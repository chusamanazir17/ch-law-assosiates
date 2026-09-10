"use client";

import { motion } from "framer-motion";
import {
  Gavel, FileSignature, KeySquare, ScrollText, Gift, MailWarning,
  BadgeCheck, Scale, Lock, Phone, MessageCircle, MapPin, Clock, Navigation, Info, ExternalLink,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const legalServices = [
  {
    icon: Gavel,
    title: "Affidavits & Oaths",
    description:
      "Expert drafting of general and specific affidavits, undertakings, and indemnity bonds for personal and official use.",
    tags: ["Court Work", "Oathe Commissioner", "Affidavits"],
  },
  {
    icon: FileSignature,
    title: "Power of Attorney",
    description:
      "General (GPA) and Special Power of Attorney (SPA) drafting and verification for overseas and local clients.",
    tags: ["POA", "Legal Representation", "Verification"],
  },
  {
    icon: KeySquare,
    title: "Rent Agreements",
    description:
      "Standardized residential and commercial lease agreements compliant with local tenant laws and stamp paper requirements.",
    tags: ["Real Estate", "Contracts", "Registration"],
  },
  {
    icon: ScrollText,
    title: "Succession Certificates",
    description:
      "Professional assistance in acquiring succession certificates from NADRA and civil courts for legal inheritance.",
    tags: ["Inheritance", "NADRA", "Family Law"],
  },
  {
    icon: Gift,
    title: "Gift Deeds",
    description:
      "Comprehensive drafting of Gift Deeds (Hiba) including the necessary legal declarations and witness attestations.",
    tags: ["Deeds", "Property Transfer", "Gifts"],
  },
  {
    icon: MailWarning,
    title: "Legal Notices",
    description:
      "Precise drafting of formal legal notices for civil matters, debt recovery, and contractual disputes.",
    tags: ["Disputes", "Notices", "Professional Draft"],
  },
];

const precisionFeatures = [
  {
    icon: BadgeCheck,
    title: "Verified Standards",
    text: "Every document we draft adheres strictly to the latest government gazette notifications and judicial formats.",
  },
  {
    icon: Scale,
    title: "Legal Accuracy",
    text: "Our internal review process ensures that all affidavits and powers of attorney are legally robust and enforceable.",
  },
  {
    icon: Lock,
    title: "Complete Privacy",
    text: "We handle sensitive personal and business documents with the highest level of confidentiality and professional ethics.",
  },
];

export default function LegalDocumentationPage() {
  return (
    <>
      <PageHero
        title="Legal Documentation"
        highlight="& Certification"
        image={HERO_IMAGES.legal}
        description="Expert assistance for affidavits, power of attorney, and statutory declarations. We ensure your legal documents are drafted with precision and compliant with Pakistani judicial standards."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/#services" },
          { label: "Legal Documentation" },
        ]}
      />

      {/* mandatory notice */}
      <div className="border-b border-navy-900/5 bg-[#eef1f6]">
        <div className="container-x flex flex-col items-start gap-4 py-5 sm:flex-row sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-300 bg-white text-red-500">
            <Info className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy-900">
              Mandatory Prerequisite Notice
            </p>
            <p className="mt-1 text-sm text-navy-800/65">
              Legal requirements vary significantly by case. Please contact us
              for a specific document checklist before visiting our office.
            </p>
          </div>
          <a href={SITE.phoneHref} className="btn-outline-navy shrink-0 py-2.5 text-xs">
            <Phone className="h-3.5 w-3.5" /> Call Now
          </a>
        </div>
      </div>

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn>
            <span className="inline-flex items-center rounded-full border border-navy-900/15 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-800/70 shadow-soft">
              Service Catalog
            </span>
            <h2 className="section-title mt-5">Comprehensive Documentation Services</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-800/60">
              We provide end-to-end support for a wide range of legal and
              administrative documentation needs across Pakistan.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {legalServices.map((s) => (
              <ServiceCard
                key={s.title}
                {...s}
                linkLabel="View Details"
                linkVariant="button"
              />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        bg="white"
        reverse
        title="Institutional Integrity & Expert Precision"
        paragraphs={[
          "In Pakistan's complex legal landscape, the difference between a valid document and a rejected one often lies in the fine print. Our documentation experts specialize in the nuances of Pakistani civil and administrative laws.",
        ]}
        features={precisionFeatures}
        image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Legal expert signing a certified document"
        badge={{ stat: "25+ Years", label: "Combined Legal Experience" }}
      >
        <a href={SITE.phoneHref} className="btn-navy mt-8">
          <ExternalLink className="h-4 w-4" /> View Procedure Guide
        </a>
      </SplitShowcase>

      {/* Immediate assistance */}
      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <FadeIn direction="right" className="rounded-lg bg-navy-900 p-9 text-white texture-grid lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold">Need Immediate Assistance?</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Our professional consultants are available for in-person meetings
              at our Blue Area office. No online applications are accepted to
              ensure maximum security and verification.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                { icon: Phone, label: "Direct Line", value: SITE.phone },
                { icon: MapPin, label: "Office Address", value: "Blue Area, Islamabad" },
                { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp },
                { icon: Clock, label: "Visiting Hours", value: "9 AM - 6 PM (Mon–Fri)" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-gold-400">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{c.label}</p>
                    <p className="mt-0.5 text-sm font-semibold">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                <Navigation className="h-4 w-4" /> Get Directions
              </a>
              <a href={SITE.phoneHref} className="btn-outline-light">
                Request Appointment
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15} className="lg:col-span-5">
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-white p-9 text-center shadow-card">
              <MotionPin />
              <h4 className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-900">
                Visit Our Blue Area Branch
              </h4>
              <p className="mt-3 text-xs leading-relaxed text-navy-800/60">
                Office 402, Business Tower, adjacent to prominent financial
                centers for your convenience.
              </p>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-navy mt-6 w-full py-2.5 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

function MotionPin() {
  return (
    <motion.span
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2.2 }}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/12 text-gold-600"
    >
      <MapPin className="h-8 w-8" />
    </motion.span>
  );
}
