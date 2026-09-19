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
} from "lucide-react";
import type { SiteSettings, NavMenuItem, ContactPerson } from "@/lib/db/siteSettingsStore";

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState<Partial<SiteSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"identity" | "contact" | "hours" | "navigation">("identity");

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm font-medium text-slate-600">Loading website configuration...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm font-semibold text-red-800">{loadError}</p>
        <button
          type="button"
          onClick={fetchSettings}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[13px] font-normal text-slate-500">
            <span>Website CMS</span>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-700">Site Settings</span>
          </div>
          <h1 className="mt-1 text-[32px] font-bold leading-tight tracking-tight text-slate-900">
            Office Identity & Navigation CMS
          </h1>
          <p className="mt-1 text-[14.5px] text-slate-500">
            Control the public firm identity, Chamber 121 address, emergency contacts, opening hours, and header navigation menu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            <span>Reset</span>
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>View Website</span>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "Saving Settings..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 shadow-xs">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-2 shadow-2xs rounded-t-xl">
        {[
          { id: "identity", label: "Firm Identity & Location", icon: Building },
          { id: "contact", label: "Contact & Key Personnel", icon: Phone },
          { id: "hours", label: "Working Hours", icon: Clock },
          { id: "navigation", label: "Header & Menu Navigation", icon: Menu },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-6 shadow-2xs">
        {/* TAB 1: FIRM IDENTITY */}
        {activeTab === "identity" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Chamber Display Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ch-Law Associates"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Legal Practice Title</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ch-Law Associates & Legal Consultants"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. E-Stamping, Property Registry & Legal Consultants"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">City / District Jurisdiction</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Sahiwal, Punjab"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Chamber Postal Address</label>
              <textarea
                rows={2}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Chamber No. 121, District Courts, Sahiwal, Punjab, Pakistan"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Short Address / Header Badge</label>
                <input
                  type="text"
                  value={formData.addressShort || ""}
                  onChange={(e) => setFormData({ ...formData, addressShort: e.target.value })}
                  placeholder="Chamber 121, District Courts Sahiwal"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Google Maps Navigation Link</label>
                <input
                  type="url"
                  value={formData.mapsUrl || ""}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACT & KEY PERSONNEL */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Primary Phone</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Phone className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full text-sm text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Chamber WhatsApp</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Smartphone className="mr-2 h-4 w-4 text-emerald-600" />
                  <input
                    type="text"
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="0305-7902744"
                    className="w-full text-sm text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Chamber Email Address</label>
                <div className="mt-1.5 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Mail className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@chlaw.pk"
                    className="w-full text-sm text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Key Consultants Roster */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Senior Advocates & Practice Advisors</h3>
              <p className="text-xs text-slate-500">Personnel listed on the public contact card and footer.</p>

              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {(formData.contacts || []).map((contact, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        {idx === 0 ? "Senior Consultant 1" : "Legal Advisor 2"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-600">English Name</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleUpdateContact(idx, "name", e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600">Urdu Name</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={contact.nameUrdu}
                          onChange={(e) => handleUpdateContact(idx, "nameUrdu", e.target.value)}
                          className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-slate-600">Designation</label>
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => handleUpdateContact(idx, "role", e.target.value)}
                            className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-600">Direct Mobile</label>
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => handleUpdateContact(idx, "phone", e.target.value)}
                            className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-emerald-500 focus:outline-none"
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

        {/* TAB 3: WORKING HOURS */}
        {activeTab === "hours" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Office Timings & Operational Schedule</h3>
              <p className="text-xs text-slate-500">Displayed in footer, contact section, and automated response cards.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-xs font-bold text-slate-700">Monday - Friday (Weekdays)</label>
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
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-xs font-bold text-slate-700">Saturday</label>
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
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="block text-xs font-bold text-slate-700">Sunday</label>
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
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NAVIGATION MENU CMS */}
        {activeTab === "navigation" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Header & Mobile Navigation Links</h3>
                <p className="text-xs text-slate-500">
                  Add, edit, enable/disable links in the website's top navigation bar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNavItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Add Navigation Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {(formData.navigationMenu || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500">Label</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateNavItem(idx, "label", e.target.value)}
                      placeholder="e.g. Legal Updates"
                      className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500">Destination URL</label>
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateNavItem(idx, "href", e.target.value)}
                      placeholder="/updates or /#services"
                      className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 sm:pt-4">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => handleUpdateNavItem(idx, "enabled", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={item.isExternal || false}
                        onChange={(e) => handleUpdateNavItem(idx, "isExternal", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>New Tab</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveNavItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
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
