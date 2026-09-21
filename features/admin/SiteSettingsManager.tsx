"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Building,
  Phone,
  Clock,
  Menu,
  Save,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  MapPin,
  Mail,
  Smartphone,
  ShieldCheck,
  UserCheck,
  Globe,
  Compass,
  ArrowUpRight,
  MessageCircle,
  Sliders,
  Sparkles,
} from "lucide-react";
import type {
  SiteSettings,
  NavMenuItem,
  ContactPerson,
  WhatsAppSettings,
  HeaderSettings,
  FooterSettings,
} from "@/lib/db/siteSettingsStore";
import { buildWhatsAppUrl } from "@/lib/site";

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "identity" | "contact" | "whatsapp" | "headerFooter" | "hours" | "navigation"
  >("identity");

  const fetchSettings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setFormData(JSON.parse(JSON.stringify(data.settings)));
      } else {
        throw new Error(data.error || "Failed to load site configuration");
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error loading configuration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save configuration");
      }

      setSettings(data.settings);
      setFormData(JSON.parse(JSON.stringify(data.settings)));
      setSaveSuccess("Office settings and navigation successfully updated!");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cms-updated"));
      }
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error saving configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Nav Menu Helpers
  const handleAddNavItem = () => {
    const currentMenu = formData.navigationMenu || [];
    const newItem: NavMenuItem = {
      id: `nav-${Date.now()}`,
      label: "New Page Link",
      href: "/services",
      enabled: true,
      isExternal: false,
    };
    setFormData({ ...formData, navigationMenu: [...currentMenu, newItem] });
  };

  const handleUpdateNavItem = (index: number, field: keyof NavMenuItem, value: any) => {
    const updated = [...(formData.navigationMenu || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, navigationMenu: updated });
  };

  const handleRemoveNavItem = (index: number) => {
    const updated = [...(formData.navigationMenu || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, navigationMenu: updated });
  };

  // Contacts Helpers
  const handleUpdateContact = (index: number, field: keyof ContactPerson, value: string) => {
    const updated = [...(formData.contacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, contacts: updated });
  };

  // WhatsApp Helpers
  const updateWhatsAppSettings = (field: keyof WhatsAppSettings, value: any) => {
    const current = formData.whatsappSettings || {
      number: "0305-7902744",
      defaultMessage: "",
      floatingButtonEnabled: true,
      floatingButtonMessage: "",
      sectionMessages: {},
    };
    setFormData({
      ...formData,
      whatsappSettings: { ...current, [field]: value },
    });
  };

  const updateSectionMessage = (section: string, msg: string) => {
    const current = formData.whatsappSettings || {
      number: "0305-7902744",
      defaultMessage: "",
      floatingButtonEnabled: true,
      floatingButtonMessage: "",
      sectionMessages: {},
    };
    setFormData({
      ...formData,
      whatsappSettings: {
        ...current,
        sectionMessages: { ...current.sectionMessages, [section]: msg },
      },
    });
  };

  // Header/Footer Helpers
  const updateHeaderSettings = (field: keyof HeaderSettings, value: any) => {
    const current = formData.headerSettings || {
      logoText: "Ch Composing",
      logoSubtitle: "Estamp & Tax Advisor",
      phone: "0305-7902744",
      whatsapp: "0305-7902744",
      primaryCtaText: "Visit Chamber",
      primaryCtaHref: "/#office",
      primaryCtaEnabled: true,
    };
    setFormData({
      ...formData,
      headerSettings: { ...current, [field]: value },
    });
  };

  const updateFooterSettings = (field: keyof FooterSettings, value: any) => {
    const current = formData.footerSettings || {
      description: "",
      descriptionUrdu: "",
      copyrightText: "",
      showSocials: true,
    };
    setFormData({
      ...formData,
      footerSettings: { ...current, [field]: value },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-2xs">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8973D]" />
        <p className="mt-3 text-xs font-medium text-[#52627A]">Loading website configuration...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-xs font-semibold text-red-800">{loadError}</p>
        <button
          type="button"
          onClick={fetchSettings}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentWaNumber = formData.whatsappSettings?.number || formData.whatsapp || "0305-7902744";
  const currentWaMsg = formData.whatsappSettings?.defaultMessage || "Hello, I need consultation regarding legal/tax documentation.";
  const testWaUrl = buildWhatsAppUrl(currentWaNumber, currentWaMsg);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-[#64748B] flex items-center gap-1.5">
            <span>Website CMS</span>
            <span className="text-[#94A3B8]">/</span>
            <span className="text-[#0B1F36] font-semibold">Site Settings</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B1F36]">
            Site Configuration & WhatsApp CMS
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Manage firm credentials, Chamber 121 contacts, WhatsApp messages, header branding, and footer text.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSettings}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-2xs transition hover:bg-[#F8FAFC] hover:text-[#0B1F36]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Reset</span>
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1F36] shadow-2xs transition hover:bg-[#F8FAFC]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
            <span>View Website</span>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102943] disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-[#C8973D]" /> : <Save className="h-4 w-4 text-[#C8973D]" />}
            <span>{isSaving ? "Saving Settings..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-[#C8973D]/40 bg-[#FDF8EE] p-3.5 text-xs font-semibold text-[#96641E] shadow-2xs">
          <Check className="h-4 w-4 text-[#C8973D]" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800 shadow-2xs">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] bg-white px-2 shadow-2xs rounded-t-xl overflow-x-auto scrollbar-thin">
        {[
          { id: "identity", label: "Firm Identity & Location", icon: Building },
          { id: "whatsapp", label: "WhatsApp Configuration", icon: Smartphone },
          { id: "headerFooter", label: "Header & Footer", icon: Sliders },
          { id: "contact", label: "Key Personnel & Phones", icon: Phone },
          { id: "hours", label: "Working Hours", icon: Clock },
          { id: "navigation", label: "Menu Navigation", icon: Menu },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "border-[#0B1F36] text-[#0B1F36] bg-[#0B1F36]/4"
                  : "border-transparent text-[#64748B] hover:text-[#0B1F36]"
              }`}
            >
              <Icon className={`h-4 w-4 ${activeTab === tab.id ? "text-[#C8973D]" : "text-[#94A3B8]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="rounded-b-xl border border-t-0 border-[#E2E8F0] bg-white p-6 shadow-2xs">
        {/* TAB 1: FIRM IDENTITY */}
        {activeTab === "identity" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Chamber Display Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ch Composing"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Full Legal Practice Title</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ch Composing Estamp and Tax Advisor"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Official Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. E-Stamping, Property Registry & Legal Consultants"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">City / District Jurisdiction</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Sahiwal, Punjab"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F36]">Full Chamber Postal Address</label>
              <textarea
                rows={2}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Chamber No. 121, District Courts, Sahiwal, Punjab, Pakistan"
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs leading-relaxed text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Short Address / Header Badge</label>
                <input
                  type="text"
                  value={formData.addressShort || ""}
                  onChange={(e) => setFormData({ ...formData, addressShort: e.target.value })}
                  placeholder="Chamber 121, District Courts Sahiwal"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Google Maps Navigation Link</label>
                <input
                  type="url"
                  value={formData.mapsUrl || ""}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHATSAPP CONFIGURATION */}
        {activeTab === "whatsapp" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#C8973D]/30 bg-[#FDF8EE] p-4 text-xs text-[#96641E] flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-[#C8973D] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-[#0B1F36]">Centralized WhatsApp CTA Control</p>
                <p className="mt-0.5 text-[#52627A] leading-relaxed">
                  The public website is designed to convert visitors directly into WhatsApp chats.
                  All WhatsApp buttons (Hero, Floating button, Services, Office card, and Final CTA) automatically use the number and messages configured below.
                </p>
              </div>
              <a
                href={testWaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#128C7E] hover:bg-[#075E54] px-3 py-1.5 font-bold text-white shadow-xs transition"
              >
                <span>Test Live Link</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Primary WhatsApp Mobile Number</label>
                <input
                  type="text"
                  value={formData.whatsappSettings?.number || formData.whatsapp || "0305-7902744"}
                  onChange={(e) => updateWhatsAppSettings("number", e.target.value)}
                  placeholder="0305-7902744"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
                <p className="text-[11px] text-[#64748B] mt-1">Accepts Pakistani local format (0305-7902744) or international (+923057902744).</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Floating Button State</label>
                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#334155]">
                    <input
                      type="checkbox"
                      checked={formData.whatsappSettings?.floatingButtonEnabled ?? true}
                      onChange={(e) => updateWhatsAppSettings("floatingButtonEnabled", e.target.checked)}
                      className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]/30"
                    />
                    <span>Show Floating WhatsApp Button on Public Website</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.whatsappSettings?.floatingButtonMessage || "Chat with Tax & Legal Consultant"}
                  onChange={(e) => updateWhatsAppSettings("floatingButtonMessage", e.target.value)}
                  placeholder="Hover label / tooltip text"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F36]">Default Global WhatsApp Message</label>
              <textarea
                rows={2}
                value={formData.whatsappSettings?.defaultMessage || ""}
                onChange={(e) => updateWhatsAppSettings("defaultMessage", e.target.value)}
                placeholder="Hello, I would like to inquire about legal documentation and tax advisory services."
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs leading-relaxed text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
              />
            </div>

            {/* Section Specific Overrides */}
            <div className="border-t border-[#E2E8F0] pt-5 space-y-4">
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Pre-Filled Messages Per Website Section</h3>
              <p className="text-xs text-[#52627A]">
                When a user clicks a WhatsApp button in a specific section, this customized message will be pre-filled so you know which service they need!
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0B1F36]">Hero Section WhatsApp Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsappSettings?.sectionMessages?.hero || ""}
                    onChange={(e) => updateSectionMessage("hero", e.target.value)}
                    placeholder="Hello, I visited your homepage and would like immediate assistance with legal documentation."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0B1F36]">Services Section Inquiry Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsappSettings?.sectionMessages?.services || ""}
                    onChange={(e) => updateSectionMessage("services", e.target.value)}
                    placeholder="Hello, I am interested in consulting about your chamber legal services."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0B1F36]">About / Visiting Guide Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsappSettings?.sectionMessages?.about || ""}
                    onChange={(e) => updateSectionMessage("about", e.target.value)}
                    placeholder="Hello, please send me the required documents checklist for visiting Chamber 121."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1.5">
                  <label className="text-xs font-semibold text-[#0B1F36]">Chamber 121 & Map Section Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsappSettings?.sectionMessages?.office || ""}
                    onChange={(e) => updateSectionMessage("office", e.target.value)}
                    placeholder="Hello, I am on my way to Chamber 121 District Court Sahiwal."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#0B1F36]">Final Bottom Banner WhatsApp Message</label>
                  <textarea
                    rows={2}
                    value={formData.whatsappSettings?.sectionMessages?.finalCta || ""}
                    onChange={(e) => updateSectionMessage("finalCta", e.target.value)}
                    placeholder="Hello, I need urgent legal/tax consultation from Chamber 121."
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white p-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEADER & FOOTER */}
        {activeTab === "headerFooter" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Header Branding & Action Buttons</h3>
              <p className="text-xs text-[#52627A]">Customize the top navigation bar branding and quick action buttons.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Header Logo Main Text</label>
                <input
                  type="text"
                  value={formData.headerSettings?.logoText || "Ch Composing"}
                  onChange={(e) => updateHeaderSettings("logoText", e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-semibold text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Header Logo Subtitle</label>
                <input
                  type="text"
                  value={formData.headerSettings?.logoSubtitle || "Estamp & Tax Advisor"}
                  onChange={(e) => updateHeaderSettings("logoSubtitle", e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] pt-5 space-y-4">
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Footer Text & Disclaimers</h3>
              <p className="text-xs text-[#52627A]">Edit the summary and copyright statement appearing at the very bottom of every page.</p>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Footer About Summary (English)</label>
                <textarea
                  rows={2}
                  value={formData.footerSettings?.description || ""}
                  onChange={(e) => updateFooterSettings("description", e.target.value)}
                  placeholder="Authorized legal documentation & tax advisory firm providing verified E-Stamping, property registration, and corporate compliance services at District Court Sahiwal."
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs leading-relaxed text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Footer About Summary (Urdu)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.footerSettings?.descriptionUrdu || ""}
                  onChange={(e) => updateFooterSettings("descriptionUrdu", e.target.value)}
                  placeholder="ڈسٹرکٹ کورٹ ساہیوال میں ای سٹامپنگ، پراپرٹی رجسٹری، ٹیکس اور قانونی دستاویزات کا مستند و بااعتماد ادارہ۔"
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs font-urdu leading-relaxed text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Copyright Statement</label>
                <input
                  type="text"
                  value={formData.footerSettings?.copyrightText || ""}
                  onChange={(e) => updateFooterSettings("copyrightText", e.target.value)}
                  placeholder="© 2026 Ch Composing Estamp and Tax Advisor. Chamber 121 District Court Sahiwal. All rights reserved."
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-xs text-[#0B1F36] placeholder:text-[#94A3B8] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT & KEY PERSONNEL */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Official Primary Phone</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                  <Phone className="mr-2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full bg-transparent text-xs font-semibold text-[#0B1F36] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Official Chamber WhatsApp</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                  <Smartphone className="mr-2 h-4 w-4 text-[#C8973D]" />
                  <input
                    type="text"
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full bg-transparent text-xs font-semibold text-[#0B1F36] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36]">Chamber Email Address</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                  <Mail className="mr-2 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@chlaw.pk"
                    className="w-full bg-transparent text-xs text-[#0B1F36] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Key Consultants Roster */}
            <div className="border-t border-[#E2E8F0] pt-5">
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Senior Advocates & Practice Advisors</h3>
              <p className="text-xs text-[#52627A]">Personnel listed on the public contact card and footer.</p>

              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {(formData.contacts || []).map((contact, idx) => (
                  <div key={idx} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
                      <UserCheck className="h-4 w-4 text-[#C8973D]" />
                      <span className="text-xs font-bold text-[#0B1F36]">
                        {idx === 0 ? "Senior Consultant 1" : "Legal Advisor 2"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-[#0B1F36]">English Name</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleUpdateContact(idx, "name", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#0B1F36]">Urdu Name</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={contact.nameUrdu}
                          onChange={(e) => handleUpdateContact(idx, "nameUrdu", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-urdu text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-[#0B1F36]">Designation</label>
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => handleUpdateContact(idx, "role", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-[#0B1F36]">Direct Mobile</label>
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(idx, "phone", e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WORKING HOURS */}
        {activeTab === "hours" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Office Timings & Operational Schedule</h3>
              <p className="text-xs text-[#52627A]">Displayed in footer, contact section, and automated response cards.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <label className="block text-xs font-semibold text-[#0B1F36]">Monday - Friday (Weekdays)</label>
                <input
                  type="text"
                  value={formData.hours?.weekdays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours: { ...(formData.hours || { weekdays: "", saturday: "", sunday: "" }), weekdays: e.target.value },
                    })
                  }
                  placeholder="8:00 AM – 8:00 PM"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <label className="block text-xs font-semibold text-[#0B1F36]">Saturday</label>
                <input
                  type="text"
                  value={formData.hours?.saturday || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours: { ...(formData.hours || { weekdays: "", saturday: "", sunday: "" }), saturday: e.target.value },
                    })
                  }
                  placeholder="8:00 AM – 6:00 PM"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <label className="block text-xs font-semibold text-[#0B1F36]">Sunday</label>
                <input
                  type="text"
                  value={formData.hours?.sunday || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours: { ...(formData.hours || { weekdays: "", saturday: "", sunday: "" }), sunday: e.target.value },
                    })
                  }
                  placeholder="Emergency / Prior Appointment"
                  className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NAVIGATION MENU CMS */}
        {activeTab === "navigation" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#0B1F36]">Header & Mobile Navigation Links</h3>
                <p className="text-xs text-[#52627A]">
                  Add, edit, enable/disable links in the website's top navigation bar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNavItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B1F36] shadow-2xs hover:bg-[#F8FAFC] transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#C8973D]" />
                <span>Add Navigation Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {(formData.navigationMenu || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#64748B]">Label</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateNavItem(idx, "label", e.target.value)}
                      placeholder="e.g. Legal Updates"
                      className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#64748B]">Destination URL</label>
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateNavItem(idx, "href", e.target.value)}
                      placeholder="/updates or /#services"
                      className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 font-mono text-xs text-[#0B1F36] focus:border-[#C8973D] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
                    />
                  </div>

                  <div className="flex items-center gap-4 sm:pt-4">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#334155]">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => handleUpdateNavItem(idx, "enabled", e.target.checked)}
                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]/30"
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#334155]">
                      <input
                        type="checkbox"
                        checked={item.isExternal || false}
                        onChange={(e) => handleUpdateNavItem(idx, "isExternal", e.target.checked)}
                        className="h-4 w-4 rounded border-[#E2E8F0] text-[#0B1F36] focus:ring-[#C8973D]/30"
                      />
                      <span>New Tab</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveNavItem(idx)}
                      className="p-1.5 text-[#94A3B8] hover:text-rose-600 transition cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
