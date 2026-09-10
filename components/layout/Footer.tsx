"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { isUrdu, t } = useLanguage();

  const quickLinks = [
    { label: isUrdu ? "ای سٹامپنگ سروسز" : "E-Stamping", href: "/services/e-stamping" },
    { label: isUrdu ? "پراپرٹی رجسٹری و انتقال" : "Property Registry", href: "/services/property-land" },
    { label: isUrdu ? "بزنس و کمپنی رجسٹریشن" : "Business Registration", href: "/services/business-registration" },
    { label: isUrdu ? "ٹیکس سروسز (FBR)" : "Tax Services", href: "/services/tax" },
    { label: isUrdu ? "ہمارے بارے میں" : "About Us", href: "/#about" },
  ];

  const socials = [
    { icon: Facebook, label: "Facebook" },
    { icon: Instagram, label: "Instagram" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Twitter, label: "Twitter" },
  ];

  return (
    <footer className="border-t border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#071224] transition-colors duration-200">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Contact */}
        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
            {t.footer.contactUs}
          </h4>
          <ul className="space-y-4 text-sm text-navy-800/70 dark:text-slate-300">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>{isUrdu ? "آفس 402، بزنس ٹاور، بلیو ایریا، اسلام آباد، پاکستان" : SITE.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <a href={SITE.phoneHref} className="transition hover:text-gold-600 dark:hover:text-gold-400">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <a href={`mailto:${SITE.email}`} className="transition hover:text-gold-600 dark:hover:text-gold-400">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
            {t.footer.businessHours}
          </h4>
          <ul className="space-y-3 text-sm text-navy-800/70 dark:text-slate-300">
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>{isUrdu ? "پیر تا جمعہ: 9:00 بجے صبح تا 6:00 بجے شام" : SITE.hours.weekdays}</span>
            </li>
            <li className="flex gap-3 pl-7 rtl:pr-7 rtl:pl-0">
              {isUrdu ? "ہفتہ: 10:00 بجے صبح تا 2:00 بجے دوپہر" : SITE.hours.saturday}
            </li>
            <li className="flex gap-3 pl-7 rtl:pr-7 rtl:pl-0">
              {isUrdu ? "اتوار: بند ہے" : SITE.hours.sunday}
            </li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
            {t.footer.quickLinks}
          </h4>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-navy-800/70 dark:text-slate-300 transition hover:pl-1 rtl:hover:pr-1 rtl:hover:pl-0 hover:text-gold-600 dark:hover:text-gold-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-navy-900 dark:text-white">
            {t.footer.followUs}
          </h4>
          <div className="flex gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-400/40"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-navy-900/[0.04] dark:bg-white/[0.06] p-4 text-xs leading-relaxed text-navy-800/70 dark:text-slate-300 border border-navy-900/5 dark:border-white/5">
            {t.footer.disclaimer}
          </div>
        </div>
      </div>

      <div className="border-t border-navy-900/10 dark:border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-navy-800/55 dark:text-slate-400 sm:flex-row">
          <p>{t.footer.rights}</p>
          <div className="flex gap-6">
            <Link href="#" className="transition hover:text-gold-600 dark:hover:text-gold-400">
              {t.footer.privacy}
            </Link>
            <Link href="#" className="transition hover:text-gold-600 dark:hover:text-gold-400">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
