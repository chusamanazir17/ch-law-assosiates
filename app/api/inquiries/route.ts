import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getSupabasePublicConfig } from "@/config/env";
import { validateInquiry } from "@/lib/validation/inquiry";

export const dynamic = "force-dynamic";

function getClientAddress(request: NextRequest) {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function hashRateKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot. Bots receive a generic success response without a database write.
    if (typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ success: true });
    }

    const inquiry = validateInquiry(body);
    if (!getSupabasePublicConfig()) {
      return NextResponse.json(
        { success: false, error: "Inquiry storage is not configured." },
        { status: 503 }
      );
    }

    const client = createServiceClient();
    const { error } = await client.rpc("submit_consultation_inquiry", {
      p_name: inquiry.name,
      p_phone: inquiry.phone,
      p_service_needed: inquiry.service,
      p_message: inquiry.message ?? "",
      p_rate_key: `inquiry_${hashRateKey(getClientAddress(request))}`,
    });

    if (error) {
      if (error.message.includes("RATE_LIMIT_EXCEEDED")) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save inquiry.";
    const isValidation = message.startsWith("Please") || message.startsWith("Invalid");
    if (!isValidation) console.error("[Inquiry API] Save failed:", error);

    return NextResponse.json(
      { success: false, error: isValidation ? message : "Unable to save inquiry." },
      { status: isValidation ? 400 : message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 503 : 500 }
    );
  }
}
