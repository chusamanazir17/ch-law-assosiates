"use client";

import {
  HeartHandshake, ScrollText, FileX2, ShieldPlus, FilePenLine, Globe2,
  Lock, BadgeCheck, Phone, MessageCircle, MapPin, Scale, ArrowRight, AlertTriangle,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const familyServices = [
  {
    icon: HeartHandshake,
    title: "Nikahnama Registration",
    description:
      "Official registration and certification of marriage with Union Councils and NADRA authorities.",
    bullets: [
      "Computerized Nikahnama",
      "Manual Register Verification",
      "Attestation for International Use",
      "Drafting & Preparation",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
  {
    icon: ScrollText,
    title: "Succession Certificates",
    description:
      "Legal documentation identifying legal heirs for the purpose of transfer of assets and accounts.",
    bullets: [
      "Court Application Filing",
      "Newspaper Advertisement Handling",
      "Legal Heir Verification",
      "Document Collection Assistance",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
  {
    icon: FileX2,
    title: "Divorce Documents",
    description:
      "Processing of Talaq-nama and Khula related legal requirements through relevant legal channels.",
    bullets: [
      "Notice Generation",
      "Arbitration Council Facilitation",
      "Divorce Certificate Issuance",
      "Legal Consultation Support",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
  {
    icon: ShieldPlus,
    title: "Child Guardianship",
    description:
      "Legal support for securing guardianship certificates and related family documentation.",
    bullets: [
      "Guardianship Petition Drafting",
      "Court Hearing Documentation",
      "NADRA ID Coordination",
      "Process Guidance",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
  {
    icon: FilePenLine,
    title: "Affidavits & Declarations",
    description:
      "Preparation of legally binding family declarations and non-judicial stamp paper affidavits.",
    bullets: [
      "Relationship Declarations",
      "Death Affidavits",
      "Property Gift Deeds",
      "E-Stamp Paper Issuance",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
  {
    icon: Globe2,
    title: "International Attestations",
    description:
      "Foreign Office and Embassy attestation for family documents required for overseas use.",
    bullets: [
      "MOFA Attestation",
      "Embassy Legalization",
      "Translation Services",
      "Courier Handling",
    ],
    linkLabel: "Inquire Details",
    linkVariant: "outlined" as const,
  },
];

export default function FamilyLegalPage() {
  return (
    <>
      <PageHero
        badge="Personal & Family Affairs"
        title="Family & Legal Documents"
        image={HERO_IMAGES.family}
        description="Professional handling of sensitive family documentations including Nikahnama registration, divorce proceedings, and legal succession certificates with utmost confidentiality."
        backLabel="Back to Home"
      />

      <div className="border-b border-gold-200/60 bg-gold-50">
        <div className="container-x py-5">
          <NoticeBar
            tone="info"
            icon={AlertTriangle}
            label="Important Client Notice"
            title="Important Client Notice"
            text="Documentation requirements vary significantly by case. Please contact our office for a customized checklist before visiting."
            ctaLabel="Call for Checklist"
            ctaHref={SITE.phoneHref}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>
      </div>

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <h2 className="section-title">Our Family Documentation Services</h2>
            <p className="mt-5 text-sm leading-relaxed text-navy-800/60">
              We provide end-to-end assistance for all essential family-related
              legal documentation. Our experts ensure your records are accurately
              prepared and registered with relevant union councils and government
              bodies.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {familyServices.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        bg="white"
        eyebrow="Why Professional Assistance Matters"
        title="Integrity in Every Document"
        paragraphs={[
          "Family legal matters require more than just clerical work; they require sensitivity, precision, and an absolute understanding of Pakistani family laws. Errors in Nikah registration or succession certificates can lead to long-term legal complications regarding inheritance and property.",
        ]}
        features={[
          {
            icon: Lock,
            title: "Confidential Handling",
            text: "Your private family data is protected under strict client confidentiality protocols.",
          },
          {
            icon: BadgeCheck,
            title: "Verified Authenticity",
            text: "We facilitate documentation that is fully verified and recognizable by NADRA and courts.",
          },
        ]}
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Family legal documents being signed with care"
        imageFrame
        quote={{
          text: "Documentation is the foundation of legal protection. We ensure your family's future is built on clean, accurate, and authenticated records.",
          author: "Senior Legal Consultant, LegalAssist Pakistan",
        }}
      />

      {/* Connect */}
      <section className="relative overflow-hidden bg-navy-900 py-20 texture-grid">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-white">Connect With Our Office</h2>
            <p className="mt-4 text-sm text-white/65">
              Our specialists are available for consultation. Whether you need
              immediate document verification or want to discuss a new filing,
              reach out through your preferred channel.
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, title: "Visit Our Office", lines: ["Office 402, Business Tower, Blue", "Area, Islamabad"], action: "View Map", href: SITE.mapsUrl },
              { icon: MessageCircle, title: "WhatsApp Us", lines: [SITE.whatsapp, ""], action: "Start Chat", href: SITE.whatsappHref, featured: true },
              { icon: Phone, title: "Call Now", lines: [SITE.phone, ""], action: "Call Support", href: SITE.phoneHref },
              { icon: Scale, title: "Get Directions", lines: ["Available 9:00 AM - 6:00 PM", ""], action: "Directions", href: SITE.mapsUrl },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1} direction="up">
                <div
                  className={`flex h-full flex-col items-center rounded-lg border p-7 text-center ${
                    c.featured
                      ? "border-gold-400/50 bg-gold-400 text-white"
                      : "border-white/10 bg-white/[0.05] text-white"
                  }`}
                >
                  <span
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                      c.featured ? "bg-white/20 text-white" : "bg-white/10 text-gold-400"
                    }`}
                  >
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h4 className={`text-[11px] font-bold uppercase tracking-[0.14em] ${c.featured ? "text-white" : "text-white/60"}`}>
                    {c.title}
                  </h4>
                  {c.lines.filter(Boolean).map((l) => (
                    <p key={l} className={`mt-2 text-xs ${c.featured ? "text-white/90" : "text-white/60"}`}>{l}</p>
                  ))}
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                      c.featured ? "text-white" : "text-gold-400 hover:text-gold-300"
                    }`}
                  >
                    {c.action} <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
