import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllInquiries,
  addInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from "@/lib/db/inquiriesStore";
import type { ConsultationInquiry } from "@/types/cms";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const inquiries = await getAllInquiries();
    return NextResponse.json({
      success: true,
      inquiries,
      totalCount: inquiries.length,
    });
  } catch (error) {
    console.error("[Admin Inquiries] Load failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load inquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = (await request.json()) as {
      action?: "create" | "status" | "delete";
      id?: string;
      status?: ConsultationInquiry["status"];
      name?: string;
      phone?: string;
      service?: string;
      message?: string;
      email?: string;
    };

    if (body.action === "create") {
      if (!body.name || !body.phone) {
        return NextResponse.json(
          { success: false, error: "Name and phone are required." },
          { status: 400 }
        );
      }
      const inquiry = await addInquiry({
        name: body.name,
        phone: body.phone,
        service: body.service || "General Inquiry",
        message: body.message,
        email: body.email,
      });
      return NextResponse.json({
        success: true,
        inquiry,
        message: "Consultation inquiry recorded.",
      });
    }

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Inquiry ID is required." }, { status: 400 });
    }

    if (body.action === "delete") {
      await deleteInquiry(body.id);
      return NextResponse.json({ success: true, message: "Inquiry deleted." });
    }

    if (body.status) {
      await updateInquiryStatus(body.id, body.status);
      return NextResponse.json({ success: true, message: `Status updated to ${body.status}.` });
    }

    return NextResponse.json({ success: false, error: "No valid action specified." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Inquiries] Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inquiry." },
      { status: 500 }
    );
  }
}
