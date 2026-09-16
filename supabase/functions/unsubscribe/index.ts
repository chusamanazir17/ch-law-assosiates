// Supabase Edge Function: unsubscribe
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashToken } from "../_shared/crypto.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  let rawToken: string | null = null;

  // Support POST body or query parameter
  if (req.method === "POST") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json();
        rawToken = body.token || null;
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        // RFC 8058 one-click unsubscribe POST body
        const text = await req.text();
        const params = new URLSearchParams(text);
        rawToken = params.get("token") || new URL(req.url).searchParams.get("token");
      }
    } catch {
      // fallback to URL query
      rawToken = new URL(req.url).searchParams.get("token");
    }
  } else if (req.method === "GET") {
    rawToken = new URL(req.url).searchParams.get("token");
  } else {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 16) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid or missing unsubscribe token." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const tokenHash = await hashToken(rawToken.trim());

    // Check token table
    const { data: tokenRecord, error: tokenErr } = await supabase
      .from("subscription_tokens")
      .select("id, subscriber_id, purpose, expires_at, used_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    let subscriberId: string | null = null;

    if (tokenRecord) {
      subscriberId = tokenRecord.subscriber_id;
      // Mark token used
      await supabase
        .from("subscription_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenRecord.id);
    } else {
      // Check if raw token is a direct subscriber id fallback for admin or direct link
      const { data: sub } = await supabase
        .from("subscribers")
        .select("id")
        .eq("id", rawToken)
        .maybeSingle();
      if (sub) {
        subscriberId = sub.id;
      }
    }

    if (!subscriberId) {
      return new Response(
        JSON.stringify({ success: false, error: "Unsubscribe link is invalid or already processed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set subscriber status to unsubscribed
    await supabase
      .from("subscribers")
      .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
      .eq("id", subscriberId);

    // Cancel any queued deliveries
    await supabase
      .from("reminder_deliveries")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("subscriber_id", subscriberId)
      .eq("status", "queued");

    return new Response(
      JSON.stringify({
        success: true,
        message: "You have been successfully unsubscribed from tax deadline reminders.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("[Unsubscribe Error]", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to process unsubscribe request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
