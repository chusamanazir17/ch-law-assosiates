import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ThemeRegistry>
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
