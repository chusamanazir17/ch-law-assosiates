"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  Home,
  CheckCircle2,
  Send,
  type LucideIcon,
} from "lucide-react";
import { SITE, buildWhatsAppUrl } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";
import { useLanguage } from "@/providers/LanguageProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { validateInquiry } from "@/lib/validation/inquiry";
import { useCms } from "@/lib/hooks/useCms";

const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export type ContactOption = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
  actionLabel: string;
  href: string;
  featured?: boolean;
};

export function ContactCards({
  items,
  dark = false,
  featuredFirst = false,
}: {
  items?: ContactOption[];
  dark?: boolean;
  featuredFirst?: boolean;
}) {
  const { isUrdu, t } = useLanguage();
  const { settings } = useCms();

  const phone = settings?.phone || SITE.phone;
  const whatsapp = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const address = settings?.address || (isUrdu ? "شرقی گیٹ چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال" : SITE.address);
  const mapsUrl = settings?.mapsUrl || SITE.mapsUrl;

  const defaultOptions: ContactOption[] = [
    {
      icon: Phone,
      title: t.common.callNow,
      lines: [
        isUrdu ? "قانونی دستاویزات کی معلومات کے لیے" : "Talk to an agent about specific legal",
        isUrdu ? "ہمارے نمائندے سے بات کریں۔" : "documentation needs.",
      ],
      actionLabel: t.common.callSupport,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    },
    {
      icon: WhatsAppIcon,
      title: t.common.whatsappUs,
      lines: [
        isUrdu ? "فوری معلومات اور مطلوبہ دستاویزات" : "Instant replies for quick queries and",
        isUrdu ? "کی چیک لسٹ کے لیے۔" : "checklist requests.",
      ],
      actionLabel: isUrdu ? "پیغام بھیجیں" : "Message Now",
      href: buildWhatsAppUrl(whatsapp, "Hello Ch Composing, I would like to inquire about legal documentation and tax advisory services."),
      featured: true,
    },
    {
      icon: MapPin,
      title: t.common.getDirections,
      lines: [isUrdu ? "ڈسٹرکٹ کورٹ ساہیوال" : "District Court Sahiwal", ""],
      actionLabel: isUrdu ? "نقشہ دیکھیں" : "Open Maps",
      href: mapsUrl,
    },
    {
      icon: Home,
      title: t.common.visitOurOffice,
      lines: [isUrdu ? "چیمبر نمبر 121، شرقی گیٹ" : "Chamber 121, Sharki Gate", ""],
      actionLabel: isUrdu ? "اوقات دیکھیں" : "See Schedule",
      href: "/#office",
    },
  ];

  const displayItems = items || defaultOptions;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {displayItems.map((o, i) => {
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
            className={`flex flex-col items-center rounded-lg border p-7 text-center transition-all duration-300 hover:shadow-card-hover ${
              featured
                ? "border-gold-400/50 bg-gold-400 text-white shadow-card"
                : dark
                ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                : "border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] text-navy-900 dark:text-white shadow-soft"
            }`}
          >
            <span
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                featured
                  ? "bg-white/20 text-white"
                  : dark
                  ? "bg-white/10 text-gold-400"
                  : "bg-navy-900/[0.05] dark:bg-white/10 text-navy-900 dark:text-gold-400"
              }`}
            >
              <o.icon className="h-5 w-5" />
            </span>
            <h4
              className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                featured || dark ? "text-white" : "text-navy-800/50 dark:text-slate-400"
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
                    : "text-navy-800/65 dark:text-slate-300"
                }`}
              >
                {l}
              </p>
            ))}
            {o.href.startsWith("/") ? (
              <Link
                href={o.href}
                className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                  featured
                    ? "bg-white text-gold-700 hover:bg-gold-50"
                    : dark
                    ? "bg-gold-400 text-white hover:bg-gold-500"
                    : "border border-navy-900/20 dark:border-white/20 text-navy-900 dark:text-white hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:bg-white/10"
                }`}
              >
                {o.actionLabel}
              </Link>
            ) : (
              <a
                href={o.href}
                target={o.href.startsWith("http") ? "_blank" : undefined}
                rel={o.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                  featured
                    ? "bg-white text-gold-700 hover:bg-gold-50"
                    : dark
                    ? "bg-gold-400 text-white hover:bg-gold-500"
                    : "border border-navy-900/20 dark:border-white/20 text-navy-900 dark:text-white hover:border-navy-900 hover:bg-navy-900 hover:text-white dark:hover:bg-white/10"
                }`}
              >
                {o.actionLabel}
              </a>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* Dark split consultation panel with a clean contact/consultation card on the right */
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
  const { t } = useLanguage();

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
            <Link href="/#office" className="btn-gold">
              <MapPin className="h-4 w-4" /> {t.common.visitOurOffice}
            </Link>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-6 py-3 text-sm shadow-md shadow-[#25D366]/25 transition hover:shadow-lg hover:shadow-[#25D366]/35"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t.common.whatsappUs}
            </a>
          </div>
        </FadeIn>

        <FadeIn direction="left" delay={0.15}>
          {children ?? (
            <div className="rounded-xl bg-white dark:bg-[#0c1c33] border border-transparent dark:border-white/10 p-8 shadow-card-hover text-navy-900 dark:text-white transition-colors duration-200">
              <h3 className="text-center font-serif text-xl font-bold text-navy-900 dark:text-white">
                {t.common.fastContact}
              </h3>
              <div className="mt-6 space-y-3">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center justify-between rounded-lg bg-navy-900 dark:bg-[#071224] border border-transparent dark:border-white/15 px-5 py-4 text-sm font-semibold text-white transition hover:bg-navy-800 dark:hover:bg-[#0a1b35]"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gold-400" /> {t.common.callSupport}
                  </span>
                  <span className="text-white/60 text-xs font-mono">{SITE.phone}</span>
                </a>
                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-[#25d366] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-95 shadow-md shadow-[#25d366]/20"
                >
                  <span className="flex items-center gap-3">
                    <WhatsAppIcon className="h-4 w-4" /> {t.common.whatsappUs}
                  </span>
                  <span className="text-white/90 text-xs font-mono">{SITE.whatsapp}</span>
                </a>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-gold-400 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gold-500"
                >
                  <span className="flex items-center gap-3">
                    <Navigation className="h-4 w-4" /> {t.common.getDirections}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-center text-[11px] leading-relaxed text-navy-800/60 dark:text-slate-400">
                {t.common.physicalVerificationNotice}
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

/* Interactive Quick Consultation Form for users requesting document assistance */
export function ConsultationForm() {
  const { isUrdu, t } = useLanguage();
  const { services, settings } = useCms();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState(SITE.whatsappHref);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    service: "tax",
    message: "",
    company: "",
  });

  const availableServices = services && services.length > 0
    ? services.filter((s) => s.active).map((s) => ({
        id: s.slug,
        label: isUrdu ? (s.nameUrdu || s.name) : s.name,
      }))
    : [
        { id: "tax", label: isUrdu ? "ٹیکس سروسز" : "Tax Services" },
        { id: "e-stamping", label: isUrdu ? "ای سٹامپنگ" : "E-Stamping" },
        { id: "property-land", label: isUrdu ? "پراپرٹی سروسز" : "Property Services" },
        { id: "business-registration", label: isUrdu ? "بزنس رجسٹریشن" : "Business Registration" },
        { id: "legal-documentation", label: isUrdu ? "قانونی دستاویزات" : "Legal Documentation" },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveWarning(null);

    try {
      validateInquiry({
        name: formData.fullName,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Please check the form details and try again.");
      return;
    }

    setLoading(true);

    const activeService = availableServices.find((s) => s.id === formData.service);
    const serviceName = activeService ? activeService.label : formData.service;
    const message = isUrdu
      ? `السلام علیکم چوہدری کمپوزنگ ای سٹامپ اور ٹیکس ایڈوائزر،\n\nنام: ${formData.fullName}\nفون: ${formData.phone}\nسروس: ${serviceName}\n${formData.message ? `تفصیلات: ${formData.message}` : ""}`
      : `Hello Ch Composing Estamp and Tax Advisor,\n\nName: ${formData.fullName}\nPhone: ${formData.phone}\nService: ${serviceName}\n${formData.message ? `Details: ${formData.message}` : ""}`;

    const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
    const whatsappUrl = buildWhatsAppUrl(whatsappPhone, message.trim());
    setLastWhatsAppUrl(whatsappUrl);

    // Open from the original submit gesture so browser popup protection does not
    // block the WhatsApp handoff. The success screen also includes a fallback link.
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (whatsappWindow) whatsappWindow.opener = null;

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          service: formData.service,
          message: formData.message.trim(),
          company: formData.company,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success !== true) {
        setSaveWarning(
          payload?.error ||
            "WhatsApp was opened, but the website could not save a separate inquiry record. Please send the prepared WhatsApp message.",
        );
      }
    } catch (error) {
      console.warn("[Inquiry Save] Database capture unavailable; WhatsApp handoff remains available.", error);
      setSaveWarning(
        "WhatsApp was opened, but the website could not save a separate inquiry record. Please send the prepared WhatsApp message.",
      );
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-gold-400/30 bg-white dark:bg-[#0c1c33] p-8 text-center shadow-card-hover text-navy-900 dark:text-white">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
          {saveWarning ? (isUrdu ? "واٹس ایپ پیغام تیار ہے" : "WhatsApp Message Ready") : t.form.successTitle}
        </h3>
        <p className="mt-2 text-sm text-navy-800/70 dark:text-slate-300">
          {saveWarning ? saveWarning : t.form.successDesc}
        </p>
        <a
          href={lastWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-[#25D366]/30 transition hover:shadow-lg hover:shadow-[#25D366]/40 mt-5"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {isUrdu ? "واٹس ایپ پیغام کھولیں" : "Open WhatsApp Message"}
        </a>
        <button
          onClick={() => {
            setSubmitted(false);
            setSaveWarning(null);
            setFormError(null);
            setFormData({ fullName: "", phone: "", service: "tax", message: "", company: "" });
          }}
          className="btn-gold mt-6 py-2.5 text-xs"
        >
          {isUrdu ? "ایک اور درخواست بھیجیں" : "Send Another Request"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#0c1c33] p-8 shadow-card-hover text-navy-900 dark:text-white transition-colors duration-200"
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="consultation-company">Company</label>
        <input
          id="consultation-company"
          tabIndex={-1}
          autoComplete="off"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div className="mb-6 text-center">
        <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
          {t.form.cardTitle}
        </h3>
        <p className="mt-1 text-xs text-navy-800/60 dark:text-slate-400">
          {t.form.cardSubtitle}
        </p>
      </div>

      {formError && (
        <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {formError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="consultation-name" className="form-label mb-1.5">{t.form.fullName}</label>
          <input
            id="consultation-name"
            type="text"
            required
            placeholder={t.form.fullNamePlaceholder}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="form-input"
            autoComplete="name"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="consultation-phone" className="form-label mb-1.5">{t.form.phone}</label>
          <input
            id="consultation-phone"
            type="tel"
            required
            placeholder={t.form.phonePlaceholder}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
            autoComplete="tel"
            inputMode="tel"
            minLength={7}
            maxLength={24}
            pattern={"[+()0-9\\s-]{7,24}"}
          />
        </div>

        <div>
          <label htmlFor="consultation-service" className="form-label mb-1.5">{t.form.service}</label>
          <select
            id="consultation-service"
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="form-input cursor-pointer"
          >
            {availableServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="consultation-message" className="form-label mb-1.5">{t.form.message}</label>
          <textarea
            id="consultation-message"
            rows={3}
            placeholder={t.form.messagePlaceholder}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="form-input resize-none"
            maxLength={1500}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full py-3 text-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            t.form.submitting
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {t.form.submitBtn}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* Compact navy banner: "Need more legal help?" */
export function HelpBanner() {
  const { t } = useLanguage();

  return (
    <section className="bg-navy-900 border-t border-white/10">
      <div className="container-x flex flex-col items-center justify-between gap-5 py-8 sm:flex-row">
        <FadeIn direction="right" className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-white">
            <Navigation className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              {t.common.needChecklist}
            </h3>
            <p className="text-sm text-white/60">
              {t.common.needChecklistDesc}
            </p>
          </div>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-400 transition hover:gap-3 hover:text-gold-300"
          >
            {t.common.backToHome} <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

export function OfficeHoursCard({ dark = false }: { dark?: boolean }) {
  const { t } = useLanguage();

  const items = [
    { label: t.common.weekdays, value: t.common.weekdaysHours, icon: Clock },
    { label: t.common.saturdays, value: t.common.saturdayHours, icon: Clock },
  ];

  return (
    <div
      className={`rounded-lg border p-6 transition-colors ${
        dark
          ? "border-white/10 bg-white/[0.04] text-white"
          : "border-navy-900/8 dark:border-white/10 bg-white dark:bg-[#0c1c33] text-navy-900 dark:text-white shadow-soft"
      }`}
    >
      <h4
        className={`mb-4 text-[11px] font-bold uppercase tracking-[0.16em] ${
          dark ? "text-white/50" : "text-navy-800/50 dark:text-slate-400"
        }`}
      >
        {t.common.publicDealingHours}
      </h4>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-4">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                dark ? "text-white/60" : "text-navy-800/60 dark:text-slate-400"
              }`}
            >
              {i.label}
            </span>
            <span
              className={`text-xs font-semibold ${
                dark ? "text-white" : "text-navy-900 dark:text-slate-200"
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
