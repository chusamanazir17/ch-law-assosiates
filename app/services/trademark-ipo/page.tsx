"use client";

import { motion } from "framer-motion";
import {
  Stamp, Search, RefreshCw, Copyright, Lightbulb, MessageSquareWarning,
  BadgeCheck, PenLine, Gauge, CalendarClock, Phone, MessageCircle, Clock, MapPin,
  Navigation, ExternalLink, Scale, Award, Globe2, Info,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ServiceCard from "@/components/ui/ServiceCard";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const ipServices = [
  {
    icon: Stamp,
    title: "Brand Trademark Filing",
    description:
      "Protection for brand names, logos, and taglines. Includes application drafting and IPO Pakistan registry submission.",
    linkLabel: "View Detail",
  },
  {
    icon: Search,
    title: "IPO Search Reports",
    description:
      "In-depth search across all trademark classes to ensure your brand name is unique and available for registration.",
    linkLabel: "View Detail",
  },
  {
    icon: RefreshCw,
    title: "IP Renewal Management",
    description:
      "Automated tracking and processing of trademark renewals to ensure your legal protection never lapses.",
    linkLabel: "View Detail",
  },
  {
    icon: Copyright,
    title: "Copyright Registration",
    description:
      "Legal protection for artistic works, software, literature, and architectural designs under Pakistani law.",
    linkLabel: "View Detail",
  },
  {
    icon: Lightbulb,
    title: "Patent Advisory",
    description:
      "Consultation and documentation for filing registrations of innovative patent applications with the IPO.",
    linkLabel: "View Detail",
  },
  {
    icon: MessageSquareWarning,
    title: "Registry Objection Handling",
    description:
      "Expert assistance in drafting replies to IPO show-cause notices and attending registry hearings.",
    linkLabel: "View Detail",
  },
];

const strategyFeatures = [
  { icon: BadgeCheck, title: "IPO Pakistan Compliance" },
  { icon: Gauge, title: "Expedited Search Reports" },
  { icon: PenLine, title: "Expert Legal Drafting" },
  { icon: CalendarClock, title: "Renewal Management" },
];

const trustStrip = [
  { icon: BadgeCheck, label: "Authorized" },
  { icon: Scale, label: "Compliant" },
  { icon: Award, label: "Certified" },
  { icon: Globe2, label: "Nationwide" },
];

export default function TrademarkIpoPage() {
  return (
    <>
      <PageHero
        badge="Intellectual Property Protection"
        title="Trademark & IPO Registration Services"
        image={HERO_IMAGES.trademark}
        description="Protect your brand identity and corporate assets with Pakistan's premier IP documentation experts. We provide comprehensive support for IPO filings and Trademark Registry processes with guaranteed compliance."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Trademark & IPO" },
        ]}
      />

      {/* Strategy split */}
      <section className="bg-white py-20">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn direction="right">
            <h2 className="section-title">Strategic Intellectual Property Management</h2>
            <p className="mt-5 text-sm leading-relaxed text-navy-800/65">
              In Pakistan&apos;s competitive market, securing your trademarks and
              patents is not just a legal requirement but a strategic necessity.
              Our firm acts as a bridge between businesses and the Intellectual
              Property Organization (IPO) of Pakistan, ensuring that your
              applications are drafted with precision.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/65">
              We specialize in the complete lifecycle of IP protection, from
              initial search and filing to responding to registry objections and
              handling renewals. Our experts ensure your brand remains your
              exclusive asset.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {strategyFeatures.map((f) => (
                <div key={f.title} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gold-400/50 text-gold-600">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-navy-900">{f.title}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-lg shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80"
                alt="Trademark certificate and legal scales"
                className="h-[420px] w-full object-cover"
              />
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Mandatory pre-visit */}
      <section className="bg-navy-900 py-12 texture-grid">
        <div className="container-x flex flex-col items-start gap-6 lg:flex-row lg:items-center">
          <FadeIn direction="right" className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-400">
              <Info className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Mandatory Pre-Visit Notice</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
                Trademark and IPO requirements vary significantly based on your
                industry, business type, and registration category. To ensure
                efficiency and avoid multiple trips, you must contact our office
                to receive a customized document checklist before your physical
                visit.
              </p>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.1} className="flex shrink-0 flex-wrap gap-3 lg:ml-auto">
            <a href={SITE.phoneHref} className="btn-gold py-2.5 text-xs">
              <Phone className="h-3.5 w-3.5" /> Call for Checklist
            </a>
            <a href="#ip-services" className="btn-outline-light py-2.5 text-xs">
              Learn Requirements
            </a>
          </FadeIn>
        </div>
      </section>

      {/* IP services */}
      <section id="ip-services" className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Our Specialized IP Services</h2>
            <p className="mt-4 text-sm text-navy-800/60">
              Comprehensive solutions designed for startups, SMEs, and large
              corporations looking to protect their identity within the
              Pakistani legal framework.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ipServices.map((s) => (
              <ServiceCard key={s.title} {...s} linkVariant="button" />
            ))}
          </Stagger>
        </div>
      </section>

      {/* Connect with experts */}
      <section className="bg-white py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <FadeIn direction="right">
            <h2 className="section-title">Connect with Our Experts</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-800/60">
              Our specialized IP consultants are available for one-on-one
              sessions. Please use the following channels to schedule your
              appointment.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Phone, label: "Primary Support", title: "Call Now", value: SITE.phone },
                { icon: MessageCircle, label: "Quick Response", title: "WhatsApp Us", value: SITE.whatsapp },
                { icon: Clock, label: "Mon – Fri", title: "Working Hours", value: "9:00 AM - 6:00 PM" },
                { icon: MapPin, label: "Office 402", title: "Visit Location", value: "Blue Area, Islamabad" },
              ].map((c, i) => (
                <FadeIn key={c.title} delay={i * 0.08}>
                  <div className="flex h-full items-start gap-4 rounded-lg border border-navy-900/8 bg-white p-5 shadow-soft">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/12 text-gold-600">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-medium text-navy-800/45">{c.label}</p>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-navy-900">{c.title}</p>
                      <p className="mt-0.5 text-xs font-semibold text-gold-600">{c.value}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <div className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
                alt="LegalAssist headquarters"
                className="h-[440px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
              <div className="absolute inset-x-6 bottom-6">
                <div className="flex items-center gap-3 rounded-lg bg-white/95 px-5 py-4 backdrop-blur">
                  <MapPin className="h-5 w-5 text-gold-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-800/50">LegalAssist Headquarters</p>
                    <p className="text-xs font-bold text-navy-900">Business Tower, Blue Area</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded bg-navy-900 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-navy-800">
                    <Navigation className="h-3.5 w-3.5" /> Get Directions
                  </a>
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded border border-white/50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white/10">
                    <ExternalLink className="h-3.5 w-3.5" /> View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* trust strip */}
      <section className="border-y border-navy-900/8 bg-[#f5f7fa] py-8">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {trustStrip.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <t.icon className="h-5 w-5 text-navy-900" />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-navy-900">{t.label}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
