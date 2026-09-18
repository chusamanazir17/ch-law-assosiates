import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllPagesContent,
  getPageContentByRoute,
  updatePageContent,
} from "@/lib/db/pagesContentStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const route = request.nextUrl.searchParams.get("route");
    if (route) {
      const page = getPageContentByRoute(route);
      if (!page) {
        return NextResponse.json({ success: false, error: "Page content not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, page });
    }

    const pages = getAllPagesContent();
    return NextResponse.json({ success: true, pages });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load page content" },
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
    if ((!body.id || typeof body.id !== "string") && (!body.route || typeof body.route !== "string")) {
      return NextResponse.json({ success: false, error: "Page ID or route is required" }, { status: 400 });
    }

    const updated = updatePageContent(body);

    if (updated.route) {
      revalidatePath(updated.route);
    }
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Content for "${updated.title}" updated successfully.`,
      page: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update page content" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
