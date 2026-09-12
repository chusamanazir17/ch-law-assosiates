import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://legalassist.pk'),
  title: {
    default: "LegalAssist Pakistan | Premium Legal Documentation Services",
    template: "%s | LegalAssist Pakistan",
  },
  description:
    "Pakistan's trusted legal documentation firm for E-Stamping, property registry, business registration, tax filings, and family legal services in Islamabad.",
  keywords: [
    "E-Stamping Pakistan",
    "Property Registry Islamabad",
    "SECP Registration",
    "NTN Registration",
    "Legal Documentation Pakistan",
  ],
  openGraph: { type: 'website', locale: 'en_PK', siteName: 'LegalAssist Pakistan', images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', width: 1200, height: 630, alt: 'LegalAssist Pakistan Office' }] },
  twitter: { card: 'summary_large_image' }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg">Skip to content</a>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('legalassist_theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        <JsonLd />
        <ThemeRegistry>
          <ScrollProgress />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
