import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { listClients, createClientRecord } from "@/lib/services/clients.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search") || undefined;
    const clients = await listClients(search);
    return NextResponse.json({ success: true, clients });
  } catch (error: any) {
    console.error("[API Office Clients GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newClient = await createClientRecord({
      full_name: body.full_name || body.name,
      business_name: body.business_name || body.businessName || null,
      client_type: body.client_type || body.clientType || "individual",
      cnic: body.cnic || null,
      ntn: body.ntn || null,
      mobile: body.mobile || body.phone,
      phone: body.phone || null,
      email: body.email || null,
      city: body.city || "Sahiwal",
      address: body.address || null,
      status: body.status || "active",
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Clients POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create client" }, { status: 400 });
  }
}
