"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE } from "@/lib/site";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get("redirectedFrom");
  const redirectedFrom =
    requestedPath?.startsWith("/admin") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/admin";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "unauthorized"
      ? "Access denied. Your account does not have administrator privileges."
      : urlError === "configuration"
        ? "Admin access is unavailable until Supabase environment variables are configured."
        : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Verify admin membership
        const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin", {
          p_user_id: data.user.id,
        });

        if (adminErr || !isAdmin) {
          await supabase.auth.signOut();
          setErrorMessage("Access denied. Your account is not authorized as an administrator.");
          setIsLoading(false);
          return;
        }

        router.push(redirectedFrom);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-navy-950/90 p-8 shadow-2xl backdrop-blur-xl text-white">
      {/* Brand & Badge */}
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-navy-950 font-bold shadow-lg shadow-gold-400/20">
          <Shield className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight">
          Admin Compliance Portal
        </h1>
        <p className="mt-1 text-xs text-white/60">
          {SITE.fullName} • Chamber 121 Sahiwal
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-950/50 p-3.5 text-xs text-red-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-white/75 mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chcomposing.pk"
              required
              className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 pl-9 pr-3.5 text-sm text-white placeholder-white/30 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-white/75 mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 pl-9 pr-3.5 text-sm text-white placeholder-white/30 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gold-400 py-3 text-sm font-bold text-navy-950 shadow-md hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Sign In to Admin
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-white/10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Main Website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#061226] texture-grid">
      <Suspense fallback={<div className="text-white">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
