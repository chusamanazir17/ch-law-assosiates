"use client";

import { useEffect, type ReactNode } from "react";
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

  useEffect(() => {
    // Admin dashboard strictly enforces bright light theme.
    // Temporarily remove dark mode while inside admin area.
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    const previousColorScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = "light";

    return () => {
      if (wasDark) {
        document.documentElement.classList.add("dark");
      }
      document.documentElement.style.colorScheme = previousColorScheme;
    };
  }, []);

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div
      className="admin-shell flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased"
      style={{ colorScheme: "light" }}
    >
      <AdminSidebar />

      <div
        className={`flex min-w-0 flex-1 flex-col bg-slate-50 transition-[padding] duration-300 ease-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile hamburger & Search input */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search subscribers, posts, media, or anything..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-14 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38] transition"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-2xs">
                  <span>⌘</span>
                  <span>K</span>
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Notifications & Admin Profile */}
          <div className="flex items-center gap-4 shrink-0 pl-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition focus:outline-none"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
                N
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Admin</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
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
