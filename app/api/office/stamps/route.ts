import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
  canManageFinance,
} from "@/lib/auth/officePermissions";
import {
  listStampProducts,
  createStampProduct,
  updateStampProduct,
  listStampMovements,
  recordStampMovement,
} from "@/lib/services/stamps.service";
import {
  validateBody,
  clampLimitParam,
  stampProductCreateSchema,
  stampProductUpdateSchema,
  stampMovementSchema,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("stamps", "GET", request);
    if (!auth.ok) return auth.response;

    const type = request.nextUrl.searchParams.get("type"); // 'products' | 'movements' | null
    const productId = request.nextUrl.searchParams.get("product_id") || undefined;
    const movementType = request.nextUrl.searchParams.get("movement_type") || undefined;
    // API-5: clamp the attacker-controlled limit.
    const limit = clampLimitParam(request.nextUrl.searchParams.get("limit"), 100, 500);

    if (type === "products") {
      const products = await listStampProducts();
      return NextResponse.json({ success: true, products });
    }

    if (type === "movements") {
      const movements = await listStampMovements({ stampProductId: productId, movementType, limit });
      return NextResponse.json({ success: true, movements });
    }

    const [products, movements] = await Promise.all([
      listStampProducts(),
      listStampMovements({ stampProductId: productId, movementType, limit }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      movements,
    });
  } catch (error: any) {
    console.error("[API Office Stamps GET]", error);
    return officeErrorResponse(error, "Failed to load stamps data", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("stamps", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const action = body.action;

    if (action === "create_product") {
      // Creating a denomination / setting prices is a finance-admin action.
      if (!canManageFinance(auth.session.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden: only finance roles may create stamp products." },
          { status: 403 }
        );
      }
      const validated = validateBody(stampProductCreateSchema, {
        name: body.name || (body.denomination ? `Rs. ${body.denomination} Stamp Paper` : undefined),
        denomination: body.denomination,
        purchase_price: body.purchase_price ?? body.purchasePrice,
        sale_price: body.sale_price ?? body.salePrice,
        current_stock: body.current_stock ?? body.openingStock,
        minimum_stock: body.minimum_stock ?? body.minimumLevel,
      });
      if (!validated.success) {
        return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
      }
      const product = await createStampProduct(validated.data as any);
      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    // Record movement (Sale, Purchase, Adjustment)
    let moveType = body.movement_type || body.movementType || "sale";
    if (moveType === "Sale") moveType = "sale";
    if (moveType === "Purchase") moveType = "purchase";
    if (moveType === "Adjustment") moveType = "adjustment_in";

    const validated = validateBody(stampMovementSchema, {
      stamp_product_id: body.stamp_product_id || body.stampProductId,
      movement_type: moveType,
      quantity: body.quantity ?? body.qty,
      unit_price: body.unit_price ?? body.unitPrice,
      client_id: body.client_id || body.clientId,
      client_name: body.client_name || body.clientOrSupplier,
      notes: body.notes,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const movementData = validated.data as {
      stamp_product_id: string;
      movement_type: "opening" | "purchase" | "sale" | "adjustment_in" | "adjustment_out" | "reversal";
      quantity: number;
      unit_price: number | null;
      client_id: string | null;
      client_name: string | null;
      notes: string | null;
    };
    await recordStampMovement({
      stampProductId: movementData.stamp_product_id,
      movementType: movementData.movement_type,
      quantity: movementData.quantity,
      unitPrice: movementData.unit_price ?? undefined,
      clientId: movementData.client_id,
      clientName: movementData.client_name,
      notes: movementData.notes,
      createdBy: auth.session.user.id,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Stamps POST]", error);
    return officeErrorResponse(error, "Failed to record stamp operation");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("stamps", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const validated = validateBody(stampProductUpdateSchema, {
      name: body.name,
      purchase_price: body.purchase_price,
      sale_price: body.sale_price,
      minimum_stock: body.minimum_stock,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const updated = await updateStampProduct(body.id, validated.data as any);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Stamp product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("[API Office Stamps PATCH]", error);
    return officeErrorResponse(error, "Failed to update stamp product");
  }
}
