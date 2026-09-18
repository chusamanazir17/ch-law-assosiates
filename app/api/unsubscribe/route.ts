import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/config/env";

export const dynamic = "force-dynamic";

/** RFC 8058 one-click unsubscribe endpoint used by reminder email headers. */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token || token.length < 16) {
    return NextResponse.json({ success: false, error: "Invalid unsubscribe token." }, { status: 400 });
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, error: "Unsubscribe service is not configured." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${config.url}/functions/v1/unsubscribe`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({
      success: false,
      error: "Unsubscribe service returned an invalid response.",
    }));

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("[One-click Unsubscribe] Request failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process unsubscribe request." },
      { status: 500 }
    );
  }
}
