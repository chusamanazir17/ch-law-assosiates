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
    date: date.toLocaleDateString("en-GB", {
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

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      draft: posts.filter((post) => post.status === "draft").length,
    }),
    [posts]
  );

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
    <div className="space-y-6">
      <div className="text-xs font-medium text-[#64748B] flex items-center gap-1.5">
        <span>Website</span>
        <span className="text-[#94A3B8]">/</span>
        <span className="text-[#0B1F36] font-semibold">Posts</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">Legal Updates & Posts</h1>
          <p className="text-xs text-[#52627A] mt-0.5 leading-relaxed">Create, review and publish website updates and statutory circulars.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/updates"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-2xs transition hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
            <span>View website</span>
          </Link>
          <Link
            href="/admin/posts/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F36] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102943]"
          >
            <Plus className="h-4 w-4 text-[#C8973D]" />
            <span>Create post</span>
          </Link>
        </div>
      </div>

      {(loadError || actionError) && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{actionError || loadError}</span>
          {loadError && (
            <button
              type="button"
              onClick={() => void loadPosts()}
              className="font-semibold text-red-900 underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="border-b border-[#E2E8F0]">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Post status filters">
          {([
            ["all", "All posts", counts.all],
            ["published", "Published", counts.published],
            ["draft", "Drafts", counts.draft],
          ] as const).map(([tab, label, count]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 pt-1 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#0B1F36] text-[#0B1F36]"
                  : "border-transparent text-[#64748B] hover:text-[#0B1F36]"
              }`}
            >
              <span>{label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  activeTab === tab ? "bg-[#0B1F36] text-white" : "bg-slate-100 text-[#64748B]"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Search posts</span>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Search title, category or author..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] shadow-2xs outline-none transition focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="appearance-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-3.5 pr-9 text-xs font-medium text-[#0B1F36] shadow-2xs outline-none transition focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20 cursor-pointer"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          </label>

          <label className="relative">
            <span className="sr-only">Sort posts</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="appearance-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-3.5 pr-9 text-xs font-medium text-[#0B1F36] shadow-2xs outline-none transition focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20 cursor-pointer"
            >
              <option value="updated">Last updated</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="views">Most views</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                <th className="w-12 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all visible posts"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]/30"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="w-16 px-4 py-3 text-right font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-[#64748B]">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#C8973D]" />
                    Loading posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="font-semibold text-[#0B1F36]">No posts found.</p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {posts.length === 0 ? "Create the first post to publish an update." : "Change the filters or search term."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isChecked = selectedIds.includes(post.id);
                  const { date, time } = formatDate(post.updated_at);
                  const isMenuOpen = activeDropdownId === post.id;
                  const isPending = pendingId === post.id;

                  return (
                    <tr key={post.id} className="group transition-colors hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select ${post.title}`}
                          checked={isChecked}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]/30"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-64 items-center gap-3">
                          <div className="h-10 w-13 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-slate-100">
                            {post.cover_image_url ? (
                              <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[#94A3B8]">POST</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/posts/editor?slug=${encodeURIComponent(post.slug)}`}
                              className="block truncate text-xs font-semibold text-[#0B1F36] transition-colors hover:text-[#B8832A]"
                            >
                              {post.title}
                            </Link>
                            <span className="mt-0.5 block text-[11px] text-[#64748B]">By {post.author_name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10.5px] font-semibold ${
                            post.status === "published"
                              ? "border-[#C8973D]/40 bg-[#FDF8EE] text-[#96641E]"
                              : "border-[#E2E8F0] bg-slate-100 text-[#64748B]"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#52627A]">{post.category}</td>
                      <td className="px-4 py-3 tabular-nums text-[#64748B] font-mono">{post.views_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-[#52627A]">
                        <div className="font-medium text-[#0B1F36]">{date}</div>
                        {time && <div className="text-[11px] text-[#94A3B8]">{time}</div>}
                      </td>

                      <td className="relative px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(isMenuOpen ? null : post.id)}
                          disabled={isPending}
                          className="rounded-md p-1.5 text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#0B1F36] disabled:cursor-wait disabled:opacity-50"
                          aria-label={`Actions for ${post.title}`}
                          aria-expanded={isMenuOpen}
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </button>

                        {isMenuOpen && !isPending && (
                          <div className="absolute right-4 top-10 z-30 w-40 rounded-xl border border-[#E2E8F0] bg-white py-1 text-left shadow-lg">
                            <Link href={`/admin/posts/editor?slug=${encodeURIComponent(post.slug)}`} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0B1F36] hover:bg-[#F8FAFC]">
                              <Edit2 className="h-3.5 w-3.5 text-[#64748B]" />
                              Edit
                            </Link>
                            {post.status === "published" && (
                              <Link href={`/updates/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0B1F36] hover:bg-[#F8FAFC]">
                                <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                                View live
                              </Link>
                            )}
                            <button type="button" onClick={() => void handleToggleStatus(post)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-[#0B1F36] hover:bg-[#F8FAFC]">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#64748B]" />
                              {post.status === "published" ? "Move to draft" : "Publish"}
                            </button>
                            <button type="button" onClick={() => void handleDelete(post.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              Delete permanently
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs text-[#52627A] sm:flex-row sm:items-center sm:justify-between">
          <span>{filteredPosts.length} visible of {posts.length} total posts</span>
          {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
        </div>
      </div>
    </div>
  );
}
