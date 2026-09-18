"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, Plus, Tag } from "lucide-react";
import type { Post } from "@/types/cms";

interface CategorySummary {
  name: string;
  slug: string;
  total: number;
  published: number;
  drafts: number;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriesManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/posts", { cache: "no-store" });
      const payload = (await response.json()) as {
        success?: boolean;
        posts?: Post[];
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to load categories.");
      }

      setPosts(payload.posts ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const categories = useMemo<CategorySummary[]>(() => {
    const summary = new Map<string, CategorySummary>();

    for (const post of posts) {
      const name = post.category?.trim() || "Uncategorized";
      const key = name.toLowerCase();
      const existing = summary.get(key) ?? {
        name,
        slug: toSlug(name) || "uncategorized",
        total: 0,
        published: 0,
        drafts: 0,
      };

      existing.total += 1;
      if (post.status === "published") existing.published += 1;
      else existing.drafts += 1;
      summary.set(key, existing);
    }

    return Array.from(summary.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="text-[13px] font-normal text-slate-500">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Categories</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[32px]">
            Article categories
          </h1>
          <p className="mt-1 max-w-2xl text-[14px] leading-6 text-slate-500">
            Categories are generated from the category assigned to each post. Change a category by editing the relevant post so the CMS and public content stay consistent.
          </p>
        </div>

        <Link
          href="/admin/posts/editor"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#075e38] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#064e2e] focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadPosts()}
            className="shrink-0 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories
          </div>
        ) : categories.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Tag className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-900">No categories yet</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Publish or save a post with a category and it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Slug</th>
                  <th className="px-4 py-3.5 text-center">Published</th>
                  <th className="px-4 py-3.5 text-center">Drafts</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13.5px]">
                {categories.map((category) => (
                  <tr key={category.slug} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Tag className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-slate-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">{category.slug}</td>
                    <td className="px-4 py-4 text-center text-slate-700">{category.published}</td>
                    <td className="px-4 py-4 text-center text-slate-700">{category.drafts}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">{category.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600 shadow-sm">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <p>
          Category names are intentionally stored on posts rather than in a second browser-only category list. This prevents orphaned categories and keeps filtering data tied to published content.
        </p>
      </div>
    </div>
  );
}
