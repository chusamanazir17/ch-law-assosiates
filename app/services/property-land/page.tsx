"use client";

import {
  FileSignature, Send, SearchCheck, Landmark, ScrollText, FileKey,
  ShieldCheck, PenLine, Phone, MessageCircle, MapPin, Navigation, AlertTriangle,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import NoticeBar from "@/components/ui/NoticeBar";
import ServiceCard from "@/components/ui/ServiceCard";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const propertyServices = [
  {
    icon: FileSignature,
    title: "Sale Deed Documentation",
    description:
      "Complete legal drafting and processing of Sale Deeds (Baya-Nama) for residential and commercial plots.",
    linkLabel: "In-Person Inquiry",
  },
  {
    icon: Send,
    title: "Transfer Letter Services",
    description:
      "End-to-end facilitation for transfer of allotment letters in CDA, LDA, and private housing societies.",
    linkLabel: "In-Person Inquiry",
  },
  {
    icon: SearchCheck,
    title: "Legal Search Reports",
    description:
      "Thorough verification of property titles, non-encumbrance certificates (NEC), and history of ownership.",
    linkLabel: "In-Person Inquiry",
  },
  {
    icon: Landmark,
    title: "Registry & Attestation",
    description:
      "Authorized assistance for property registration before the Sub-Registrar and official stamp duty processing.",
    linkLabel: "In-Person Inquiry",
  },
  {
    icon: ScrollText,
    title: "Succession Certificates",
    description:
      "Legal support for obtaining succession and heirship certificates for property inheritance matters.",
    linkLabel: "In-Person Inquiry",
  },
  {
    icon: FileKey,
    title: "Power of Attorney",
    description:
      "Drafting and registration of General (GPA) and Special (SPA) Power of Attorney for property management.",
    linkLabel: "In-Person Inquiry",
  },
];

export default function PropertyLandPage() {
  return (
    <>
      <PageHero
        badge="Real Estate & Documentation"
        title="Property & Land Services"
        image={HERO_IMAGES.property}
        description="Expert assistance for property transfers, title verification, registry documentation, and legal searches across Islamabad and major districts of Pakistan."
        backLabel="Back to Home"
      />

      {/* Secure assets split */}
      <section className="bg-white py-20">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn direction="right">
            <h2 className="section-title title-underline">
              Secure Your Property Assets with Legal Precision
            </h2>
            <p className="mt-8 text-sm leading-relaxed text-navy-800/65">
              In Pakistan, property transactions demand meticulous attention to
              detail to prevent future disputes. LegalAssist provides a
              specialized team dedicated to the rigorous verification of land
              titles, e-stamping, and the preparation of comprehensive sale
              deeds.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/65">
              We bridge the gap between clients and government authorities
              (Patwari, CDA, LDA, etc.), ensuring every document complies with
              current provincial laws and regulatory standards. Our goal is
              absolute transparency and protection for your investment.
            </p>

            <div className="mt-9 grid gap-7 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Authentic Verification",
                  text: "Verification from relevant land record authorities.",
                },
                {
                  icon: PenLine,
                  title: "Expert Drafting",
                  text: "Legal drafting of Sale Deeds, Lease, and Gift Deeds.",
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gold-400/50 text-gold-600">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-900">
                      {f.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-navy-800/60">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <div className="relative">
              <div className="absolute -right-4 -top-4 h-full w-full rounded-lg border-2 border-gold-400/50" />
              <div className="relative overflow-hidden rounded-lg shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80"
                  alt="Property sale deed documentation"
                  className="h-[420px] w-full object-cover"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <h2 className="section-title">Our Specialized Property Services</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/60">
              We provide a full range of documentation and search services to
              ensure your property matters are handled with institutional
              excellence.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propertyServices.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </Stagger>
        </div>
      </section>

      {/* Notice */}
      <section className="bg-white pb-16 pt-2">
        <div className="container-x">
          <NoticeBar
            tone="danger"
            icon={AlertTriangle}
            label="Essential Visit Notice"
            title="Essential Visit Notice"
            text="Requirements for property transfers and registry vary significantly based on the area, district, and specific nature of the transaction. Please contact our office for a customized document checklist before planning your visit."
            ctaLabel="Get My Checklist"
            ctaHref={SITE.phoneHref}
          />
        </div>
      </section>

      {/* Consultation */}
      <section id="contact" className="relative overflow-hidden bg-navy-900 py-20 texture-grid">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <FadeIn direction="right">
            <h2 className="font-serif text-3xl font-bold text-white">
              Schedule a Professional Consultation
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Our consultants are available for in-person meetings at our Blue
              Area office. We recommend booking an appointment to ensure
              dedicated time for your complex property documentation needs.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
                <Phone className="h-6 w-6 text-gold-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Direct Line</p>
                <p className="mt-1 text-sm font-semibold text-white">{SITE.phone}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
                <MessageCircle className="h-6 w-6 text-gold-400" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">WhatsApp Support</p>
                <p className="mt-1 text-sm font-semibold text-white">{SITE.whatsapp}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#office" className="btn-gold">
                <MapPin className="h-4 w-4" /> Visit Our Office
              </a>
              <a href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <div className="rounded-lg bg-white p-8 shadow-card-hover">
              <h3 className="font-serif text-xl font-bold text-navy-900">Location &amp; Directions</h3>
              <div className="my-6 h-px bg-navy-900/10" />
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/[0.05] text-navy-900">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-800/45">Office Address</p>
                    <p className="mt-1 text-sm text-navy-800/75">{SITE.address}.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900/[0.05] text-navy-900">
                    <Navigation className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-800/45">Near Landmark</p>
                    <p className="mt-1 text-sm text-navy-800/75">
                      Opposite Saudi-Pak Tower, Jinnah Avenue.
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-navy mt-8 w-full"
              >
                <Navigation className="h-4 w-4" /> Get Directions on Google Maps
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
