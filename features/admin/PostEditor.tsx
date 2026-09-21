"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import { slugify } from "@/lib/validation/post";
import type { Post } from "@/types/cms";

type EditorStatus = Post["status"];

type PostResponse = {
  post?: Post;
  error?: string;
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "Guides",
  authorName: "Admin",
  status: "draft" as EditorStatus,
};

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [slug, setSlug] = useState(EMPTY_FORM.slug);
  const [excerpt, setExcerpt] = useState(EMPTY_FORM.excerpt);
  const [content, setContent] = useState(EMPTY_FORM.content);
  const [coverImageUrl, setCoverImageUrl] = useState(EMPTY_FORM.coverImageUrl);
  const [category, setCategory] = useState(EMPTY_FORM.category);
  const [authorName, setAuthorName] = useState(EMPTY_FORM.authorName);
  const [status, setStatus] = useState<EditorStatus>(EMPTY_FORM.status);
  const [slugTouched, setSlugTouched] = useState(Boolean(slugParam));
  const [isLoading, setIsLoading] = useState(Boolean(slugParam));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!slugParam) return;

    const requestedSlug = slugParam;
    const controller = new AbortController();

    async function loadPost() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/posts?slug=${encodeURIComponent(requestedSlug)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await response.json()) as PostResponse;
        if (!response.ok || !data.post) {
          throw new Error(data.error || "Unable to load the post.");
        }

        const post = data.post;
        setPostId(post.id);
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt ?? "");
        setContent(post.content);
        setCoverImageUrl(post.cover_image_url ?? "");
        setCategory(post.category);
        setAuthorName(post.author_name);
        setStatus(post.status);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the post.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPost();
    return () => controller.abort();
  }, [slugParam]);

  const characterCounts = useMemo(
    () => ({ title: title.length, excerpt: excerpt.length }),
    [excerpt.length, title.length]
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(slugify(value));
  };

  const savePost = async (nextStatus: EditorStatus) => {
    setError(null);
    setNotice(null);

    if (title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }
    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(postId ? { id: postId } : {}),
          title: title.trim(),
          slug: slugify(slug || title),
          excerpt: excerpt.trim() || null,
          content,
          cover_image_url: coverImageUrl.trim() || null,
          category: category.trim() || "Guides",
          author_name: authorName.trim() || "Admin",
          status: nextStatus,
        }),
      });
      const data = (await response.json()) as PostResponse;
      if (!response.ok || !data.post) {
        throw new Error(data.error || "Unable to save the post.");
      }

      const saved = data.post;
      setPostId(saved.id);
      setTitle(saved.title);
      setSlug(saved.slug);
      setExcerpt(saved.excerpt ?? "");
      setContent(saved.content);
      setCoverImageUrl(saved.cover_image_url ?? "");
      setCategory(saved.category);
      setAuthorName(saved.author_name);
      setStatus(saved.status);
      setSlugTouched(true);
      setNotice(saved.status === "published" ? "Post published successfully." : "Draft saved successfully.");

      if (!slugParam || slugParam !== saved.slug) {
        router.replace(`/admin/posts/editor?slug=${encodeURIComponent(saved.slug)}`);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the post.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white">
        <div className="text-center text-xs text-[#52627A]">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#C8973D]" />
          Loading post...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            href="/admin/posts"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#52627A] transition hover:text-[#0B1F36]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to posts
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            {postId ? "Edit post" : "Create post"}
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Write the public update, then save it as a draft or publish it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {postId && status === "published" && slug && (
            <Link
              href={`/updates/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-xs transition hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View live
            </Link>
          )}
          <button
            type="button"
            onClick={() => void savePost("draft")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-xs transition hover:bg-[#F8FAFC] hover:text-[#0B1F36] disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8973D]" /> : <Save className="h-3.5 w-3.5 text-[#52627A]" />}
            Save draft
          </button>
          <button
            type="button"
            onClick={() => void savePost("published")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102943] disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 text-[#C8973D]" />}
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-[#C8973D]/40 bg-[#FDF8EE] px-4 py-3 text-xs font-medium text-[#96641E]">
          {notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <label htmlFor="post-title" className="text-xs font-semibold text-[#0B1F36]">Title</label>
              <span className="text-xs tabular-nums text-[#94A3B8]">{characterCounts.title}/180</span>
            </div>
            <input
              id="post-title"
              value={title}
              maxLength={180}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Enter a clear post title"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#0B1F36] outline-none transition placeholder:font-normal placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
            />
          </div>

          <div>
            <label htmlFor="post-slug" className="mb-1.5 block text-xs font-semibold text-[#0B1F36]">URL slug</label>
            <div className="flex overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus-within:border-[#C8973D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#C8973D]/20">
              <span className="hidden border-r border-[#E2E8F0] px-3 py-2 text-xs text-[#64748B] sm:block">/updates/</span>
              <input
                id="post-slug"
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="post-url-slug"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-[#0B1F36] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <label htmlFor="post-excerpt" className="text-xs font-semibold text-[#0B1F36]">Excerpt</label>
              <span className="text-xs tabular-nums text-[#94A3B8]">{characterCounts.excerpt}/500</span>
            </div>
            <textarea
              id="post-excerpt"
              value={excerpt}
              maxLength={500}
              rows={3}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Short summary shown in post listings."
              className="w-full resize-y rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs leading-relaxed text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <label htmlFor="post-content" className="text-xs font-semibold text-[#0B1F36]">Content</label>
              <span className="text-[11px] font-medium text-[#94A3B8]">Markdown supported</span>
            </div>
            <textarea
              id="post-content"
              value={content}
              rows={22}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"Write the full post here.\n\nUse ## for section headings and ordinary paragraphs for body copy."}
              className="w-full resize-y rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 font-mono text-xs leading-relaxed text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
            />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Publishing</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="post-status" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Status</label>
                <select
                  id="post-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as EditorStatus)}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] outline-none transition focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#94A3B8]">Use the action buttons above to persist a status change.</p>
              </div>

              <div>
                <label htmlFor="post-category" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Category</label>
                <input
                  id="post-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
                />
              </div>

              <div>
                <label htmlFor="post-author" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">Author</label>
                <input
                  id="post-author"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#C8973D]" />
                <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Cover image</h2>
              </div>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition"
                >
                  Clear image
                </button>
              )}
            </div>

            <label htmlFor="cover-image-url" className="mt-4 mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              Image URL (Custom or Preset)
            </label>
            <input
              id="cover-image-url"
              type="url"
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs text-[#0B1F36] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:ring-2 focus:ring-[#C8973D]/20"
            />

            {/* Quick Presets Gallery */}
            <div className="mt-4">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B] mb-2">
                1-Click Curated Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: "E-Stamp & Papers",
                    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
                  },
                  {
                    name: "FBR Income Tax",
                    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
                  },
                  {
                    name: "Property Registry",
                    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
                  },
                  {
                    name: "SECP Corporate",
                    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                  },
                  {
                    name: "Sales Tax / PRA",
                    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
                  },
                  {
                    name: "Chamber 121 Office",
                    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=70",
                  },
                ].map((preset) => {
                  const isSelected = coverImageUrl === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCoverImageUrl(preset.url)}
                      className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-left text-xs transition ${
                        isSelected
                          ? "border-[#C8973D] bg-[#FDF8EE] text-[#96641E] font-semibold"
                          : "border-[#E2E8F0] bg-[#F8FAFC] text-[#52627A] hover:bg-slate-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-8 w-8 rounded object-cover shrink-0"
                      />
                      <span className="truncate text-[11px] leading-tight">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {coverImageUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="aspect-video w-full object-cover"
                />
                <div className="bg-[#F8FAFC] p-2 text-center text-[11px] text-[#52627A] font-medium border-t border-[#E2E8F0]">
                  Cover Image Live Preview
                </div>
              </div>
            ) : (
              <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#94A3B8]">
                No cover image selected
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
