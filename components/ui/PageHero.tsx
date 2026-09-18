"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/providers/LanguageProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useCms } from "@/lib/hooks/useCms";

export type Crumb = { label: string; href?: string };

type PageHeroProps = {
  badge?: string;
  title: string;
  highlight?: string;
  description: string;
  image: string;
  crumbs?: Crumb[];
  backLabel?: string;
  backHref?: string;
  primaryCta?: { label: string; href: string };
  whatsapp?: boolean;
  tall?: boolean;
};

export default function PageHero({
  badge,
  title,
  highlight,
  description,
  image,
  crumbs,
  backLabel,
  backHref = "/",
  primaryCta,
  whatsapp = true,
  tall = false,
}: PageHeroProps) {
  const pathname = usePathname() || "";
  const { t } = useLanguage();
  const { getPageContent, getService } = useCms();

  // Dynamic CMS overrides from Admin Dashboard
  const cmsPage = getPageContent(pathname);
  const slug = pathname.startsWith("/services/") ? pathname.replace(/^\/services\//, "") : "";
  const cmsService = slug ? getService(slug) : undefined;

  const effectiveBadge = cmsPage?.heroBadge || cmsService?.tagline || badge;
  const effectiveTitle = cmsPage?.heroHeadline || cmsService?.name || title;
  const effectiveDescription = cmsPage?.heroSubtitle || cmsService?.description || description;
  const effectiveImage = cmsPage?.heroImage || cmsService?.heroImage || image;

  const effectiveBackLabel = backLabel || t.common.backToHome;
  const rawPrimaryCta = primaryCta || { label: t.common.visitOurOffice, href: "/#office" };
  const effectivePrimaryCta = cmsPage?.primaryCtaText
    ? { label: cmsPage.primaryCtaText, href: cmsPage.primaryCtaHref || "/#office" }
    : {
        ...rawPrimaryCta,
        href: rawPrimaryCta.href === "#contact" || rawPrimaryCta.href === "#office" ? "/#office" : rawPrimaryCta.href,
      };

  return (
    <section
      className={`relative flex items-center overflow-hidden ${
        tall ? "min-h-[560px]" : "min-h-[440px]"
      }`}
    >
      {/* Background image with Ken Burns */}
      <motion.div
        className="absolute inset-0 will-change-transform transform-gpu"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 7, ease: "easeOut" }}
      >
        <Image
          src={effectiveImage}
          alt={effectiveTitle}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 hero-overlay texture-grid" />

      <div className="container-x relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {crumbs ? (
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/60">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-2">
                  {c.href ? (
                    <Link href={c.href} className="transition hover:text-gold-300">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-gold-300">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span className="text-white/30">/</span>}
                </span>
              ))}
            </nav>
          ) : (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:text-gold-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              {effectiveBackLabel}
            </Link>
          )}
        </motion.div>

        {effectiveBadge && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {effectiveBadge}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18 }}
          className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
        >
          {effectiveTitle}
          {highlight && <span className="text-gold-400"> {highlight}</span>}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-white/80"
        >
          {effectiveDescription}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.38 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link href={effectivePrimaryCta.href} className="btn-gold px-7 py-3 text-sm">
            <MapPin className="h-4 w-4" /> {effectivePrimaryCta.label}
          </Link>
          {whatsapp && (
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold px-7 py-3 text-sm"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-400" /> {t.common.whatsappUs}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
