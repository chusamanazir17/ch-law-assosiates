"use client";

import { Stamp, Scale, Home, Handshake, Landmark, ShieldCheck, FileCheck2, BadgeCheck, Clock3, FileSearch, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { Chip } from "@mui/material";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { ContactCards } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";

const stampServices = [
  {
    icon: Stamp,
    title: "Non-Judicial E-Stamp",
    meta: "Value: PKR 50 to PKR 1,000+",
    description:
      "Standard digital stamp papers for commercial agreements, affidavits, and general legal documentation.",
    listLabel: "Common Applications",
    bullets: ["Rental Agreements", "Affidavits", "Indemnity Bonds", "Undertakings"],
    linkLabel: "Requirement Details",
  },
  {
    icon: Scale,
    title: "High-Value Judicial",
    meta: "Value: Variable based on court fees",
    description:
      "Stamp papers required for court proceedings, litigation, and formal legal representation in Pakistani courts.",
    listLabel: "Common Applications",
    bullets: ["Power of Attorney", "Court Petitions", "Legal Declarations", "Succession Papers"],
    linkLabel: "Requirement Details",
  },
  {
    icon: Home,
    title: "Property Sale Deed",
    meta: "Value: 1% of Property DC Rate",
    description:
      "Specific E-stamping required for the transfer of immovable property, including plots and houses.",
    listLabel: "Common Applications",
    bullets: ["Sale Deeds", "Gift Deeds", "Transfer Letters", "Relinquishment Deeds"],
    linkLabel: "Requirement Details",
  },
  {
    icon: Handshake,
    title: "Partnership Deed",
    meta: "Value: PKR 2,000 to PKR 5,000",
    description:
      "Authorized stamp papers for registering business partnerships and joint venture agreements.",
    listLabel: "Common Applications",
    bullets: ["Partnership Registration", "Business Agreements", "LLP Documents"],
    linkLabel: "Requirement Details",
  },
  {
    icon: Landmark,
    title: "Bank Documentation",
    meta: "Value: Based on Loan Amount",
    description:
      "Stamp papers customized for banking facilities, loan agreements, and financial mortgages.",
    listLabel: "Common Applications",
    bullets: ["Loan Agreements", "Mortgage Deeds", "Guarantees", "Charge Forms"],
    linkLabel: "Requirement Details",
  },
  {
    icon: ShieldCheck,
    title: "Verification Services",
    meta: "Service Fee Only",
    description:
      "Official verification of existing E-stamp papers to ensure authenticity and validity via government portal.",
    listLabel: "Common Applications",
    bullets: ["Document Audit", "Verification Certificate", "Fraud Prevention Check"],
    linkLabel: "Requirement Details",
  },
];

const whyFeatures = [
  {
    icon: FileCheck2,
    title: "Accurate Challan Generation",
    text: "We handle the generation of 32-A Challans with the correct Head of Account to avoid payment errors.",
  },
  {
    icon: BadgeCheck,
    title: "Authenticity Verification",
    text: "Every e-stamp paper we issue is verified through the official FBR portal and stamped with our vendor mark.",
  },
  {
    icon: Clock3,
    title: "Same-Day Issuance",
    text: "If you bring the required documents before 12:00 PM, we can usually process your stamp paper on the same day.",
  },
];

const immediateOptions = [
  {
    icon: MapPin,
    title: "Visit Our Office",
    lines: ["Office 402, Business Tower, Blue", "Area, Islamabad"],
    actionLabel: "Get Directions",
    href: SITE.mapsUrl,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Us",
    lines: ["Instant replies for quick queries and", "checklist requests."],
    actionLabel: "Message Now",
    href: SITE.whatsappHref,
    featured: true,
  },
  {
    icon: Phone,
    title: "Call Now",
    lines: ["Talk to an agent about specific legal", "documentation needs."],
    actionLabel: "Call Support",
    href: SITE.phoneHref,
  },
  {
    icon: Clock,
    title: "Office Hours",
    lines: ["Open Mon-Fri 9:00 AM - 6:00 PM", "for all walk-in clients."],
    actionLabel: "View Schedule",
    href: "#hours",
  },
];

export default function EStampingPage() {
  return (
    <>
      <PageHero
        badge="Authorized Government Vendor"
        title="E-Stamp & Stamp Paper Services"
        description="Legally recognized judicial and non-judicial stamp papers for all your legal, property, and business requirements. Fast, verified, and professional processing at our Blue Area office."
        image={HERO_IMAGES.estamp}
        backLabel="Back to Home"
      />

      <div className="border-b border-red-100 bg-red-50">
        <div className="container-x py-5">
          <NoticeBar
            tone="warning"
            icon={Clock3}
            label="Pre-Visit Consultation Required"
            title="Pre-Visit Consultation Required"
            text="Stamp paper requirements vary significantly based on the purpose (e.g. Sale Deed, Affidavit, Rental Agreement). Please contact us before visiting to ensure you bring the correct documentation and CNIC."
            ctaLabel="Check Requirements"
            ctaHref={SITE.phoneHref}
            className="!border-0 !bg-transparent !p-0"
          />
        </div>
      </div>

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="section-title">Complete Stamp Paper Solutions</h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-800/60">
                We provide a comprehensive range of e-stamping services tailored
                for legal professionals, corporate entities, and private
                individuals.
              </p>
            </div>
            <Chip
              label="Total Services: 6"
              variant="outlined"
              sx={{
                borderColor: "rgba(11,29,56,.2)",
                color: "#0b1d38",
                fontWeight: 600,
                borderRadius: 999,
                px: 1,
              }}
            />
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stampServices.map((s) => (
              <ServiceCard key={s.title} {...s} linkVariant="button" />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        eyebrow="Institutional Standards"
        title="Why Professional E-Stamping Matters in Pakistan"
        paragraphs={[
          "The Government of Pakistan has transitioned to a digital E-Stamping system to prevent fraud and simplify verification. However, selecting the correct category, value, and challan details remains a complex task that requires precise legal knowledge.",
        ]}
        features={whyFeatures}
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80"
        imageAlt="E-stamp paper being processed by a documentation expert"
        imageTip="Ensure the stamp paper value matches the legal obligation it is intended to fulfill (per applicable laws)."
      >
        <div className="mt-8 flex gap-4 rounded-lg border border-navy-900/10 bg-navy-900 p-5 text-white">
          <FileSearch className="h-8 w-8 shrink-0 text-gold-400" />
          <p className="text-xs leading-relaxed text-white/75">
            <span className="font-bold text-white">LegalAssist Pakistan</span> is
            an authorized facilitator. We do not provide online delivery of stamp
            papers; all documents must be collected in person after verification.
          </p>
        </div>
      </SplitShowcase>

      <section className="bg-white py-20">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Immediate Assistance</h2>
            <p className="mt-4 text-sm text-navy-800/60">
              Get in touch with our document experts to confirm your requirements
              or navigate to our office for immediate processing.
            </p>
          </FadeIn>
          <div className="mt-12">
            <ContactCards items={immediateOptions} featuredFirst />
          </div>
        </div>
      </section>

      {/* checklist banner */}
      <section className="bg-navy-900 py-10">
        <div className="container-x flex flex-col items-center justify-between gap-5 sm:flex-row">
          <FadeIn>
            <h3 className="font-serif text-xl font-bold text-gold-400">Need a Document Checklist?</h3>
            <p className="mt-1 text-sm text-white/60">
              Don&apos;t risk multiple trips. Call us now and we&apos;ll tell you
              exactly what you need to bring for your specific stamp paper request.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <a href={SITE.phoneHref} className="btn-gold whitespace-nowrap">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
