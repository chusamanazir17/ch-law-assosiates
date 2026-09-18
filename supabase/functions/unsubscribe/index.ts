// Supabase Edge Function: unsubscribe
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

  let rawToken: string | null = null;

  if (req.method === "POST") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json();
        rawToken = typeof body.token === "string" ? body.token : null;
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        // RFC 8058 one-click unsubscribe POST body.
        const text = await req.text();
        const params = new URLSearchParams(text);
        rawToken = params.get("token") || new URL(req.url).searchParams.get("token");
      } else {
        rawToken = new URL(req.url).searchParams.get("token");
      }
    } catch {
      rawToken = new URL(req.url).searchParams.get("token");
    }
  } else if (req.method === "GET") {
    rawToken = new URL(req.url).searchParams.get("token");
  } else {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!rawToken || rawToken.length < 16) {
    return jsonResponse({ success: false, error: "Invalid or missing unsubscribe token." }, 400);
  }

  try {
    const supabase = getSupabaseAdmin();
    const tokenHash = await hashToken(rawToken.trim());
    const { data: result, error } = await supabase.rpc("consume_unsubscribe_token", {
      p_token_hash: tokenHash,
    });

    if (error) throw error;

    if (result === "unsubscribed") {
      return jsonResponse({
        success: true,
        message: "You have been successfully unsubscribed from tax deadline reminders.",
      });
    }

    if (result === "expired") {
      return jsonResponse(
        { success: false, error: "Unsubscribe link is expired or already processed." },
        410,
      );
    }

    return jsonResponse(
      { success: false, error: "Unsubscribe link is invalid or already processed." },
      400,
    );
  } catch (err: unknown) {
    console.error("[Unsubscribe Error]", err);
    return jsonResponse(
      { success: false, error: "Unable to process unsubscribe request." },
      500,
    );
  }
});
