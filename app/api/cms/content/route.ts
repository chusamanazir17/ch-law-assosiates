import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/db/siteSettingsStore";
import { getAllServices, getServiceBySlug } from "@/lib/db/servicesStore";
import { getAllPagesContent, getPageContentByRoute } from "@/lib/db/pagesContentStore";
import { getHomeSections } from "@/lib/db/homeSectionsStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get("route");
    const serviceSlug = searchParams.get("service");

    const settings = await getSiteSettings();
    const services = await getAllServices();
    const homeSections = await getHomeSections();

    if (route) {
      const page = await getPageContentByRoute(route);
      return NextResponse.json({
        success: true,
        settings,
        homeSections,
        page,
      });
    }

    if (serviceSlug) {
      const service = await getServiceBySlug(serviceSlug);
      return NextResponse.json({
        success: true,
        settings,
        homeSections,
        service,
      });
    }

    const pages = await getAllPagesContent();
    return NextResponse.json({
      success: true,
      settings,
      services,
      homeSections,
      pages,
    });
  } catch (error) {
    console.error("[CmsContentAPI] Failed to fetch CMS content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load public CMS content" },
      { status: 500 }
    );
  }
}
