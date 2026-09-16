"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, History, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Subscribers", href: "/admin/subscribers", icon: Users },
    { label: "Deadlines", href: "/admin/deadlines", icon: Calendar },
    { label: "Reminder Logs", href: "/admin/history", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur-md text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 text-navy-950 font-bold">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block">
                  {SITE.name} Admin
                </span>
                <span className="text-[10px] text-gold-400 font-semibold tracking-wider uppercase block">
                  Compliance Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-gold-400/15 text-gold-400 border border-gold-400/30"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Sign Out & Return Home */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-white/60 hover:text-white hidden sm:block"
            >
              View Website &rarr;
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden border-t border-white/10 px-2 py-1.5 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-semibold shrink-0 ${
                isActive
                  ? "bg-gold-400/20 text-gold-400"
                  : "text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
