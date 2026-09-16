"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, BellRing, ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import { confirmSubscriptionToken } from "@/features/reminders/api";
import { SITE } from "@/lib/site";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConfirm = async () => {
    if (!token) return;
    setIsConfirming(true);
    const res = await confirmSubscriptionToken(token);
    if (res.success) {
      setResult({
        success: true,
        message: res.message || "Your subscription has been confirmed and activated.",
      });
    } else {
      setResult({
        success: false,
        message: res.error || "Confirmation link is invalid or has expired.",
      });
    }
    setIsConfirming(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-navy-900/90 p-8 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-center mb-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-400">
          <BellRing className="h-8 w-8" />
        </span>
      </div>

      <h1 className="text-center font-serif text-2xl font-bold sm:text-3xl">
        Confirm Your Tax Reminders
      </h1>
      <p className="mt-2 text-center text-xs sm:text-sm text-white/70">
        Ch Composing Estamp & Tax Advisor • District Court Sahiwal
      </p>

      {/* When no token provided */}
      {!token ? (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-center text-sm text-red-300">
          <AlertCircle className="mx-auto h-6 w-6 text-red-400 mb-2" />
          <p>No confirmation token found. Please use the link sent to your email address.</p>
          <div className="mt-4">
            <Link href="/#tax-reminders" className="btn-gold px-4 py-2 text-xs inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Subscription Form
            </Link>
          </div>
        </div>
      ) : result ? (
        /* Result state */
        <div className="mt-6">
          {result.success ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-emerald-200">Subscription Activated!</h3>
              <p className="mt-2 text-xs leading-relaxed text-emerald-300">{result.message}</p>
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/" className="btn-gold px-5 py-2.5 text-xs inline-flex items-center justify-center gap-2">
                  Return to Home
                </Link>
                <Link href="/#office" className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-xs text-white hover:bg-white/20 inline-flex items-center justify-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Office Information
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-5 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
              <h3 className="text-lg font-bold text-red-200">Unable to Confirm</h3>
              <p className="mt-2 text-xs leading-relaxed text-red-300">{result.message}</p>
              <div className="mt-6">
                <Link href="/#tax-reminders" className="btn-gold px-5 py-2.5 text-xs inline-flex items-center gap-2">
                  Subscribe Again
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Initial confirmation prompt with explicit button */
        <div className="mt-6 space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/80">
            <p>
              To protect your privacy and ensure automated link scanners do not inadvertently trigger subscriptions, please click the confirmation button below to activate your reminders.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold-400 py-3 px-6 text-sm font-bold text-navy-950 shadow-lg hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition disabled:opacity-50"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Subscription...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Confirm My Subscription
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-white/50">
            Reminders relate to in-person tax services at {SITE.address}.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ConfirmReminderPage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-navy-950 texture-grid">
      <Suspense fallback={<div className="text-white text-center">Loading confirmation...</div>}>
        <ConfirmContent />
      </Suspense>
    </section>
  );
}
