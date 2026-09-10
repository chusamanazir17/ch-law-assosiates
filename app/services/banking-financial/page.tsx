"use client";

import {
  Landmark, Briefcase, FileSignature, Home, ShieldCheck, Coins,
  FileCheck2, FileBadge, CheckCircle2, Phone, MapPin,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import OfficeSection from "@/components/ui/OfficeSection";
import { HelpBanner } from "@/components/ui/ContactBlocks";
import { HERO_IMAGES, SITE } from "@/lib/site";

const bankingServices = [
  {
    icon: FileSignature,
    title: "Loan Documentation",
    description:
      "Legal drafting and verification of all documents required for Personal, Auto, and Home loans from private and government banks.",
    bullets: [
      "Personal Loan Agreements",
      "Auto Finance Contracts",
      "Home Loan (Mortgage) Deeds",
      "Debt Restructuring Papers",
    ],
    linkLabel: "Contact for Checklist",
  },
  {
    icon: Briefcase,
    title: "Corporate Finance Docs",
    description:
      "Specialized support for businesses seeking commercial financing, working capital loans, or equipment leasing.",
    bullets: [
      "Commercial Loan Agreements",
      "Charge Creation (Form 10/12)",
      "Bank Guarantees Support",
      "Hypothecation Deeds",
    ],
    linkLabel: "Contact for Checklist",
  },
  {
    icon: FileBadge,
    title: "Official Affidavits",
    description:
      "Provision and attestation of various financial affidavits required by banks for account opening or limit changes.",
    bullets: [
      "Source of Income Affidavit",
      "Loss of Cheque Book Forms",
      "Account Closure Certificates",
      "No-Objection Certificates (NOC)",
    ],
    linkLabel: "Contact for Checklist",
  },
  {
    icon: Home,
    title: "Mortgage & Registry",
    description:
      "Assistance with the legal registration of property as collateral for secure banking facilities and loans.",
    bullets: [
      "Equitable Mortgage Papers",
      "Registered Mortgage Deeds",
      "Property Title Verification",
      "Lien Marking Assistance",
    ],
    linkLabel: "Contact for Checklist",
  },
  {
    icon: ShieldCheck,
    title: "Guarantee Letters",
    description:
      "Legal preparation of personal and corporate guarantee letters ensuring they meet standard banking legal frameworks.",
    bullets: [
      "Personal Guarantee Forms",
      "Corporate Guarantee Deeds",
      "Indemnity Bonds",
      "Surety Documentation",
    ],
    linkLabel: "Contact for Checklist",
  },
  {
    icon: Coins,
    title: "Specialized Banking",
    description:
      "Documentation support for specialized banking services including Islamic Finance contracts and foreign currency accounts.",
    bullets: [
      "Islamic Finance Agreements",
      "Murabaha / Ijarah Contracts",
      "FX Account Documentation",
      "Letter of Credit Support",
    ],
    linkLabel: "Contact for Checklist",
  },
];

const requirements = [
  "Requirements vary significantly based on the specific bank and type of instrument.",
  "Original CNIC and relevant bank offer letters/term sheets are mandatory for all visits.",
  "Corporate clients must bring a certified copy of the Board Resolution for the authorized signatory.",
];

export default function BankingPage() {
  return (
    <>
      <PageHero
        badge="Financial Compliance & Legal Clarity"
        title="Banking & Financial Documentation"
        image={HERO_IMAGES.banking}
        description="Navigating the complexities of Pakistani financial regulations requires precision. We provide end-to-end documentation support for loans, guarantees, and corporate financial agreements."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/#services" },
          { label: "Banking & Finance" },
        ]}
      />

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <h2 className="section-title">Core Financial Services</h2>
            <p className="mt-5 text-sm leading-relaxed text-navy-800/60">
              Our specialists ensure that every document adheres to the latest
              State Bank of Pakistan (SBP) guidelines and local legal
              requirements, protecting your interests in every transaction.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bankingServices.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        bg="white"
        title="Expert Consultation for Complex Financial Instruments"
        paragraphs={[
          "The Pakistani banking sector is governed by rigorous documentation standards. Whether you are an individual applying for a home loan or a corporation restructuring debt, the validity of your contracts is paramount.",
          "LegalAssist Pakistan bridges the gap between financial institutions and clients by providing verified legal forms, accurately drafted agreements, and official attestation services that meet bank-specific requirements.",
        ]}
        features={[
          {
            icon: FileCheck2,
            title: "Authenticated Documentation",
            text: "All forms and agreements are reviewed for compliance with the latest SBP circulars.",
          },
          {
            icon: FileBadge,
            title: "Standardized Legal Forms",
            text: "Pre-vetted loan agreements, mortgage deeds, and guarantee instruments.",
          },
        ]}
        image="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Financial consultant reviewing banking documentation"
        quote={{
          text: "Precision in financial documentation is not just a requirement; it is the foundation of institutional trust and individual security.",
          author: "Legal Advisory Team, LegalAssist Pakistan",
        }}
      />

      {/* Before you visit */}
      <section id="contact" className="relative overflow-hidden bg-navy-900 py-20 texture-grid">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <FadeIn direction="right" className="lg:col-span-2">
            <span className="eyebrow">
              <CheckCircle2 className="h-3.5 w-3.5" /> Required Preparation
            </span>
            <h2 className="mt-5 font-serif text-3xl font-bold text-white">
              Before You Visit Our Office
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
              Banking requirements in Pakistan are subject to frequent changes
              based on government policy. To ensure we can process your request
              in a single visit, please note:
            </p>

            <ul className="mt-8 space-y-5">
              {requirements.map((r, i) => (
                <FadeIn key={r} delay={i * 0.1} direction="right">
                  <li className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/50 text-gold-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-relaxed text-white/75">{r}</p>
                  </li>
                </FadeIn>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-4">
              <a href={SITE.phoneHref} className="btn-gold">
                <Phone className="h-4 w-4" /> Call for Checklist
              </a>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-light"
              >
                <MapPin className="h-4 w-4" /> View Office Map
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <div className="flex h-full flex-col justify-center rounded-lg border border-white/10 bg-white/[0.04] p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-400">Contact Hotline</p>
              <p className="mt-2 text-xl font-bold text-white">{SITE.phone}</p>
              <div className="my-6 h-px bg-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-400">WhatsApp Support</p>
              <p className="mt-2 text-xl font-bold text-white">{SITE.whatsapp}</p>
              <p className="mt-6 text-[11px] leading-relaxed text-white/45">
                Our experts are available for preliminary phone consultations
                between 10:00 AM and 4:00 PM.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <OfficeSection
        title="Visit Us for Professional Service"
        text="No online applications. All legal financial documentation must be processed physically to ensure authenticity and legal validity."
      />
      <HelpBanner />
    </>
  );
}
