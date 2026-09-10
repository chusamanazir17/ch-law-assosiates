"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

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
  const { t } = useLanguage();
  const effectiveBackLabel = backLabel || t.common.backToHome;
  const effectivePrimaryCta = primaryCta || { label: t.common.visitOurOffice, href: "#contact" };
  return (
    <section
      className={`relative flex items-center overflow-hidden ${
        tall ? "min-h-[560px]" : "min-h-[440px]"
      }`}
    >
      {/* Background image with Ken Burns */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      />
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

        {badge && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {badge}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18 }}
          className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl"
        >
          {title} {highlight && <span className="text-gold-400">{highlight}</span>}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28 }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-white/75"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.38 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <Link href={effectivePrimaryCta.href} className="btn-gold">
            <MapPin className="h-4 w-4" />
            {effectivePrimaryCta.label}
          </Link>
          {whatsapp && (
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-light"
            >
              <MessageCircle className="h-4 w-4" />
              {t.common.whatsappUs}
            </a>
          )}
        </motion.div>
      </div>

      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f7fa] dark:from-[#071224] to-transparent" />
    </section>
  );
}
