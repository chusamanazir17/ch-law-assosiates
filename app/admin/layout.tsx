"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/features/admin/AdminSidebar";
import { AdminSidebarProvider, useAdminSidebar } from "@/features/admin/AdminSidebarContext";
import { Menu } from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { isCollapsed, setMobileOpen } = useAdminSidebar();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#f8fafc] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {/* Mobile Header (only visible on small screens to toggle sidebar) */}
        <div className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-800">Office CMS</span>
          </div>
        </div>

        {/* Dynamic Page Body */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSidebarProvider>
  );
}
