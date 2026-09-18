// Supabase Edge Function: subscribe
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { generateToken, hashToken } from "../_shared/crypto.ts";
import { isValidEmail, sanitizeName } from "../_shared/validation.ts";
import { renderConfirmationEmail } from "../_shared/emailTemplates.ts";
import { sendEmail } from "../_shared/resendClient.ts";

const GENERIC_RESPONSE = {
  success: true,
  message: "If this email address is valid, a confirmation link has been sent to your inbox.",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const { name, email, category_ids, consent, hp_company } = body;

    // Honeypot requests receive a generic success response and no database write.
    if (hp_company) {
      console.warn("[Spam Protection] Honeypot triggered.");
      return jsonResponse(GENERIC_RESPONSE);
    }

    const clientName = sanitizeName(name);
    if (!clientName) {
      return jsonResponse({ success: false, error: "Please provide your full name." }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ success: false, error: "Please enter a valid email address." }, 400);
    }

    if (!consent) {
      return jsonResponse(
        { success: false, error: "Consent is required to receive tax deadline reminders." },
        400,
      );
    }

    if (!Array.isArray(category_ids) || category_ids.length === 0 || category_ids.length > 20) {
      return jsonResponse(
        { success: false, error: "Please select between 1 and 20 tax categories." },
        400,
      );
    }

    const requestedCategoryIds = [
      ...new Set(
        category_ids.filter(
          (id: unknown): id is string => typeof id === "string" && id.trim().length > 0,
        ),
      ),
    ];

    if (requestedCategoryIds.length !== category_ids.length) {
      return jsonResponse({ success: false, error: "Invalid tax categories selected." }, 400);
    }

    const supabase = getSupabaseAdmin();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const normalizedEmail = email.trim().toLowerCase();

    // Persistent server-side rate limiting.
    const ipRateKey = await hashToken(clientIp);
    const emailRateKey = await hashToken(normalizedEmail);

    const { data: ipAllowed, error: ipRateError } = await supabase.rpc("check_rate_limit", {
      p_key: `sub_ip_${ipRateKey}`,
      p_max_requests: 6,
      p_window_seconds: 300,
    });
    if (ipRateError) throw ipRateError;

    const { data: emailAllowed, error: emailRateError } = await supabase.rpc("check_rate_limit", {
      p_key: `sub_email_${emailRateKey}`,
      p_max_requests: 3,
      p_window_seconds: 3600,
    });
    if (emailRateError) throw emailRateError;

    if (ipAllowed === false || emailAllowed === false) {
      return jsonResponse(
        {
          success: false,
          error: "Too many subscription requests. Please wait a few minutes before trying again.",
        },
        429,
      );
    }

    // Verify that every requested category exists and is currently active.
    const { data: validCategories, error: categoryError } = await supabase
      .from("tax_categories")
      .select("id, name")
      .in("id", requestedCategoryIds)
      .eq("is_active", true);

    if (categoryError) throw categoryError;
    if (!validCategories || validCategories.length !== requestedCategoryIds.length) {
      return jsonResponse({ success: false, error: "Invalid tax categories selected." }, 400);
    }

    const validCategoryIds = validCategories.map((category) => category.id);
    const categoryNames = validCategories.map((category) => category.name);

    const siteUrl = (Deno.env.get("SITE_URL") || "https://chcomposing.pk").replace(/\/$/, "");
    const rawToken = generateToken(32);
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // This RPC creates/updates the pending subscription and token atomically.
    const { data: preparedRows, error: prepareError } = await supabase.rpc(
      "prepare_subscription_request",
      {
        p_name: clientName,
        p_email: normalizedEmail,
        p_category_ids: validCategoryIds,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      },
    );
    if (prepareError) throw prepareError;

    const prepared = Array.isArray(preparedRows) ? preparedRows[0] : preparedRows;
    if (!prepared) {
      throw new Error("Subscription preparation returned no result.");
    }

    // Suppressed addresses intentionally receive no indication that they exist.
    if (prepared.is_suppressed || prepared.should_send === false) {
      return jsonResponse(GENERIC_RESPONSE);
    }

    const confirmUrl = `${siteUrl}/reminders/confirm?token=${encodeURIComponent(rawToken)}`;
    const emailContent = renderConfirmationEmail({
      name: clientName,
      confirmUrl,
      categories: categoryNames,
    });

    const sendResult = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!sendResult.success) {
      console.error("[Subscribe] Confirmation email dispatch failed:", sendResult.error);
      return jsonResponse(
        {
          success: false,
          error: "Confirmation email is temporarily unavailable. Please try again later.",
        },
        503,
      );
    }

    return jsonResponse(GENERIC_RESPONSE);
  } catch (err: unknown) {
    console.error("[Subscribe Error]", err);
    return jsonResponse(
      {
        success: false,
        error: "Unable to process subscription at this time. Please try again later.",
      },
      500,
    );
  }
});
