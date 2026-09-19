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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/features/admin/AdminSidebar";
import {
  AdminSidebarProvider,
  useAdminSidebar,
} from "@/features/admin/AdminSidebarContext";
import { createClient } from "@/lib/supabase/client";

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { isCollapsed, setMobileOpen } = useAdminSidebar();

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
      className="admin-shell flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased"
      style={{ colorScheme: "light" }}
    >
      <AdminSidebar />

      <div
        className={`flex min-w-0 flex-1 flex-col bg-slate-50 transition-[padding] duration-300 ease-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8">
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

            {/* Search Input without K badge, with search icon preserved */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscribers, posts, media, or anything..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#075e38] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#075e38] transition"
              />
            </form>
          </div>

          {/* Right: Notifications & Admin Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-3">
            {/* Notification Bell with interactive dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowAdminMenu(false);
                }}
                className={`relative rounded-lg p-2 transition focus:outline-none ${
                  showNotifications
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#075e38]">
                        3 new
                      </span>
                    </div>
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-semibold text-[#075e38] hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-2 divide-y divide-slate-100 text-xs">
                    {/* Item 1 */}
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-slate-50 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mt-0.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          New consultation inquiry
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Ali Khan: Income Tax Filing guidance
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">9 hours ago</span>
                      </div>
                    </Link>

                    {/* Item 2 */}
                    <Link
                      href="/admin/subscribers"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-slate-50 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 mt-0.5">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          New subscriber opted-in
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Chaudhry Usama: Property & Capital Tax
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">2 hours ago</span>
                      </div>
                    </Link>

                    {/* Item 3 */}
                    <Link
                      href="/admin/deadlines"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-2.5 py-2.5 hover:bg-slate-50 rounded-lg px-2 transition -mx-1"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          System Status: Operational
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Tax reminders and dispatches synchronized
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">1 day ago</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info with interactive dropdown menu */}
            <div ref={adminMenuRef} className="relative pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowAdminMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-slate-100 transition focus:outline-none"
                aria-expanded={showAdminMenu}
                title="Admin Account Menu"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
                  N
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Admin</p>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Administrator</p>
                </div>
              </button>

              {/* Admin Profile Dropdown Panel */}
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs">
                  {/* User info banner */}
                  <div className="p-2.5 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900">Admin Account</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">admin@ch-law.pk</p>
                    <span className="inline-block mt-1.5 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#075e38]">
                      Authorized Administrator
                    </span>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/admin"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                      <span>Dashboard Overview</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span>Firm & Site Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setShowAdminMenu(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                      <span>Open Live Website</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminMenu(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-rose-600 hover:bg-rose-50 transition"
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

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminSidebarProvider>
  );
}
