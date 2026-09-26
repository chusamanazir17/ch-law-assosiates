import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllFaqs,
  getFaqById,
  saveFaq,
  deleteFaq,
  reorderFaqs,
} from "@/lib/db/faqsStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const faq = await getFaqById(id);
      if (!faq) {
        return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, faq });
    }

    const faqs = await getAllFaqs();
    return NextResponse.json({ success: true, faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      await reorderFaqs(body.orderedIds);
      revalidatePath("/");
      return NextResponse.json({ success: true, message: "FAQs reordered successfully." });
    }

    if (!body.question || typeof body.question !== "string" || !body.question.trim()) {
      return NextResponse.json({ success: false, error: "Question is required" }, { status: 400 });
    }
    if (!body.answer || typeof body.answer !== "string" || !body.answer.trim()) {
      return NextResponse.json({ success: false, error: "Answer is required" }, { status: 400 });
    }

    const saved = await saveFaq(body);

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "FAQ saved successfully.",
      faq: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "FAQ ID is required" }, { status: 400 });
    }

    await deleteFaq(id);

    revalidatePath("/");

    return NextResponse.json({ success: true, message: "FAQ deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
