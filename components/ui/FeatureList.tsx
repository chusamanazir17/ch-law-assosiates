"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Users, Eye, type LucideIcon } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

export type Feature = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const defaultFeatures: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Verified Credentials",
    text: "Officially recognized and registered entity providing authorized government services.",
  },
  {
    icon: Zap,
    title: "Fast-Track Processing",
    text: "Optimized workflows that significantly reduce waiting times compared to standard channels.",
  },
  {
    icon: Users,
    title: "Expert Advisory",
    text: "Our consultants hold years of experience in Pakistani property law and corporate regulation.",
  },
  {
    icon: Eye,
    title: "100% Transparency",
    text: "Clear fee structures with no hidden costs. Every transaction is documented and receipted.",
  },
];

export default function FeatureList({
  features = defaultFeatures,
  dark = false,
  columns = 2,
}: {
  features?: Feature[];
  dark?: boolean;
  columns?: 2 | 4;
}) {
  return (
    <div
      className={
        columns === 4
          ? "grid gap-x-6 gap-y-8 sm:grid-cols-2"
          : "grid gap-x-8 gap-y-8 sm:grid-cols-2"
      }
    >
      {features.map((f, i) => (
        <FadeIn key={f.title} delay={i * 0.08}>
          <div className="flex gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                dark ? "bg-gold-400/15 text-gold-400" : "bg-gold-400/12 text-gold-600"
              }`}
            >
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <h4
                className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                  dark ? "text-white" : "text-navy-900"
                }`}
              >
                {f.title}
              </h4>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  dark ? "text-white/60" : "text-navy-800/65"
                }`}
              >
                {f.text}
              </p>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/* numbered vertical steps */
export function StepList({
  steps,
}: {
  steps: { title: string; text: string }[];
}) {
  return (
    <ol className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-navy-900/10">
      {steps.map((s, i) => (
        <motion.li
          key={s.title}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.5 }}
          className="relative flex gap-5"
        >
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-400">
            {i + 1}
          </span>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-navy-900">
              {s.title}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-navy-800/65">{s.text}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
