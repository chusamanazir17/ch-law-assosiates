"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Boxes,
  FileSpreadsheet,
  Tag,
  Image as ImageIcon,
  Users,
  Calendar,
  Mail,
  Settings,
  ChevronRight,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  MessageSquare,
  ExternalLink,
  Headphones,
  Scale,
  UserCheck,
  Star,
  HelpCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminSidebar } from "./AdminSidebarContext";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  mobileOpen: propMobileOpen,
  onCloseMobile: propOnCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { isCollapsed, toggleCollapsed, mobileOpen: ctxMobileOpen, setMobileOpen, isReady } = useAdminSidebar();

  const isMobileDrawerOpen = propMobileOpen !== undefined ? propMobileOpen : ctxMobileOpen;
  const handleCloseMobile = propOnCloseMobile || (() => setMobileOpen(false));

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

  const navSections = [
    {
      group: null,
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: Home },
        { label: "Office System", href: "/office", icon: Scale, badge: "Live Suite" },
      ],
    },
    {
      group: "WEBSITE CONTENT",
      items: [
        { label: "Page Content", href: "/admin/pages", icon: FileText },
        { label: "Services Catalog", href: "/admin/services", icon: Boxes },
        { label: "Team & Lawyers", href: "/admin/team", icon: UserCheck },
        { label: "Client Reviews", href: "/admin/testimonials", icon: Star },
        { label: "FAQ Knowledgebase", href: "/admin/faqs", icon: HelpCircle },
        { label: "Articles & Updates", href: "/admin/posts", icon: FileSpreadsheet },
        { label: "Tax Categories", href: "/admin/categories", icon: Tag },
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
        { label: "Site Notices", href: "/admin/announcements", icon: Megaphone },
        { label: "Client Inquiries", href: "/admin/inquiries", icon: MessageSquare },
      ],
    },
    {
      group: "CLIENT TELEMETRY",
      items: [
        { label: "Subscribers", href: "/admin/subscribers", icon: Users },
        { label: "Tax Deadlines", href: "/admin/deadlines", icon: Calendar },
        { label: "Reminder Dispatches", href: "/admin/history", icon: Mail },
      ],
    },
    {
      group: "CHAMBER MANAGEMENT",
      items: [
        { label: "Firm Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div
      className={`flex h-full flex-col justify-between overflow-y-auto bg-white dark:bg-[#0b1329] text-[#334155] dark:text-slate-200 border-r border-[#E2E8F0] dark:border-slate-800 ${
        isReady ? "transition-all duration-300 ease-in-out" : ""
      } ${isCollapsed ? "w-[72px] px-2 py-4" : "w-64 p-4"}`}
    >
      <div>
        {/* Brand Header */}
        <div
          className={`flex items-center pb-5 pt-1 ${
            isCollapsed ? "flex-col gap-2 justify-center px-0" : "justify-between px-1"
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F36] to-[#05162B] text-[#D39D3D] shadow-sm border border-[#D39D3D]/30 transition hover:border-[#D39D3D]"
                title="Chamber 121 - Dashboard"
              >
                <Scale className="h-5 w-5" />
              </Link>
              {/* Expand Toggle Button */}
              <button
                onClick={toggleCollapsed}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0B1F36] dark:hover:text-slate-100 transition"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/admin" className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1F36] to-[#05162B] text-[#D39D3D] shadow-sm border border-[#D39D3D]/30">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <span className="text-[15px] font-bold tracking-tight text-[#0B1F36] dark:text-slate-100 block leading-tight truncate">
                    Chamber 121
                  </span>
                  <span className="text-[11.5px] text-[#64748B] dark:text-slate-400 font-medium block leading-tight mt-0.5 truncate">
                    Legal & Tax Management
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Toggle Button */}
                <button
                  onClick={toggleCollapsed}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0B1F36] dark:hover:text-slate-100 transition"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                {/* Mobile Close button */}
                <button
                  onClick={handleCloseMobile}
                  className="lg:hidden rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick View Public Site button */}
        <div className={isCollapsed ? "mt-2 mb-3" : "mt-2 mb-4"}>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`group relative flex items-center rounded-lg border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900/60 font-medium text-[#334155] dark:text-slate-300 shadow-2xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700 hover:text-[#0B1F36] dark:hover:text-slate-100 ${
              isCollapsed ? "justify-center h-10 w-full" : "justify-between px-3 py-2 text-[12.5px]"
            }`}
            title="Open Live Website in New Tab"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#64748B] dark:text-slate-400 group-hover:text-[#0B1F36] dark:group-hover:text-gold-400 transition-colors" />
              {!isCollapsed && <span>View Public Site</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs text-[#94A3B8] dark:text-slate-500 group-hover:text-[#0B1F36] dark:group-hover:text-gold-400">↗</span>
            )}
            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-[#0B1F36] dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-lg z-50 group-hover:flex">
                View Public Site
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className={`mt-1 ${isCollapsed ? "space-y-4" : "space-y-5"}`}>
          {navSections.map((section, idx) => (
            <div key={idx}>
              {section.group && (
                isCollapsed ? (
                  <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                ) : (
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B] dark:text-slate-400">
                    {section.group}
                  </p>
                )
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => handleCloseMobile()}
                      className={`group relative flex items-center rounded-lg transition-all duration-150 ${
                        isCollapsed
                          ? "justify-center h-10 w-full"
                          : "gap-3 px-3 py-2 text-[13.5px]"
                      } ${
                        isActive
                          ? "bg-[#0B1F36] dark:bg-gold-500/15 text-white dark:text-gold-300 font-semibold shadow-xs dark:border dark:border-gold-500/30"
                          : "text-[#475569] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800/70 hover:text-[#0B1F36] dark:hover:text-slate-100 font-medium"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive ? "text-[#D39D3D]" : "text-[#64748B] dark:text-slate-400 group-hover:text-[#0B1F36] dark:group-hover:text-gold-400"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && (item as any).badge && (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 shrink-0">
                          {(item as any).badge}
                        </span>
                      )}

                      {/* Floating tooltip on hover when collapsed */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-[#0B1F36] dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-lg z-50 group-hover:flex">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help? Card */}
      {!isCollapsed && (
        <div className="mt-4 mb-2 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F36]/8 dark:bg-slate-800 text-[#0B1F36] dark:text-gold-400">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#0B1F36] dark:text-slate-100">Need Support?</h4>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Chamber tech & compliance desk.</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="mt-2.5 flex w-full items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-xs font-semibold text-[#334155] dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#0B1F36] dark:hover:text-slate-100 hover:border-[#CBD5E1] transition"
          >
            Firm Settings
          </Link>
        </div>
      )}

      {/* Bottom Profile Footer */}
      <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
        {isCollapsed ? (
          <div className="group relative flex flex-col items-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1F36] dark:bg-slate-800 text-xs font-bold text-[#D39D3D] ring-2 ring-[#D39D3D]/30 shadow-2xs cursor-pointer"
              title="Muhammad Usama (Principal Advocate & Tax Consultant)"
            >
              MU
            </div>
            {/* Tooltip with Sign Out */}
            <div className="pointer-events-none absolute left-full ml-3 bottom-0 hidden w-48 rounded-lg bg-white dark:bg-[#0b1329] p-2 text-[#334155] dark:text-slate-200 shadow-xl border border-[#E2E8F0] dark:border-slate-800 z-50 group-hover:pointer-events-auto group-hover:block">
              <div className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100">Muhammad Usama</div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 mb-2 font-medium">Principal Advocate & Tax Consultant</div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1F36] dark:bg-slate-800 text-xs font-bold text-[#D39D3D] ring-2 ring-[#D39D3D]/30">
                MU
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[#0B1F36] dark:text-slate-100 block leading-tight truncate">
                  Muhammad Usama
                </span>
                <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium block leading-tight mt-0.5 truncate">
                  Principal Advocate & Tax Consultant
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of Admin"
              className="rounded p-1 text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block ${
          isReady ? "transition-all duration-300 ease-in-out" : ""
        } ${isCollapsed ? "w-[72px]" : "w-64"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={handleCloseMobile}
        />
      )}

      {/* Mobile Slide-over Drawer (always expanded for usability) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
