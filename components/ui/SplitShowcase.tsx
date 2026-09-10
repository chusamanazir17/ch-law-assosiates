"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Quote } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

export type ShowcaseFeature = {
  icon: LucideIcon;
  title: string;
  text: string;
};

type SplitShowcaseProps = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  features?: ShowcaseFeature[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
  imageTip?: string;
  badge?: { stat: string; label: string };
  quote?: { text: string; author: string };
  children?: React.ReactNode;
  bg?: "white" | "gray";
  imageFrame?: boolean;
};

export default function SplitShowcase({
  eyebrow,
  title,
  paragraphs,
  features = [],
  image,
  imageAlt,
  reverse = false,
  imageTip,
  badge,
  quote,
  children,
  bg = "gray",
  imageFrame = false,
}: SplitShowcaseProps) {
  return (
    <section className={`${bg === "gray" ? "bg-[#f5f7fa]" : "bg-white"} py-20`}>
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image column */}
        <FadeIn direction={reverse ? "left" : "right"} className={reverse ? "lg:order-2" : ""}>
          <div className="relative">
            {imageFrame && (
              <div className="absolute -left-4 -top-4 h-full w-full rounded-lg border-2 border-gold-400/50" />
            )}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-lg shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={imageAlt} className="h-[380px] w-full object-cover sm:h-[440px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
            </motion.div>

            {imageTip && (
              <div className="absolute bottom-5 right-5 max-w-[220px] rounded-lg bg-navy-900/95 p-5 text-xs italic leading-relaxed text-white/85 shadow-card-hover backdrop-blur">
                <Quote className="mb-2 h-4 w-4 text-gold-400" />
                {imageTip}
              </div>
            )}

            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`absolute ${
                  reverse ? "-left-5" : "-right-5"
                } bottom-8 rounded-lg bg-navy-900 px-7 py-6 text-center shadow-card-hover`}
              >
                <p className="font-serif text-3xl font-bold text-gold-400">{badge.stat}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {badge.label}
                </p>
              </motion.div>
            )}
          </div>
        </FadeIn>

        {/* Text column */}
        <FadeIn direction={reverse ? "right" : "left"} delay={0.1} className={reverse ? "lg:order-1" : ""}>
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-navy-900/15 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-800/70 shadow-soft">
              {eyebrow}
            </span>
          )}
          <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
            {title}
          </h2>
          <div className="mt-5 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-navy-800/65">
                {p}
              </p>
            ))}
          </div>

          {features.length > 0 && (
            <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/12 text-gold-600">
                    <f.icon size={18} />
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy-900">
                      {f.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-navy-800/60">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {quote && (
            <div className="mt-8 border-l-[3px] border-gold-400 bg-white/60 py-4 pl-5 pr-4">
              <p className="text-xs italic leading-relaxed text-navy-800/75">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-700">
                — {quote.author}
              </p>
            </div>
          )}

          {children}
        </FadeIn>
      </div>
    </section>
  );
}
