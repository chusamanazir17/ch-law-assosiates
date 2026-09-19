import { NextResponse, type NextRequest } from "next/server";
import { validateSubscription } from "@/lib/validation/subscription";
import { addOrUpdateSubscriber } from "@/lib/db/subscribersStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`subscribe:${ip}`, 5, 10 * 60 * 1000); // 5 submissions per 10 min

    if (!rateLimitResult.success) {
      const retrySeconds = Math.ceil(rateLimitResult.resetMs / 1000);
      return NextResponse.json(
        {
          success: false,
          error: "Too many subscription attempts. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retrySeconds),
          },
        }
      );
    }
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypots must look successful to automated submitters without storing
    if (typeof body.hp_company === "string" && body.hp_company.trim()) {
      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing! Your email has been successfully registered.",
      });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const categoryIds = Array.isArray(body.category_ids)
      ? body.category_ids.filter((id): id is string => typeof id === "string")
      : [];
    const consent = body.consent === true;

    const validation = validateSubscription({ name, email, category_ids: categoryIds, consent });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: Object.values(validation.errors)[0] || "Invalid subscription request." },
        { status: 400 }
      );
    }

    // Save to the database store (persisted locally & synced with Supabase if configured)
    const subscriber = await addOrUpdateSubscriber({
      name,
      email,
      categoryIds,
      consent,
    });

    console.log(`[Subscription Registered] Email: ${email}, Name: ${name}, Categories: ${categoryIds.join(", ")}`);

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Your email has been registered for tax and legal compliance reminders.",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
      },
    });
  } catch (error) {
    console.error("[Reminder Subscribe] Request failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process subscription at this time. Please try again." },
      { status: 500 }
    );
  }
}
