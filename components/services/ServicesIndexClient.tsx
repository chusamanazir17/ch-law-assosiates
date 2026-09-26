"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  ArrowRight,
  Clock,
  FileCheck2,
  Search,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import FadeIn from "@/components/motion/FadeIn";
import Stagger, { StaggerItem } from "@/components/motion/Stagger";
import { ConsultationForm } from "@/components/ui/ContactBlocks";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCms } from "@/lib/hooks/useCms";
import { HERO_IMAGES, SITE } from "@/lib/site";
import type { CmsService } from "@/lib/db/servicesStore";

interface ServicesIndexClientProps {
  initialServices: CmsService[];
}

export default function ServicesIndexClient({ initialServices }: ServicesIndexClientProps) {
  const { isUrdu } = useLanguage();
  const { services: liveServices } = useCms({ services: initialServices });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const displayServices = (liveServices && liveServices.length > 0 ? liveServices : initialServices)
    .filter((s) => s.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = ["All", ...Array.from(new Set(displayServices.map((s) => s.category).filter(Boolean)))];

  const filtered = displayServices.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameUrdu && s.nameUrdu.includes(searchQuery)) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#061226] text-navy-950 dark:text-white transition-colors duration-200">
      <PageHero
        badge={isUrdu ? "مستند عدالتی خدمات • چیمبر 121" : "COURT & TAX PRACTICE AREAS"}
        title={isUrdu ? "ہماری قانونی و دستاویزی خدمات" : "Official Legal & Documentation"}
        highlight={isUrdu ? "جامع خدمات" : "Practice Areas"}
        description={
          isUrdu
            ? "ڈسٹرکٹ کورٹ ساہیوال میں ای سٹامپنگ، پراپرٹی رجسٹری، ایف بی آر انکم ٹیکس، ایس ای سی پی رجسٹریشن اور عدالتی دستاویزات کی مستند و بااعتماد خدمات۔"
            : "Authorized legal documentation, certified e-stamping, property registry deeds, FBR tax advisory, and corporate compliance services at Chamber 121, District Court Sahiwal."
        }
        image={HERO_IMAGES.registry}
      />

      {/* Filter and Search Bar */}
      <section className="py-8 border-b border-navy-900/10 dark:border-white/10 bg-white dark:bg-[#081730]">
        <div className="container-x flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isUrdu ? "سروس تلاش کریں..." : "Search services, e-stamping, tax..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-navy-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-navy-950 text-white dark:bg-gold-400 dark:text-navy-950 shadow-sm"
                    : "bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-14 sm:py-20">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <div
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c1c33] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <Image
                      src={service.heroImage || HERO_IMAGES.home}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />

                    <div className="absolute top-3.5 left-3.5">
                      <span className="rounded-full bg-navy-950/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400 border border-gold-400/25 backdrop-blur-xs">
                        {service.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-serif text-lg font-bold leading-snug drop-shadow-sm">
                        {isUrdu && service.nameUrdu ? service.nameUrdu : service.name}
                      </h3>
                      {service.nameUrdu && !isUrdu && (
                        <p className="text-xs text-gold-400 font-medium">{service.nameUrdu}</p>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    {service.tagline && (
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                        {service.tagline}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Turnaround Time Pill */}
                    <div className="flex items-center gap-2 pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                      <span>Turnaround: <strong className="text-navy-900 dark:text-white">{service.turnaroundTime || "Same-day"}</strong></span>
                    </div>

                    {/* Key Items / Sub-services */}
                    {service.items && service.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Key Sub-Services:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {service.items.slice(0, 3).map((item) => (
                            <li key={item.id} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-gold-500 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="p-5 sm:p-6 pt-0">
                  <Link
                    href={`/services/${service.slug}`}
                    className="w-full flex items-center justify-between rounded-xl bg-navy-50 hover:bg-gold-400 dark:bg-white/[0.05] dark:hover:bg-gold-400 px-4 py-2.5 text-xs font-bold text-navy-950 dark:text-white dark:hover:text-navy-950 transition-colors group-hover:bg-gold-400 group-hover:text-navy-950"
                  >
                    <span>{isUrdu ? "تفصیلات و معلومات دیکھیں" : "View Full Details"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-16 bg-white dark:bg-[#07152b] border-t border-navy-900/10 dark:border-white/10">
        <div className="container-x max-w-4xl">
          <div className="text-center mb-10">
            <span className="eyebrow">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-400" />
              {isUrdu ? "فوری قانونی و ٹیکس رہنمائی" : "CONSULTATION ASSISTANCE"}
            </span>
            <h2 className="section-title text-navy-950 dark:text-white mt-3">
              {isUrdu ? "اپنے قانونی معاملات کے لیے ہم سے رابطہ کریں" : "Request a Chamber Legal Consultation"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-300">
              {isUrdu
                ? "فوری ای سٹامپنگ یا ٹیکس مشاورت کے لیے آن لائن فارم پر کریں۔"
                : "Submit your details or visit Chamber 121 District Court Sahiwal for immediate assistance."}
            </p>
          </div>
          <ConsultationForm />
        </div>
      </section>
    </div>
  );
}
