import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllCategories,
  getCategoryBySlugOrId,
  saveCategory,
  deleteCategory,
  isCategorySlugAvailable,
  validateCategoryInput,
} from "@/lib/db/categoriesStore";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const params = request.nextUrl.searchParams;

    // Live slug-uniqueness check for the admin editor.
    const checkSlug = params.get("checkSlug")?.trim().toLowerCase();
    if (checkSlug) {
      const excludeId = params.get("excludeId")?.trim() || undefined;
      const available = await isCategorySlugAvailable(checkSlug, excludeId);
      return NextResponse.json({ success: true, available });
    }

    const slugOrId = (params.get("id") || params.get("slug"))?.trim();
    if (slugOrId) {
      const category = await getCategoryBySlugOrId(slugOrId);
      if (!category) {
        return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, category });
    }

    const categories = await getAllCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load categories") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const input = validateCategoryInput(await request.json());
    const category = await saveCategory(input);
    revalidatePath("/updates");

    return NextResponse.json({
      success: true,
      message: input.id ? "Category updated successfully." : "Category created successfully.",
      category,
    });
  } catch (error) {
    const message = errorMessage(error, "Failed to save category");
    const isValidation = !message.toLowerCase().includes("database") && !message.startsWith("Unable to");
    return NextResponse.json(
      { success: false, error: message },
      { status: isValidation ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const params = request.nextUrl.searchParams;
    const target = (params.get("id") || params.get("slug"))?.trim();
    if (!target) {
      return NextResponse.json(
        { success: false, error: "Category ID or slug is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCategory(target);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to delete category") },
      { status: 500 }
    );
  }
}

export const PUT = POST;
