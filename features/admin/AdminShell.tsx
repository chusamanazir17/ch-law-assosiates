"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/features/admin/AdminSidebar";
import {
  AdminSidebarProvider,
  useAdminSidebar,
} from "@/features/admin/AdminSidebarContext";

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const { isCollapsed, setMobileOpen } = useAdminSidebar();

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <AdminSidebar />

      <div
        className={`flex min-w-0 flex-1 flex-col bg-slate-50 transition-[padding] duration-300 ease-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 text-sm font-semibold text-slate-800">Office CMS</span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminSidebarProvider>
  );
}
