"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, UserMinus, ArrowLeft } from "lucide-react";
import { processUnsubscribe } from "@/features/reminders/api";
import { SITE } from "@/lib/site";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setIsProcessing(true);
    const res = await processUnsubscribe(token);
    if (res.success) {
      setResult({
        success: true,
        message: res.message || "You have been successfully unsubscribed.",
      });
    } else {
      setResult({
        success: false,
        message: res.error || "Unable to unsubscribe. The link may have expired or already been processed.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-navy-900/90 p-8 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-center mb-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/80">
          <UserMinus className="h-8 w-8" />
        </span>
      </div>

      <h1 className="text-center font-serif text-2xl font-bold sm:text-3xl">
        Unsubscribe from Tax Reminders
      </h1>
      <p className="mt-2 text-center text-xs sm:text-sm text-white/70">
        {SITE.fullName} • District Court Sahiwal
      </p>

      {!token ? (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-center text-sm text-red-300">
          <AlertCircle className="mx-auto h-6 w-6 text-red-400 mb-2" />
          <p>No unsubscribe token found. Please use the unsubscribe link at the bottom of the email you received.</p>
          <div className="mt-4">
            <Link href="/" className="btn-gold px-4 py-2 text-xs inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Website
            </Link>
          </div>
        </div>
      ) : result ? (
        <div className="mt-6">
          {result.success ? (
            <div className="rounded-lg border border-white/15 bg-white/[0.04] p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <h3 className="text-lg font-bold text-white">Unsubscribed Successfully</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">{result.message}</p>
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
                <Link href="/" className="btn-gold px-5 py-2.5 text-xs inline-flex items-center gap-2">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-5 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
              <h3 className="text-lg font-bold text-red-200">Notice</h3>
              <p className="mt-2 text-xs leading-relaxed text-red-300">{result.message}</p>
              <div className="mt-6">
                <Link href="/" className="btn-gold px-5 py-2.5 text-xs inline-flex items-center gap-2">
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/80">
            <p>
              Clicking below will immediately remove your email from all future scheduled tax deadline reminder alerts. No login or password is required.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/80 py-3 px-6 text-sm font-bold text-white shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Request...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4" />
                Confirm Unsubscribe
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-white/50">
            You can resubscribe at any time from our homepage.
          </p>
        </div>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-navy-950 texture-grid">
      <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </section>
  );
}
