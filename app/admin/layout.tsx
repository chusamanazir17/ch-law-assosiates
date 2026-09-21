import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
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

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("office_cms_sidebar_collapsed")?.value === "true";

  return <AdminShell initialCollapsed={isCollapsed}>{children}</AdminShell>;
}
