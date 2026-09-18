import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllSubscribers,
  updateSubscriberStatus,
} from "@/lib/db/subscribersStore";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json({
      success: true,
      subscribers,
      totalCount: subscribers.length,
    });
  } catch (error) {
    console.error("[Admin Subscribers] Load failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load subscribers." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = (await request.json()) as {
      action?: string;
      id?: string;
      status?: "active" | "pending" | "unsubscribed" | "suppressed";
    };

    if (typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json({ success: false, error: "Subscriber ID is required." }, { status: 400 });
    }

    const targetStatus = body.status || (body.action === "unsubscribe" ? "unsubscribed" : "active");
    await updateSubscriberStatus(body.id.trim(), targetStatus);

    return NextResponse.json({
      success: true,
      message: `Subscriber status updated to ${targetStatus}.`,
    });
  } catch (error) {
    console.error("[Admin Subscribers] Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subscriber." },
      { status: 500 }
    );
  }
}
