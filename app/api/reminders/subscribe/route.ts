import { NextResponse, type NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { validateSubscription } from "@/lib/validation/subscription";
import { getCategoryNamesByIds } from "@/lib/db/subscribersStore";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendSubscriptionConfirmationEmail } from "@/lib/email/emailService";
import { createServiceClient } from "@/lib/supabase/service";
import { getSiteUrl, getSupabasePublicConfig } from "@/config/env";

export const dynamic = "force-dynamic";

// Confirmation links stay valid for 48 hours.
const CONFIRMATION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

interface PrepareSubscriptionResult {
  subscriber_id: string;
  should_send: boolean;
  is_suppressed: boolean;
}

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

    if (!getSupabasePublicConfig()) {
      throw new Error("Supabase is not configured: cannot save subscription.");
    }

    // The confirmation RPC expects UUID category ids; reject anything else
    // here so a malformed id fails with a clear 400 instead of a DB cast error.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (categoryIds.some((id) => !UUID_RE.test(id))) {
      return NextResponse.json(
        { success: false, error: "One or more tax categories are invalid." },
        { status: 400 }
      );
    }

    // Double opt-in: create a confirmation token and register the request
    // through the atomic `prepare_subscription_request` RPC. The subscriber is
    // created as `pending` — never `active` — and suppressed/unsubscribed
    // addresses are never reactivated.
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + CONFIRMATION_TOKEN_TTL_MS).toISOString();

    const supabase = createServiceClient();
    // The subscription RPCs are not in the generated Database types, so call
    // through a locally typed wrapper instead of an untyped `any`.
    const callPrepareSubscription = (
      supabase.rpc as unknown as (
        fn: "prepare_subscription_request",
        args: {
          p_name: string;
          p_email: string;
          p_category_ids: string[];
          p_token_hash: string;
          p_expires_at: string;
        }
      ) => Promise<{
        data: PrepareSubscriptionResult[] | null;
        error: { message: string } | null;
      }>
    ).bind(supabase);
    const { data: rpcRows, error: rpcError } = await callPrepareSubscription(
      "prepare_subscription_request",
      {
        p_name: name,
        p_email: email,
        p_category_ids: categoryIds,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      }
    );

    if (rpcError) {
      const message = rpcError.message || "";
      console.error("[Reminder Subscribe] prepare_subscription_request failed:", message);
      if (message.includes("INVALID_CATEGORY_SELECTION")) {
        return NextResponse.json(
          { success: false, error: "Please select at least one valid reminder category." },
          { status: 400 }
        );
      }
      if (message.includes("INVALID_SUBSCRIPTION_INPUT")) {
        return NextResponse.json(
          { success: false, error: "Invalid subscription request." },
          { status: 400 }
        );
      }
      throw new Error(`Failed to register subscription: ${message}`);
    }

    const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
      | PrepareSubscriptionResult
      | undefined;
    if (!result?.subscriber_id) {
      throw new Error("Subscription request returned no subscriber.");
    }

    console.log(
      `[Subscription Request] Email: ${email}, Name: ${name}, ` +
        `Categories: ${categoryIds.join(", ")}, suppressed=${result.is_suppressed}`
    );

    // Never reveal suppression status: suppressed addresses get the same
    // neutral response as a fresh pending subscription, and no email is sent.
    if (result.is_suppressed || !result.should_send) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        message:
          "Thank you for subscribing! If this email address is eligible, a confirmation email is on its way.",
      });
    }

    // Dispatch the double opt-in confirmation email with the confirmation link.
    const categoryNames = await getCategoryNamesByIds(categoryIds);
    const confirmUrl = `${getSiteUrl()}/reminders/confirm?token=${rawToken}`;
    const emailResult = await sendSubscriptionConfirmationEmail({
      to: email,
      name,
      categoryNames,
      confirmUrl,
    });

    const emailSent = emailResult.success;
    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Thank you for subscribing! Please click the confirmation link in the email we just sent to activate your reminders."
        : "Thank you for subscribing! Your request was registered — please try again if the confirmation email does not arrive.",
      subscriber: {
        id: result.subscriber_id,
        email,
        name,
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
