import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { SITE, buildWhatsAppUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = { title: "Page Not Found | Ch Composing" };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy-900 texture-grid">
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="container-x relative text-center">
        <p className="font-serif text-8xl font-bold text-gold-400 sm:text-9xl">404</p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-white">
          Page Not Found
        </h1>
        <p className="mt-1 font-serif text-xl text-white/50">
          صفحہ نہیں ملا
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">
          The page you are looking for may have been moved or no longer exists.
          Please return to our homepage or contact our office directly on WhatsApp for assistance.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/50">
          جو صفحہ آپ تلاش کر رہے ہیں وہ منتقل ہو چکا ہے یا موجود نہیں ہے۔ براہ کرم ہوم پیج پر واپس جائیں یا واٹس ایپ پر رابطہ کریں۔
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">
            <Home className="h-4 w-4" /> Back to Homepage
          </Link>
          <a
            href={buildWhatsAppUrl(SITE.whatsapp, "Hello, I encountered a 404 missing page and need assistance.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md cursor-pointer"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>WhatsApp Assistance</span>
          </a>
          <Link href="/#contact" className="btn-outline-light">
            <ArrowLeft className="h-4 w-4" /> Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
