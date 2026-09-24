import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import { getPublishedPostBySlug } from "@/lib/cms/publicPosts";
import type { Post } from "@/types/cms";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post || post.status !== "published") {
    return {
      title: "Article Not Found | Ch-Law Sahiwal",
    };
  }

  return {
    title: `${post.title} | Ch Composing & Tax Advisor`,
    description:
      post.excerpt ||
      "Legal advice, tax compliance guidelines, and e-stamping documentation procedures from Chamber 121, District Court Sahiwal.",
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

export default async function PostReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postData = await getPublishedPostBySlug(slug);

  if (!postData || postData.status !== "published") {
    notFound();
  }

  const post = postData as Post;

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-[#071328] text-navy-950 dark:text-slate-100 transition-colors">
      {/* Top Header Section */}
      <header className="relative overflow-hidden bg-[#040c18] text-white py-12 lg:py-16 border-b border-navy-900/10 dark:border-white/10">
        {/* Full-bleed Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/hero-scales-justice.jpg"
            alt="Legal desk background"
            fill
            priority
            className="object-cover object-right sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040c18] via-[#040c18]/90 via-45% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#040c18]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#040c18] to-transparent" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Legal Updates & Guides</span>
          </Link>

          <div className="space-y-3">
            <span className="inline-block rounded-md bg-gold-400/20 border border-gold-400/30 px-3 py-1 text-xs font-bold text-gold-400 uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm sm:text-base text-white/70 leading-relaxed pt-1">
                {post.excerpt}
              </p>
            )}

            {/* Author & Meta bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-xs text-white/60">
              <span className="flex items-center gap-1.5 font-medium text-white/90">
                <User className="h-3.5 w-3.5 text-gold-400" />
                {post.author_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold-400" />
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-PK", {
                      dateStyle: "long",
                    })
                  : "Recent"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold-400" />
                <span>4 min read</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-navy-900/10 dark:border-white/10 shadow-lg aspect-video bg-navy-950">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 896px) 896px, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-5 text-slate-800 dark:text-slate-200">
          {post.content.split("\n\n").map((chunk, index) => {
            const trimmed = chunk.trim();

            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-gold-400 pt-6 pb-2 border-b border-navy-900/10 dark:border-white/10"
                >
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }

            if (trimmed.startsWith("### ")) {
              return (
                <h3
                  key={index}
                  className="font-serif text-lg font-bold text-navy-900 dark:text-white pt-4"
                >
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }

            if (trimmed.startsWith("> ")) {
              return (
                <blockquote
                  key={index}
                  className="rounded-xl border-l-4 border-gold-500 bg-gold-500/[0.08] dark:bg-gold-500/10 p-4 text-sm font-medium text-navy-900 dark:text-gold-200 italic my-4"
                >
                  {trimmed.replace("> ", "")}
                </blockquote>
              );
            }

            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n").map((line) => line.replace("- ", ""));
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-3 pl-2">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-slate-700 dark:text-slate-300">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={index} className="leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Chamber 121 In-Person Consultation Card */}
        <div className="mt-14 rounded-2xl border border-gold-400/30 bg-gradient-to-br from-navy-900 to-[#0b1f3d] p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                In-Person Office Services
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Visit Chamber 121, District Court Sahiwal
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All e-stamp verifications, legal document composing, deed registrations, and FBR tax returns are executed in person at our physical chamber.
              </p>
              <div className="pt-2 text-xs text-white/70 space-y-1">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>Sharki Gate, Chamber No. 121, District Court Sahiwal, Punjab</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>{SITE.hours.weekdays}; {SITE.hours.saturday}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0">
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Consultant</span>
              </a>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Phone className="h-4 w-4" />
                <span>Call {SITE.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="mt-8 rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-navy-900/60 p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/20 text-gold-500 font-serif font-bold text-lg shrink-0">
            CH
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
              {post.author_name}
            </h4>
            <p className="text-xs text-gold-600 dark:text-gold-400 font-semibold mt-0.5">
              Legal Practitioner & Tax Consultant • District Court Sahiwal
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Specializing in Punjab e-stamping, FBR income tax compliance, PRA sales tax registration, property sale deed drafting, and legal documentation with over two decades of dedicated legal practice.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
