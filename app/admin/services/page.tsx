import Link from "next/link";
import { Boxes, CheckCircle, ExternalLink, Eye, Tag } from "lucide-react";

interface ServiceItem {
  name: string;
  nameUrdu: string;
  category: string;
  url: string;
}

const SERVICES: ServiceItem[] = [
  { name: "E-Stamping & 32-A Challan", nameUrdu: "ای سٹامپنگ و چالان 32-A", category: "Court Document Services", url: "/services/e-stamping" },
  { name: "Property Registry & Inteqal", nameUrdu: "پراپرٹی رجسٹری و انتقال", category: "Revenue & Land Services", url: "/services/property-land" },
  { name: "Registry & Deeds", nameUrdu: "رجسٹری و قانونی دستاویزات", category: "Revenue & Land Services", url: "/services/registry-deeds" },
  { name: "FBR Income Tax & ATL Filing", nameUrdu: "انکم ٹیکس ریٹرن و فائلر اسٹیٹس", category: "Taxation", url: "/services/tax" },
  { name: "Business Registration & SECP", nameUrdu: "بزنس و کمپنی رجسٹریشن", category: "Corporate Services", url: "/services/business-registration" },
  { name: "Trademark & IPO Pakistan", nameUrdu: "ٹریڈ مارک و آئی پی او پاکستان", category: "Intellectual Property", url: "/services/trademark-ipo" },
  { name: "Legal Documentation & Affidavits", nameUrdu: "قانونی دستاویزات و بیان حلفی", category: "Legal Documentation", url: "/services/legal-documentation" },
  { name: "Family Court & Succession", nameUrdu: "فیملی کورٹ و جانشینی سرٹیفکیٹ", category: "Civil & Family Law", url: "/services/family-legal" },
  { name: "Banking & Financial Legal Services", nameUrdu: "بینکنگ و مالی قانونی خدمات", category: "Financial Legal Services", url: "/services/banking-financial" },
];

export const metadata = { title: "Service Routes | Ch-Law CMS" };

export default function ServicesManager() {
  return (
    <div className="space-y-6">
      <div className="text-[13px] font-normal text-slate-500">
        <span>Website</span><span className="mx-2 text-slate-400">/</span><span className="text-slate-700">Services</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900">Service routes</h1>
          <p className="mt-1 text-[14.5px] text-slate-500">
            Read-only inventory of service pages shipped with the application. Edit page source to change service content.
          </p>
        </div>
        <Link href="/#services" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50">
          <ExternalLink className="h-4 w-4 text-slate-500" />
          <span>View services</span>
        </Link>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-blue-900">
        These routes are code-managed rather than database-managed. This screen intentionally provides navigation only and does not imply CMS editing support.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SERVICES.map((service) => (
          <div key={service.url} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200/60 bg-emerald-50 text-emerald-700"><Boxes className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">{service.name}</h2>
                    <p className="text-xs text-slate-400">{service.nameUrdu}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"><CheckCircle className="h-3 w-3 text-emerald-600" />Route</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Tag className="h-3.5 w-3.5 text-slate-400" /><span>{service.category}</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="font-mono text-xs text-slate-400">{service.url}</span>
              <Link href={service.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"><Eye className="h-3.5 w-3.5 text-slate-400" /><span>View</span></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
