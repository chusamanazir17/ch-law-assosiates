import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listServiceOrders,
  createServiceOrderRecord,
  updateServiceOrderRecord,
  deleteServiceOrderRecord,
} from "@/lib/services/services.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const clientId = request.nextUrl.searchParams.get("client_id") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const orders = await listServiceOrders({ status, category, clientId, search });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("[API Office Services GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load service orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newOrder = await createServiceOrderRecord({
      client_id: body.client_id || body.clientId || null,
      customer_name: body.customer_name || body.customer || "Walk-in Client",
      service_name: body.service_name || body.serviceName,
      category: body.category || "Legal Drafting",
      pages: Number(body.pages || 1),
      amount: Number(body.amount || 0),
      payment_status: body.payment_status || body.payment || "Unpaid",
      delivery_date: body.delivery_date || body.deliveryDate || null,
      file_reference: body.file_reference || body.fileReference || null,
      status: body.status || "In Progress",
      notes: body.notes || body.specialInstructions || null,
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Services POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create service order" }, { status: 400 });
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
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const updated = await updateServiceOrderRecord(body.id, {
      status: body.status,
      payment_status: body.payment_status || body.payment,
      delivery_date: body.delivery_date || body.deliveryDate,
      notes: body.notes || body.specialInstructions,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("[API Office Services PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update service order" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    await deleteServiceOrderRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Services DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete service order" }, { status: 400 });
  }
}
