"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ExternalLink,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/cms";

const DEFAULT_POSTS: any[] = [
  {
    id: "seed-1",
    title: "Preparing for your office visit",
    slug: "preparing-for-your-office-visit",
    author_name: "Admin",
    category: "Guides",
    status: "published",
    cover_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-16T10:24:00Z",
  },
  {
    id: "seed-2",
    title: "Your tax document checklist",
    slug: "your-tax-document-checklist",
    author_name: "Admin",
    category: "Tax tips",
    status: "draft",
    cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-15T09:15:00Z",
  },
  {
    id: "seed-3",
    title: "Understanding e-stamp services",
    slug: "understanding-e-stamp-services",
    author_name: "Admin",
    category: "E-stamp",
    status: "published",
    cover_image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-14T15:20:00Z",
  },
  {
    id: "seed-4",
    title: "Office opening hours",
    slug: "office-opening-hours",
    author_name: "Admin",
    category: "Updates",
    status: "draft", // scheduled representation
    cover_image_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-14T11:40:00Z",
  },
  {
    id: "seed-5",
    title: "Organising your paperwork",
    slug: "organising-your-paperwork",
    author_name: "Admin",
    category: "Guides",
    status: "draft",
    cover_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-13T14:10:00Z",
  },
  {
    id: "seed-6",
    title: "How to find our office",
    slug: "how-to-find-our-office",
    author_name: "Admin",
    category: "Updates",
    status: "published",
    cover_image_url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=75",
    updated_at: "2026-09-12T09:05:00Z",
  },
];

export default function PostsManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "scheduled" | "trash">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data && data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setPosts(DEFAULT_POSTS);
      }
    } catch (err) {
      setPosts(DEFAULT_POSTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post from the database?")) return;
    try {
      await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setActiveDropdownId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (post: any) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          slug: post.slug,
          title: post.title,
          status: nextStatus,
        }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
      );
      setActiveDropdownId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Status mapping for scheduled demo items
  const getItemStatus = (item: any) => {
    if (item.title === "Office opening hours") return "scheduled";
    return item.status || "draft";
  };

  // Counts
  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => getItemStatus(p) === "published").length;
  const draftCount = posts.filter((p) => getItemStatus(p) === "draft").length;
  const scheduledCount = posts.filter((p) => getItemStatus(p) === "scheduled").length;

  // Filtered list
  const filteredPosts = posts.filter((post) => {
    const status = getItemStatus(post);
    if (activeTab === "published" && status !== "published") return false;
    if (activeTab === "draft" && status !== "draft") return false;
    if (activeTab === "scheduled" && status !== "scheduled") return false;
    if (activeTab === "trash") return false;

    if (categoryFilter !== "all" && post.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchCategory = post.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { date: "16 Sep 2026", time: "10:24 AM" };
    try {
      const d = new Date(dateStr);
      const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return { date, time };
    } catch {
      return { date: "16 Sep 2026", time: "10:24 AM" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Posts</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Posts
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Create, edit and publish helpful articles.
          </p>
        </div>

        {/* Action Buttons matching Screenshot 2 */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/updates"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>View website</span>
          </Link>

          <Link
            href="/admin/posts/editor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create post</span>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs matching Screenshot 2 */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-[14px]">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "all"
                ? "border-[#075e38] text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All posts</span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs ${
                activeTab === "all"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("published")}
            className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "published"
                ? "border-[#075e38] text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Published</span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs ${
                activeTab === "published"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {publishedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("draft")}
            className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "draft"
                ? "border-[#075e38] text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Drafts</span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs ${
                activeTab === "draft"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {draftCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "scheduled"
                ? "border-[#075e38] text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Scheduled</span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs ${
                activeTab === "scheduled"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {scheduledCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("trash")}
            className={`flex items-center gap-2 pb-3 pt-1 text-[13.5px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "trash"
                ? "border-[#075e38] text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Trash</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              0
            </span>
          </button>
        </nav>
      </div>

      {/* Filter and Search Bar matching Screenshot 2 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13.5px] text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[13.5px] font-normal text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="all">All categories</option>
              <option value="Guides">Guides</option>
              <option value="Tax tips">Tax tips</option>
              <option value="E-stamp">E-stamp</option>
              <option value="Updates">Updates</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[13.5px] font-normal text-slate-700 focus:border-emerald-600 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option>Last updated</option>
              <option>Alphabetical (A-Z)</option>
              <option>Most views</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Posts Data Table matching Screenshot 2 */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[13px] font-medium text-slate-700">
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                </th>
                <th className="px-4 py-3.5 font-medium">Post</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Category</th>
                <th className="px-4 py-3.5 font-medium">Updated</th>
                <th className="w-16 px-4 py-3.5 text-right font-medium"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading posts...</span>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No posts found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const status = getItemStatus(post);
                  const isChecked = selectedIds.includes(post.id);
                  const { date, time } = formatDate(post.updated_at);
                  const isMenuOpen = activeDropdownId === post.id;

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                      </td>

                      {/* Post Thumbnail & Title */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3.5">
                          {/* Thumbnail */}
                          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                            {post.cover_image_url ? (
                              <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                                Doc
                              </div>
                            )}
                          </div>

                          {/* Title & Author */}
                          <div>
                            <Link
                              href={`/admin/posts/editor?slug=${post.slug || ""}`}
                              className="font-semibold text-slate-900 hover:text-emerald-700 block transition-colors leading-snug text-[14px]"
                            >
                              {post.title}
                            </Link>
                            <span className="text-[12px] text-slate-500 block mt-0.5">
                              By {post.author_name || "Admin"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        {status === "published" && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800 border border-emerald-200/70">
                            Published
                          </span>
                        )}
                        {status === "draft" && (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                        {status === "scheduled" && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-800 border border-amber-200">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-700 font-normal">
                        {post.category || "Guides"}
                      </td>

                      {/* Updated Date & Time */}
                      <td className="px-4 py-3 text-slate-600 text-[13px]">
                        <div>{date}</div>
                        <div className="text-[11.5px] text-slate-400">{time}</div>
                      </td>

                      {/* Row Action Menu ••• */}
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() =>
                            setActiveDropdownId(isMenuOpen ? null : post.id)
                          }
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-4 top-10 z-30 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-left">
                            <Link
                              href={`/admin/posts/editor?slug=${post.slug || ""}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>Edit</span>
                            </Link>
                            <Link
                              href={`/updates/${post.slug || ""}`}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              <span>View live</span>
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(post)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>{post.status === "published" ? "Make draft" : "Publish"}</span>
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              <span>Delete</span>
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

        {/* Table Footer matching Screenshot 2 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-4 py-3 bg-white text-[13px] text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <div className="relative">
              <select className="appearance-none rounded-md border border-slate-200 bg-white py-1 pl-2.5 pr-7 text-xs font-medium text-slate-700 focus:outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>
              1–{filteredPosts.length} of {filteredPosts.length} posts
            </span>

            {/* Pagination Box */}
            <div className="flex items-center gap-1">
              <button
                disabled
                className="h-7 w-7 rounded border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button className="h-7 w-7 rounded bg-[#075e38] text-white flex items-center justify-center text-xs font-semibold">
                1
              </button>

              <button
                disabled
                className="h-7 w-7 rounded border border-slate-200 flex items-center justify-center text-slate-300 cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Attribution */}
      <div className="pt-2 text-right text-[11px] text-slate-400 font-normal">
        Sample content • Design concept
      </div>
    </div>
  );
}
