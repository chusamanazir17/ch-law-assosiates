import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listReminderDeliveries,
  listVerifiedDeadlines,
  queueDeliveryRetry,
} from "@/lib/services/reminders-admin.service";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const status = request.nextUrl.searchParams.get("status") ?? "all";
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? "1") || 1);

    const [history, verifiedDeadlines] = await Promise.all([
      listReminderDeliveries({ status, page }),
      listVerifiedDeadlines(),
    ]);

    return NextResponse.json({
      success: true,
      deliveries: history.deliveries,
      totalCount: history.totalCount,
      verifiedDeadlines,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load reminder history.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    if (typeof body.deliveryId !== "string" || !body.deliveryId.trim()) {
      return NextResponse.json({ success: false, error: "Delivery ID is required." }, { status: 400 });
    }

    await queueDeliveryRetry(body.deliveryId.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to retry delivery.") },
      { status: 500 }
    );
  }
}
