"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Eye,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Crop,
  Settings2,
  AlertCircle,
  X,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/cms";

export default function PostEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  // Tab selection
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "social" | "revisions">("content");

  // Form states matching Screenshot 1
  const [title, setTitle] = useState("Preparing for your office visit");
  const [slug, setSlug] = useState("preparing-for-your-office-visit");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [contentHeading, setContentHeading] = useState("Before you arrive");
  const [contentBody1, setContentBody1] = useState(
    "Contact our office to confirm which documents your service requires."
  );
  const [contentBody2, setContentBody2] = useState(
    "Keep your paperwork together so our team can review it during your visit."
  );
  const [contentBody3, setContentBody3] = useState(
    "For directions and opening hours, visit our contact page."
  );
  const [imageCaption, setImageCaption] = useState("Prepare your paperwork before visiting.");
  const [featuredImage, setFeaturedImage] = useState(
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
  );
  const [altText, setAltText] = useState("Documents arranged on an office desk");

  // Right sidebar settings
  const [status, setStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [author, setAuthor] = useState("Admin");
  const [category, setCategory] = useState("Guides");
  const [tags, setTags] = useState<string[]>(["office visit"]);
  const [newTagInput, setNewTagInput] = useState("");

  // SEO Tab state
  const [seoDescription, setSeoDescription] = useState("");
  const [seoFocusKeyword, setSeoFocusKeyword] = useState("e-stamp office visit");

  // Collapsible cards state
  const [openPostSettings, setOpenPostSettings] = useState(true);
  const [openFeaturedImage, setOpenFeaturedImage] = useState(true);
  const [openPublishing, setOpenPublishing] = useState(true);

  // Status message
  const [isSaving, setIsSaving] = useState(false);
  const [savedTime, setSavedTime] = useState("Saved just now");

  // Load post from database API if slug is provided
  useEffect(() => {
    if (!slugParam) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slugParam)}`);
        const data = await res.json();

        if (data && data.post) {
          const p = data.post;
          setTitle(p.title || "");
          setSlug(p.slug || "");
          setCategory(p.category || "Guides");
          setAuthor(p.author_name || "Admin");
          setStatus(p.status || "published");
          if (p.cover_image_url) setFeaturedImage(p.cover_image_url);
          if (p.excerpt) setContentBody1(p.excerpt);
        }
      } catch (err) {
        // Fallback to initial mockup data
      }
    };
    fetchPost();
  }, [slugParam]);

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const combinedMarkdown = `# ${contentHeading}\n\n${contentBody1}\n\n${contentBody2}\n\n![${altText}](${featuredImage})\n*${imageCaption}*\n\n${contentBody3}`;

      const postPayload = {
        title,
        slug,
        excerpt: contentBody1,
        content: combinedMarkdown,
        cover_image_url: featuredImage,
        category,
        author_name: author,
        status: "published" as const,
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });
      const data = await res.json();

      if (data && data.success) {
        setStatus("published");
        setSavedTime("Published to database just now");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const combinedMarkdown = `# ${contentHeading}\n\n${contentBody1}\n\n${contentBody2}\n\n![${altText}](${featuredImage})\n*${imageCaption}*\n\n${contentBody3}`;

      const postPayload = {
        title,
        slug,
        excerpt: contentBody1,
        content: combinedMarkdown,
        cover_image_url: featuredImage,
        category,
        author_name: author,
        status: "draft" as const,
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });
      const data = await res.json();

      if (data && data.success) {
        setStatus("draft");
        setSavedTime("Draft saved to database");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const removeTag = (tToRemove: string) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <Link href="/admin/posts" className="hover:text-slate-800">
          Posts
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700 font-medium">Edit post</span>
      </div>

      {/* Page Header matching Screenshot 1 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Edit post
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Make changes to your post and update when ready.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          {/* Draft changes saved text */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[13px]">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Draft changes saved</span>
            </div>
            <div className="text-[11.5px] text-slate-400">{savedTime}</div>
          </div>

          {/* Preview Button */}
          <Link
            href={`/updates/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span>Preview</span>
          </Link>

          {/* Publish Changes Button */}
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition disabled:opacity-75"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )}
            <span>Publish changes</span>
          </button>
        </div>
      </div>

      {/* Blue Informational Banner matching Screenshot 1 */}
      <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[13px] text-[#1e40af] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <Info className="h-3.5 w-3.5" />
          </div>
          <span>
            <strong>Published version is live.</strong> Your edits stay private until you publish changes.
          </span>
        </div>

        <Link
          href={`/updates/${slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 font-semibold text-[#1d4ed8] hover:underline shrink-0 text-xs ml-4"
        >
          <span>View live post</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main 2-Column Responsive Layout matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Main Editor (Span 2) */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            {/* Tabs Header */}
            <div className="border-b border-slate-200 -mx-6 px-6 pb-0 mb-6">
              <nav className="flex space-x-7 text-[13.5px]">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`pb-3 border-b-2 font-medium transition-colors ${
                    activeTab === "content"
                      ? "border-[#075e38] text-[#075e38] font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Content
                </button>

                <button
                  onClick={() => setActiveTab("seo")}
                  className={`pb-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === "seo"
                      ? "border-[#075e38] text-[#075e38] font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>SEO</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    1
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("social")}
                  className={`pb-3 border-b-2 font-medium transition-colors ${
                    activeTab === "social"
                      ? "border-[#075e38] text-[#075e38] font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Social sharing
                </button>

                <button
                  onClick={() => setActiveTab("revisions")}
                  className={`pb-3 border-b-2 font-medium transition-colors ${
                    activeTab === "revisions"
                      ? "border-[#075e38] text-[#075e38] font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Revisions
                </button>
              </nav>
            </div>

            {/* TAB 1: Content Editor */}
            {activeTab === "content" && (
              <div className="space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Permalink Row */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Permalink</span>
                  {isEditingSlug ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">/posts/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-800"
                      />
                      <button
                        onClick={() => setIsEditingSlug(false)}
                        className="text-emerald-700 font-semibold"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-600">/posts/{slug}</span>
                      <button
                        onClick={() => setIsEditingSlug(true)}
                        className="text-emerald-800 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>

                {/* Rich Text Editor Box matching Screenshot 1 */}
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/70 px-3 py-1.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      {/* Paragraph Style Dropdown */}
                      <div className="relative">
                        <button className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-slate-200/60 text-slate-700">
                          <span>Paragraph</span>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      </div>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      {/* Format Buttons */}
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-700">
                        <Bold className="h-3.5 w-3.5 font-bold" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-700">
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-700">
                        <Link2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-700">
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-700">
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>

                      <div className="h-4 w-px bg-slate-200 mx-1" />

                      <button className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:bg-slate-200/60 text-slate-700">
                        <span>Insert</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </div>

                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-400">
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-slate-200/60 text-slate-400">
                        <Redo2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Document Content Canvas */}
                  <div className="p-6 space-y-4 bg-white text-slate-800 text-[14.5px] leading-relaxed min-h-[360px]">
                    {/* Subheading */}
                    <div>
                      <input
                        type="text"
                        value={contentHeading}
                        onChange={(e) => setContentHeading(e.target.value)}
                        className="w-full text-2xl font-bold tracking-tight text-slate-900 border-none p-0 focus:outline-none focus:ring-0"
                      />
                    </div>

                    {/* Paragraph 1 */}
                    <div>
                      <textarea
                        rows={2}
                        value={contentBody1}
                        onChange={(e) => setContentBody1(e.target.value)}
                        className="w-full resize-none border-none p-0 focus:outline-none focus:ring-0 text-slate-700 text-[14.5px] leading-relaxed"
                      />
                    </div>

                    {/* Paragraph 2 */}
                    <div>
                      <textarea
                        rows={2}
                        value={contentBody2}
                        onChange={(e) => setContentBody2(e.target.value)}
                        className="w-full resize-none border-none p-0 focus:outline-none focus:ring-0 text-slate-700 text-[14.5px] leading-relaxed"
                      />
                    </div>

                    {/* Inline Image Component Block matching Screenshot 1 */}
                    <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      {/* Floating overlay action buttons */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-sm backdrop-blur-xs text-xs font-medium text-slate-700">
                        <button
                          onClick={() => {
                            const newUrl = prompt("Enter new image URL:", featuredImage);
                            if (newUrl) setFeaturedImage(newUrl);
                          }}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span>Replace</span>
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded">
                          <Crop className="h-3.5 w-3.5 text-slate-500" />
                          <span>Crop</span>
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded">
                          <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                          <span>Image settings</span>
                        </button>
                      </div>

                      {/* Image render */}
                      <div className="h-56 w-full overflow-hidden bg-slate-100">
                        <img
                          src={featuredImage}
                          alt={altText}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Caption text */}
                      <div className="px-4 py-2 bg-white border-t border-slate-100 text-xs text-slate-500 italic">
                        <input
                          type="text"
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          className="w-full border-none p-0 text-xs italic text-slate-500 focus:outline-none focus:ring-0"
                          placeholder="Add image caption..."
                        />
                      </div>
                    </div>

                    {/* Paragraph 3 */}
                    <div>
                      <textarea
                        rows={2}
                        value={contentBody3}
                        onChange={(e) => setContentBody3(e.target.value)}
                        className="w-full resize-none border-none p-0 focus:outline-none focus:ring-0 text-slate-700 text-[14.5px] leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Word Count Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50 text-xs text-slate-400 font-normal">
                    <span>86 words</span>
                    <span>Saved just now</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SEO Settings */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Short summary for Google and search engines..."
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={seoFocusKeyword}
                    onChange={(e) => setSeoFocusKeyword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Social Sharing */}
            {activeTab === "social" && (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                Social card preview: Title and image are automatically used for WhatsApp, Facebook, and LinkedIn links.
              </div>
            )}

            {/* TAB 4: Revisions */}
            {activeTab === "revisions" && (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                Revision history: Auto-saved today at 10:24 AM (Current live version).
              </div>
            )}
          </div>

          {/* Warning Banner at Bottom matching Screenshot 1 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-sm">
                !
              </div>
              <div>
                <span className="font-bold text-[13.5px] text-slate-900 block">
                  Before publishing
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Add an SEO description to help people find your post in search results.
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("seo")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              Open SEO
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Settings Cards (Span 1) */}
        {/* ============================================================ */}
        <div className="space-y-4">
          {/* CARD 1: Post Settings matching Screenshot 1 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => setOpenPostSettings(!openPostSettings)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left border-b border-slate-100 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900">
                <Settings2 className="h-4 w-4 text-slate-700" />
                <span>Post settings</span>
              </div>
              {openPostSettings ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {openPostSettings && (
              <div className="p-4 space-y-4 text-xs">
                {/* Status Dropdown */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Status</span>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="appearance-none rounded-md bg-emerald-50 border border-emerald-200/80 pl-3 pr-8 py-1 font-semibold text-emerald-800 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-700" />
                  </div>
                </div>

                {/* Author Dropdown */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Author</span>
                  <div className="relative">
                    <select
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Usama Nazir Ch">Usama Nazir Ch</option>
                      <option value="Haji Nazir Ahmad">Haji Nazir Ahmad</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Category <span className="text-red-500">*</span>
                  </span>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Guides">Guides</option>
                      <option value="Tax tips">Tax tips</option>
                      <option value="E-stamp">E-stamp</option>
                      <option value="Updates">Updates</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Tags Field */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1.5">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 p-2 bg-white">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-800 font-medium border border-sky-100"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-sky-600 hover:text-sky-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1 min-w-[80px] text-xs text-slate-700 placeholder-slate-400 focus:outline-none border-none p-0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: Featured Image matching Screenshot 1 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => setOpenFeaturedImage(!openFeaturedImage)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left border-b border-slate-100 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900">
                <ImageIcon className="h-4 w-4 text-slate-700" />
                <span>Featured image</span>
              </div>
              {openFeaturedImage ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {openFeaturedImage && (
              <div className="p-4 space-y-3.5 text-xs">
                {/* Thumbnail Preview */}
                <div className="h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={featuredImage}
                    alt={altText}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Replace Image Button */}
                <button
                  onClick={() => {
                    const url = prompt("Enter Image URL:", featuredImage);
                    if (url) setFeaturedImage(url);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Replace image</span>
                </button>

                {/* Alt Text Input */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Alt text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Caption and Credit expandable */}
                <div className="pt-1 flex items-center justify-between text-slate-600 font-medium cursor-pointer hover:text-slate-900">
                  <span>Caption and credit</span>
                  <span className="text-slate-400">&gt;</span>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: Publishing matching Screenshot 1 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => setOpenPublishing(!openPublishing)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left border-b border-slate-100 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900">
                <Calendar className="h-4 w-4 text-slate-700" />
                <span>Publishing</span>
              </div>
              {openPublishing ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {openPublishing && (
              <div className="p-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">First published</span>
                  <span className="font-medium text-slate-800">16 Sep 2026</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Timezone</span>
                  <span className="font-medium text-slate-800">Asia/Karachi</span>
                </div>

                <div className="pt-2">
                  <button className="text-emerald-800 font-medium hover:underline text-xs">
                    Schedule changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Attribution matching Screenshot 1 */}
      <div className="pt-4 text-right text-[11px] text-slate-400 font-normal">
        Design concept • Sample content
      </div>
    </div>
  );
}
