// Supabase Edge Function: resend-webhook
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";

/**
 * Verify Webhook Signature (svix / Resend standard HMAC)
 */
async function verifyWebhookSignature(payload: string, headers: Headers, secret: string): Promise<boolean> {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  // Verify timestamp is within 5 minutes to prevent replay attacks
  const ts = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return false;
  }

  // Secret may be formatted as "whsec_..."
  const cleanSecret = secret.startsWith("whsec_") ? secret.substring(6) : secret;
  const secretBytes = new Uint8Array(
    atob(cleanSecret)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent));
  const expectedSigBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

  const passedSignatures = svixSignature.split(" ").map((s) => (s.startsWith("v1,") ? s.substring(3) : s));
  return passedSignatures.includes(expectedSigBase64);
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET")?.trim();

    if (!webhookSecret) {
      console.error("[Resend Webhook] RESEND_WEBHOOK_SECRET is not configured.");
      return new Response("Webhook is not configured", { status: 503, headers: corsHeaders });
    }

    const isValid = await verifyWebhookSignature(rawBody, req.headers, webhookSecret);
    if (!isValid) {
      console.warn("[Resend Webhook] Signature verification failed.");
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (!type || !data) {
      return new Response("Invalid event structure", { status: 400, headers: corsHeaders });
    }

    const supabase = getSupabaseAdmin();
    const emailId = data.email_id;
    const recipientEmail = Array.isArray(data.to) ? data.to[0] : data.to;

    console.log(`[Resend Webhook] Event: ${type}, EmailId: ${emailId}, Recipient: ${recipientEmail}`);

    switch (type) {
      case "email.delivered":
        if (emailId) {
          const { error } = await supabase
            .from("reminder_deliveries")
            .update({ status: "sent", updated_at: new Date().toISOString() })
            .eq("provider_message_id", emailId);
          if (error) throw error;
        }
        break;

      case "email.bounced":
        // Mark delivery as failed
        if (emailId) {
          const { error } = await supabase
            .from("reminder_deliveries")
            .update({
              status: "failed",
              error_details: "Email bounced by receiving mail server.",
              updated_at: new Date().toISOString(),
            })
            .eq("provider_message_id", emailId);
          if (error) throw error;
        }
        // Suppress subscriber to prevent future bounces
        if (recipientEmail) {
          const { error } = await supabase
            .from("subscribers")
            .update({ status: "suppressed", updated_at: new Date().toISOString() })
            .eq("email", recipientEmail.trim().toLowerCase());
          if (error) throw error;
        }
        break;

      case "email.complained":
        // Spam complaint: immediately suppress subscriber
        if (recipientEmail) {
          const { error } = await supabase
            .from("subscribers")
            .update({ status: "suppressed", updated_at: new Date().toISOString() })
            .eq("email", recipientEmail.trim().toLowerCase());
          if (error) throw error;
        }
        break;

      default:
        // Other events ignored
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("[Webhook Processing Error]", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
