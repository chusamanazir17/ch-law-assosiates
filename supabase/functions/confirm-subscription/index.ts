// Supabase Edge Function: confirm-subscription
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashToken } from "../_shared/crypto.ts";

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
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length < 16) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid confirmation token." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = getSupabaseAdmin();
    const tokenHash = await hashToken(token.trim());

    // Find token record
    const { data: tokenRecord, error: tokenErr } = await supabase
      .from("subscription_tokens")
      .select("id, subscriber_id, purpose, metadata, expires_at, used_at, revoked_at")
      .eq("token_hash", tokenHash)
      .eq("purpose", "confirmation")
      .maybeSingle();

    if (tokenErr || !tokenRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "This confirmation link is invalid or does not exist.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenRecord.used_at) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Your subscription has already been confirmed and is active.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenRecord.revoked_at || new Date(tokenRecord.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "This confirmation link has expired. Please subscribe again on our website to receive a fresh link.",
        }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark token as used
    await supabase
      .from("subscription_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRecord.id);

    // Update subscriber to active
    const updatePayload: Record<string, unknown> = {
      status: "active",
      confirmed_at: new Date().toISOString(),
    };

    if (tokenRecord.metadata?.proposed_name) {
      updatePayload.name = tokenRecord.metadata.proposed_name;
    }

    await supabase
      .from("subscribers")
      .update(updatePayload)
      .eq("id", tokenRecord.subscriber_id);

    // If token has category_ids, sync subscriber_categories
    const categoryIds = tokenRecord.metadata?.category_ids;
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      // Remove old category links
      await supabase
        .from("subscriber_categories")
        .delete()
        .eq("subscriber_id", tokenRecord.subscriber_id);

      // Insert updated categories
      const rows = categoryIds.map((cId: string) => ({
        subscriber_id: tokenRecord.subscriber_id,
        category_id: cId,
      }));
      await supabase.from("subscriber_categories").insert(rows);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your subscription has been confirmed! You will now receive reminders before important tax deadlines.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("[Confirm Subscription Error]", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to confirm subscription at this time." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
