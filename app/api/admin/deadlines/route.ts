import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listDeadlines,
  listTaxCategories,
  createDeadline,
  updateDeadline,
  setDeadlineVerification,
  setDeadlineActive,
  type DeadlineInput,
} from "@/lib/services/deadlines.service";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const [deadlines, categories] = await Promise.all([listDeadlines(), listTaxCategories()]);
    return NextResponse.json({ success: true, deadlines, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load tax deadlines.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "save";

    if (action === "verify") {
      if (typeof body.id !== "string" || !body.id.trim()) {
        return NextResponse.json({ success: false, error: "Deadline ID is required." }, { status: 400 });
      }
      const verified = body.verified === true;
      // verified_by has a FK into auth.users — only real Supabase sessions qualify.
      const verifiedBy = !session.isLocalAdmin && /^[0-9a-f-]{36}$/i.test(session.user.id) ? session.user.id : null;
      await setDeadlineVerification(body.id.trim(), verified, verifiedBy);
      return NextResponse.json({ success: true });
    }

    if (action === "toggle-active") {
      if (typeof body.id !== "string" || !body.id.trim()) {
        return NextResponse.json({ success: false, error: "Deadline ID is required." }, { status: 400 });
      }
      await setDeadlineActive(body.id.trim(), body.is_active === true);
      return NextResponse.json({ success: true });
    }

    // Default: create or update
    const input = body as DeadlineInput;
    if (
      typeof input.category_id !== "string" ||
      typeof input.tax_year_or_period !== "string" ||
      typeof input.title !== "string" ||
      typeof input.filing_deadline !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "category_id, tax_year_or_period, title and filing_deadline are required." },
        { status: 400 }
      );
    }

    if (typeof body.id === "string" && body.id.trim()) {
      await updateDeadline(body.id.trim(), input);
      return NextResponse.json({ success: true, message: "Tax deadline updated." });
    }

    await createDeadline(input);
    return NextResponse.json({ success: true, message: "Tax deadline created." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to save deadline.") },
      { status: 500 }
    );
  }
}
