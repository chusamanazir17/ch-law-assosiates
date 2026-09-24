import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listStampProducts,
  createStampProduct,
  updateStampProduct,
  listStampMovements,
  recordStampMovement,
} from "@/lib/services/stamps.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type"); // 'products' | 'movements' | null
    const productId = request.nextUrl.searchParams.get("product_id") || undefined;
    const movementType = request.nextUrl.searchParams.get("movement_type") || undefined;
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!, 10)
      : 100;

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
    return NextResponse.json({ success: false, error: error.message || "Failed to load stamps data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === "create_product") {
      const product = await createStampProduct({
        name: body.name || `Rs. ${body.denomination} Stamp Paper`,
        denomination: Number(body.denomination),
        purchase_price: Number(body.purchase_price || body.purchasePrice),
        sale_price: Number(body.sale_price || body.salePrice),
        current_stock: Number(body.current_stock || body.openingStock || 0),
        minimum_stock: Number(body.minimum_stock || body.minimumLevel || 20),
      });
      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    // Record movement (Sale, Purchase, Adjustment)
    let moveType = body.movement_type || body.movementType || "sale";
    if (moveType === "Sale") moveType = "sale";
    if (moveType === "Purchase") moveType = "purchase";
    if (moveType === "Adjustment") moveType = "adjustment_in";

    await recordStampMovement({
      stampProductId: body.stamp_product_id || body.stampProductId,
      movementType: moveType,
      quantity: Number(body.quantity || body.qty),
      unitPrice: body.unit_price ? Number(body.unit_price) : undefined,
      clientId: body.client_id || body.clientId || null,
      clientName: body.client_name || body.clientOrSupplier || null,
      notes: body.notes || null,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Stamps POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to record stamp operation" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const updated = await updateStampProduct(body.id, {
      name: body.name,
      purchase_price: body.purchase_price ? Number(body.purchase_price) : undefined,
      sale_price: body.sale_price ? Number(body.sale_price) : undefined,
      minimum_stock: body.minimum_stock ? Number(body.minimum_stock) : undefined,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("[API Office Stamps PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update stamp product" }, { status: 400 });
  }
}
