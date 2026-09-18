import { NextResponse, type NextRequest } from "next/server";
import { validateInquiry } from "@/lib/validation/inquiry";
import { addInquiry } from "@/lib/db/inquiriesStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot. Bots receive a generic success response without a database write.
    if (typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ success: true });
    }

    const inquiry = validateInquiry(body);

    const saved = await addInquiry({
      name: inquiry.name,
      phone: inquiry.phone,
      service: inquiry.service,
      message: inquiry.message ?? undefined,
    });

    console.log(`[Consultation Inquiry Received] Client: ${saved.name}, Phone: ${saved.phone}, Service: ${saved.service_needed}`);

    return NextResponse.json({
      success: true,
      message: "Consultation inquiry received successfully. Our team will contact you shortly.",
      inquiry: {
        id: saved.id,
        name: saved.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save inquiry.";
    const isValidation = message.startsWith("Please") || message.startsWith("Invalid");
    if (!isValidation) console.error("[Inquiry API] Save failed:", error);

    return NextResponse.json(
      { success: false, error: isValidation ? message : "Unable to process consultation request." },
      { status: isValidation ? 400 : 500 }
    );
  }
}
