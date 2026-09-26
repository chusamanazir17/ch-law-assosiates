import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllTeamMembers,
  getTeamMemberById,
  saveTeamMember,
  deleteTeamMember,
  reorderTeamMembers,
} from "@/lib/db/teamMembersStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const member = await getTeamMemberById(id);
      if (!member) {
        return NextResponse.json({ success: false, error: "Team member not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, member });
    }

    const members = await getAllTeamMembers();
    return NextResponse.json({ success: true, members });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load team members" },
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
      await reorderTeamMembers(body.orderedIds);
      revalidatePath("/");
      revalidatePath("/about");
      return NextResponse.json({ success: true, message: "Team members reordered successfully." });
    }

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Full name is required" }, { status: 400 });
    }
    if (!body.role || typeof body.role !== "string" || !body.role.trim()) {
      return NextResponse.json({ success: false, error: "Job title / role is required" }, { status: 400 });
    }

    const saved = await saveTeamMember(body);

    revalidatePath("/");
    revalidatePath("/about");

    return NextResponse.json({
      success: true,
      message: "Team member saved successfully.",
      member: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save team member" },
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
      return NextResponse.json({ success: false, error: "Team member ID is required" }, { status: 400 });
    }

    await deleteTeamMember(id);

    revalidatePath("/");
    revalidatePath("/about");

    return NextResponse.json({ success: true, message: "Team member deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete team member" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
