"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  Home,
  type LucideIcon,
} from "lucide-react";
import { SITE } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";

const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Option = {
  icon: LucideIcon;
  title: string;
  lines: string[];
  actionLabel: string;
  href: string;
  featured?: boolean;
};

export const contactOptions: Option[] = [
  {
    icon: Phone,
    title: "Call Now",
    lines: ["Talk to an agent about specific legal", "documentation needs."],
    actionLabel: "Call Support",
    href: SITE.phoneHref,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Us",
    lines: ["Instant replies for quick queries and", "checklist requests."],
    actionLabel: "Message Now",
    href: SITE.whatsappHref,
    featured: true,
  },
  {
    icon: MapPin,
    title: "Get Directions",
    lines: ["Blue Area, Islamabad", ""],
    actionLabel: "Open Maps",
    href: SITE.mapsUrl,
  },
  {
    icon: Home,
    title: "Visit Our Office",
    lines: ["Office 402, Business Tower", ""],
    actionLabel: "See Schedule",
    href: "#office",
  },
];

export function ContactCards({
  items = contactOptions,
  dark = false,
  featuredFirst = false,
}: {
  items?: Option[];
  dark?: boolean;
  featuredFirst?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((o, i) => {
        const featured = featuredFirst ? i === 0 : o.featured;
        return (
          <motion.div
            key={o.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={cardAnim}
            whileHover={{ y: -6 }}
            className={`flex flex-col items-center rounded-lg border p-7 text-center transition-shadow duration-300 hover:shadow-card-hover ${
              featured
                ? "border-gold-400/50 bg-gold-400 text-white"
                : dark
                  ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                  : "border-navy-900/8 bg-white text-navy-900"
            }`}
          >
            <span
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                featured
                  ? "bg-white/20 text-white"
                  : dark
                    ? "bg-white/10 text-gold-400"
                    : "bg-navy-900/[0.05] text-navy-900"
              }`}
            >
              <o.icon className="h-5 w-5" />
            </span>
            <h4
              className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                featured || dark ? "text-white" : "text-navy-800/50"
              }`}
            >
              {o.title}
            </h4>
            {o.lines.filter(Boolean).map((l) => (
              <p
                key={l}
                className={`mt-2 text-sm ${
                  featured
                    ? "text-white/90"
                    : dark
                      ? "text-white/65"
                      : "text-navy-800/65"
                }`}
              >
                {l}
              </p>
            ))}
            <a
              href={o.href}
              className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                featured
                  ? "bg-white text-gold-700 hover:bg-gold-50"
                  : dark
                    ? "bg-gold-400 text-white hover:bg-gold-500"
                    : "border border-navy-900/20 text-navy-900 hover:border-navy-900 hover:bg-navy-900 hover:text-white"
              }`}
            >
              {o.actionLabel}
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}

/* Dark split consultation panel with a white contact card on the right */
export function ConsultationPanel({
  title,
  text,
  bullets,
  children,
  id,
}: {
  title: string;
  text: string;
  bullets?: { icon: LucideIcon; label: string; value: string }[];
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="relative overflow-hidden bg-navy-900 py-20 texture-grid">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <FadeIn direction="right">
          <h2 className="font-serif text-3xl font-bold text-white">{title}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">{text}</p>

          {bullets && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {bullets.map((b) => (
                <div key={b.label} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-gold-400">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                      {b.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{b.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="#office" className="btn-gold">
              <MapPin className="h-4 w-4" /> Visit Our Office
            </Link>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-light"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={0.15}>
          {children ?? (
            <div className="rounded-xl bg-white p-8 shadow-card-hover">
              <h3 className="text-center font-serif text-xl font-bold text-navy-900">
                Fast Contact Options
              </h3>
              <div className="mt-6 space-y-3">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center justify-between rounded-lg bg-navy-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-navy-800"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gold-400" /> Call Support Now
                  </span>
                  <span className="text-white/50">{SITE.phone}</span>
                </a>
                <a
                  href={SITE.whatsappHref}
                  className="flex items-center justify-between rounded-lg bg-[#25d366] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Direct
                  </span>
                  <span className="text-white/80">{SITE.whatsapp}</span>
                </a>
                <a
                  href={SITE.mapsUrl}
                  className="flex items-center justify-between rounded-lg bg-gold-400 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gold-500"
                >
                  <span className="flex items-center gap-3">
                    <Navigation className="h-4 w-4" /> Get Office Directions
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-center text-[11px] leading-relaxed text-navy-800/50">
                Note: We do not accept online applications. Physical verification
                of original documents is required.
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

/* Compact navy banner: "Need more legal help?" */
export function HelpBanner() {
  return (
    <section className="bg-navy-900">
      <div className="container-x flex flex-col items-center justify-between gap-5 py-8 sm:flex-row">
        <FadeIn direction="right" className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-white">
            <Navigation className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Need more legal help?
            </h3>
            <p className="text-sm text-white/60">
              Explore our full range of documentation services.
            </p>
          </div>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-400 transition hover:gap-3 hover:text-gold-300"
          >
            Back to Homepage <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export function OfficeHoursCard({ dark = false }: { dark?: boolean }) {
  const items = [
    { label: "WEEKDAYS", value: "9:00 AM - 6:00 PM", icon: Clock },
    { label: "SATURDAYS", value: "10:00 AM - 2:00 PM", icon: Clock },
  ];
  return (
    <div
      className={`rounded-lg border p-6 ${
        dark ? "border-white/10 bg-white/[0.04]" : "border-navy-900/8 bg-white shadow-soft"
      }`}
    >
      <h4
        className={`mb-4 text-[11px] font-bold uppercase tracking-[0.16em] ${
          dark ? "text-white/50" : "text-navy-800/50"
        }`}
      >
        Public Dealing Hours
      </h4>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-4">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                dark ? "text-white/60" : "text-navy-800/60"
              }`}
            >
              {i.label}
            </span>
            <span
              className={`text-xs font-semibold ${
                dark ? "text-white" : "text-navy-900"
              }`}
            >
              {i.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
