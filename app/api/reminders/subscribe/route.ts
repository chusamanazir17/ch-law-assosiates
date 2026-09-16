import { NextRequest, NextResponse } from "next/server";
import { addOrUpdateSubscriber, TAX_CATEGORY_MAP } from "@/lib/cms/subscribersStorage";
import { sendAlertEmail } from "@/lib/email/emailService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category_ids, consent, hp_company } = body;

    // 1. Honeypot spam check
    if (hp_company) {
      return NextResponse.json({
        success: true,
        message: "Subscription confirmed! You will receive statutory tax deadline reminders.",
      });
    }

    // 2. Validate email
    const trimmedEmail = (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address (e.g. client@example.com)." },
        { status: 400 }
      );
    }

    // 3. Resolve categories
    let selectedIds: string[] = Array.isArray(category_ids) && category_ids.length > 0
      ? category_ids
      : ["1", "2", "3"]; // Default to primary tax categories if none ticked

    const categoryNames = selectedIds.map((id) => TAX_CATEGORY_MAP[id]?.name || `Category ${id}`);

    const clientName = (name || "").trim() || trimmedEmail.split("@")[0];

    // 4. Store in Database
    const subscriber = await addOrUpdateSubscriber({
      name: clientName,
      email: trimmedEmail,
      categoryIds: selectedIds,
      consent: consent !== false,
    });

    // 5. Send Alert Email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const emailResult = await sendAlertEmail({
      to: trimmedEmail,
      name: clientName,
      categoryNames,
      unsubscribeUrl: `${siteUrl}/reminders/unsubscribe?email=${encodeURIComponent(trimmedEmail)}`,
    });

    console.log(`[Subscribe API] Stored subscriber ${trimmedEmail} in database. Email result:`, emailResult);

    return NextResponse.json({
      success: true,
      message: `Alert activated! A confirmation email for your selected tax reminders has been sent to ${trimmedEmail}.`,
      subscriber: {
        id: subscriber.id,
        name: subscriber.name,
        email: subscriber.email,
        categories: subscriber.categories,
      },
    });
  } catch (err: any) {
    console.error("[Subscribe API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "An unexpected error occurred while processing your subscription. Please try again.",
      },
      { status: 500 }
    );
  }
}
