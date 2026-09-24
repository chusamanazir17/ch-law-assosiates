import { NextResponse, type NextRequest } from "next/server";
import { getUnifiedSession, canAccessOfficeSystem } from "@/lib/services/auth.service";
import {
  listTasks,
  createTaskRecord,
  updateTaskStatus,
  deleteTaskRecord,
} from "@/lib/services/tasks.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const assignedTo = request.nextUrl.searchParams.get("assigned_to") || undefined;

    const tasks = await listTasks({ status, assignedTo });
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("[API Office Tasks GET]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newTask = await createTaskRecord({
      title: body.title,
      description: body.description || null,
      assigned_to: body.assigned_to || body.assignedTo || null,
      case_id: body.case_id || body.caseId || null,
      client_id: body.client_id || body.clientId || null,
      due_date: body.due_date || body.dueDate || new Date().toISOString().split("T")[0],
      priority: (body.priority?.toLowerCase() as any) || "medium",
      status: (body.status?.toLowerCase() as any) || "pending",
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Tasks POST]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create task" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    const status = (body.status?.toLowerCase() as any) || "completed";
    await updateTaskStatus(body.id, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tasks PATCH]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update task" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getUnifiedSession();
    if (!session || !canAccessOfficeSystem(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    await deleteTaskRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tasks DELETE]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete task" }, { status: 400 });
  }
}
