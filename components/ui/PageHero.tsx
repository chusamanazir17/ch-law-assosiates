"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Users } from "lucide-react";
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
  image?: string;
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
  const { t, isUrdu } = useLanguage();
  const { getPageContent, getService } = useCms();

  // Dynamic CMS overrides from Admin Dashboard (only override in English mode)
  const cmsPage = getPageContent(pathname);
  const slug = pathname.startsWith("/services/") ? pathname.replace(/^\/services\//, "") : "";
  const cmsService = slug ? getService(slug) : undefined;

  const effectiveBadge = isUrdu ? badge : (cmsPage?.heroBadge || cmsService?.tagline || badge);
  const effectiveTitle = isUrdu ? title : (cmsPage?.heroHeadline || cmsService?.name || title);
  const effectiveDescription = isUrdu ? description : (cmsPage?.heroSubtitle || cmsService?.description || description);

  const effectiveBackLabel = backLabel || t.common.backToHome;
  const rawPrimaryCta = primaryCta || { label: t.common.visitOurOffice, href: "/#office" };
  const effectivePrimaryCta = (!isUrdu && cmsPage?.primaryCtaText)
    ? { label: cmsPage.primaryCtaText, href: cmsPage.primaryCtaHref || "/#office" }
    : {
        ...rawPrimaryCta,
        href: rawPrimaryCta.href === "#contact" || rawPrimaryCta.href === "#office" ? "/#office" : rawPrimaryCta.href,
      };

  return (
    <section
      className={`relative overflow-hidden bg-[#040c18] text-white ${
        tall ? "min-h-[420px]" : "min-h-[340px]"
      }`}
    >
      {/* Full-bleed Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image || "/images/hero-scales-justice.jpg"}
          alt={effectiveTitle}
          fill
          priority
          className="object-cover object-right sm:object-center"
          sizes="100vw"
        />
        {/* Left-side gradient shadow to ensure 100% solid dark navy under text on all screen sizes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040c18] via-[#040c18]/90 via-45% to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#040c18]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#040c18] to-transparent" />
      </div>

      <div className="container-x relative z-10 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[320px] lg:min-h-[420px]">
          {/* Left Column (spans 7 cols): Breadcrumbs, Eyebrow, H1, Description, Buttons */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left py-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
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
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {effectiveBackLabel}
                </Link>
              )}
            </motion.div>

            {effectiveBadge && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                {effectiveBadge}
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18 }}
              className="font-serif text-[clamp(2rem,4vw+0.5rem,3.25rem)] font-bold leading-tight text-white tracking-tight"
            >
              {effectiveTitle}
              {highlight && <span className="text-gold-400"> {highlight}</span>}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#F4F6F8]/90 font-normal"
            >
              {effectiveDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.38 }}
              className="mt-7 flex flex-wrap gap-4"
            >
              <Link href={effectivePrimaryCta.href} className="btn-gold px-7 py-3 text-[13.5px] font-medium shadow-lg shadow-gold-500/20">
                <MapPin className="h-4 w-4" /> {effectivePrimaryCta.label}
              </Link>
              {whatsapp && (
                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-medium px-7 py-3 text-[13.5px] shadow-lg shadow-[#25D366]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#25D366]/35 hover:-translate-y-0.5 active:translate-y-0 border border-emerald-400/30"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>{t.common.whatsappUs}</span>
                </a>
              )}
            </motion.div>
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
                  {isUrdu ? "بااعتماد برائے" : "Trusted by"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                  {isUrdu ? "کاروبار، خاندان اور افراد" : "Businesses, Families & Individuals"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
