"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const OfficeApp = dynamic(
  () => import("@/features/office/App").then((mod) => mod.App),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070D18] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <span className="font-['Playfair_Display',serif] font-black text-xl text-white">CH</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading Office Management System...</span>
          </div>
        </div>
      </div>
    ),
  }
);

export default function OfficeDashboardPage() {
  return <OfficeApp />;
}
