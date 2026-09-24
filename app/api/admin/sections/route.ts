import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getHomeSections,
  updateHomeSections,
  type HomeSectionsData,
} from "@/lib/db/homeSectionsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sections = await getHomeSections();
    return NextResponse.json({ success: true, sections });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load home sections",
      },
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
    const body = (await request.json()) as Partial<HomeSectionsData>;
    const updated = await updateHomeSections(body);

    // Revalidate public landing page and feeds
    revalidatePath("/");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      message: "Landing page sections updated successfully.",
      sections: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update home sections",
      },
      { status: 500 }
    );
  }
}

export const PUT = POST;
