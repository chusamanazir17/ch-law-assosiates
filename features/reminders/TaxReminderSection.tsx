"use client";

import React from "react";
import { Calendar, MapPin, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import SubscriptionForm from "./SubscriptionForm";
import FadeIn from "@/components/motion/FadeIn";
import { SITE } from "@/lib/site";

export default function TaxReminderSection() {
  return (
    <section
      id="tax-reminders"
      className="relative overflow-hidden bg-navy-900 py-20 sm:py-24 text-white border-t border-white/10 texture-grid"
    >
      {/* Decorative ambient radial glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(200,151,61,0.12)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(50,85,137,0.25)_0%,_transparent_70%)]" />

      <div className="container-x relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Context & Physical Office Notice */}
          <FadeIn className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-400">
              <Calendar className="h-3.5 w-3.5" />
              Automated Compliance Alerts
            </div>

            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl text-white">
              Never Miss a Statutory <span className="text-gold-400">Tax Deadline</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-white/80">
              FBR and PRA tax deadlines in Pakistan carry statutory non-filing penalties and surcharges. Subscribe to receive automated reminders <strong>30 days</strong> and <strong>7 days</strong> before critical filing cutoff dates.
            </p>

            {/* Service & Office Reality Details */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-400 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    In-Person Documentation & Filing Services
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    Reminders are published for clients of our physical practice located at:
                    <br />
                    <strong className="text-white">{SITE.address}</strong>.
                    <br />
                    Our advisors are available on-site to assist with NTN, iris income tax filing, sales tax, and e-stamp paperwork.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Double opt-in verification</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Clock className="h-4 w-4 text-gold-400 shrink-0" />
                  <span>30-day & 7-day notifications</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <ShieldAlert className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>100% spam-free & private</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Instant 1-click unsubscribe</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Column: Form */}
          <FadeIn delay={0.15} className="lg:col-span-6">
            <SubscriptionForm />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
