import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { SITE } from "@/lib/site";

export default function Logo({
  isUrdu = false,
  isDark = false,
}: {
  isUrdu?: boolean;
  isDark?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={isUrdu ? "لیگل اسسٹ پاکستان ہوم" : "LegalAssist Pakistan Home"}>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 shadow-sm border border-gold-500/20">
        <FileText className="h-5 w-5 text-gold-400" />
      </span>
      <span className="leading-none">
        <span
          className={`block font-serif text-lg font-bold tracking-tight ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          {isUrdu ? "لیگل اسسٹ" : SITE.name}
        </span>
        <span className="block text-[10px] font-bold tracking-[0.28em] text-gold-500">
          {isUrdu ? "پاکستان" : SITE.country}
        </span>
      </span>
    </Link>
  );
}
