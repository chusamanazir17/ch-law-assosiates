"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-[#f5f7fa] dark:bg-[#071224] transition-colors">
      <div className="container-x max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white">
          Something Went Wrong
        </h1>
        <p className="mt-2 font-serif text-lg text-navy-800/60 dark:text-slate-400">
          کچھ غلط ہو گیا
        </p>
        <p className="mt-4 text-sm leading-relaxed text-navy-800/65 dark:text-slate-300">
          An unexpected error occurred. Please try again or return to the homepage.
          If the problem persists, contact our office for assistance.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={reset} className="btn-gold">
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
          <Link href="/" className="btn-outline-navy dark:border-white/20 dark:text-white dark:hover:bg-white/10">
            <Home className="h-4 w-4" /> Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
