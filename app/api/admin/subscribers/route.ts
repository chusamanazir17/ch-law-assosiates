import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listSubscribers,
  setSubscriberStatus,
} from "@/lib/repositories/subscribersRepository";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const subscribers = await listSubscribers(session.supabase);
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
    const body = (await request.json()) as { action?: unknown; id?: unknown };
    if (body.action !== "unsubscribe" || typeof body.id !== "string" || !body.id.trim()) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    await setSubscriberStatus(session.supabase, body.id.trim(), "unsubscribed");
    return NextResponse.json({
      success: true,
      message: "Subscriber marked as unsubscribed.",
    });
  } catch (error) {
    console.error("[Admin Subscribers] Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subscriber." },
      { status: 500 }
    );
  }
}
