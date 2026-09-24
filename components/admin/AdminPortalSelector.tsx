"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Globe,
  Briefcase,
  Shield,
  ArrowRight,
  Lock,
  User,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
  LogOut,
  Sparkles,
  ArrowLeft,
  Scale,
  FileText,
  Users,
  Wallet,
  Calendar,
  Building2,
} from "lucide-react";
import { SITE } from "@/lib/site";

interface SessionData {
  authenticated: boolean;
  role: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export default function AdminPortalSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const redirectedFrom = searchParams.get("redirectedFrom");

  const [session, setSession] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<"cms" | "office">("cms");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch {
        setSession({ authenticated: false, role: null });
      } finally {
        setLoadingSession(false);
      }
    }
    checkSession();
  }, []);

  const handlePortalClick = (portal: "cms" | "office") => {
    setAuthError(null);
    setSelectedPortal(portal);

    // If already authenticated, check role
    if (session?.authenticated && session.role) {
      if (session.role === "super_admin") {
        router.push(portal === "office" ? "/office/dashboard" : "/admin/dashboard");
        return;
      }
      if (portal === "cms") {
        if (["website_admin", "office_admin"].includes(session.role)) {
          router.push("/admin/dashboard");
          return;
        }
        setAuthError(`Your role (${session.role}) is not permitted to access Website CMS.`);
        setIsAuthModalOpen(true);
        return;
      }
      if (portal === "office") {
        if (["office_admin", "lawyer", "staff", "accountant", "receptionist"].includes(session.role)) {
          router.push("/office/dashboard");
          return;
        }
        setAuthError(`Your role (${session.role}) is not permitted to access Office Management.`);
        setIsAuthModalOpen(true);
        return;
      }
    }

    // Otherwise prompt for password/credentials
    setIsAuthModalOpen(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          targetPortal: selectedPortal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || "Authentication failed. Invalid password or permissions.");
        return;
      }

      // Success: redirect to designated dashboard
      const targetUrl = data.redirect || (selectedPortal === "office" ? "/office/dashboard" : "/admin/dashboard");
      window.location.href = targetUrl;
    } catch {
      setAuthError("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setSession({ authenticated: false, role: null });
      router.refresh();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#040C18] text-white flex flex-col justify-between selection:bg-[#C8973D] selection:text-[#040C18] relative overflow-hidden font-admin antialiased">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#C8973D]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="relative z-10 border-b border-white/10 bg-[#061224]/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D39D3D] via-[#C8973D] to-[#996F26] text-[#040C18] font-bold shadow-md shadow-[#C8973D]/20">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <div className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-[#D39D3D] transition">
                {SITE.name}
              </div>
              <div className="text-[11px] text-white/50">Chamber 121 Sahiwal • Central Portal Hub</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {session?.authenticated && (
              <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Signed in: <strong className="text-[#D39D3D]">{session.role}</strong></span>
                <button
                  onClick={handleSignOut}
                  className="ml-2 text-white/40 hover:text-white transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-5xl w-full mx-auto">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D39D3D]/30 bg-[#D39D3D]/10 px-4 py-1.5 text-xs font-semibold text-[#D39D3D] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Enterprise Management System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Select Your <span className="text-[#D39D3D]">Portal</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/65 leading-relaxed">
              Access website publishing and content administration, or launch the Chamber 121 practice management, client CRM, e-stamp registers, and treasury accounts system.
            </p>

            {/* Error notice if redirected */}
            {urlError && (
              <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-xs text-red-200 text-left flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-300">Access Restricted</div>
                  <div className="mt-0.5 text-red-200/80">
                    {urlError === "office_forbidden"
                      ? "Your account role does not have permission to access the Office Management System."
                      : urlError === "cms_forbidden"
                      ? "Your account role does not have permission to access Website CMS administration."
                      : "Please authenticate with permitted credentials to access the requested portal."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dual Portal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* PORTAL 1: Website Administration */}
            <div
              onClick={() => handlePortalClick("cms")}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0B1E38]/90 to-[#071328]/95 p-7 sm:p-9 shadow-2xl backdrop-blur-xl hover:border-[#D39D3D]/60 hover:shadow-2xl hover:shadow-[#D39D3D]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/60">
                  /admin/dashboard
                </span>
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#1D4ED8]/40 border border-[#3B82F6]/30 text-[#60A5FA] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-[#60A5FA]/60 transition-transform">
                  <Globe className="h-7 w-7" />
                </div>

                <h2 className="font-serif text-2xl font-bold text-white group-hover:text-[#D39D3D] transition">
                  Website Administration
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">
                  Full control over public website content, legal blog articles, consultation inquiries, site notices, and media library.
                </p>

                {/* Feature Tags */}
                <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/70">
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <FileText className="h-3 w-3 text-[#60A5FA]" /> Legal Articles & Blog
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <Users className="h-3 w-3 text-[#60A5FA]" /> Client Inquiries
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <Shield className="h-3 w-3 text-[#60A5FA]" /> Site Settings
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  Required: <span className="text-white/75 font-semibold">CMS / Super Admin</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 group-hover:bg-[#D39D3D] text-white group-hover:text-[#040C18] px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  <span>Enter CMS</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* PORTAL 2: Office Management System */}
            <div
              onClick={() => handlePortalClick("office")}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#111A2E]/90 to-[#080E1C]/95 p-7 sm:p-9 shadow-2xl backdrop-blur-xl hover:border-[#D39D3D]/60 hover:shadow-2xl hover:shadow-[#D39D3D]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/60">
                  /office/dashboard
                </span>
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D39D3D]/20 to-[#B88728]/40 border border-[#D39D3D]/30 text-[#D39D3D] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-[#D39D3D] transition-transform">
                  <Briefcase className="h-7 w-7" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#D39D3D] transition">
                  Office Management System
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed font-admin">
                  Complete chamber ERP: E-Stamps & 32-A Challan, Cash In / Out ledger, clients CRM, tax filing, composing services, invoices & staff attendance.
                </p>

                {/* Feature Tags */}
                <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/70 font-admin">
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <FileText className="h-3 w-3 text-[#D39D3D]" /> E-Stamps & 32-A Challan
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <Wallet className="h-3 w-3 text-[#D39D3D]" /> Cash In / Out Ledger
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    <Users className="h-3 w-3 text-[#D39D3D]" /> Clients CRM & Tax
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  Required: <span className="text-white/75 font-semibold">Chamber / Staff Roles</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D39D3D] to-[#B88728] text-[#040C18] px-4 py-2.5 text-xs font-bold shadow-md hover:from-[#E4AE4E] hover:to-[#C8973D] transition"
                >
                  <span>Enter Office System</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#071328] p-7 shadow-2xl text-white relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition text-sm p-1"
            >
              ✕
            </button>

            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#D39D3D]/10 border border-[#D39D3D]/30 text-[#D39D3D] mb-3">
                <Lock className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                Enter {selectedPortal === "office" ? "Office Management" : "Website CMS"}
              </h3>
              <p className="mt-1 text-xs text-white/60">
                Please enter your credentials to authenticate and enter this section.
              </p>
            </div>

            {authError && (
              <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    required
                    className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:border-[#D39D3D] focus:outline-none focus:ring-1 focus:ring-[#D39D3D]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoFocus
                    className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:border-[#D39D3D] focus:outline-none focus:ring-1 focus:ring-[#D39D3D]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D39D3D] to-[#B88728] py-3 text-xs font-bold text-[#040C18] shadow-md hover:from-[#E4AE4E] hover:to-[#C8973D] transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying Permissions...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Authenticate & Enter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        <div>{SITE.fullName} • Chamber 121 District Court Sahiwal • All Rights Reserved</div>
      </footer>
    </div>
  );
}
