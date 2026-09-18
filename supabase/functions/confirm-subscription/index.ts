// Supabase Edge Function: confirm-subscription
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashToken } from "../_shared/crypto.ts";

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
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length < 16) {
      return jsonResponse({ success: false, error: "Missing or invalid confirmation token." }, 400);
    }

    const supabase = getSupabaseAdmin();
    const tokenHash = await hashToken(token.trim());
    const { data: result, error } = await supabase.rpc("consume_confirmation_token", {
      p_token_hash: tokenHash,
    });

    if (error) throw error;

    switch (result) {
      case "confirmed":
        return jsonResponse({
          success: true,
          message:
            "Your subscription has been confirmed. You will now receive reminders before important tax deadlines.",
        });
      case "already_confirmed":
        return jsonResponse({
          success: true,
          message: "Your subscription has already been confirmed and is active.",
        });
      case "expired":
        return jsonResponse(
          {
            success: false,
            error:
              "This confirmation link has expired. Please subscribe again on our website to receive a fresh link.",
          },
          410,
        );
      case "categories_changed":
        return jsonResponse(
          {
            success: false,
            error:
              "One or more selected reminder categories are no longer available. Please subscribe again and select current categories.",
          },
          409,
        );
      default:
        return jsonResponse(
          { success: false, error: "This confirmation link is invalid or does not exist." },
          400,
        );
    }
  } catch (err: unknown) {
    console.error("[Confirm Subscription Error]", err);
    return jsonResponse(
      { success: false, error: "Unable to confirm subscription at this time." },
      500,
    );
  }
});
