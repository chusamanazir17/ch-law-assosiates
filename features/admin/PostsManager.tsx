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
      <div className="text-[13px] text-slate-500">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Posts</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Posts</h1>
          <p className="mt-1 text-sm text-slate-500">Create, review and publish website updates.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/updates"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            View website
          </Link>
          <Link
            href="/admin/posts/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#064e2e]"
          >
            <Plus className="h-4 w-4" />
            Create post
          </Link>
        </div>
      </div>

      {(loadError || actionError) && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto text-[13.5px]" aria-label="Post status filters">
          {([
            ["all", "All posts", counts.all],
            ["published", "Published", counts.published],
            ["draft", "Drafts", counts.draft],
          ] as const).map(([tab, label, count]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 pt-1 font-medium transition-colors ${
                activeTab === tab
                  ? "border-[#075e38] text-[#075e38]"
                  : "border-transparent text-slate-600 hover:text-slate-950"
              }`}
            >
              {label}
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab ? "bg-emerald-50 text-[#075e38]" : "bg-slate-100 text-slate-600"
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
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search title, category or author"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13.5px] text-slate-800 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[13.5px] text-slate-700 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>

          <label className="relative">
            <span className="sr-only">Sort posts</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[13.5px] text-slate-700 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
            >
              <option value="updated">Last updated</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="views">Most views</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[13px] font-medium text-slate-700">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all visible posts"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                </th>
                <th className="px-4 py-3.5 font-medium">Post</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Views</th>
                <th className="px-4 py-3.5 font-medium">Updated</th>
                <th className="w-16 px-4 py-3.5 text-right font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-700" />
                    Loading posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <p className="font-medium text-slate-700">No posts found.</p>
                    <p className="mt-1 text-sm text-slate-500">
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
                    <tr key={post.id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select ${post.title}`}
                          checked={isChecked}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-64 items-center gap-3.5">
                          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {post.cover_image_url ? (
                              <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-slate-400">POST</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/posts/editor?slug=${encodeURIComponent(post.slug)}`}
                              className="block truncate text-[14px] font-semibold leading-snug text-slate-900 transition-colors hover:text-emerald-700"
                            >
                              {post.title}
                            </Link>
                            <span className="mt-0.5 block text-[12px] text-slate-500">By {post.author_name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-medium ${
                            post.status === "published"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">{post.category}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-600">{post.views_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600">
                        <div>{date}</div>
                        {time && <div className="text-[11.5px] text-slate-400">{time}</div>}
                      </td>

                      <td className="relative px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(isMenuOpen ? null : post.id)}
                          disabled={isPending}
                          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-wait disabled:opacity-50"
                          aria-label={`Actions for ${post.title}`}
                          aria-expanded={isMenuOpen}
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </button>

                        {isMenuOpen && !isPending && (
                          <div className="absolute right-4 top-10 z-30 w-40 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                            <Link href={`/admin/posts/editor?slug=${encodeURIComponent(post.slug)}`} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                              <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                              Edit
                            </Link>
                            {post.status === "published" && (
                              <Link href={`/updates/${post.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                View live
                              </Link>
                            )}
                            <button type="button" onClick={() => void handleToggleStatus(post)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              {post.status === "published" ? "Move to draft" : "Publish"}
                            </button>
                            <button type="button" onClick={() => void handleDelete(post.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
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

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{filteredPosts.length} visible of {posts.length} total posts</span>
          {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
        </div>
      </div>
    </div>
  );
}
