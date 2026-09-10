import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy-900 texture-grid">
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="container-x relative text-center">
        <p className="font-serif text-8xl font-bold text-gold-400 sm:text-9xl">404</p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-white">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">
          The page you are looking for may have been moved or no longer exists.
          Please return to our homepage or contact our office for assistance.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-gold">
            <Home className="h-4 w-4" /> Back to Homepage
          </Link>
          <Link href="/#contact" className="btn-outline-light">
            <ArrowLeft className="h-4 w-4" /> Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
