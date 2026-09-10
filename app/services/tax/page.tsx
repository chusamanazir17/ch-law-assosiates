"use client";

import { motion } from "framer-motion";
import {
  ContactRound, FileSpreadsheet, TrendingUp, BadgePercent, FileSearch2, Building2,
  ShieldCheck, Receipt, Info, Phone, MapPin, Clock, ChevronRight,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SplitShowcase from "@/components/ui/SplitShowcase";
import { ConsultationPanel } from "@/components/ui/ContactBlocks";
import FadeIn from "@/components/motion/FadeIn";
import { staggerContainer, staggerItem } from "@/components/motion/Stagger";
import { HERO_IMAGES, SITE } from "@/lib/site";

const taxServices = [
  {
    icon: ContactRound,
    title: "NTN Registration",
    description:
      "Issuance of National Tax Number for individuals, freelancers, and businesses with Iris FBR portal setup.",
  },
  {
    icon: FileSpreadsheet,
    title: "Income Tax Filing",
    description:
      "Annual and wealth statement filing for salaried persons and business individuals to become Active Taxpayers.",
  },
  {
    icon: TrendingUp,
    title: "Sales Tax Registration",
    description:
      "STRN registration for manufacturers, importers, and retailers under the Sales Tax Act 1990.",
  },
  {
    icon: BadgePercent,
    title: "Tax Exemption Certificates",
    description:
      "Documentation and application for withholding tax exemptions and specific industrial certificates.",
  },
  {
    icon: FileSearch2,
    title: "FBR Audit Response",
    description:
      "Professional drafting and representation for notices received under section 177 or 214C of Income Tax Ordinance.",
  },
  {
    icon: Building2,
    title: "Chamber Membership",
    description:
      "Complete documentation for Islamabad/Rawalpindi Chamber of Commerce and Industry membership.",
  },
];

export default function TaxPage() {
  return (
    <>
      <PageHero
        badge=""
        title="Tax Services"
        image={HERO_IMAGES.tax}
        description="Expert tax consultancy and documentation services for individuals and corporations in Pakistan. We simplify FBR compliance so you can focus on growth."
        backLabel="Back to Services"
        backHref="/"
      />

      <SplitShowcase
        bg="white"
        eyebrow="Institutional Excellence"
        title="Why Professional Tax Assistance Matters"
        paragraphs={[
          "Navigating the Federal Board of Revenue (FBR) regulations in Pakistan requires precision and up-to-date knowledge of the current Finance Act. Incorrect filings or missed deadlines can result in heavy penalties and legal complications.",
          "LegalAssist Pakistan provides a bridge between complex tax laws and your financial peace of mind. Our team of certified consultants ensures that every document is verified, every exemption is explored, and every submission is timely.",
        ]}
        features={[
          {
            icon: ShieldCheck,
            title: "Fully Compliant",
            text: "Adhering strictly to latest FBR guidelines and legal frameworks.",
          },
          {
            icon: Receipt,
            title: "Transparent Fee",
            text: "Fixed service charges with no hidden consultancy costs.",
          },
        ]}
        image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Tax consultant advising a client"
      />

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Our Tax Service Portfolio</h2>
            <p className="mt-4 text-sm text-navy-800/60">
              Comprehensive solutions for individuals, freelancers, and
              small-to-medium enterprises seeking professional documentation
              support.
            </p>
          </FadeIn>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {taxServices.map((s) => (
              <motion.div
                key={s.title}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group relative flex h-full flex-col rounded-lg border border-navy-900/8 bg-white p-7 shadow-soft transition-shadow hover:shadow-card-hover"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-600 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900/[0.04] text-navy-900 transition-colors duration-300 group-hover:bg-navy-900 group-hover:text-gold-400">
                  <s.icon size={22} />
                </div>
                <h3 className="mb-2.5 text-lg font-bold text-navy-900">{s.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-navy-800/65">{s.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-navy-900/8 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-600">
                    Official Processing
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-navy-900/20 text-navy-800 transition group-hover:border-gold-500 group-hover:bg-gold-400 group-hover:text-white">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mandatory notice */}
          <FadeIn className="mt-14">
            <div className="flex flex-col items-start gap-5 rounded-lg border-2 border-navy-900/10 bg-white p-8 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                <Info className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-navy-900">
                  Mandatory Requirement Notice
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-800/65">
                  Tax documentation requirements in Pakistan vary significantly
                  based on your source of income (Salary, Business, Property, or
                  Foreign Remittance). <strong>Please contact our office to
                  receive a customized document checklist before your physical
                  visit.</strong> This ensures we can finalize your application
                  in a single session.
                </p>
                <a href={SITE.phoneHref} className="btn-outline-navy mt-5 py-2.5 text-xs">
                  <Phone className="h-3.5 w-3.5" /> Request Checklist: {SITE.phone}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <ConsultationPanel
        title="Schedule Your Consultation"
        text="Our Blue Area office is open Monday through Saturday for walk-in consultations and pre-scheduled appointments. Get your tax matters sorted with authorized experts."
        bullets={[
          { icon: MapPin, label: "Office Location", value: "4th Floor, Business Tower, Blue Area" },
          { icon: Phone, label: "Helpline", value: `${SITE.phone} | Mon–Fri 9am–6pm` },
        ]}
      />
    </>
  );
}
