import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllTestimonials,
  getTestimonialById,
  saveTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from "@/lib/db/testimonialsStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const testimonial = await getTestimonialById(id);
      if (!testimonial) {
        return NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, testimonial });
    }

    const testimonials = await getAllTestimonials();
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load testimonials" },
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
      await reorderTestimonials(body.orderedIds);
      revalidatePath("/");
      return NextResponse.json({ success: true, message: "Testimonials reordered successfully." });
    }

    if (!body.clientName || typeof body.clientName !== "string" || !body.clientName.trim()) {
      return NextResponse.json({ success: false, error: "Client name is required" }, { status: 400 });
    }
    if (!body.comment || typeof body.comment !== "string" || !body.comment.trim()) {
      return NextResponse.json({ success: false, error: "Review comment is required" }, { status: 400 });
    }

    const saved = await saveTestimonial(body);

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Testimonial saved successfully.",
      testimonial: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save testimonial" },
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
      return NextResponse.json({ success: false, error: "Testimonial ID is required" }, { status: 400 });
    }

    await deleteTestimonial(id);

    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
