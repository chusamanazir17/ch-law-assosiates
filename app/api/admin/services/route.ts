import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllServices,
  getServiceBySlug,
  saveService,
  deleteService,
} from "@/lib/db/servicesStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (slug) {
      const service = getServiceBySlug(slug);
      if (!service) {
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, service });
    }

    const services = getAllServices();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load services" },
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
    const existing = (body.id && getServiceBySlug(body.id)) || (body.slug && getServiceBySlug(body.slug));
    const effectiveName = body.name || existing?.name;

    if (!effectiveName || typeof effectiveName !== "string" || !effectiveName.trim()) {
      return NextResponse.json({ success: false, error: "Service name is required" }, { status: 400 });
    }

    const saved = saveService({ ...(existing || {}), ...body, name: effectiveName });

    revalidatePath("/");
    revalidatePath("/#services");
    revalidatePath(`/services/${saved.slug}`);

    return NextResponse.json({
      success: true,
      message: "Service saved successfully.",
      service: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save service" },
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
      return NextResponse.json({ success: false, error: "Service ID is required" }, { status: 400 });
    }

    const deleted = deleteService(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/#services");

    return NextResponse.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete service" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
