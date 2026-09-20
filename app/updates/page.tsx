import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  FileText,
  Clock,
  Shield,
  MapPin,
  Phone,
  MessageCircle,
  Users,
} from "lucide-react";
import { getPublishedPosts } from "@/lib/cms/publicPosts";
import type { Post } from "@/types/cms";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Legal Updates, FBR Guides & E-Stamp Advice | Ch Composing Sahiwal",
  description:
    "Official legal articles, tax filing deadlines, e-stamping procedural guides, and Punjab property compliance documentation from Chamber 121, District Court Sahiwal.",
};

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategory = resolvedSearchParams.category || "all";
  const query = resolvedSearchParams.q?.toLowerCase() || "";

  const publishedPosts = await getPublishedPosts();

  const allPosts =
    selectedCategory !== "all"
      ? publishedPosts.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      : publishedPosts;

  const filteredPosts = query
    ? allPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(query))
      )
    : allPosts;

  const featuredPost = filteredPosts[0];
  const regularPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  const categories = [
    { label: "All Updates", value: "all" },
    { label: "Income Tax", value: "Income Tax" },
    { label: "Sales Tax (Federal & PRA)", value: "Sales Tax (Federal & PRA)" },
    { label: "E-Stamping & Property", value: "E-Stamping & Property" },
    { label: "Corporate & NTN", value: "Corporate & NTN" },
    { label: "Chamber News & Legal", value: "Chamber News & Legal" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#071328] text-navy-950 dark:text-slate-100 transition-colors">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#040c18] text-white">
        {/* Full-bleed Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-scales-justice.jpg"
            alt="Legal desk with golden scales of justice, luxury fountain pen, and law books"
            fill
            priority
            className="object-cover object-right sm:object-center"
            sizes="100vw"
          />
          {/* Left-side gradient shadow to ensure 100% solid dark navy under text on all screen sizes */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040c18] via-[#040c18]/90 via-45% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#040c18]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#040c18] to-transparent" />
        </div>

        <div className="container-x relative z-10 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px] lg:min-h-[460px]">
            {/* Left Column (spans 7 cols): Eyebrow, H1, Description, Office Strip & Buttons */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left py-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1 text-xs font-semibold text-gold-400 mb-4 w-fit">
                <Shield className="h-3.5 w-3.5" />
                <span>Chamber 121 Legal & Tax Insights</span>
              </div>

              <h1 className="font-serif text-[clamp(2rem,4vw+0.5rem,3.25rem)] font-bold leading-tight text-white tracking-tight">
                Legal Guides, FBR Updates & <span className="text-gold-400">E-Stamp Advice</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#F4F6F8]/90 font-normal">
                Step-by-step documentation guides, tax deadline explanations, and official filing instructions prepared by certified practitioners at District Court Sahiwal.
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href={SITE.phoneHref}
                  className="btn-gold inline-flex items-center gap-2.5 px-6 py-3 text-[13.5px] font-medium shadow-lg shadow-gold-500/20"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call {SITE.phone}</span>
                </a>

                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] border border-emerald-400/30 px-6 py-3 text-[13.5px] font-medium text-white shadow-lg shadow-[#25D366]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#25D366]/35"
                >
                  <WhatsAppIcon className="h-4 w-4 text-white" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>

              {/* In-Person Office Strip */}
              <div className="mt-8 inline-flex flex-wrap items-center gap-4 rounded-xl border border-white/15 bg-[#05162B]/80 backdrop-blur-md p-3 text-xs text-white/80 w-fit">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4 text-gold-400" />
                  <span>Sharki Gate, Chamber No. 121, District Court Sahiwal</span>
                </div>
                <span className="hidden sm:inline text-white/30">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8792A1]">Direct Consultation:</span>
                  <a href={SITE.phoneHref} className="text-gold-400 font-bold hover:underline">
                    {SITE.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column (spans 5 cols): Script overlay and floating pill badge */}
            <div className="hidden lg:block lg:col-span-5 relative h-full min-h-[300px] pointer-events-none">
              {/* Elegant Script Overlay in Top Right */}
              <div className="absolute top-2 right-0 z-20 text-right drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                <p className="font-script text-3xl sm:text-4xl lg:text-[40px] text-white leading-[1.08] -rotate-3 select-none">
                  Legal Guidance
                  <br />
                  <span className="text-white/95">for a Better</span>
                  <br />
                  <span className="relative inline-block text-gold-300">
                    Tomorrow
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full h-3 text-gold-400"
                      viewBox="0 0 100 20"
                      preserveAspectRatio="none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <path d="M2,12 Q50,19 98,8" />
                    </svg>
                  </span>
                </p>
              </div>

              {/* Floating Pill Badge at Bottom Right */}
              <div className="absolute bottom-2 right-0 z-20 flex items-center gap-3 rounded-2xl bg-[#05162B]/90 backdrop-blur-md border border-white/20 px-4 py-3 shadow-2xl max-w-[280px] pointer-events-auto">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10.5px] uppercase tracking-wider text-[#8792A1] block font-medium">
                    Trusted by
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                    Businesses, Families & Individuals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Pills & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-navy-900/10 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <Link
                  key={cat.value}
                  href={`/updates?category=${encodeURIComponent(cat.value)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-gold-500 text-navy-950 font-bold shadow-sm"
                      : "bg-white dark:bg-navy-900/70 border border-navy-900/10 dark:border-white/10 text-navy-800 dark:text-slate-300 hover:border-gold-400/40"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Post (if available) */}
        {featuredPost && (
          <div className="mt-8">
            <Link
              href={`/updates/${featuredPost.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-navy-900/70 shadow-lg hover:border-gold-400/50 transition duration-300"
            >
              <div className="grid lg:grid-cols-12 gap-0">
                {featuredPost.cover_image_url ? (
                  <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-navy-950">
                    <img
                      src={featuredPost.cover_image_url}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950 uppercase shadow-md">
                        Featured Guide
                      </span>
                    </div>
                  </div>
                ) : null}

                <div
                  className={`p-6 sm:p-8 flex flex-col justify-between ${
                    featuredPost.cover_image_url ? "lg:col-span-5" : "lg:col-span-12"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      {featuredPost.category}
                    </span>
                    <h2 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white group-hover:text-gold-500 dark:group-hover:text-gold-400 transition">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-navy-900/5 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{featuredPost.author_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        4 min read
                      </span>
                    </div>
                    <span className="font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                      Read Guide &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/updates/${post.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-navy-900/60 shadow-sm hover:border-gold-400/40 hover:shadow-md transition duration-200"
              >
                <div>
                  {post.cover_image_url && (
                    <div className="relative aspect-video overflow-hidden bg-navy-950">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <span className="inline-block rounded-md bg-navy-900/5 dark:bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-gold-600 dark:text-gold-400">
                      {post.category}
                    </span>
                    <h3 className="mt-2.5 font-serif text-base font-bold text-navy-900 dark:text-white group-hover:text-gold-500 dark:group-hover:text-gold-400 transition line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-navy-900/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{post.author_name}</span>
                  <span className="font-semibold text-gold-600 dark:text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    Read &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : !featuredPost ? (
          <div className="mt-12 rounded-2xl border border-dashed border-navy-900/15 dark:border-white/15 p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-navy-400 dark:text-white/30 mb-2" />
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
              No articles found in this category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Please choose another topic or visit our Chamber 121 office in Sahiwal for direct legal consultations.
            </p>
            <Link href="/updates" className="btn-gold mt-4 inline-block px-4 py-2 text-xs">
              View All Topics
            </Link>
          </div>
        ) : null}

        {/* Bottom In-Person Consultation Banner */}
        <section className="mt-16 rounded-2xl border border-gold-400/30 bg-gradient-to-r from-navy-900 to-[#0b1f3d] p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                In-Person Legal & Tax Assistance
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Need Help with Your E-Stamp or FBR Return?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Visit our physical office at <strong>Sharki Gate Chamber No. 121, District Court Sahiwal</strong>. We provide on-the-spot e-stamp issuance, tax return preparation, legal document drafting, and affidavit composing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Consultant</span>
              </a>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Phone className="h-4 w-4" />
                <span>Call {SITE.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
