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
        { label: "Dashboard", href: "/admin", icon: Home },
      ],
    },
    {
      group: "WEBSITE CONTENT",
      items: [
        { label: "Page Content", href: "/admin/pages", icon: FileText },
        { label: "Services Catalog", href: "/admin/services", icon: Boxes },
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
      className={`flex h-full flex-col justify-between overflow-y-auto bg-white text-[#334155] border-r border-[#E2E8F0] ${
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
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100 hover:text-[#0B1F36] transition"
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
                  <span className="text-[15px] font-bold tracking-tight text-[#0B1F36] block leading-tight truncate">
                    Chamber 121
                  </span>
                  <span className="text-[11.5px] text-[#64748B] font-medium block leading-tight mt-0.5 truncate">
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
                  className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100 hover:text-[#0B1F36] transition"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>

                {/* Mobile Close button */}
                <button
                  onClick={handleCloseMobile}
                  className="lg:hidden rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-slate-900"
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
            className={`group relative flex items-center rounded-lg border border-[#E2E8F0] bg-white font-medium text-[#334155] shadow-2xs transition-all hover:bg-slate-50 hover:border-[#CBD5E1] hover:text-[#0B1F36] ${
              isCollapsed ? "justify-center h-10 w-full" : "justify-between px-3 py-2 text-[12.5px]"
            }`}
            title="Open Live Website in New Tab"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#64748B] group-hover:text-[#0B1F36] transition-colors" />
              {!isCollapsed && <span>View Public Site</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs text-[#94A3B8] group-hover:text-[#0B1F36]">↗</span>
            )}
            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-[#0B1F36] px-2.5 py-1 text-xs font-medium text-white shadow-lg z-50 group-hover:flex">
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
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
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
                          ? "bg-[#0B1F36] text-white font-semibold shadow-xs"
                          : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B1F36] font-medium"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive ? "text-[#D39D3D]" : "text-[#64748B] group-hover:text-[#0B1F36]"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}

                      {/* Floating tooltip on hover when collapsed */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-full ml-3 hidden items-center rounded-md bg-[#0B1F36] px-2.5 py-1 text-xs font-medium text-white shadow-lg z-50 group-hover:flex">
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
        <div className="mt-4 mb-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1F36]/8 text-[#0B1F36]">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-[#0B1F36]">Need Support?</h4>
              <p className="text-xs text-[#64748B] mt-0.5">Chamber tech & compliance desk.</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="mt-2.5 flex w-full items-center justify-center rounded-lg border border-[#E2E8F0] bg-white py-1.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-slate-50 hover:text-[#0B1F36] hover:border-[#CBD5E1] transition"
          >
            Firm Settings
          </Link>
        </div>
      )}

      {/* Bottom Profile Footer */}
      <div className="pt-3 border-t border-[#E2E8F0]">
        {isCollapsed ? (
          <div className="group relative flex flex-col items-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1F36] text-xs font-bold text-[#D39D3D] ring-2 ring-[#D39D3D]/30 shadow-2xs cursor-pointer"
              title="Chaudhry Admin (Principal Practitioner)"
            >
              C
            </div>
            {/* Tooltip with Sign Out */}
            <div className="pointer-events-none absolute left-full ml-3 bottom-0 hidden w-44 rounded-lg bg-white p-2 text-[#334155] shadow-xl border border-[#E2E8F0] z-50 group-hover:pointer-events-auto group-hover:block">
              <div className="text-[13.5px] font-semibold text-[#0B1F36]">Chaudhry Admin</div>
              <div className="text-xs text-[#64748B] mb-2 font-medium">Principal Practitioner</div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1F36] text-xs font-bold text-[#D39D3D] ring-2 ring-[#D39D3D]/30">
                C
              </div>
              <div className="min-w-0">
                <span className="text-[13.5px] font-semibold text-[#0B1F36] block leading-tight truncate">
                  Chaudhry Admin
                </span>
                <span className="text-xs text-[#64748B] font-medium block leading-tight mt-0.5 truncate">
                  Principal Practitioner
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of Admin"
              className="rounded p-1 text-[#94A3B8] hover:bg-slate-200 hover:text-slate-700 transition"
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
