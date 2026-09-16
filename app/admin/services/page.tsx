"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Boxes, ExternalLink, CheckCircle, Eye, Tag, Phone } from "lucide-react";

interface ServiceItem {
  name: string;
  nameUrdu: string;
  slug: string;
  category: string;
  status: "active" | "draft";
  url: string;
  features: string[];
}

const SERVICES_LIST: ServiceItem[] = [
  {
    name: "E-Stamping & 32-A Challan",
    nameUrdu: "ای سٹامپنگ و چالان 32-A",
    slug: "e-stamping",
    category: "Court Document Services",
    status: "active",
    url: "/services/e-stamping",
    features: ["Online Verification", "Stamp Duty Calculation", "Fast-track Deed Composing"],
  },
  {
    name: "Property Registry & Inteqal",
    nameUrdu: "پراپرٹی رجسٹری و انتقال",
    slug: "property-land",
    category: "Revenue & Land Services",
    status: "active",
    url: "/services/property-land",
    features: ["Title Deed Verification", "Sub-Registrar Submission", "Fard Compliance"],
  },
  {
    name: "FBR Income Tax & ATL Filing",
    nameUrdu: "انکم ٹیکس ریٹرن و فائلر اسٹیٹس",
    slug: "tax",
    category: "Taxation (Direct & Indirect)",
    status: "active",
    url: "/services/tax",
    features: ["Active Taxpayer List (ATL)", "Annual Income Tax Returns", "PRA Sales Tax"],
  },
  {
    name: "Business Registration & SECP",
    nameUrdu: "بزنس و کمپنی رجسٹریشن",
    slug: "business-registration",
    category: "Corporate Legal Services",
    status: "active",
    url: "/services/business-registration",
    features: ["NTN / STRN Generation", "Partnership Deeds (Form C)", "SECP Pvt Ltd Incorporation"],
  },
  {
    name: "Legal Documentation & Affidavits",
    nameUrdu: "قانونی دستاویزات و بیان حلفی",
    slug: "legal-documentation",
    category: "Chamber Drafting Services",
    status: "active",
    url: "/services/legal-documentation",
    features: ["Affidavits & Declarations", "Power of Attorney (Mukhtar Nama)", "Rental Agreements"],
  },
  {
    name: "Family Court & Succession",
    nameUrdu: "فیملی کورٹ و جانشینی سرٹیفکیٹ",
    slug: "family-legal",
    category: "Civil & Family Law",
    status: "active",
    url: "/services/family-legal",
    features: ["Succession Certificates", "Inheritance Deeds", "Guardianship Petitions"],
  },
];

export default function ServicesManager() {
  const [services] = useState<ServiceItem[]>(SERVICES_LIST);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[13px] text-slate-500 font-normal">
        <span>Website</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Services</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Services
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Manage legal practice areas, e-stamping solutions, and FBR tax services offered at Chamber 121.
          </p>
        </div>

        <Link
          href="/#services"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
        >
          <ExternalLink className="h-4 w-4 text-slate-500" />
          <span>View on website</span>
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s.slug}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-[15px]">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.nameUrdu}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200/70">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  Active
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>{s.category}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.features.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-50 px-2 py-0.5 text-[11.5px] text-slate-600 border border-slate-200/50"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">{s.url}</span>
              <Link
                href={s.url}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>View live page</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
