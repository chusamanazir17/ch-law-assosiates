"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, ExternalLink, CheckCircle, Edit3, Eye, Clock } from "lucide-react";

interface SitePage {
  title: string;
  slug: string;
  status: "published" | "draft";
  updated: string;
  description: string;
  url: string;
}

const SITE_PAGES: SitePage[] = [
  {
    title: "Home Page",
    slug: "home",
    status: "published",
    updated: "16 Sept 2026",
    description: "Main office landing page with Chamber introduction, services showcase, and location map.",
    url: "/",
  },
  {
    title: "E-Stamping & Stamp Papers",
    slug: "e-stamping",
    status: "published",
    updated: "15 Sept 2026",
    description: "32-A Challan generation, deed drafting, verification portal, and court fee guidelines.",
    url: "/services/e-stamping",
  },
  {
    title: "Property & Land Registration",
    slug: "property-land",
    status: "published",
    updated: "14 Sept 2026",
    description: "Registry, Inteqal, Fard compliance, and District Court Sahiwal verification procedures.",
    url: "/services/property-land",
  },
  {
    title: "Tax Services & FBR Compliance",
    slug: "tax",
    status: "published",
    updated: "15 Sept 2026",
    description: "Active Taxpayer List (ATL), annual income tax returns, sales tax, and withholding audits.",
    url: "/services/tax",
  },
  {
    title: "Business & Corporate Registration",
    slug: "business-registration",
    status: "published",
    updated: "12 Sept 2026",
    description: "NTN, SECP incorporation, partnership deeds, and Chamber of Commerce registrations.",
    url: "/services/business-registration",
  },
  {
    title: "Family Legal Documentation",
    slug: "family-legal",
    status: "published",
    updated: "10 Sept 2026",
    description: "Succession certificates, guardianship petitions, inheritance deeds, and family affidavits.",
    url: "/services/family-legal",
  },
  {
    title: "Banking & Financial Legal Services",
    slug: "banking-financial",
    status: "published",
    updated: "10 Sept 2026",
    description: "Loan documentation vetting, recovery disputes, and financial contracts.",
    url: "/services/banking-financial",
  },
];

export default function PagesManager() {
  const [pages] = useState<SitePage[]>(SITE_PAGES);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Page content</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Page content
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Review and manage public website content, meta descriptions, and active service landing pages.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ExternalLink className="h-4 w-4 text-slate-500" />
          <span>View website</span>
        </Link>
      </div>

      {/* Pages Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[13px] font-medium text-slate-700">
              <th className="px-5 py-3.5">Page Title</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Route</th>
              <th className="px-4 py-3.5">Last Updated</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13.5px]">
            {pages.map((p) => (
              <tr key={p.slug} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{p.title}</span>
                      <span className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">
                        {p.description}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800 border border-emerald-200/70">
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    Published
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                  {p.url}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">
                  {p.updated}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={p.url}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
