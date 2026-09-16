import { NextRequest, NextResponse } from "next/server";
import { getAllSubscribers, unsubscribeSubscriber } from "@/lib/cms/subscribersStorage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json({
      success: true,
      subscribers,
      totalCount: subscribers.length,
    });
  } catch (err: any) {
    console.error("[Admin Subscribers API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load subscribers from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, email } = body;

    if (action === "unsubscribe" && (id || email)) {
      await unsubscribeSubscriber(id || email);
      return NextResponse.json({ success: true, message: "Subscriber marked as unsubscribed." });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to process action" }, { status: 500 });
  }
}
