import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import { listClients, createClientRecord, updateClientRecord, deleteClientRecord } from "@/lib/services/clients.service";
import {
  validateBody,
  pickAllowed,
  clientCreateSchema,
  clientUpdateSchema,
  CLIENT_UPDATE_ALLOWLIST,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("clients", "GET", request);
    if (!auth.ok) return auth.response;

    const search = request.nextUrl.searchParams.get("search") || undefined;
    const clients = await listClients(search);
    return NextResponse.json({ success: true, clients });
  } catch (error: any) {
    console.error("[API Office Clients GET]", error);
    return officeErrorResponse(error, "Failed to load clients", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("clients", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const validated = validateBody(
      clientCreateSchema,
      {
        full_name: body.full_name || body.name,
        business_name: body.business_name ?? body.businessName,
        client_type: body.client_type || body.clientType,
        cnic: body.cnic,
        ntn: body.ntn,
        mobile: body.mobile || body.phone,
        phone: body.phone,
        email: body.email,
        city: body.city,
        address: body.address,
        status: body.status,
      }
    );
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newClient = await createClientRecord(validated.data as any);
    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Clients POST]", error);
    return officeErrorResponse(error, "Failed to create client");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("clients", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    // Mass-assignment guard: only allowlisted fields reach the service.
    const picked = pickAllowed(body, CLIENT_UPDATE_ALLOWLIST);
    const validated = validateBody(clientUpdateSchema, picked);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const updated = await updateClientRecord(body.id, validated.data as any, {
      allowedFields: CLIENT_UPDATE_ALLOWLIST,
    });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    console.error("[API Office Clients PATCH]", error);
    return officeErrorResponse(error, "Failed to update client");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("clients", "DELETE", request);
    if (!auth.ok) return auth.response;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    await deleteClientRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Clients DELETE]", error);
    return officeErrorResponse(error, "Failed to delete client");
  }
}
