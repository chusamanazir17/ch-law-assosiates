import type { Metadata } from "next";
import {
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Configuration | Office CMS",
};

const rows = [
  { label: "Office title", value: SITE.fullName, icon: Settings },
  { label: "Chamber address", value: SITE.address, icon: MapPin },
  { label: "Primary phone", value: SITE.phone, icon: Phone },
  { label: "WhatsApp", value: SITE.whatsapp, icon: Smartphone },
  { label: "Contact email", value: SITE.email, icon: Mail },
  { label: "Timezone", value: "Asia/Karachi (PKT +05:00)", icon: Clock },
];

export default function SettingsManager() {
  return (
    <div className="space-y-6">
      <div className="text-[13px] font-normal text-slate-500">
        <span>Management</span>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">Configuration</span>
      </div>

      <div>
        <h1 className="text-[30px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[32px]">
          Site configuration
        </h1>
        <p className="mt-1 max-w-3xl text-[14px] leading-6 text-slate-500">
          Core identity and deployment settings are code-managed so public contact details cannot be changed accidentally from a browser session.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Public office identity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Current values rendered across the public website.</p>
          </div>
          <dl className="divide-y divide-slate-100">
            {rows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="grid gap-2 px-5 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Icon className="h-4 w-4 text-emerald-700" />
                  {label}
                </dt>
                <dd className="text-sm font-medium leading-6 text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="text-sm font-semibold text-emerald-950">Production-safe configuration</h2>
                <p className="mt-1 text-xs leading-5 text-emerald-900/75">
                  Update office identity in <code className="rounded bg-white/70 px-1 py-0.5 font-mono">lib/site.ts</code>. Supabase and deployment URLs belong in environment variables, never in this screen.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Required deployment variables</h2>
                <ul className="mt-3 space-y-2 font-mono text-[11px] text-slate-600">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li>NEXT_PUBLIC_SITE_URL</li>
                </ul>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Server-side email credentials and Supabase service-role credentials are configured only in the corresponding Supabase Edge Function environment.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
