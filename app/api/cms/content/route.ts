import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/db/siteSettingsStore";
import { getAllServices, getServiceBySlug } from "@/lib/db/servicesStore";
import { getAllPagesContent, getPageContentByRoute } from "@/lib/db/pagesContentStore";
import { getHomeSections } from "@/lib/db/homeSectionsStore";
import { getAllTeamMembers } from "@/lib/db/teamMembersStore";
import { getAllTestimonials } from "@/lib/db/testimonialsStore";
import { getAllFaqs } from "@/lib/db/faqsStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get("route");
    const serviceSlug = searchParams.get("service");

    const [settings, services, homeSections, teamMembers, testimonials, faqs] =
      await Promise.all([
        getSiteSettings(),
        getAllServices(),
        getHomeSections(),
        getAllTeamMembers(),
        getAllTestimonials(),
        getAllFaqs(),
      ]);

    if (route) {
      const page = await getPageContentByRoute(route);
      return NextResponse.json({
        success: true,
        settings,
        homeSections,
        page,
        teamMembers,
        testimonials,
        faqs,
      });
    }

    if (serviceSlug) {
      const service = await getServiceBySlug(serviceSlug);
      return NextResponse.json({
        success: true,
        settings,
        homeSections,
        service,
        teamMembers,
        testimonials,
        faqs,
      });
    }

    const pages = await getAllPagesContent();
    return NextResponse.json({
      success: true,
      settings,
      services,
      homeSections,
      pages,
      teamMembers,
      testimonials,
      faqs,
    });
  } catch (error) {
    console.error("[CmsContentAPI] Failed to fetch CMS content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load public CMS content" },
      { status: 500 }
    );
  }
}
