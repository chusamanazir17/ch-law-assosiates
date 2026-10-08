"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client/apiFetch";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  updatedAt: string;
}

interface PostRef {
  id: string;
  category?: string | null;
  status?: string;
}

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  description: "",
  active: true,
  order: 100,
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogImage: "",
};

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, postRes] = await Promise.all([
        apiFetch("/api/admin/categories", { cache: "no-store" }),
        apiFetch("/api/admin/posts", { cache: "no-store" }),
      ]);
      const catJson = (await catRes.json()) as { success?: boolean; categories?: Category[]; error?: string };
      if (!catRes.ok || !catJson.success) {
        throw new Error(catJson.error || "Unable to load categories.");
      }
      setCategories(catJson.categories ?? []);

      if (postRes.ok) {
        const postJson = (await postRes.json()) as { success?: boolean; posts?: PostRef[] };
        if (postJson.success && Array.isArray(postJson.posts)) {
          const counts: Record<string, number> = {};
          for (const post of postJson.posts) {
            const name = (post.category ?? "").trim().toLowerCase();
            if (name) counts[name] = (counts[name] ?? 0) + 1;
          }
          setPostCounts(counts);
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Live slug uniqueness check (debounced)
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    const slug = form.slug.trim().toLowerCase();
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    checkTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ checkSlug: slug });
        if (form.id) params.set("excludeId", form.id);
        const res = await apiFetch(`/api/admin/categories?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as { success?: boolean; available?: boolean };
        setSlugAvailable(res.ok && json.success ? Boolean(json.available) : null);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [form.slug, form.id]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [categories]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setSlugAvailable(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      active: category.active,
      order: category.order ?? 100,
      seoTitle: category.seoTitle ?? "",
      metaDescription: category.metaDescription ?? "",
      canonicalUrl: category.canonicalUrl ?? "",
      ogImage: category.ogImage ?? "",
    });
    setSlugTouched(true);
    setSlugAvailable(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setSaveError(null);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: slugTouched ? prev.slug : slugifyName(value) }));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: slugifyName(value) }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);

    if (form.name.trim().length < 2) {
      setSaveError("Category name must be at least 2 characters.");
      return;
    }
    if (slugAvailable === false) {
      setSaveError(`The slug "${form.slug}" is already used by another category.`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiFetch("/api/admin/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          name: form.name.trim(),
          slug: form.slug.trim() || slugifyName(form.name),
          description: form.description.trim(),
          active: form.active,
          order: Number.isFinite(form.order) ? form.order : 100,
          seoTitle: form.seoTitle.trim(),
          metaDescription: form.metaDescription.trim(),
          canonicalUrl: form.canonicalUrl.trim(),
          ogImage: form.ogImage.trim(),
        }),
      });
      const json = (await res.json()) as { success?: boolean; category?: Category; error?: string; message?: string };
      if (!res.ok || !json.success || !json.category) {
        throw new Error(json.error || "Unable to save the category.");
      }

      const saved = json.category;
      setCategories((prev) =>
        editing ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]
      );
      setNotice(json.message || "Category saved.");
      window.setTimeout(() => setNotice(null), 4000);
      closeModal();
    } catch (saveErr) {
      setSaveError(saveErr instanceof Error ? saveErr.message : "Unable to save the category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    setPendingId(category.id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Send the full category: the API replaces all fields, so a partial
        // payload would wipe the description, order, and SEO values.
        body: JSON.stringify({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          order: category.order ?? 100,
          seoTitle: category.seoTitle ?? "",
          metaDescription: category.metaDescription ?? "",
          canonicalUrl: category.canonicalUrl ?? "",
          ogImage: category.ogImage ?? "",
          active: !category.active,
        }),
      });
      const json = (await res.json()) as { success?: boolean; category?: Category; error?: string };
      if (!res.ok || !json.success || !json.category) {
        throw new Error(json.error || "Unable to update the category.");
      }
      setCategories((prev) => prev.map((c) => (c.id === category.id ? json.category as Category : c)));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update the category.");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (category: Category) => {
    // Two-step inline confirmation (deleteConfirmId) replaces window.confirm.
    setDeleteConfirmId(null);
    setPendingId(category.id);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/categories?id=${encodeURIComponent(category.id)}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to delete the category.");
      }
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setNotice(`Category "${category.name}" deleted.`);
      window.setTimeout(() => setNotice(null), 4000);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the category.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
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
            Manage the categories available to posts. Slugs are unique and power the public category filter on /updates.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => void loadAll()} className="shrink-0 font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Tag className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-slate-900">No categories yet</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Create the first category to organize your posts.
            </p>
            <button type="button" onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> New category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[680px]">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th className="text-center">Posts</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((category) => {
                  const isPending = pendingId === category.id;
                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Tag className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{category.name}</div>
                            {category.description && (
                              <div className="max-w-xs truncate text-xs text-slate-500">{category.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-slate-500">{category.slug}</td>
                      <td className="text-center text-slate-700">
                        {postCounts[category.name.trim().toLowerCase()] ?? 0}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            category.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => openEdit(category)}
                            className="btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-[11px]"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => void handleToggleActive(category)}
                            className="btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-[11px]"
                          >
                            {category.active ? "Deactivate" : "Activate"}
                          </button>
                          {deleteConfirmId === category.id ? (
                            <span className="flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 p-1">
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => void handleDelete(category)}
                                className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700"
                                title={
                                  (postCounts[category.name.trim().toLowerCase()] ?? 0) > 0
                                    ? `Delete "${category.name}"? Its posts will be moved to the "Guides" category.`
                                    : `Delete "${category.name}" permanently?`
                                }
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => setDeleteConfirmId(category.id)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="Delete category"
                              aria-label={`Delete ${category.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Deleting a category never deletes posts — posts using it are moved to the default "Guides" category.
      </p>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit category" : "New category"}
          onClick={closeModal}
        >
          <form
            onSubmit={handleSave}
            onClick={(event) => event.stopPropagation()}
            className="card flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-950">
                {editing ? `Edit "${editing.name}"` : "New category"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {saveError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-name" className="form-label">Name</label>
                  <input
                    id="cat-name"
                    value={form.name}
                    maxLength={100}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Taxation & FBR"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="cat-slug" className="form-label">URL slug (unique)</label>
                  <input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    placeholder="taxation-fbr"
                    className="input-field font-mono text-xs"
                  />
                  <p className="mt-1.5 text-[11px] leading-4">
                    {slugChecking ? (
                      <span className="text-slate-500">Checking availability...</span>
                    ) : form.slug && slugAvailable === true ? (
                      <span className="font-semibold text-emerald-700">Slug is available.</span>
                    ) : form.slug && slugAvailable === false ? (
                      <span className="font-semibold text-rose-600">This slug is already in use.</span>
                    ) : (
                      <span className="text-slate-500">Auto-generated from the name; must be unique.</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="cat-description" className="form-label">Description</label>
                <textarea
                  id="cat-description"
                  value={form.description}
                  maxLength={500}
                  rows={2}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short description shown on category filters."
                  className="input-field resize-y"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cat-order" className="form-label">Display order</label>
                  <input
                    id="cat-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.order}
                    onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
                    />
                    Active (visible in post filters)
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-slate-600">SEO</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor="cat-seo-title" className="form-label">SEO title</label>
                    <input
                      id="cat-seo-title"
                      value={form.seoTitle}
                      maxLength={180}
                      onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
                      placeholder="Defaults to the category name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="cat-meta-description" className="form-label">Meta description</label>
                    <textarea
                      id="cat-meta-description"
                      value={form.metaDescription}
                      maxLength={500}
                      rows={2}
                      onChange={(event) => setForm((prev) => ({ ...prev, metaDescription: event.target.value }))}
                      placeholder="Search-result description for the category listing."
                      className="input-field resize-y"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cat-canonical" className="form-label">Canonical URL (optional)</label>
                      <input
                        id="cat-canonical"
                        type="url"
                        value={form.canonicalUrl}
                        onChange={(event) => setForm((prev) => ({ ...prev, canonicalUrl: event.target.value }))}
                        placeholder="https://..."
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="cat-og" className="form-label">OG image URL (optional)</label>
                      <input
                        id="cat-og"
                        type="url"
                        value={form.ogImage}
                        onChange={(event) => setForm((prev) => ({ ...prev, ogImage: event.target.value }))}
                        placeholder="https://..."
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4">
              <button type="button" onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSaving || slugAvailable === false} className="btn-primary inline-flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="text-xs text-slate-500">
        <Link href="/admin/posts" className="font-semibold text-emerald-700 underline underline-offset-2">
          Manage posts
        </Link>{" "}
        to assign categories to individual articles.
      </div>
    </div>
  );
}
