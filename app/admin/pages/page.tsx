import Link from "next/link";
import { CheckCircle, ExternalLink, Eye, FileText } from "lucide-react";

interface SitePage {
  title: string;
  description: string;
  url: string;
}

const SITE_PAGES: SitePage[] = [
  { title: "Home", description: "Office overview, services, reminders and contact sections.", url: "/" },
  { title: "Updates", description: "Published CMS updates and informational posts.", url: "/updates" },
  { title: "E-Stamping & Stamp Papers", description: "E-stamping, challan and stamp-paper guidance.", url: "/services/e-stamping" },
  { title: "Property & Land Registration", description: "Property registry, Inteqal and verification services.", url: "/services/property-land" },
  { title: "Registry & Deeds", description: "Registry and deed documentation services.", url: "/services/registry-deeds" },
  { title: "Tax Services & FBR Compliance", description: "Income tax, ATL and related compliance services.", url: "/services/tax" },
  { title: "Business & Corporate Registration", description: "Business registration and SECP services.", url: "/services/business-registration" },
  { title: "Trademark & IPO Pakistan", description: "Trademark registration and intellectual-property services.", url: "/services/trademark-ipo" },
  { title: "Legal Documentation", description: "Affidavits and general legal documentation services.", url: "/services/legal-documentation" },
  { title: "Family Legal Services", description: "Family, succession and inheritance documentation services.", url: "/services/family-legal" },
  { title: "Banking & Financial Legal Services", description: "Financial documentation and related legal services.", url: "/services/banking-financial" },
];

export const metadata = { title: "Public Routes | Ch-Law CMS" };

export default function PagesManager() {
  return (
    <div className="space-y-6">
      <div className="text-[13px] font-normal text-slate-500"><span>Website</span><span className="mx-2 text-slate-400">/</span><span className="text-slate-700">Public routes</span></div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900">Public routes</h1>
          <p className="mt-1 text-[14.5px] text-slate-500">Read-only route inventory for the public website. CMS-managed updates are maintained under Posts.</p>
        </div>
        <Link href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"><ExternalLink className="h-4 w-4 text-slate-500" /><span>View website</span></Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead><tr className="border-b border-slate-200 bg-slate-50/50 text-[13px] font-medium text-slate-700"><th className="px-5 py-3.5">Page</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Route</th><th className="px-5 py-3.5 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100 text-[13.5px]">
            {SITE_PAGES.map((page) => (
              <tr key={page.url} className="transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/50 bg-emerald-50 text-emerald-700"><FileText className="h-4 w-4" /></div><div><span className="block font-semibold text-slate-900">{page.title}</span><span className="mt-0.5 block max-w-xl text-[12px] text-slate-500">{page.description}</span></div></div></td>
                <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800"><CheckCircle className="h-3 w-3 text-emerald-600" />Available</span></td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{page.url}</td>
                <td className="px-5 py-3.5 text-right"><Link href={page.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"><Eye className="h-3.5 w-3.5 text-slate-400" /><span>View</span></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
