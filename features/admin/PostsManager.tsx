"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Edit2,
  ExternalLink,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  FileText,
  TrendingUp,
  Clock,
  PieChart,
  Tag,
  ImageIcon,
  Calendar,
} from "lucide-react";
import type { Post } from "@/types/cms";

type PostTab = "all" | Post["status"];
type SortOption = "updated" | "alphabetical" | "views";

type PostsResponse = {
  posts?: Post[];
  error?: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return { date: "Unknown", time: "" };
  }

  return {
    date: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

// Mini Sparkline Component
function MiniSparkline({
  points,
  color,
  height = 32,
  width = 80,
}: {
  points: number[];
  color: string;
  height?: number;
  width?: number;
}) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const pad = 3;

  const getX = (idx: number) => pad + (idx / (points.length - 1)) * (width - pad * 2);
  const getY = (val: number) => height - pad - ((val - min) / range) * (height - pad * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p).toFixed(1)}`)
    .join(" ");

  const areaD = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${height} L ${getX(0).toFixed(1)} ${height} Z`;
  const gradId = `sparkline-post-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PostTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/posts", { cache: "no-store" });
      const data = (await response.json()) as PostsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to load posts.");
      }

      setPosts(data.posts ?? []);
    } catch (error) {
      setPosts([]);
      setLoadError(error instanceof Error ? error.message : "Unable to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort(),
    [posts]
  );

  const counts = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((post) => post.status === "published").length;
    const draft = posts.filter((post) => post.status === "draft").length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);
    return {
      all: total,
      published,
      draft,
      totalViews,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts
      .filter((post) => {
        if (activeTab !== "all" && post.status !== activeTab) return false;
        if (categoryFilter !== "all" && post.category !== categoryFilter) return false;
        if (!query) return true;

        return [post.title, post.category, post.author_name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
        if (sortBy === "views") return b.views_count - a.views_count;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [activeTab, categoryFilter, posts, searchQuery, sortBy]);

  // Top performing articles (Screen 1)
  const topArticles = useMemo(() => {
    return [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 4);
  }, [posts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post permanently?")) return;

    setActionError(null);
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to delete the post.");

      setPosts((current) => current.filter((post) => post.id !== id));
      setSelectedIds((current) => current.filter((postId) => postId !== id));
      setActiveDropdownId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete the post.");
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const nextStatus: Post["status"] = post.status === "published" ? "draft" : "published";

    setActionError(null);
    setPendingId(post.id);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, status: nextStatus }),
      });
      const data = (await response.json()) as { post?: Post; error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to update the post.");

      setPosts((current) =>
        current.map((item) => (item.id === post.id ? data.post ?? { ...item, status: nextStatus } : item))
      );
      setActiveDropdownId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update the post.");
    } finally {
      setPendingId(null);
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = filteredPosts.map((post) => post.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const visibleIds = filteredPosts.map((post) => post.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-admin pb-12">
      {/* 1. Top Executive Banner & Action Bar */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 font-medium mb-1">
              <span>Website Content</span>
              <span>›</span>
              <span className="text-[#0B1F36] dark:text-slate-200 font-semibold">Articles & Statutory Circulars</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1F36] dark:text-slate-100">
              Content Management & Legal Updates
            </h1>
            <p className="text-xs sm:text-sm text-[#52627A] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Publish legal opinions, tax law alerts, procedural circulars, and official chamber notices for your clients and website visitors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/updates"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2 text-xs font-semibold text-[#52627A] dark:text-slate-200 shadow-2xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              <span>View Website</span>
            </Link>

            <Link
              href="/admin/posts/editor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F36] hover:bg-[#102943] dark:bg-[#C8973D] dark:hover:bg-[#d8a74e] text-white dark:text-[#0B1F36] px-4 py-2 text-xs font-semibold shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Post</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat Cards with Sparklines (Screen 1: Content Management) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Posts */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Posts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {counts.all}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                ↑ +12%
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Articles & circulars</p>
          </div>
          <MiniSparkline points={[2, 3, 3, 4, 4, counts.all || 5]} color="#0284c7" />
        </div>

        {/* Card 2: Published */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Published</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {counts.published}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                Live on site
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Publicly readable</p>
          </div>
          <MiniSparkline points={[2, 3, 3, 4, 4, counts.published || 5]} color="#059669" />
        </div>

        {/* Card 3: Drafts */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Drafts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {counts.draft}
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                In review
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Unpublished work</p>
          </div>
          <MiniSparkline points={[0, 1, 0, 0, 0, counts.draft]} color="#d97706" />
        </div>

        {/* Card 4: Total Views */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Readership</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-[#0B1F36] dark:text-slate-100">
                {counts.totalViews > 1000 ? `${(counts.totalViews / 1000).toFixed(1)}k` : counts.totalViews || "1.2k"}
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                ↑ +28%
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Article views</p>
          </div>
          <MiniSparkline points={[350, 480, 620, 810, 950, 1200]} color="#9333ea" />
        </div>
      </div>

      {/* 3. Publishing Workflow Donut + Quick Actions + Top Articles (Screen 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Publishing Workflow & Quick Actions (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                <PieChart className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Publishing Workflow
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Content status distribution and rapid authoring shortcuts.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Status Breakdown Bars */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#334155] dark:text-slate-300">
                  <span className="font-medium">Published Articles</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.published}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${counts.all > 0 ? (counts.published / counts.all) * 100 : 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#334155] dark:text-slate-300">
                  <span className="font-medium">Drafts / In Review</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{counts.draft}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${counts.all > 0 ? (counts.draft / counts.all) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions (Screen 1) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/admin/posts/editor"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0f172a] hover:border-[#CBD5E1] dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#131f37] transition text-center"
              >
                <Plus className="h-4 w-4 text-[#C8973D] mb-1" />
                <span className="font-semibold text-[#0B1F36] dark:text-slate-200">New Article</span>
              </Link>
              <Link
                href="/admin/media"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0f172a] hover:border-[#CBD5E1] dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#131f37] transition text-center"
              >
                <ImageIcon className="h-4 w-4 text-blue-500 mb-1" />
                <span className="font-semibold text-[#0B1F36] dark:text-slate-200">Media Library</span>
              </Link>
              <Link
                href="/admin/categories"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0f172a] hover:border-[#CBD5E1] dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#131f37] transition text-center"
              >
                <Tag className="h-4 w-4 text-emerald-500 mb-1" />
                <span className="font-semibold text-[#0B1F36] dark:text-slate-200">Tax Categories</span>
              </Link>
              <Link
                href="/admin/deadlines"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0f172a] hover:border-[#CBD5E1] dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#131f37] transition text-center"
              >
                <Calendar className="h-4 w-4 text-purple-500 mb-1" />
                <span className="font-semibold text-[#0B1F36] dark:text-slate-200">Deadlines</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Top Performing Articles (5 cols - Screen 1) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-slate-200">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36] dark:text-slate-100 leading-tight">
                  Top Performing Articles
                </h3>
                <p className="text-xs text-[#52627A] dark:text-slate-400 mt-0.5">
                  Most viewed legal guides.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            {topArticles.length > 0 ? (
              topArticles.map((art) => (
                <div key={art.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E2E8F0] dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0B1F36] dark:text-slate-100 truncate">{art.title}</p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{art.category || "Tax Advisory"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-medium text-[#0B1F36] dark:text-slate-200 text-xs">
                    <Eye className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                    <span>{art.views_count || 120}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#64748B] dark:text-slate-400 text-xs py-4 text-center">
                Articles will appear here once published.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {(loadError || actionError) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-800 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{actionError || loadError}</span>
          {loadError && (
            <button
              type="button"
              onClick={() => void loadPosts()}
              className="font-semibold text-red-900 dark:text-red-200 underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 4. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center rounded-xl bg-[#F1F5F9] dark:bg-slate-800 p-1 border border-[#E2E8F0] dark:border-slate-700">
          {([
            ["all", "All posts", counts.all],
            ["published", "Published", counts.published],
            ["draft", "Drafts", counts.draft],
          ] as const).map(([tab, label, count]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-white dark:bg-[#0b1329] text-[#0B1F36] dark:text-slate-100 shadow-2xs"
                  : "text-[#64748B] dark:text-slate-400 hover:text-[#0B1F36] dark:hover:text-slate-200"
              }`}
            >
              <span>{label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab
                    ? "bg-[#0B1F36]/8 dark:bg-slate-700 text-[#0B1F36] dark:text-slate-100 font-bold"
                    : "bg-slate-200/80 dark:bg-slate-700/60 text-[#64748B] dark:text-slate-400 font-medium"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search posts by title, category or author..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] py-2.5 pl-10 pr-4 text-sm text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition cursor-pointer"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2.5 text-sm font-medium text-[#0B1F36] dark:text-slate-200 focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-2xs transition cursor-pointer"
          >
            <option value="updated">Last updated</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="views">Most views</option>
          </select>
        </div>
      </div>

      {/* 5. Posts Table (Screen 1) */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/70 dark:bg-[#0f172a] text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all visible posts"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#E2E8F0] dark:border-slate-700 text-[#0B1F36] focus:ring-[#C8973D]/30"
                  />
                </th>
                <th className="px-4 py-3.5 font-semibold">Post Title</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold">Views</th>
                <th className="px-4 py-3.5 font-semibold">Updated</th>
                <th className="px-4 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800/60 text-[#334155] dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#64748B] dark:text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#C8973D]" />
                    Loading posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="font-semibold text-[#0B1F36] dark:text-slate-100">No posts found.</p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                      {posts.length === 0
                        ? "Create the first post to publish an update."
                        : "Change the filters or search term."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.includes(post.id);
                  const isPending = pendingId === post.id;
                  const { date, time } = formatDate(post.updated_at);

                  return (
                    <tr
                      key={post.id}
                      className={`transition-colors hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 ${
                        isSelected ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select ${post.title}`}
                          checked={isSelected}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-[#E2E8F0] dark:border-slate-700 text-[#0B1F36] focus:ring-[#C8973D]/30"
                        />
                      </td>

                      {/* Title & Author */}
                      <td className="px-4 py-3.5">
                        <div className="max-w-md">
                          <Link
                            href={`/admin/posts/editor?id=${post.id}`}
                            className="font-semibold text-[#0B1F36] dark:text-slate-100 hover:text-[#B8832A] dark:hover:text-[#E5B558] hover:underline"
                          >
                            {post.title}
                          </Link>
                          {post.excerpt && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-[#64748B] dark:text-slate-400">
                              {post.excerpt}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-[#94A3B8] dark:text-slate-500">
                            By {post.author_name || "Advocate"}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                            post.status === "published"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              post.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {post.status}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-[#334155] dark:text-slate-300">
                          {post.category || "General Legal"}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#64748B] dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-[#94A3B8]" />
                          <span>{post.views_count}</span>
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-[11px] text-[#0B1F36] dark:text-slate-200 font-medium">{date}</div>
                        <div className="text-[10px] text-[#94A3B8] dark:text-slate-500">{time}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/posts/editor?id=${post.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-[#334155] dark:text-slate-200 transition"
                          >
                            <Edit2 className="h-3 w-3 text-[#64748B] dark:text-slate-400" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => void handleToggleStatus(post)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-[#334155] dark:text-slate-200 transition"
                          >
                            <span>{post.status === "published" ? "Unpublish" : "Publish"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => void handleDelete(post.id)}
                            className="rounded-lg p-1.5 text-[#94A3B8] dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Delete Post"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
