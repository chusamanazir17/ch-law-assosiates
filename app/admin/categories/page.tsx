"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tag, Plus, FileText, CheckCircle, Trash2 } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  description: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Guides",
    slug: "guides",
    postCount: 2,
    description: "Step-by-step documentation, checklists, and procedural guides for office consultations.",
  },
  {
    id: "cat-2",
    name: "Tax tips",
    slug: "tax-tips",
    postCount: 1,
    description: "FBR tax saving strategies, wealth reconciliation advice, and ATL filing guidelines.",
  },
  {
    id: "cat-3",
    name: "E-stamp",
    slug: "e-stamp",
    postCount: 2,
    description: "Punjab e-Stamping 32-A Challan instructions, barcode audits, and stamp duty values.",
  },
  {
    id: "cat-4",
    name: "Updates",
    slug: "updates",
    postCount: 2,
    description: "Chamber announcements, court scheduling notifications, and regulatory circulars.",
  },
  {
    id: "cat-5",
    name: "Property & Land",
    slug: "property-land",
    postCount: 1,
    description: "Sub-Registrar deed drafting, Inteqal legal safeguards, and title deed investigations.",
  },
];

export default function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      postCount: 0,
      description: newCatDesc.trim() || "Legal category",
    };
    setCategories([...categories, newCat]);
    setNewCatName("");
    setNewCatDesc("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this category?")) return;
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Categories</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Categories
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Organize articles, legal updates, and e-stamp advice by practice category.
          </p>
        </div>

        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <FileText className="h-4 w-4 text-slate-500" />
          <span>View all posts</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[13px] font-medium text-slate-700">
                <th className="px-5 py-3.5">Category</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5 text-center">Articles</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{cat.name}</span>
                        <span className="text-[12px] text-slate-500 line-clamp-1">{cat.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {cat.postCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Category Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs h-fit">
          <h2 className="text-[16px] font-semibold text-slate-900 mb-3">Add new category</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category name *
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Corporate Law"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief summary of articles in this category..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#075e38] hover:bg-[#064e2e] py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create category</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
