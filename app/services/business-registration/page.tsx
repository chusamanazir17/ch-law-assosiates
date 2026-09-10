"use client";

import { motion } from "framer-motion";
import {
  Building2, User, Handshake, ReceiptText, Globe2, FileBadge,
  BadgeCheck, PiggyBank, Network, UserCog, Phone, MessageCircle, MapPin, Clock, Navigation, AlertTriangle, ClipboardCheck,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ServiceCard from "@/components/ui/ServiceCard";
import SplitShowcase from "@/components/ui/SplitShowcase";
import Stagger from "@/components/motion/Stagger";
import FadeIn from "@/components/motion/FadeIn";
import { HERO_IMAGES, SITE } from "@/lib/site";

const registrationServices = [
  {
    icon: Building2,
    title: "SECP Incorporation",
    description:
      "Complete handling of Private Limited (Pvt. Ltd.) and Single Member Company (SMC) registration with the SECP, including MOA and AOA drafting.",
    linkLabel: "View Requirements",
  },
  {
    icon: User,
    title: "Sole Proprietorship",
    description:
      "Fast-track registration of individual business entities with FBR and relevant municipal authorities to get your business operational instantly.",
    linkLabel: "View Requirements",
  },
  {
    icon: Handshake,
    title: "Partnership Deeds",
    description:
      "Professional drafting and official registration of partnership deeds (Firm Registration) with the Registrar of Firms in your district.",
    linkLabel: "View Requirements",
  },
  {
    icon: ReceiptText,
    title: "NTN & Sales Tax (GST)",
    description:
      "Assistance with FBR National Tax Number (NTN) registration and Sales Tax (GST/SRB) certification for both individuals and firms.",
    linkLabel: "View Requirements",
  },
  {
    icon: Globe2,
    title: "Chamber of Commerce",
    description:
      "Membership processing for Islamabad, Rawalpindi, and other major Chambers of Commerce to facilitate trade and official networking.",
    linkLabel: "View Requirements",
  },
  {
    icon: FileBadge,
    title: "Trade License (DMC/CDA)",
    description:
      "Acquisition of required trade licenses and professional tax certificates from local municipal corporations and development authorities.",
    linkLabel: "View Requirements",
  },
];

const whyFeatures = [
  {
    icon: BadgeCheck,
    title: "Full Compliance",
    text: "Adherence to Companies Act 2017 and latest FBR guidelines.",
  },
  {
    icon: PiggyBank,
    title: "Tax Optimization",
    text: "Structure your business to benefit from available tax incentives.",
  },
  {
    icon: Network,
    title: "Global Standards",
    text: "Documentation ready for international trade and investment.",
  },
  {
    icon: UserCog,
    title: "Expert Counsel",
    text: "Dedicated consultants for post-registration compliance.",
  },
];

export default function BusinessRegistrationPage() {
  return (
    <>
      <PageHero
        badge=""
        title="Business Registration"
        description="Legitimize your enterprise with Pakistan's most trusted corporate documentation firm. From SECP incorporations to sole proprietorships, we handle the complexity while you build your vision."
        image={HERO_IMAGES.business}
        primaryCta={{ label: "Call for Consultation", href: SITE.phoneHref }}
      />

      <section className="bg-[#f5f7fa] py-20">
        <div className="container-x">
          <FadeIn className="max-w-2xl">
            <h2 className="section-title">Our Core Registration Services</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/60">
              We provide end-to-end support for all business structures in
              Pakistan. Our experts ensure your registration complies with the
              latest government regulations and FBR requirements.
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {registrationServices.map((s) => (
              <ServiceCard key={s.title} {...s} linkVariant="button" />
            ))}
          </Stagger>
        </div>
      </section>

      <SplitShowcase
        bg="white"
        eyebrow="Institutional Excellence"
        title="Why Professional Registration Matters"
        paragraphs={[
          "Registering a business in Pakistan requires navigating multiple regulatory bodies including the Securities and Exchange Commission of Pakistan (SECP), Federal Board of Revenue (FBR), and provincial trade chambers.",
          "LegalAssist Pakistan provides a seamless bridge between your entrepreneurial goals and governmental compliance. We ensure that every document, from the Memorandum of Association to NTN registration, is processed with surgical precision.",
        ]}
        features={whyFeatures}
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Certificate of incorporation document"
        imageFrame
      />

      {/* Mandatory notice + gold contact split */}
      <section className="bg-[#f5f7fa] pb-20">
        <div className="container-x grid overflow-hidden rounded-lg shadow-card lg:grid-cols-3">
          <FadeIn direction="right" className="bg-navy-900 p-9 text-white texture-grid lg:col-span-2">
            <span className="eyebrow">
              <AlertTriangle className="h-3.5 w-3.5" /> Mandatory Notice
            </span>
            <h2 className="mt-5 font-serif text-2xl font-bold">
              Requirements Vary by Business Sector
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
              Government regulations for business registration are subject to
              frequent updates based on the nature of your industry and chosen
              legal structure.
            </p>
            <div className="mt-7 border-l-[3px] border-gold-400 bg-white/[0.05] py-4 pl-5 pr-4">
              <p className="text-xs italic leading-relaxed text-white/80">
                &ldquo;We strongly advise all prospective clients to contact our
                experts for a personalized document checklist before visiting the
                office.&rdquo;
              </p>
            </div>
            <a href={SITE.phoneHref} className="btn-gold mt-7">
              <ClipboardCheck className="h-4 w-4" /> Get My Checklist
            </a>
          </FadeIn>

          <FadeIn direction="left" delay={0.15} className="bg-gold-400 p-9 text-white">
            <h3 className="font-serif text-xl font-bold">Contact Us Directly</h3>
            <ul className="mt-7 space-y-6">
              <li className="flex gap-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Direct Line</p>
                  <p className="mt-0.5 text-sm font-semibold">{SITE.phone}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">WhatsApp</p>
                  <p className="mt-0.5 text-sm font-semibold">{SITE.whatsapp}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Islamabad Office</p>
                  <p className="mt-0.5 text-sm font-semibold">Office 402, Business Tower</p>
                </div>
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Corporate office + map */}
      <section className="bg-white py-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <FadeIn direction="right">
            <h2 className="section-title">Visit Our Corporate Office</h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-800/65">
              Located in the premier business district of Islamabad, our office
              provides a professional environment for all your documentation
              needs.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-900">Corporate Address</h4>
                  <p className="mt-1 text-sm text-navy-800/65">
                    Office 402, 4th Floor, Business Tower, Blue Area, Islamabad, 44000, Pakistan
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-900">Office Hours</h4>
                  <p className="mt-1 text-sm text-navy-800/65">
                    Monday – Friday: 9:00 AM – 6:00 PM<br />
                    Saturday: 10:00 AM – 2:00 PM (By Appointment Only)
                  </p>
                </div>
              </div>
            </div>

            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-navy mt-9">
              <Navigation className="h-4 w-4" /> Get Directions on Google Maps
            </a>
          </FadeIn>

          <FadeIn direction="left" delay={0.15}>
            <div className="relative flex h-[380px] items-center justify-center overflow-hidden rounded-lg bg-navy-900/[0.04] p-8">
              <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(11,29,56,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(11,29,56,.4) 1px,transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
              <MapCard />
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

/* small inline motion map card */
function MapCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-card-hover"
    >
      <motion.span
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/12 text-gold-600"
      >
        <MapPin className="h-7 w-7" />
      </motion.span>
      <h4 className="mt-4 font-serif text-lg font-bold text-navy-900">Interactive Map</h4>
      <p className="mt-2 text-xs leading-relaxed text-navy-800/60">
        View our precise location in Blue Area and plan your visit.
      </p>
      <a
        href={SITE.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline-navy mt-5 w-full py-2.5 text-xs"
      >
        Open in Browser
      </a>
    </motion.div>
  );
}
