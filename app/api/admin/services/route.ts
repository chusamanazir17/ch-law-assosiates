import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAllServices,
  getServiceBySlug,
  saveService,
  deleteService,
  isServiceSlugAvailable,
} from "@/lib/db/servicesStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = request.nextUrl.searchParams;

    // Live slug-uniqueness check for the admin editor.
    const checkSlug = params.get("checkSlug")?.trim().toLowerCase();
    if (checkSlug) {
      const excludeId = params.get("excludeId")?.trim() || undefined;
      const available = await isServiceSlugAvailable(checkSlug, excludeId);
      return NextResponse.json({ success: true, available });
    }

    const slug = params.get("slug");
    if (slug) {
      const service = await getServiceBySlug(slug);
      if (!service) {
        return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, service });
    }

    const services = await getAllServices();
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
    const existing =
      (body.id && (await getServiceBySlug(body.id))) ||
      (body.slug && (await getServiceBySlug(body.slug)));
    const effectiveName = body.name || existing?.name;

    if (!effectiveName || typeof effectiveName !== "string" || !effectiveName.trim()) {
      return NextResponse.json({ success: false, error: "Service name is required" }, { status: 400 });
    }

    const saved = await saveService({ ...(existing || {}), ...body, name: effectiveName });

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

    const deleted = await deleteService(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/#services");
    // The deleted slug is unknown here (id only) — revalidate the whole
    // /services tree so the removed page drops out of ISR cache.
    revalidatePath("/services", "layout");

    return NextResponse.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete service" },
      { status: 500 }
    );
  }
}

export const PUT = POST;
