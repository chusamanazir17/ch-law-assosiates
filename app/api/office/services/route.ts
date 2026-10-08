import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import {
  listServiceOrders,
  createServiceOrderRecord,
  updateServiceOrderRecord,
  deleteServiceOrderRecord,
} from "@/lib/services/services.service";
import {
  validateBody,
  pickAllowed,
  serviceOrderCreateSchema,
  serviceOrderUpdateSchema,
  SERVICE_ORDER_UPDATE_ALLOWLIST,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("services", "GET", request);
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const orders = await listServiceOrders({ status, category, clientId, search });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("[API Office Services GET]", error);
    return officeErrorResponse(error, "Failed to load service orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("services", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(serviceOrderCreateSchema, {
      client_id: body.client_id || body.clientId,
      customer_name: body.customer_name || body.customer || "Walk-in Client",
      service_name: body.service_name || body.serviceName,
      category: body.category,
      pages: body.pages,
      amount: body.amount,
      payment_status: body.payment_status || body.payment,
      delivery_date: body.delivery_date || body.deliveryDate,
      file_reference: body.file_reference || body.fileReference,
      status: body.status,
      notes: body.notes || body.specialInstructions,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newOrder = await createServiceOrderRecord(validated.data as any);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Services POST]", error);
    return officeErrorResponse(error, "Failed to create service order");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("services", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const fields = pickAllowed(body, SERVICE_ORDER_UPDATE_ALLOWLIST);
    // Accept camelCase aliases for the allowlisted fields.
    if (body.payment !== undefined && fields.payment_status === undefined) {
      fields.payment_status = body.payment;
    }
    if (body.deliveryDate !== undefined && fields.delivery_date === undefined) {
      fields.delivery_date = body.deliveryDate;
    }
    if (body.specialInstructions !== undefined && fields.notes === undefined) {
      fields.notes = body.specialInstructions;
    }
    const validated = validateBody(serviceOrderUpdateSchema, fields);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const updated = await updateServiceOrderRecord(body.id, validated.data as any, {
      allowedFields: SERVICE_ORDER_UPDATE_ALLOWLIST,
    });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Service order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("[API Office Services PATCH]", error);
    return officeErrorResponse(error, "Failed to update service order");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("services", "DELETE", request);
    if (!auth.ok) return auth.response;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    await deleteServiceOrderRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Services DELETE]", error);
    return officeErrorResponse(error, "Failed to delete service order");
  }
}
