import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  listAnnouncements,
  saveNotice,
  toggleNotice,
  deleteNotice,
} from "@/lib/repositories/announcementsRepository";

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
    const announcements = await listAnnouncements();
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to load announcements") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const { id, title, message, tone, link_url, link_text, is_active } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required." },
        { status: 400 }
      );
    }

    const saved = await saveNotice({
      id,
      title,
      message,
      tone,
      link_url,
      link_text,
      is_active,
    });

    revalidatePath("/");
    revalidatePath("/updates");

    return NextResponse.json({ success: true, announcement: saved });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to save announcement") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Announcement ID is required" }, { status: 400 });
    }

    const updated = await toggleNotice(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Announcement not found" }, { status: 404 });
    }

    revalidatePath("/");

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to toggle announcement") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Announcement ID is required" }, { status: 400 });
    }

    const success = await deleteNotice(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Announcement not found" }, { status: 404 });
    }

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: errorMessage(error, "Failed to delete announcement") },
      { status: 500 }
    );
  }
}
