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
  const { isCollapsed, toggleCollapsed, mobileOpen: ctxMobileOpen, setMobileOpen } = useAdminSidebar();

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
        { label: "Dashboard", href: "/admin", icon: Home },
      ],
    },
    {
      group: "WEBSITE",
      items: [
        { label: "Page Content", href: "/admin/pages", icon: FileText },
        { label: "Services", href: "/admin/services", icon: Boxes },
        { label: "Posts", href: "/admin/posts", icon: FileSpreadsheet },
        { label: "Categories", href: "/admin/categories", icon: Tag },
        { label: "Media", href: "/admin/media", icon: ImageIcon },
        { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { label: "Client Inquiries", href: "/admin/inquiries", icon: MessageSquare },
      ],
    },
    {
      group: "REMINDERS",
      items: [
        { label: "Subscribers", href: "/admin/subscribers", icon: Users },
        { label: "Tax Deadlines", href: "/admin/deadlines", icon: Calendar },
        { label: "Email Reminders", href: "/admin/history", icon: Mail },
      ],
    },
    {
      group: "MANAGEMENT",
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div
      className={`flex h-full flex-col justify-between overflow-y-auto bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[72px] px-2 py-4" : "w-64 p-4"
      }`}
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
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#075e38] text-white shadow-xs transition hover:bg-[#064e2e]"
                title="Office CMS - Dashboard"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </Link>
              {/* Expand Toggle Button */}
              <button
                onClick={toggleCollapsed}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-[#eef7f2] hover:text-[#075e38] transition"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/admin" className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#075e38] text-white shadow-xs">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="min-w-0 overflow-hidden">
                  <span className="text-[17px] font-bold tracking-tight text-slate-900 block leading-tight truncate">
                    Office CMS
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block leading-tight mt-0.5 truncate">
                    E-stamp & Tax Services
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Toggle Button */}
                <button
                  onClick={toggleCollapsed}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-[#eef7f2] hover:text-[#075e38] transition"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                {/* Mobile Close button */}
                <button
                  onClick={handleCloseMobile}
                  className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
            className={`group relative flex items-center rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 ${
              isCollapsed ? "justify-center h-10 w-full" : "justify-between px-3 py-2 text-xs"
            }`}
            title="Open Live Website in New Tab"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-700 transition-colors" />
              {!isCollapsed && <span>View Public Site</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] text-slate-400 group-hover:text-slate-600">↗</span>
            )}
            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-slate-900 px-2.5 py-1 text-[12px] font-medium text-white shadow-lg z-50 group-hover:flex">
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
                  <div className="my-2 border-t border-slate-100" />
                ) : (
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                          : "gap-3 px-3 py-2 text-[13px]"
                      } ${
                        isActive
                          ? "bg-[#e8f5e9] text-[#075e38] font-semibold"
                          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-medium"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive ? "text-[#075e38]" : "text-slate-500 group-hover:text-slate-700"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}

                      {/* Floating tooltip on hover when collapsed */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-slate-900 px-2.5 py-1 text-[12px] font-medium text-white shadow-lg z-50 group-hover:flex">
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
        <div className="mt-4 mb-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef7f2] text-[#075e38]">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Need Help?</h4>
              <p className="text-[11px] text-slate-400">Get support or view guides.</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="mt-2.5 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            Visit Help Center
          </Link>
        </div>
      )}

      {/* Bottom Profile Footer */}
      <div className="pt-3 border-t border-slate-100">
        {isCollapsed ? (
          <div className="group relative flex flex-col items-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white shadow-2xs cursor-pointer"
              title="Admin (Administrator)"
            >
              N
            </div>
            {/* Tooltip with Sign Out */}
            <div className="pointer-events-none absolute left-full ml-3 bottom-0 hidden w-44 rounded-lg bg-white p-2 text-slate-800 shadow-xl border border-slate-200 z-50 group-hover:pointer-events-auto group-hover:block">
              <div className="text-[13px] font-semibold text-slate-900">Admin</div>
              <div className="text-[11px] text-slate-500 mb-2">Administrator</div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-white">
                N
              </div>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold text-slate-900 block leading-tight truncate">
                  Admin
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight mt-0.5 truncate">
                  Administrator
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of Admin"
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
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
        className={`fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
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
