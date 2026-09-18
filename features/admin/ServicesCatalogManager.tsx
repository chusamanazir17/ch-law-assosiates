"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
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
  Plus,
  Trash2,
  Layers,
  FileCheck,
  Banknote,
  Globe,
  Tag,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import type { CmsService, SubService } from "@/lib/db/servicesStore";

const PRESET_IMAGES = [
  { label: "Legal Chamber / Courtroom", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80" },
  { label: "Document Signing & Seals", url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80" },
  { label: "Property & Real Estate", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80" },
  { label: "Tax & Finance Analytics", url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Corporate Business Office", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" },
  { label: "Trademark & Patents Desk", url: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=1200&q=80" },
  { label: "Family Legal & Heritage", url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80" },
  { label: "Banking & Loan Desk", url: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80" },
];

export default function ServicesCatalogManager() {
  const [services, setServices] = useState<CmsService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Modal & Form State
  const [editingService, setEditingService] = useState<CmsService | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<CmsService>>({});
  const [activeTab, setActiveTab] = useState<"general" | "content" | "items" | "image">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (res.ok && data.success) {
        setServices(data.services || []);
        setCategories(data.categories || []);
      } else {
        throw new Error(data.error || "Failed to load services");
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openEditModal = (service: CmsService) => {
    setIsCreatingNew(false);
    setEditingService(service);
    setFormData(JSON.parse(JSON.stringify(service))); // deep copy
    setActiveTab("general");
    setSaveSuccess(null);
    setSaveError(null);
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setEditingService(null);
    const newService: Partial<CmsService> = {
      id: "",
      slug: "",
      name: "",
      nameUrdu: "",
      category: categories[0] || "Court Document Services",
      description: "",
      tagline: "Professional Legal Assistance",
      heroImage: PRESET_IMAGES[0].url,
      turnaroundTime: "1 to 2 business days",
      governmentFeeInfo: "Official government fee schedule applicable.",
      requiredDocuments: ["CNIC copies", "Relevant legal affidavits"],
      items: [
        { id: "item-1", title: "Primary Consultation", description: "Comprehensive legal assessment and document review." }
      ],
      active: true,
      order: services.length + 1,
    };
    setFormData(newService);
    setActiveTab("general");
    setSaveSuccess(null);
    setSaveError(null);
  };

  const closeModal = () => {
    setEditingService(null);
    setIsCreatingNew(false);
    setFormData({});
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const method = isCreatingNew ? "POST" : "PUT";
      const payload = isCreatingNew
        ? {
            ...formData,
            id: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, "-"),
            slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, "-"),
          }
        : formData;

      const res = await fetch("/api/admin/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save service");
      }

      setSaveSuccess(isCreatingNew ? "Service created successfully!" : "Service updated successfully!");
      await fetchServices();
      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error saving service.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (service: CmsService) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: service.id,
          active: !service.active,
        }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
        );
      }
    } catch {
      // ignore
    }
  };

  // Sub-services and document list helpers
  const handleAddDocument = () => {
    const docs = formData.requiredDocuments || [];
    setFormData({ ...formData, requiredDocuments: [...docs, ""] });
  };

  const handleUpdateDocument = (index: number, val: string) => {
    const docs = [...(formData.requiredDocuments || [])];
    docs[index] = val;
    setFormData({ ...formData, requiredDocuments: docs });
  };

  const handleRemoveDocument = (index: number) => {
    const docs = [...(formData.requiredDocuments || [])];
    docs.splice(index, 1);
    setFormData({ ...formData, requiredDocuments: docs });
  };

  const handleAddSubService = () => {
    const items = formData.items || [];
    const newItem: SubService = {
      id: `item-${Date.now()}`,
      title: "",
      description: "",
    };
    setFormData({ ...formData, items: [...items, newItem] });
  };

  const handleUpdateSubService = (index: number, field: keyof SubService, val: string) => {
    const items = [...(formData.items || [])];
    items[index] = { ...items[index], [field]: val };
    setFormData({ ...formData, items });
  };

  const handleRemoveSubService = (index: number) => {
    const items = [...(formData.items || [])];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  // Filtering
  const filteredServices = services.filter((svc) => {
    const matchesCat = selectedCategory === "All" || svc.category === selectedCategory;
    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.nameUrdu.includes(searchQuery) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeCount = services.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[13px] font-normal text-slate-500">
            <span>Website CMS</span>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-700">Services Catalog</span>
          </div>
          <h1 className="mt-1 text-[32px] font-bold leading-tight tracking-tight text-slate-900">
            Legal Services Catalog
          </h1>
          <p className="mt-1 text-[14.5px] text-slate-500">
            Live catalog of 9 Chamber legal practices. Modify titles, Urdu terminology, fee structures, required documents, and hero photography.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchServices}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Legal Service</span>
          </button>
          <Link
            href="/#services"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span>View Public Grid</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Services</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Boxes className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{services.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">Core legal practice areas</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Public</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">Visible on main portal</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Tag className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">Practice categories</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CMS Persistence</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">100% Live</p>
          <p className="mt-0.5 text-xs text-slate-500">Synchronized instant updates</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search services by title, Urdu name, slug, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading services catalog...</p>
        </div>
      ) : loadError ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm font-semibold text-red-800">{loadError}</p>
          <button
            type="button"
            onClick={fetchServices}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
          <Boxes className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-700">No legal services match your filter</p>
          <p className="mt-1 text-xs text-slate-400">Try changing search keywords or category filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition duration-200 hover:border-slate-300 hover:shadow-md"
            >
              {/* Header with image & badges */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={service.heroImage || PRESET_IMAGES[0].url}
                  alt={service.name}
                  className="h-full w-full object-cover opacity-80 transition duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                
                {/* Category & Status Badges */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 backdrop-blur-xs">
                    {service.category}
                  </span>
                </div>
                <div className="absolute right-3 top-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-xs transition ${
                      service.active
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                        : "bg-slate-700/80 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${service.active ? "bg-white" : "bg-slate-400"}`} />
                    {service.active ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Bottom title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-bold text-white drop-shadow-xs">{service.name}</h3>
                  <p className="mt-0.5 text-xs font-urdu text-emerald-300 drop-shadow-xs">{service.nameUrdu}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {service.description}
                  </p>

                  <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        Turnaround
                      </span>
                      <span className="font-semibold text-slate-800">{service.turnaroundTime || "Standard"}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                        Documents
                      </span>
                      <span className="font-semibold text-slate-800">
                        {service.requiredDocuments?.length || 0} required
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <Layers className="h-3.5 w-3.5 text-purple-500" />
                        Sub-offerings
                      </span>
                      <span className="font-semibold text-slate-800">
                        {service.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Link
                    href={`/services/${service.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-700"
                  >
                    <span>/services/{service.slug}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                    <Link
                      href={`/services/${service.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Editor Modal */}
      {(editingService || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isCreatingNew ? "Add New Legal Service" : `Edit Service: ${formData.name}`}
                </h2>
                <p className="text-xs text-slate-500">
                  Manage service overview, Pakistani legal terms, timeline, government fees, and photography.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
              {[
                { id: "general", label: "General & Category" },
                { id: "content", label: "Description & Fees" },
                { id: "items", label: "Offerings & Documents" },
                { id: "image", label: "Hero Photography" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-y-auto p-6">
              {saveSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{saveSuccess}</span>
                </div>
              )}
              {saveError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Tab 1: General */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Service Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. E-Stamping & Stamp Paper"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Urdu Name / Terminology</label>
                      <input
                        type="text"
                        value={formData.nameUrdu || ""}
                        onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                        placeholder="مثال: ای سٹامپنگ و چالان 32-A"
                        dir="rtl"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Practice Category *</label>
                      <select
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">URL Route Slug *</label>
                      <div className="mt-1 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <span>/services/</span>
                        <input
                          type="text"
                          required
                          value={formData.slug || ""}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                          placeholder="slug-name"
                          className="w-full bg-transparent font-mono text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Chamber Tagline / Badge</label>
                    <input
                      type="text"
                      value={formData.tagline || ""}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Authorized Government Stamp Vendor"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="svc-active"
                      checked={formData.active ?? true}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="svc-active" className="text-xs font-medium text-slate-700">
                      Publish and display this service on the public website
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Content & Fees */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Service Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed overview of legal service, chamber role, and client benefits..."
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Expected Turnaround Time</label>
                      <input
                        type="text"
                        value={formData.turnaroundTime || ""}
                        onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                        placeholder="e.g. Same-day (15 to 30 mins) or 2 to 3 days"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Display Order</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.order || 1}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Government Fee Structure & Details</label>
                    <textarea
                      rows={3}
                      value={formData.governmentFeeInfo || ""}
                      onChange={(e) => setFormData({ ...formData, governmentFeeInfo: e.target.value })}
                      placeholder="Official 1% DC rate, stamp duty guidelines, or FBR tax brackets..."
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Offerings & Documents */}
              {activeTab === "items" && (
                <div className="space-y-6">
                  {/* Required Documents Section */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Required Client Documents
                        </h4>
                        <p className="text-[11px] text-slate-500">Documents needed from the client to process this service.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Document</span>
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(formData.requiredDocuments || []).map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">{idx + 1}.</span>
                          <input
                            type="text"
                            value={doc}
                            onChange={(e) => handleUpdateDocument(idx, e.target.value)}
                            placeholder="e.g. Original CNIC, Proof of Ownership..."
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-Services / Items Section */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Specific Offerings / Packages
                        </h4>
                        <p className="text-[11px] text-slate-500">List of specific services or tiers under this practice.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSubService}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Offering</span>
                      </button>
                    </div>

                    <div className="mt-3 space-y-3">
                      {(formData.items || []).map((item, idx) => (
                        <div key={item.id || idx} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateSubService(idx, "title", e.target.value)}
                              placeholder="Offering Title (e.g. Partnership Deed Drafting)"
                              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubService(idx)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => handleUpdateSubService(idx, "description", e.target.value)}
                            placeholder="Brief description of what this offering includes..."
                            className="mt-2 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Hero Image */}
              {activeTab === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Hero Image URL</label>
                    <input
                      type="url"
                      value={formData.heroImage || ""}
                      onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {formData.heroImage && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">Live Preview:</span>
                      <div className="relative mt-2 h-44 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                        <img
                          src={formData.heroImage}
                          alt="Service Hero"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="block text-xs font-semibold text-slate-700">Or pick from high-resolution legal presets:</span>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, heroImage: preset.url })}
                          className={`group relative h-20 overflow-hidden rounded-lg border text-left transition ${
                            formData.heroImage === preset.url
                              ? "border-emerald-600 ring-2 ring-emerald-500"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 p-1.5 transition group-hover:bg-slate-900/40">
                            <span className="text-[10px] font-semibold text-white">{preset.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{isSaving ? "Saving..." : "Save Service"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
