import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Office Management System | CH Law Associates & Chamber 121",
  description: "Chamber 121 Sahiwal litigation diary, legal court cases, e-stamps, client dossiers, and treasury ledger.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OfficeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18]">
      {children}
    </div>
  );
}
