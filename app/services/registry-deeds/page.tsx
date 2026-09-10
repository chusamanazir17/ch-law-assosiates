"use client";

import { motion } from "framer-motion";
import {
  FileSignature, Gift, FileKey, FileSearch, Landmark, CopyCheck,
  PenLine, ShieldCheck, Scale, ArchiveRestore, Phone, MessageCircle, MapPin, Home,
  Clock, Navigation, Info,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const registryServices = [
  {
    icon: FileSignature,
    title: "Sale Deed (Baye Nama)",
    description:
      "Complete legal transfer of ownership rights from seller to buyer including drafting and registration.",
    linkLabel: "View Process Detail",
  },
  {
    icon: Gift,
    title: "Gift Deed (Hiba Nama)",
    description:
      "Documentation and official recording of property transferred as a gift to family members or others.",
    linkLabel: "View Process Detail",
  },
  {
    icon: FileKey,
    title: "Power of Attorney",
    description:
      "Authorized registration of General or Special Power of Attorney for property management and legal acts.",
    linkLabel: "View Process Detail",
  },
  {
    icon: FileSearch,
    title: "Title Search & Verification",
    description:
      "Exhaustive verification of property records from the Sub-Registrar and Revenue offices.",
    linkLabel: "View Process Detail",
  },
  {
    icon: Landmark,
    title: "Mortgage Deed",
    description:
      "Official registration of property as collateral for loans with banks and financial institutions.",
    linkLabel: "View Process Detail",
  },
  {
    icon: CopyCheck,
    title: "Certified Copies (Nakal)",
    description:
      "Procurement of officially attested copies of previously registered deeds from government archives.",
    linkLabel: "View Process Detail",
  },
];

const whyFeatures = [
  {
    icon: PenLine,
    title: "Drafting Precision",
    text: "Our experts draft Sale Deeds, Gift Deeds, and Power of Attorneys with legal accuracy.",
  },
  {
    icon: ShieldCheck,
    title: "Title Verification",
    text: "We ensure the property title is clear from encumbrances before proceeding.",
  },
  {
    icon: Scale,
    title: "Regulatory Compliance",
    text: "Complete adherence to local transfer and registration laws to avoid future complications.",
  },
  {
    icon: ArchiveRestore,
    title: "Record Maintenance",
    text: "Assistance in obtaining official certified copies (Nakal) from the Revenue Department.",
  },
];

const expertCards = [
  { icon: Phone, title: "Call Now", value: SITE.phone, action: "Dial Support", href: SITE.phoneHref, solid: "navy" as const },
  { icon: MessageCircle, title: "WhatsApp Us", value: SITE.whatsapp, action: "Chat with Expert", href: SITE.whatsappHref, solid: "gold" as const },
  { icon: MapPin, title: "Get Directions", value: "Blue Area, Islamabad", action: "Open Maps", href: SITE.mapsUrl },
  { icon: Home, title: "Visit Our Office", value: "Suite 402, Business Tower", action: "See Schedule", href: "#office" },
];

export default function RegistryDeedsPage() {
  return (
    <>
      <PageHero
        badge="Official Property Recordings"
        title="Registry & Deeds"
        image={HERO_IMAGES.registry}
        description="Authorized legal assistance for the registration of property documents, sale deeds, and title records. We ensure your ownership is legally secured and officially documented."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Registry & Deeds" },
        ]}
      />

      {/* info strip */}
      <div className="bg-navy-900">
        <div className="container-x flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-400">
            <Info className="h-4 w-4" />
          </span>
          <p className="flex-1 text-xs leading-relaxed text-white/75">
            <span className="font-bold text-white">Important:</span> Requirements
            vary by district and transaction type. Contact us for a specific
            checklist before visiting.
          </p>
          <a href={SITE.phoneHref} className="inline-flex shrink-0 items-center gap-2 rounded bg-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-navy-900 transition hover:bg-gold-400 hover:text-white">
            <Phone className="h-3.5 w-3.5" /> Call for Checklist
          </a>
        </div>
      </div>

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <h2 className="section-title">Official Services in this Category</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/60">
              We provide end-to-end facilitation for various types of property
              and legal registrations under the Registration Act.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {registryServices.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        bg="white"
        eyebrow="Professional Guidance"
        title="Why Professional Assistance Matters for Registry & Deeds"
        paragraphs={[
          "The process of registering property documents in Pakistan involves complex legal requirements, including correct valuation, e-stamping, and physical appearance before the Sub-Registrar. Errors in document drafting or insufficient stamp duties can lead to legal disputes or financial penalties.",
        ]}
        features={whyFeatures}
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Official registry building"
        reverse
        badge={{ stat: "15+ Years", label: "Experience in Registry Services" }}
      />

      {/* Connect */}
      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">Connect with our Registry Experts</h2>
            <p className="mt-4 text-sm text-navy-800/60">
              Our office is centrally located to serve clients efficiently. Reach
              out via any of the channels below for immediate assistance.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {expertCards.map((c) => (
              <motion.div
                key={c.title}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center rounded-lg border border-navy-900/8 bg-white p-7 text-center shadow-soft transition-shadow hover:shadow-card-hover"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/12 text-gold-600">
                  <c.icon className="h-5 w-5" />
                </span>
                <h4 className="text-sm font-bold text-navy-900">{c.title}</h4>
                <p className="mt-1.5 text-xs text-navy-800/55">{c.value}</p>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`mt-5 w-full rounded px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                    c.solid === "navy"
                      ? "bg-navy-900 text-white hover:bg-navy-800"
                      : c.solid === "gold"
                        ? "bg-gold-400 text-white hover:bg-gold-500"
                        : "border border-navy-900/20 text-navy-900 hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                  }`}
                >
                  {c.action}
                </a>
              </motion.div>
            ))}
          </Stagger>

          {/* Principal office */}
          <div id="office" className="mt-14 grid overflow-hidden rounded-lg border border-navy-900/8 bg-white shadow-card lg:grid-cols-2">
            <FadeIn direction="right" className="p-9">
              <h3 className="font-serif text-xl font-bold text-navy-900">Our Principal Office</h3>
              <div className="mt-6 space-y-5">
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                  <p className="text-sm leading-relaxed text-navy-800/65">{SITE.address}.</p>
                </div>
                <div className="flex gap-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                  <div className="text-sm leading-relaxed text-navy-800/65">
                    <p className="font-semibold text-navy-900">Public Dealing Hours</p>
                    <p className="mt-1">Monday – Friday: 9:00 AM – 6:00 PM</p>
                    <p>Saturday: 10:00 AM – 2:00 PM (By Appointment Only)</p>
                  </div>
                </div>
              </div>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-navy mt-8">
                <Navigation className="h-4 w-4" /> Get Directions on Google Maps
              </a>
            </FadeIn>
            <FadeIn direction="left" delay={0.15}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="LegalAssist principal office in Islamabad"
                className="h-72 w-full object-cover lg:h-full"
              />
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
