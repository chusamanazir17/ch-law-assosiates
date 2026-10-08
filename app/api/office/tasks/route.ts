import { NextResponse, type NextRequest } from "next/server";
import {
  requireOfficeAccess,
  officeErrorResponse,
} from "@/lib/auth/officePermissions";
import {
  listTasks,
  createTaskRecord,
  updateTaskStatus,
  deleteTaskRecord,
} from "@/lib/services/tasks.service";
import {
  validateBody,
  taskCreateSchema,
  taskStatusSchema,
} from "@/lib/validation/office";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tasks", "GET", request);
    if (!auth.ok) return auth.response;

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const assignedTo = request.nextUrl.searchParams.get("assigned_to") || undefined;

    const tasks = await listTasks({ status, assignedTo });
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    console.error("[API Office Tasks GET]", error);
    return officeErrorResponse(error, "Failed to load tasks", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tasks", "POST", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    // Normalize UI spellings ("In Progress") to the DB enum ("in_progress").
    const normalizedStatus = (body.status?.toLowerCase?.() || body.status || "")
      .replace(/\s+/g, "_");
    const validated = validateBody(taskCreateSchema, {
      title: body.title,
      description: body.description,
      assigned_to: body.assigned_to || body.assignedTo,
      case_id: body.case_id || body.caseId,
      client_id: body.client_id || body.clientId,
      due_date: body.due_date || body.dueDate,
      priority: (body.priority?.toLowerCase?.() || body.priority || "").replace(/\s+/g, "_"),
      status: normalizedStatus || undefined,
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    const newTask = await createTaskRecord(validated.data as any);
    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error: any) {
    console.error("[API Office Tasks POST]", error);
    return officeErrorResponse(error, "Failed to create task");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tasks", "PATCH", request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    const validated = validateBody(taskStatusSchema, {
      status: (body.status?.toLowerCase?.() || body.status || "completed").replace(/\s+/g, "_"),
    });
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }

    await updateTaskStatus(body.id, (validated.data as { status: "pending" | "in_progress" | "completed" | "cancelled" }).status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tasks PATCH]", error);
    return officeErrorResponse(error, "Failed to update task");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOfficeAccess("tasks", "DELETE", request);
    if (!auth.ok) return auth.response;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    await deleteTaskRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Office Tasks DELETE]", error);
    return officeErrorResponse(error, "Failed to delete task");
  }
}
