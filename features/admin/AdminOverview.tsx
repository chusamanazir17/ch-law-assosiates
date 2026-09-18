"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  Send,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Image as ImageIcon,
  Megaphone,
  MessageSquareText,
  CalendarCheck,
  Plus,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Phone,
  MessageCircle,
  FileText,
  Boxes,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ConsultationInquiry, Post, SubscriberAnalytics, SiteAnnouncement } from "@/types/cms";

type DashboardPost = Pick<Post, "id" | "title" | "slug" | "category" | "status" | "views_count" | "created_at" | "published_at">;
type DashboardInquiry = Pick<ConsultationInquiry, "id" | "name" | "phone" | "service_needed" | "status" | "created_at" | "message">;

export default function AdminOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Email Signups Telemetry State
  const [subscriberAnalytics, setSubscriberAnalytics] = useState<SubscriberAnalytics>({
    totalEmails: 0,
    activeCount: 0,
    pendingCount: 0,
    unsubscribedCount: 0,
    suppressedCount: 0,
    categoryBreakdown: [],
    recentSignups: [],
  });

  // CMS Metrics State
  const [cmsStats, setCmsStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalMedia: 0,
    newInquiries: 0,
    activeNotice: null as SiteAnnouncement | null,
  });

  // Tax Deadlines & Activity
  const [recentInquiries, setRecentInquiries] = useState<DashboardInquiry[]>([]);
  const [recentPosts, setRecentPosts] = useState<DashboardPost[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // 1. Try aggregated admin overview API
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.subscriberAnalytics) setSubscriberAnalytics(json.subscriberAnalytics);
          if (json.cmsStats) setCmsStats(json.cmsStats);
          if (json.recentInquiries) setRecentInquiries(json.recentInquiries);
          setIsLoading(false);
          return;
        }
      }

      // 2. Direct Supabase fallback if API returned non-success
      const supabase = createClient();
      const { data: allSubscribers } = await supabase
        .from("subscribers")
        .select("id, name, email, status, created_at");

      const subscribers: any[] = (allSubscribers as any[]) || [];
      const totalEmails = subscribers.length;
      const activeCount = subscribers.filter((s: any) => s.status === "active").length;
      const pendingCount = subscribers.filter((s: any) => s.status === "pending").length;
      const unsubscribedCount = subscribers.filter((s: any) => s.status === "unsubscribed").length;
      const suppressedCount = subscribers.filter((s: any) => s.status === "suppressed").length;

      setSubscriberAnalytics({
        totalEmails,
        activeCount,
        pendingCount,
        unsubscribedCount,
        suppressedCount,
        categoryBreakdown: [],
        recentSignups: subscribers.slice(0, 5).map((s: any) => ({
          id: s.id,
          name: s.name || "Anonymous",
          email: s.email,
          status: s.status,
          created_at: s.created_at,
          categories: [],
        })),
      });
    } catch (err) {
      console.warn("[AdminOverview Notice]", err);
      // Non-fatal fallback keeps UI interactive
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Breadcrumbs */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Office CMS</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700 font-medium">Dashboard</span>
      </div>

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Monitor client subscriber signups, manage legal content, and review inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/posts/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create post</span>
          </Link>

          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <ImageIcon className="h-4 w-4 text-slate-500" />
            <span>Media</span>
          </Link>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-2xs transition"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{loadError}</span>
          <button type="button" onClick={loadData} className="shrink-0 font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* 1. HERO SECTION: EMAIL SIGNUPS TELEMETRY */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-800" />
              <h2 className="text-base font-bold text-slate-900">
                Email Signups & Audience Telemetry
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Live counter and status of clients registered for automated tax deadline reminders.
            </p>
          </div>
          <Link
            href="/admin/subscribers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
          >
            <span>View All Subscribers</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Registered */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-600">Total Subscribers</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : subscriberAnalytics.totalEmails}
              </span>
              <span className="text-[11.5px] font-medium text-slate-500">Registered</span>
            </div>
            <p className="text-[12px] text-slate-500 truncate">
              Clients opted-in via website reminder forms
            </p>
          </div>

          {/* Active Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-600">Active Recipients</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef7f2] text-[#075e38]">
                <UserCheck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : subscriberAnalytics.activeCount}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#eef7f2] border border-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-[#075e38]">
                {subscriberAnalytics.totalEmails > 0
                  ? `${Math.round((subscriberAnalytics.activeCount / subscriberAnalytics.totalEmails) * 100)}% active`
                  : "100%"}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 truncate">
              Receiving statutory reminder dispatches
            </p>
          </div>

          {/* Pending Verification */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-600">Pending Verification</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-amber-600" /> : subscriberAnalytics.pendingCount}
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Double opt-in
              </span>
            </div>
            <p className="text-[12px] text-slate-500 truncate">
              Awaiting verification link confirmation
            </p>
          </div>

          {/* Opted-Out */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs flex flex-col justify-between h-[132px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-600">Opted-Out</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  subscriberAnalytics.unsubscribedCount + subscriberAnalytics.suppressedCount
                )}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Inactive
              </span>
            </div>
            <p className="text-[12px] text-slate-500 truncate">
              Safe unsubscription links honored automatically
            </p>
          </div>
        </div>

        {/* Category breakdown if available */}
        {subscriberAnalytics.categoryBreakdown.length > 0 && (
          <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Subscriber Interest by Tax Category
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {subscriberAnalytics.categoryBreakdown.map((cat) => (
                <div key={cat.categoryName} className="rounded-md bg-white p-2.5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-800">
                    <span className="truncate pr-1">{cat.categoryName}</span>
                    <span className="text-emerald-800 font-bold shrink-0">{cat.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full"
                      style={{ width: `${Math.min(cat.percentage * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. CMS CONTENT METRICS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Posts Card */}
        <Link
          href="/admin/posts"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {cmsStats.totalPosts}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">Articles & Posts</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              {cmsStats.publishedPosts} published • {cmsStats.draftPosts} draft
            </p>
          </div>
        </Link>

        {/* Media Card */}
        <Link
          href="/admin/media"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <ImageIcon className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-700 transition" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {cmsStats.totalMedia}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">Media & Images</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">Stored image assets & banners</p>
          </div>
        </Link>

        {/* Inquiries Card */}
        <Link
          href="/admin/inquiries"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {cmsStats.newInquiries}
              </span>
              {cmsStats.newInquiries > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                  New
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">Consultation Leads</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">Direct client requests</p>
          </div>
        </Link>

        {/* Announcements Card */}
        <Link
          href="/admin/announcements"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Megaphone className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700 transition" />
          </div>
          <div className="mt-4">
            <p className="text-[14px] font-bold text-slate-900 tracking-tight truncate">
              {cmsStats.activeNotice ? cmsStats.activeNotice.title : "No active site announcement"}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">Site Notice / Ticker</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              {cmsStats.activeNotice ? "Currently live on site" : "Nothing is currently published"}
            </p>
          </div>
        </Link>
      </div>

      {/* 2.5 WEBSITE CMS CONTROL CENTER */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Website Content Management Hub</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Customize text, headlines, hero photography, legal practices, and navigation in real time.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
          >
            <span>Open Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/pages"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-emerald-600 hover:bg-white hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-800">
                  <FileText className="h-4.5 w-4.5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Pages Content Editor</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                Update headlines, subtitles, badges, hero images, and CTA buttons across all 11 public pages.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-700">
              11 Editable Pages →
            </div>
          </Link>

          <Link
            href="/admin/services"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-emerald-600 hover:bg-white hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100/80 text-blue-800">
                  <Boxes className="h-4.5 w-4.5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Services Catalog Editor</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                Manage 9 legal practices, Pakistani legal terms, required documents, turnaround times, and DC fee rates.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-blue-700">
              9 Chamber Practices →
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-emerald-600 hover:bg-white hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100/80 text-amber-800">
                  <Settings className="h-4.5 w-4.5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-700 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Firm Identity & Navigation</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                Configure Chamber 121 address, emergency hotlines, working hours, and header menu links.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-amber-700">
              Navigation & Identity →
            </div>
          </Link>
        </div>
      </div>

      {/* 3. RECENT POSTS AND LEADS ROW */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts Table Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Posts</h3>
            <Link href="/admin/posts" className="text-xs font-semibold text-emerald-800 hover:underline">
              View All
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recentPosts.length === 0 ? (
              <p className="py-4 text-xs text-slate-500 text-center">No posts created yet.</p>
            ) : (
              recentPosts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/posts/editor?slug=${p.slug}`}
                      className="font-semibold text-slate-900 hover:text-emerald-700 block truncate"
                    >
                      {p.title}
                    </Link>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {p.category} • {p.status}
                    </span>
                  </div>
                  <Link
                    href={`/updates/${p.slug}`}
                    target="_blank"
                    className="shrink-0 text-slate-400 hover:text-slate-700 p-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consultation Inquiries Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Client Consultation Inquiries</h3>
            <Link href="/admin/inquiries" className="text-xs font-semibold text-emerald-800 hover:underline">
              Inbox
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recentInquiries.length === 0 ? (
              <p className="py-4 text-xs text-slate-500 text-center">No consultation inquiries yet.</p>
            ) : (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">{inq.name}</span>
                    <span className="text-slate-400 text-[11px] block truncate">
                      {inq.service_needed} • {inq.phone}
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] font-semibold hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
