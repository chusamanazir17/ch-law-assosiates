"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Sparkles,
  Save,
  X,
  Eye,
  Loader2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  Globe,
  Sliders,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Layers,
  MessageCircle,
  HelpCircle,
  Star,
  MapPin,
  Phone,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import type { PageContentItem } from "@/lib/db/pagesContentStore";
import type {
  HomeSectionsData,
  SectionId,
  TestimonialItem,
  FaqItem,
} from "@/lib/db/homeSectionsStore";

const DEFAULT_SECTION_ORDER: { id: SectionId; name: string; desc: string }[] = [
  { id: "hero", name: "Hero Header", desc: "Top headline, badge, call & WhatsApp action buttons, and trust badges" },
  { id: "services", name: "Services Grid", desc: "Cards for all official legal, tax, and property services" },
  { id: "about", name: "About & Visiting Guide", desc: "Chamber profile, step-by-step visit process, and consultant details" },
  { id: "whyTrust", name: "Why Choose Us", desc: "Practice stats, key benefits, and credentials" },
  { id: "reminders", name: "Tax Deadlines", desc: "Upcoming FBR deadlines and compliance alerts" },
  { id: "testimonials", name: "Client Testimonials", desc: "Client feedback and star ratings" },
  { id: "faq", name: "Frequently Asked Questions", desc: "Interactive accordion answering common client questions" },
  { id: "office", name: "Chamber 121 & Map", desc: "Location map, opening hours, and visit checklist" },
  { id: "finalCta", name: "Final Contact Banner", desc: "Bottom WhatsApp and call conversion banner" },
];

export default function PagesContentManager() {
  const [pages, setPages] = useState<PageContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<PageContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Normal page tab state
  const [activeTab, setActiveTab] = useState<"hero" | "cta" | "content" | "seo">("hero");

  // Home sections builder state
  const [isHomeBuilder, setIsHomeBuilder] = useState(false);
  const [homeSections, setHomeSections] = useState<HomeSectionsData | null>(null);
  const [homeActiveTab, setHomeActiveTab] = useState<
    "order" | "hero" | "services" | "about" | "whyTrust" | "reminders" | "testimonials" | "faq" | "office" | "finalCta" | "seo"
  >("order");

  // Form state for standard pages
  const [formData, setFormData] = useState<Partial<PageContentItem>>({});

  const fetchPages = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [pagesRes, sectionsRes] = await Promise.all([
        fetch("/api/admin/pages"),
        fetch("/api/admin/sections"),
      ]);

      const pagesData = await pagesRes.json();
      if (pagesRes.ok && pagesData.success) {
        setPages(pagesData.pages);
      } else {
        throw new Error(pagesData.error || "Failed to load pages");
      }

      const sectionsData = await sectionsRes.json();
      if (sectionsRes.ok && sectionsData.success) {
        setHomeSections(sectionsData.sections);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load page content.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openEditor = (page: PageContentItem) => {
    setSelectedPage(page);
    setFormData({ ...page });
    setIsEditing(true);
    setSaveSuccess(null);
    setSaveError(null);

    if (page.id === "home" || page.route === "/") {
      setIsHomeBuilder(true);
      setHomeActiveTab("order");
    } else {
      setIsHomeBuilder(false);
      setActiveTab("hero");
    }
  };

  const closeEditor = () => {
    setIsEditing(false);
    setSelectedPage(null);
    setFormData({});
    setIsHomeBuilder(false);
  };

  // Save standard page
  const handleSaveStandardPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(data.message || "Page updated successfully!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cms-updated"));
        }
        setPages((prev) => prev.map((p) => (p.id === data.page.id ? data.page : p)));
        setSelectedPage(data.page);
      } else {
        throw new Error(data.error || "Failed to save changes");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Save homepage sections
  const handleSaveHomeSections = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!homeSections) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      // Save sections data
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeSections),
      });
      const data = await res.json();

      // If SEO was also changed in formData, save page content too
      if (formData.id) {
        await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (res.ok && data.success) {
        setSaveSuccess("Homepage sections updated and published live!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cms-updated"));
        }
        setHomeSections(data.sections);
      } else {
        throw new Error(data.error || "Failed to save homepage sections");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save homepage sections");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to reorder sections
  const moveSection = (index: number, direction: "up" | "down") => {
    if (!homeSections) return;
    const order = [...homeSections.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const [moved] = order.splice(index, 1);
    order.splice(targetIndex, 0, moved);

    setHomeSections({
      ...homeSections,
      sectionOrder: order,
    });
  };

  // Section toggle helpers
  const toggleSectionEnabled = (sectionId: SectionId) => {
    if (!homeSections) return;
    const updated = { ...homeSections };
    switch (sectionId) {
      case "services":
        updated.servicesSection = { ...updated.servicesSection, enabled: !updated.servicesSection.enabled };
        break;
      case "about":
        updated.aboutSection = { ...updated.aboutSection, enabled: !updated.aboutSection.enabled };
        break;
      case "whyTrust":
        updated.whyTrustSection = { ...updated.whyTrustSection, enabled: !updated.whyTrustSection.enabled };
        break;
      case "reminders":
        updated.remindersSection = { ...updated.remindersSection, enabled: !updated.remindersSection.enabled };
        break;
      case "testimonials":
        updated.testimonialsSection = { ...updated.testimonialsSection, enabled: !updated.testimonialsSection.enabled };
        break;
      case "faq":
        updated.faqSection = { ...updated.faqSection, enabled: !updated.faqSection.enabled };
        break;
      case "office":
        updated.officeSection = { ...updated.officeSection, enabled: !updated.officeSection.enabled };
        break;
      case "finalCta":
        updated.finalCtaSection = { ...updated.finalCtaSection, enabled: !updated.finalCtaSection.enabled };
        break;
    }
    setHomeSections(updated);
  };

  const isSectionEnabled = (sectionId: SectionId): boolean => {
    if (!homeSections) return true;
    switch (sectionId) {
      case "hero":
        return true; // Hero always enabled
      case "services":
        return homeSections.servicesSection.enabled;
      case "about":
        return homeSections.aboutSection.enabled;
      case "whyTrust":
        return homeSections.whyTrustSection.enabled;
      case "reminders":
        return homeSections.remindersSection.enabled;
      case "testimonials":
        return homeSections.testimonialsSection.enabled;
      case "faq":
        return homeSections.faqSection.enabled;
      case "office":
        return homeSections.officeSection.enabled;
      case "finalCta":
        return homeSections.finalCtaSection.enabled;
      default:
        return true;
    }
  };

  // Testimonial helpers
  const handleAddTestimonial = () => {
    if (!homeSections) return;
    const newItem: TestimonialItem = {
      id: `review-${Date.now()}`,
      clientName: "New Client",
      clientRole: "Property Owner / Business",
      text: "Excellent and transparent service at Chamber 121.",
      rating: 5,
      visible: true,
    };
    setHomeSections({
      ...homeSections,
      testimonialsSection: {
        ...homeSections.testimonialsSection,
        items: [...homeSections.testimonialsSection.items, newItem],
      },
    });
  };

  const handleUpdateTestimonial = (index: number, field: keyof TestimonialItem, value: any) => {
    if (!homeSections) return;
    const items = [...homeSections.testimonialsSection.items];
    items[index] = { ...items[index], [field]: value };
    setHomeSections({
      ...homeSections,
      testimonialsSection: { ...homeSections.testimonialsSection, items },
    });
  };

  const handleDeleteTestimonial = (index: number) => {
    if (!homeSections) return;
    const items = [...homeSections.testimonialsSection.items];
    items.splice(index, 1);
    setHomeSections({
      ...homeSections,
      testimonialsSection: { ...homeSections.testimonialsSection, items },
    });
  };

  // FAQ helpers
  const handleAddFaq = () => {
    if (!homeSections) return;
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: "What documents are required for consultation?",
      answer: "Please bring original CNIC, relevant property or tax documents, and prior filing receipts.",
      order: homeSections.faqSection.items.length + 1,
      visible: true,
    };
    setHomeSections({
      ...homeSections,
      faqSection: {
        ...homeSections.faqSection,
        items: [...homeSections.faqSection.items, newItem],
      },
    });
  };

  const handleUpdateFaq = (index: number, field: keyof FaqItem, value: any) => {
    if (!homeSections) return;
    const items = [...homeSections.faqSection.items];
    items[index] = { ...items[index], [field]: value };
    setHomeSections({
      ...homeSections,
      faqSection: { ...homeSections.faqSection, items },
    });
  };

  const handleDeleteFaq = (index: number) => {
    if (!homeSections) return;
    const items = [...homeSections.faqSection.items];
    items.splice(index, 1);
    setHomeSections({
      ...homeSections,
      faqSection: { ...homeSections.faqSection, items },
    });
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.heroHeadline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-admin">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-xs text-[#52627A] font-medium">
        <Link href="/admin" className="hover:text-[#0B1F36] transition">
          Office CMS
        </Link>
        <span className="mx-2 text-[#94A3B8]">/</span>
        <span className="text-[#0B1F36] font-semibold">Page Content & Page Builder</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Page Builder & Content CMS
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Complete visual control over Homepage sections (order, headlines, CTAs, testimonials, FAQ, and office details) and all sub-pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pages.find((p) => p.id === "home") && (
            <button
              type="button"
              onClick={() => {
                const homePage = pages.find((p) => p.id === "home");
                if (homePage) openEditor(homePage);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#102943] transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C8973D]" />
              <span>Customize Homepage Sections</span>
            </button>
          )}

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-xs hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span>Open Website</span>
          </Link>
          <button
            type="button"
            onClick={fetchPages}
            disabled={isLoading}
            className="rounded-lg border border-[#E2E8F0] bg-white p-2 text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] shadow-xs transition"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#C8973D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or route..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-4 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
          />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
          {filteredPages.length} Pages Available for Editing
        </div>
      </div>

      {/* Error Alert if Load Fails */}
      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{loadError}</span>
          </div>
          <button onClick={fetchPages} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* Pages Grid */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#52627A]">
          <Loader2 className="h-5 w-5 animate-spin text-[#C8973D]" />
          <span>Loading page content catalog...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => {
            const isHome = page.id === "home" || page.route === "/";
            return (
              <div
                key={page.id}
                className={`group flex flex-col justify-between rounded-xl border bg-white overflow-hidden shadow-xs transition hover:shadow-sm ${
                  isHome ? "border-[#C8973D]/50 ring-2 ring-[#C8973D]/10" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                {/* Thumbnail Image with Route Overlay */}
                <div className="relative h-36 w-full bg-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
                  <img
                    src={page.heroImage}
                    alt={page.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=640&q=70";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05162B]/85 via-[#05162B]/30 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-mono text-[11px] font-semibold bg-[#0B1F36]/80 px-2 py-0.5 rounded backdrop-blur-xs border border-white/10">
                      {page.route}
                    </span>
                    {isHome ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#C8973D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#05162B]">
                        <Sparkles className="h-2.5 w-2.5" />
                        Main Landing Page
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF8EE] border border-[#C8973D]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#96641E]">
                        <CheckCircle2 className="h-2.5 w-2.5 text-[#C8973D]" />
                        {page.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[#0B1F36] text-sm group-hover:text-[#0B1F36] transition leading-snug">
                      {page.title}
                    </h3>
                    <p className="text-[11px] text-[#96641E] font-semibold uppercase tracking-wider mt-1">
                      {page.heroBadge}
                    </p>
                    <p className="text-xs text-[#52627A] mt-1.5 line-clamp-2 leading-relaxed">
                      {page.heroHeadline}
                    </p>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditor(page)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer bg-[#0B1F36] hover:bg-[#102943]"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#C8973D]" />
                      <span>{isHome ? "Open Page Builder" : "Edit Content"}</span>
                    </button>

                    <Link
                      href={page.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#52627A] transition hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
                    >
                      <span>Live Page</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE EDIT MODAL / PAGE BUILDER                                    */}
      {/* ========================================================================= */}
      {isEditing && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF8EE] text-[#C8973D]">
                  {isHomeBuilder ? <Sparkles className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#0B1F36] leading-tight">
                      {isHomeBuilder ? "Homepage Section Builder" : `Edit ${selectedPage.title}`}
                    </h2>
                    <span className="font-mono text-[11px] text-[#52627A] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded">
                      {selectedPage.route}
                    </span>
                  </div>
                  <p className="text-xs text-[#52627A] mt-0.5">
                    {isHomeBuilder
                      ? "Control section visibility, order, headlines, FAQs, reviews, and buttons with immediate live preview."
                      : "Modifications will be reflected live on this public route."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={selectedPage.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#96641E] hover:underline px-2 py-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Live Page</span>
                </Link>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            {isHomeBuilder ? (
              <div className="flex border-b border-[#E2E8F0] bg-white px-4 overflow-x-auto scrollbar-thin">
                {[
                  { id: "order", label: "Section Order & Visibility", icon: Layers },
                  { id: "hero", label: "Hero Header", icon: ImageIcon },
                  { id: "services", label: "Services Intro", icon: Sliders },
                  { id: "about", label: "About & Visiting Guide", icon: FileText },
                  { id: "whyTrust", label: "Why Choose Us", icon: Award },
                  { id: "testimonials", label: "Testimonials", icon: Star },
                  { id: "faq", label: "FAQ Accordion", icon: HelpCircle },
                  { id: "office", label: "Chamber 121 & Map", icon: MapPin },
                  { id: "finalCta", label: "Final CTA", icon: Phone },
                  { id: "seo", label: "SEO Metadata", icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = homeActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHomeActiveTab(tab.id as any)}
                      className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "border-[#0B1F36] text-[#0B1F36] bg-[#F8FAFC]"
                          : "border-transparent text-[#52627A] hover:text-[#0B1F36]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex border-b border-[#E2E8F0] bg-white px-6">
                {[
                  { id: "hero", label: "Hero & Banner", icon: ImageIcon },
                  { id: "cta", label: "Calls-to-Action", icon: Sliders },
                  { id: "content", label: "Lead Narrative", icon: FileText },
                  { id: "seo", label: "SEO Metadata", icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "border-[#0B1F36] text-[#0B1F36] bg-[#F8FAFC]"
                          : "border-transparent text-[#52627A] hover:text-[#0B1F36]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Notifications */}
            {saveSuccess && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-[#C8973D]/40 bg-[#FDF8EE] px-4 py-2.5 text-xs text-[#96641E]">
                <Check className="h-4 w-4 text-[#C8973D] shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Form Fields Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F8FAFC]/50">
              {/* ================================================================= */}
              {/* HOMEPAGE SECTIONS BUILDER CONTENT                                */}
              {/* ================================================================= */}
              {isHomeBuilder && homeSections && (
                <div>
                  {/* TAB 1: SECTION ORDER & VISIBILITY */}
                  {homeActiveTab === "order" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm">Visual Section Ordering & Toggle Control</p>
                          <p className="mt-0.5 text-blue-800 leading-relaxed">
                            Use the Up/Down arrows to change the vertical order in which sections appear on the homepage.
                            Click the toggle button to temporarily show or hide any section without deleting its content.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {homeSections.sectionOrder.map((sectionId, idx) => {
                          const meta = DEFAULT_SECTION_ORDER.find((s) => s.id === sectionId) || {
                            id: sectionId,
                            name: sectionId,
                            desc: "",
                          };
                          const enabled = isSectionEnabled(sectionId as SectionId);

                          return (
                            <div
                              key={sectionId}
                              className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                                enabled
                                  ? "border-slate-200 bg-white shadow-2xs"
                                  : "border-slate-200 bg-slate-100/80 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-600">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">{meta.name}</h4>
                                    {!enabled && (
                                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                                        Hidden
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {sectionId !== "hero" && (
                                  <button
                                    type="button"
                                    onClick={() => toggleSectionEnabled(sectionId as SectionId)}
                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                                      enabled
                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    }`}
                                  >
                                    {enabled ? (
                                      <>
                                        <ToggleRight className="h-4 w-4 text-emerald-700" />
                                        <span>Visible</span>
                                      </>
                                    ) : (
                                      <>
                                        <ToggleLeft className="h-4 w-4 text-slate-500" />
                                        <span>Hidden</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                <div className="flex items-center border-l border-slate-200 pl-2 gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => moveSection(idx, "up")}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                    title="Move section up"
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === homeSections.sectionOrder.length - 1}
                                    onClick={() => moveSection(idx, "down")}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                    title="Move section down"
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HERO HEADER */}
                  {homeActiveTab === "hero" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Hero Badge / Credential Tag
                        </label>
                        <input
                          type="text"
                          value={homeSections.hero.badge}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              hero: { ...homeSections.hero, badge: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Main Headline (H1)
                          </label>
                          <input
                            type="text"
                            value={homeSections.hero.headline}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                hero: { ...homeSections.hero, headline: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Highlighted Word/Phrase (Golden Gradient)
                          </label>
                          <input
                            type="text"
                            value={homeSections.hero.highlight}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                hero: { ...homeSections.hero, highlight: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Hero Subtitle / Description
                        </label>
                        <textarea
                          rows={3}
                          value={homeSections.hero.subtitle}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              hero: { ...homeSections.hero, subtitle: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Hero Action Buttons
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                            <span className="text-xs font-bold text-slate-800">Primary Button (Gold CTA)</span>
                            <div>
                              <label className="text-[11px] text-slate-500 font-medium">Button Text</label>
                              <input
                                type="text"
                                value={homeSections.hero.primaryBtn.text}
                                onChange={(e) =>
                                  setHomeSections({
                                    ...homeSections,
                                    hero: {
                                      ...homeSections.hero,
                                      primaryBtn: { ...homeSections.hero.primaryBtn, text: e.target.value },
                                    },
                                  })
                                }
                                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-500 font-medium">Destination Link</label>
                              <input
                                type="text"
                                value={homeSections.hero.primaryBtn.href}
                                onChange={(e) =>
                                  setHomeSections({
                                    ...homeSections,
                                    hero: {
                                      ...homeSections.hero,
                                      primaryBtn: { ...homeSections.hero.primaryBtn, href: e.target.value },
                                    },
                                  })
                                }
                                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                            <span className="text-xs font-bold text-emerald-800">Secondary Button (WhatsApp CTA)</span>
                            <div>
                              <label className="text-[11px] text-slate-500 font-medium">Button Text</label>
                              <input
                                type="text"
                                value={homeSections.hero.secondaryBtn.text}
                                onChange={(e) =>
                                  setHomeSections({
                                    ...homeSections,
                                    hero: {
                                      ...homeSections.hero,
                                      secondaryBtn: { ...homeSections.hero.secondaryBtn, text: e.target.value },
                                    },
                                  })
                                }
                                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-500 font-medium">Pre-Filled WhatsApp Message</label>
                              <input
                                type="text"
                                value={homeSections.hero.secondaryBtn.message}
                                onChange={(e) =>
                                  setHomeSections({
                                    ...homeSections,
                                    hero: {
                                      ...homeSections.hero,
                                      secondaryBtn: { ...homeSections.hero.secondaryBtn, message: e.target.value },
                                    },
                                  })
                                }
                                className="w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SERVICES INTRO */}
                  {homeActiveTab === "services" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Services Section Status
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleSectionEnabled("services")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"
                        >
                          {homeSections.servicesSection.enabled ? "Enabled on Homepage" : "Disabled on Homepage"}
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={homeSections.servicesSection.title}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              servicesSection: { ...homeSections.servicesSection, title: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Section Subtitle
                        </label>
                        <textarea
                          rows={3}
                          value={homeSections.servicesSection.subtitle}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              servicesSection: { ...homeSections.servicesSection, subtitle: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Manage Individual Service Cards</p>
                          <p className="text-xs text-slate-500">Edit prices, descriptions, and icons for all 9 practice areas.</p>
                        </div>
                        <Link
                          href="/admin/services"
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800"
                        >
                          <span>Go to Services CMS</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ABOUT & VISITING GUIDE */}
                  {homeActiveTab === "about" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Badge
                          </label>
                          <input
                            type="text"
                            value={homeSections.aboutSection.badge}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                aboutSection: { ...homeSections.aboutSection, badge: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.aboutSection.title}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                aboutSection: { ...homeSections.aboutSection, title: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Firm Overview Description
                        </label>
                        <textarea
                          rows={3}
                          value={homeSections.aboutSection.description}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              aboutSection: { ...homeSections.aboutSection, description: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          4-Step Visiting Guide Steps
                        </h4>
                        <div className="space-y-2.5">
                          {homeSections.aboutSection.steps.map((step, sIdx) => (
                            <div key={sIdx} className="rounded-lg border border-slate-200 bg-white p-3 grid sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Step {sIdx + 1} Title</label>
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => {
                                    const updatedSteps = [...homeSections.aboutSection.steps];
                                    updatedSteps[sIdx].title = e.target.value;
                                    setHomeSections({
                                      ...homeSections,
                                      aboutSection: { ...homeSections.aboutSection, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 font-semibold"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Description</label>
                                <input
                                  type="text"
                                  value={step.text}
                                  onChange={(e) => {
                                    const updatedSteps = [...homeSections.aboutSection.steps];
                                    updatedSteps[sIdx].text = e.target.value;
                                    setHomeSections({
                                      ...homeSections,
                                      aboutSection: { ...homeSections.aboutSection, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: WHY CHOOSE US */}
                  {homeActiveTab === "whyTrust" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.whyTrustSection.title}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                whyTrustSection: { ...homeSections.whyTrustSection, title: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Experience Metric Number
                          </label>
                          <input
                            type="text"
                            value={homeSections.whyTrustSection.metricNumber}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                whyTrustSection: { ...homeSections.whyTrustSection, metricNumber: e.target.value },
                              })
                            }
                            placeholder="e.g. 20+"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-bold"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Trust Features List
                        </h4>
                        <div className="space-y-2.5">
                          {homeSections.whyTrustSection.features.map((feat, fIdx) => (
                            <div key={fIdx} className="rounded-lg border border-slate-200 bg-white p-3 grid sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Feature Title</label>
                                <input
                                  type="text"
                                  value={feat.title}
                                  onChange={(e) => {
                                    const updated = [...homeSections.whyTrustSection.features];
                                    updated[fIdx].title = e.target.value;
                                    setHomeSections({
                                      ...homeSections,
                                      whyTrustSection: { ...homeSections.whyTrustSection, features: updated },
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 font-semibold"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Feature Explanation</label>
                                <input
                                  type="text"
                                  value={feat.text}
                                  onChange={(e) => {
                                    const updated = [...homeSections.whyTrustSection.features];
                                    updated[fIdx].text = e.target.value;
                                    setHomeSections({
                                      ...homeSections,
                                      whyTrustSection: { ...homeSections.whyTrustSection, features: updated },
                                    });
                                  }}
                                  className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TESTIMONIALS */}
                  {homeActiveTab === "testimonials" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.testimonialsSection.title}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                testimonialsSection: { ...homeSections.testimonialsSection, title: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={homeSections.testimonialsSection.subtitle}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                testimonialsSection: { ...homeSections.testimonialsSection, subtitle: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Client Feedback & Reviews ({homeSections.testimonialsSection.items.length})
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddTestimonial}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Add Review</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {homeSections.testimonialsSection.items.map((item, tIdx) => (
                          <div key={item.id || tIdx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600">Client Name</label>
                                <input
                                  type="text"
                                  value={item.clientName}
                                  onChange={(e) => handleUpdateTestimonial(tIdx, "clientName", e.target.value)}
                                  className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600">Role / Case Type</label>
                                <input
                                  type="text"
                                  value={item.clientRole}
                                  onChange={(e) => handleUpdateTestimonial(tIdx, "clientRole", e.target.value)}
                                  className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600">Rating (Stars)</label>
                                <select
                                  value={item.rating}
                                  onChange={(e) => handleUpdateTestimonial(tIdx, "rating", Number(e.target.value))}
                                  className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800"
                                >
                                  <option value={5}>5 Stars ★★★★★</option>
                                  <option value={4}>4 Stars ★★★★☆</option>
                                  <option value={3}>3 Stars ★★★☆☆</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600">Review Quotation</label>
                              <textarea
                                rows={2}
                                value={item.text}
                                onChange={(e) => handleUpdateTestimonial(tIdx, "text", e.target.value)}
                                className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={item.visible}
                                  onChange={(e) => handleUpdateTestimonial(tIdx, "visible", e.target.checked)}
                                  className="rounded border-slate-300 text-emerald-600"
                                />
                                <span>Display on Website</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonial(tIdx)}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: FAQ ACCORDION */}
                  {homeActiveTab === "faq" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            FAQ Section Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.faqSection.title}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                faqSection: { ...homeSections.faqSection, title: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            FAQ Subtitle
                          </label>
                          <input
                            type="text"
                            value={homeSections.faqSection.subtitle}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                faqSection: { ...homeSections.faqSection, subtitle: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Frequently Asked Questions ({homeSections.faqSection.items.length})
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddFaq}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Add FAQ Item</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {homeSections.faqSection.items.map((item, fIdx) => (
                          <div key={item.id || fIdx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600">Question</label>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) => handleUpdateFaq(fIdx, "question", e.target.value)}
                                className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600">Detailed Answer</label>
                              <textarea
                                rows={3}
                                value={item.answer}
                                onChange={(e) => handleUpdateFaq(fIdx, "answer", e.target.value)}
                                className="mt-0.5 w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={item.visible}
                                  onChange={(e) => handleUpdateFaq(fIdx, "visible", e.target.checked)}
                                  className="rounded border-slate-300 text-emerald-600"
                                />
                                <span>Visible in Accordion</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleDeleteFaq(fIdx)}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 8: CHAMBER 121 & MAP */}
                  {homeActiveTab === "office" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.officeSection.title}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                officeSection: { ...homeSections.officeSection, title: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            value={homeSections.officeSection.subtitle}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                officeSection: { ...homeSections.officeSection, subtitle: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Postal Address Display
                        </label>
                        <textarea
                          rows={2}
                          value={homeSections.officeSection.addressText}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              officeSection: { ...homeSections.officeSection, addressText: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Weekday Timings
                          </label>
                          <input
                            type="text"
                            value={homeSections.officeSection.weekdayHours}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                officeSection: { ...homeSections.officeSection, weekdayHours: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Saturday Timings
                          </label>
                          <input
                            type="text"
                            value={homeSections.officeSection.saturdayHours}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                officeSection: { ...homeSections.officeSection, saturdayHours: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Visiting Checklist Points (Separated by lines)
                        </label>
                        <textarea
                          rows={4}
                          value={(homeSections.officeSection.guidePoints || []).join("\n")}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              officeSection: {
                                ...homeSections.officeSection,
                                guidePoints: e.target.value.split("\n").filter((p) => p.trim().length > 0),
                              },
                            })
                          }
                          placeholder="Original CNIC&#10;Prior Registry / Tax Documents&#10;Active Mobile Number"
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 leading-relaxed font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 9: FINAL CTA */}
                  {homeActiveTab === "finalCta" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Banner Headline
                        </label>
                        <input
                          type="text"
                          value={homeSections.finalCtaSection.title}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              finalCtaSection: { ...homeSections.finalCtaSection, title: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Banner Subtitle
                        </label>
                        <textarea
                          rows={3}
                          value={homeSections.finalCtaSection.description}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              finalCtaSection: { ...homeSections.finalCtaSection, description: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Call Assistance Card Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.finalCtaSection.callCardTitle}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                finalCtaSection: { ...homeSections.finalCtaSection, callCardTitle: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            WhatsApp Quick Chat Title
                          </label>
                          <input
                            type="text"
                            value={homeSections.finalCtaSection.whatsappCardTitle}
                            onChange={(e) =>
                              setHomeSections({
                                ...homeSections,
                                finalCtaSection: { ...homeSections.finalCtaSection, whatsappCardTitle: e.target.value },
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 10: SEO METADATA */}
                  {homeActiveTab === "seo" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Homepage Meta Title (Google Search)
                        </label>
                        <input
                          type="text"
                          value={formData.metaTitle || ""}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          placeholder="e.g. Ch Composing | E-Stamping, Registry & Tax Consultants Sahiwal"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Homepage Meta Description (150-160 characters)
                        </label>
                        <textarea
                          rows={3}
                          value={formData.metaDescription || ""}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          placeholder="Search engine snippet shown to users on Google..."
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* STANDARD PAGE EDITOR CONTENT (NON-HOMEPAGE)                       */}
              {/* ================================================================= */}
              {!isHomeBuilder && (
                <div>
                  {activeTab === "hero" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Hero Badge / Tag
                        </label>
                        <input
                          type="text"
                          value={formData.heroBadge || ""}
                          onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Main Page Headline (H1)
                        </label>
                        <input
                          type="text"
                          value={formData.heroHeadline || ""}
                          onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Hero Subtitle / Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.heroSubtitle || ""}
                          onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Hero Banner Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.heroImage || ""}
                          onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono text-xs"
                        />
                        {formData.heroImage && (
                          <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden h-32 bg-slate-100 flex items-center justify-center">
                            <img src={formData.heroImage} alt="Banner Preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "cta" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Primary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={formData.primaryCtaText || ""}
                            onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Primary CTA Destination Link
                          </label>
                          <input
                            type="text"
                            value={formData.primaryCtaHref || ""}
                            onChange={(e) => setFormData({ ...formData, primaryCtaHref: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Secondary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={formData.secondaryCtaText || ""}
                            onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Secondary CTA Destination Link
                          </label>
                          <input
                            type="text"
                            value={formData.secondaryCtaHref || ""}
                            onChange={(e) => setFormData({ ...formData, secondaryCtaHref: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Lead Paragraph & Office Practice Overview
                        </label>
                        <textarea
                          rows={8}
                          value={formData.leadContent || ""}
                          onChange={(e) => setFormData({ ...formData, leadContent: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "seo" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Meta Title (Browser Tab & Search)
                        </label>
                        <input
                          type="text"
                          value={formData.metaTitle || ""}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Meta Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.metaDescription || ""}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Publish Status
                        </label>
                        <select
                          value={formData.status || "published"}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800"
                        >
                          <option value="published">Published (Live on Website)</option>
                          <option value="draft">Draft (Under Review)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition cursor-pointer"
              >
                Close Editor
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={selectedPage.route || "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#52627A] hover:text-[#0B1F36] border border-[#E2E8F0] bg-white px-3 py-2 rounded-lg hover:bg-[#F8FAFC] transition"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#94A3B8]" />
                  <span>View Public Route</span>
                </Link>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={isHomeBuilder ? () => handleSaveHomeSections() : handleSaveStandardPage}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#102943] transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8973D]" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 text-[#C8973D]" />
                      <span>{isHomeBuilder ? "Save & Publish Sections" : "Save & Publish Page"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
