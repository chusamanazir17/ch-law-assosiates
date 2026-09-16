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

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, category_ids, consent, hp_company } = body;

    // 1. Spam Honeypot Protection
    if (hp_company) {
      console.warn("[Spam Protection] Honeypot triggered.");
      return new Response(JSON.stringify(GENERIC_RESPONSE), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Input Validation
    const clientName = sanitizeName(name);
    if (!clientName) {
      return new Response(JSON.stringify({ success: false, error: "Please provide your full name." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ success: false, error: "Please enter a valid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!consent) {
      return new Response(JSON.stringify({ success: false, error: "Consent is required to receive tax deadline reminders." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Please select at least one tax category." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseAdmin();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Persistent Server-side Rate Limiting
    const { data: ipAllowed } = await supabase.rpc("check_rate_limit", {
      p_key: `sub_ip_${clientIp}`,
      p_max_requests: 6,
      p_window_seconds: 300, // max 6 per 5 minutes per IP
    });

    const { data: emailAllowed } = await supabase.rpc("check_rate_limit", {
      p_key: `sub_email_${normalizedEmail}`,
      p_max_requests: 3,
      p_window_seconds: 3600, // max 3 per hour per email
    });

    if (ipAllowed === false || emailAllowed === false) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many subscription requests. Please wait a few minutes before trying again.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Verify Active Categories
    const { data: validCategories, error: catError } = await supabase
      .from("tax_categories")
      .select("id, name")
      .in("id", category_ids)
      .eq("is_active", true);

    if (catError || !validCategories || validCategories.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid tax categories selected." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validCategoryIds = validCategories.map((c) => c.id);
    const categoryNames = validCategories.map((c) => c.name);

    // 5. Check Existing Subscriber
    const { data: existingSubscriber } = await supabase
      .from("subscribers")
      .select("id, name, email, status")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";
    const rawToken = generateToken(32);
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    let subscriberId: string;

    if (!existingSubscriber) {
      // Create new pending subscriber
      const { data: newSub, error: subError } = await supabase
        .from("subscribers")
        .insert({
          name: clientName,
          email: normalizedEmail,
          status: "pending",
          consent_at: new Date().toISOString(),
          consent_text_version: "v1.0",
        })
        .select("id")
        .single();

      if (subError || !newSub) {
        throw new Error(`Failed to create subscriber: ${subError?.message}`);
      }

      subscriberId = newSub.id;

      // Link categories
      const categoryRows = validCategoryIds.map((catId) => ({
        subscriber_id: subscriberId,
        category_id: catId,
      }));
      await supabase.from("subscriber_categories").insert(categoryRows);

      // Store confirmation token
      await supabase.from("subscription_tokens").insert({
        subscriber_id: subscriberId,
        token_hash: tokenHash,
        purpose: "confirmation",
        metadata: { category_ids: validCategoryIds },
        expires_at: expiresAt,
      });
    } else if (existingSubscriber.status === "suppressed") {
      // Suppressed addresses (hard bounce/spam complaint) should not be sent emails
      return new Response(JSON.stringify(GENERIC_RESPONSE), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Existing subscriber (active, pending, or unsubscribed)
      subscriberId = existingSubscriber.id;

      // Revoke any older pending tokens
      await supabase
        .from("subscription_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("subscriber_id", subscriberId)
        .eq("purpose", "confirmation")
        .is("used_at", null);

      // Store new confirmation token with requested categories
      await supabase.from("subscription_tokens").insert({
        subscriber_id: subscriberId,
        token_hash: tokenHash,
        purpose: "confirmation",
        metadata: { category_ids: validCategoryIds, proposed_name: clientName },
        expires_at: expiresAt,
      });
    }

    // 6. Send Double Opt-in Confirmation Email
    const confirmUrl = `${siteUrl}/reminders/confirm?token=${rawToken}`;
    const emailContent = renderConfirmationEmail({
      name: clientName,
      confirmUrl,
      categories: categoryNames,
    });

    await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return new Response(JSON.stringify(GENERIC_RESPONSE), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[Subscribe Error]", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unable to process subscription at this time. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
