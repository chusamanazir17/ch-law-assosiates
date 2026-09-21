import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, DM_Serif_Display, Alex_Brush, Noto_Nastaliq_Urdu, Inter } from "next/font/google";
import AppProviders from "@/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import JsonLd from "@/components/seo/JsonLd";
import { FloatingWhatsApp } from "@/components/ui/WhatsAppIcon";
import TaxReturnPopupModal from "@/components/ui/TaxReturnPopupModal";
import { getSiteUrl } from "@/config/env";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Ch Composing Estamp and Tax Advisor | Professional Legal Documentation & Tax Services",
    template: "%s | Ch Composing Estamp and Tax Advisor",
  },
  description:
    "Ch Composing Estamp and Tax Advisor - Trusted documentation firm for E-Stamping, FBR tax filings, property registry, business registration, and legal paperwork at Sharki Gate Chamber No 121 District Court Sahiwal.",
  keywords: [
    "Ch Composing",
    "E-Stamp and Tax Advisor",
    "Ch Composing Estamp and Tax Advisor",
    "E-Stamping Sahiwal",
    "FBR Tax Advisor",
    "NTN Registration Sahiwal",
    "Property Registry Sahiwal",
    "District Court Sahiwal Chamber 121",
    "SECP Registration",
    "Legal Documentation Pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Ch Composing Estamp and Tax Advisor",
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
        width: 1200,
        height: 630,
        alt: "Ch Composing Estamp and Tax Advisor Office",
      },
    ],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} ${dmSerif.variable} ${alexBrush.variable} ${notoNastaliq.variable} font-sans`} suppressHydrationWarning>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg">Skip to content</a>
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('ch_composing_theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`}</Script>
        <JsonLd />
        <AppProviders>
          <ScrollProgress />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <FloatingWhatsApp />
          <TaxReturnPopupModal />
        </AppProviders>
      </body>
    </html>
  );
}
