import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "@/features/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Office CMS",
    template: "%s | Office CMS",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
