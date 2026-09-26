import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { getAllSubscribers } from "@/lib/db/subscribersStore";
import { getAllInquiries } from "@/lib/db/inquiriesStore";
import { listAllPosts } from "@/lib/services/posts.service";
import { getAllServices } from "@/lib/db/servicesStore";
import { getAllTeamMembers } from "@/lib/db/teamMembersStore";
import { getAllTestimonials } from "@/lib/db/testimonialsStore";
import { getAllFaqs } from "@/lib/db/faqsStore";
import { listMediaAssets } from "@/lib/services/media.service";
import { listAnnouncements } from "@/lib/repositories/announcementsRepository";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const [
      subscribers,
      inquiries,
      posts,
      services,
      teamMembers,
      testimonials,
      faqs,
      mediaAssets,
      announcements,
    ] = await Promise.all([
      getAllSubscribers().catch(() => []),
      getAllInquiries().catch(() => []),
      listAllPosts().catch(() => []),
      getAllServices().catch(() => []),
      getAllTeamMembers().catch(() => []),
      getAllTestimonials().catch(() => []),
      getAllFaqs().catch(() => []),
      listMediaAssets().catch(() => []),
      listAnnouncements().catch(() => []),
    ]);

    const totalEmails = subscribers.length;
    const activeCount = subscribers.filter((s) => s.status === "active").length;
    const pendingCount = subscribers.filter((s) => s.status === "pending").length;
    const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;
    const suppressedCount = subscribers.filter((s) => s.status === "suppressed").length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const sub of subscribers) {
      for (const cat of sub.categories || []) {
        const name = cat.name || cat.slug || "General Tax";
        categoryCounts[name] = (categoryCounts[name] || 0) + 1;
      }
    }

    const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
      categoryName: name,
      count,
      percentage: totalEmails > 0 ? Math.round((count / totalEmails) * 100) : 0,
    }));

    const recentSignups = subscribers.slice(0, 5).map((sub) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      status: sub.status,
      created_at: sub.created_at,
      categories: (sub.categories || []).map((c) => c.name),
    }));

    const newInquiries = inquiries.filter(
      (inq) => inq.status === "new" || (inq.status as string) === "New"
    ).length;
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p) => p.status === "published").length;
    const draftPosts = posts.filter((p) => p.status === "draft").length;
    const activeNotice = announcements.find((a) => a.is_active) || null;

    return NextResponse.json({
      success: true,
      subscriberAnalytics: {
        totalEmails,
        activeCount,
        pendingCount,
        unsubscribedCount,
        suppressedCount,
        categoryBreakdown,
        recentSignups,
      },
      cmsStats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalMedia: mediaAssets.length,
        totalServices: services.length,
        totalTeam: teamMembers.length,
        totalTestimonials: testimonials.length,
        totalFaqs: faqs.length,
        totalInquiries: inquiries.length,
        newInquiries,
        activeNotice,
      },
      recentInquiries: inquiries.slice(0, 5),
      recentPosts: posts.slice(0, 6),
    });
  } catch (error) {
    console.error("[Admin Overview] Load error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard overview." },
      { status: 500 }
    );
  }
}
