"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  ExternalLink,
  LogOut,
  MessageSquare,
  Users,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/features/admin/AdminSidebar";
import {
  AdminSidebarProvider,
  useAdminSidebar,
} from "@/features/admin/AdminSidebarContext";
import { createClient } from "@/lib/supabase/client";
import { useAppTheme } from "@/providers/ThemeProvider";

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { isCollapsed, setMobileOpen, isReady } = useAdminSidebar();
  const { isDark, toggleTheme, mode, setMode } = useAppTheme();

  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowAdminMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Sync secondary office_cms_theme key with AppThemeProvider
  useEffect(() => {
    try {
      localStorage.setItem("office_cms_theme", isDark ? "dark" : "light");
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore Supabase errors if unconfigured
    }
    router.push("/admin/login");
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/inquiries?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div
      className={`admin-shell ${isDark ? "dark" : ""} flex min-h-screen bg-slate-50 dark:bg-[#060b17] font-admin text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200`}
      data-theme={isDark ? "dark" : "light"}
      style={{ colorScheme: isDark ? "dark" : "light" }}
    >
      <AdminSidebar />

      <div
        className={`flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-[#060b17] ${
          isReady ? "transition-[padding] duration-300 ease-out" : ""
        } ${isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"}`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b1329] px-4 sm:px-6 lg:px-8 transition-colors">
          {/* Left: Mobile hamburger & Search input */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8] dark:text-slate-500">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything... (posts, subscribers, inquiries)"
                className="w-full rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#0f172a] py-2 pl-10 pr-4 text-sm text-[#0B1F36] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#C8973D] focus:bg-white dark:focus:bg-[#131f37] focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 transition"
              />
            </form>
          </div>

          {/* Right: Quick Date, View Website, Create Post, Notifications, Theme Toggle, Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-3">
            {/* View Website Button (as seen in all 8 mockups) */}
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0f172a] px-3.5 py-2 text-xs font-semibold text-[#334155] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              <span>View Website</span>
            </Link>

            {/* Create Post Action Button (as seen in all 8 mockups) */}
            <Link
              href="/admin/posts/editor"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>Create Post</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0B1F36] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-gold-400 transition focus:outline-none"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-gold-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Notification Bell with interactive dropdown & count badge */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowAdminMenu(false);
                }}
                className={`relative rounded-xl p-2 transition focus:outline-none ${
                  showNotifications
                    ? "bg-[#F1F5F9] dark:bg-slate-800 text-[#0B1F36] dark:text-slate-100"
                    : "text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#0B1F36] dark:hover:text-slate-100"
                }`}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0b1329]">
                  1
                </span>
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9] dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">Notifications</span>
                      <span className="rounded-full bg-[#0B1F36]/8 dark:bg-gold-400/15 px-2 py-0.5 text-xs font-semibold text-[#0B1F36] dark:text-gold-300">
                        3 new
                      </span>
                    </div>
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-[#B8832A] dark:text-gold-400 hover:text-[#91651E] dark:hover:text-gold-300 hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-2 divide-y divide-[#F1F5F9] dark:divide-slate-800">
                    {/* Item 1 */}
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-gold-400 mt-0.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#0B1F36] dark:text-slate-100 truncate">
                          New consultation inquiry
                        </p>
                        <p className="text-xs text-[#52627A] dark:text-slate-400 line-clamp-1 mt-0.5">
                          Ali Khan: Income Tax Filing guidance
                        </p>
                        <span className="text-[11.5px] text-[#94A3B8] dark:text-slate-500 mt-0.5 block">9 hours ago</span>
                      </div>
                    </Link>

                    {/* Item 2 */}
                    <Link
                      href="/admin/subscribers"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C8973D]/15 dark:bg-gold-500/20 text-[#B8832A] dark:text-gold-400 mt-0.5">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#0B1F36] dark:text-slate-100 truncate">
                          New subscriber opted-in
                        </p>
                        <p className="text-xs text-[#52627A] dark:text-slate-400 line-clamp-1 mt-0.5">
                          Chaudhry Usama: Property & Capital Tax
                        </p>
                        <span className="text-[11.5px] text-[#94A3B8] dark:text-slate-500 mt-0.5 block">2 hours ago</span>
                      </div>
                    </Link>

                    {/* Item 3 */}
                    <Link
                      href="/admin/deadlines"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-slate-300 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#0B1F36] dark:text-slate-100 truncate">
                          System Status: Operational
                        </p>
                        <p className="text-xs text-[#52627A] dark:text-slate-400 line-clamp-1 mt-0.5">
                          Tax reminders and dispatches synchronized
                        </p>
                        <span className="text-[11.5px] text-[#94A3B8] dark:text-slate-500 mt-0.5 block">1 day ago</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info with interactive dropdown menu */}
            <div ref={adminMenuRef} className="relative pl-2 border-l border-[#E2E8F0] dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAdminMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition focus:outline-none"
                aria-expanded={showAdminMenu}
                title="Admin Account Menu"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1F36] dark:bg-slate-800 text-xs font-bold text-[#D39D3D] ring-2 ring-[#D39D3D]/30 shadow-2xs">
                  MU
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100 leading-tight">Muhammad Usama</p>
                    <ChevronDown className="h-3 w-3 text-[#94A3B8] dark:text-slate-500" />
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-tight mt-0.5">Principal Advocate & Tax Consultant</p>
                </div>
              </button>

              {/* Admin Profile Dropdown Panel */}
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0b1329] p-2 shadow-xl z-50 text-sm">
                  {/* User info banner */}
                  <div className="p-2.5 border-b border-[#F1F5F9] dark:border-slate-800 mb-1">
                    <p className="font-semibold text-sm text-[#0B1F36] dark:text-slate-100">Muhammad Usama</p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">usama@ch-law.pk</p>
                    <span className="inline-block mt-1.5 rounded bg-[#0B1F36]/8 dark:bg-gold-500/15 border border-[#0B1F36]/10 dark:border-gold-500/30 px-2 py-0.5 text-xs font-semibold text-[#0B1F36] dark:text-gold-300">
                      Principal Practitioner
                    </span>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/admin"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-[#334155] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 hover:text-[#0B1F36] dark:hover:text-slate-100 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#64748B] dark:text-slate-400" />
                      <span>Dashboard Overview</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-[#334155] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 hover:text-[#0B1F36] dark:hover:text-slate-100 transition"
                    >
                      <Settings className="h-4 w-4 text-[#64748B] dark:text-slate-400" />
                      <span>Firm & Site Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-[#334155] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 hover:text-[#0B1F36] dark:hover:text-slate-100 transition"
                    >
                      <ExternalLink className="h-4 w-4 text-[#64748B] dark:text-slate-400" />
                      <span>Open Live Website</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-[#F1F5F9] dark:border-slate-800 mt-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-3 pb-8 sm:px-6 sm:pt-3.5 sm:pb-8 lg:px-8 lg:pt-4 lg:pb-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({
  children,
  initialCollapsed = false,
}: {
  children: ReactNode;
  initialCollapsed?: boolean;
}) {
  return (
    <AdminSidebarProvider initialCollapsed={initialCollapsed}>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminSidebarProvider>
  );
}
