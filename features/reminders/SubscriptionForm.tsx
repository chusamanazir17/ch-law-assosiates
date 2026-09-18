"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, BellRing, ShieldCheck, Mail, User } from "lucide-react";
import { getActiveTaxCategories, submitSubscription } from "./api";
import { validateSubscription } from "@/lib/validation/subscription";
import type { TaxCategory } from "@/types/reminders";

// Fallback initial categories if DB is loading or empty in dev
const FALLBACK_CATEGORIES: TaxCategory[] = [
  { id: "income-tax-individuals", name: "Income Tax - Individuals & Salaried", slug: "income-tax-individuals", description: "Annual FBR returns", is_active: true, sort_order: 1, created_at: "", updated_at: "" },
  { id: "business-corporate-tax", name: "Business & Corporate Tax", slug: "business-corporate-tax", description: "AOP, Sole Proprietor, Private Ltd", is_active: true, sort_order: 2, created_at: "", updated_at: "" },
  { id: "sales-tax-pra", name: "Sales Tax (Federal & PRA)", slug: "sales-tax-pra", description: "Monthly sales tax returns", is_active: true, sort_order: 3, created_at: "", updated_at: "" },
  { id: "withholding-tax", name: "Withholding Tax Statements", slug: "withholding-tax", description: "Periodic withholding statements", is_active: true, sort_order: 4, created_at: "", updated_at: "" },
  { id: "property-tax-stamp-duty", name: "Property & Capital Value Tax", slug: "property-tax-stamp-duty", description: "E-Stamp duty and transfer deadlines", is_active: true, sort_order: 5, created_at: "", updated_at: "" },
];

export default function SubscriptionForm() {
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState(""); // Hidden spam honeypot

  // Form states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoadingCategories(true);
      const data = await getActiveTaxCategories();
      const loadedCats = data && data.length > 0 ? data : FALLBACK_CATEGORIES;
      setCategories(loadedCats);
      setSelectedCategories(loadedCats.slice(0, 2).map((c) => c.id));
      setIsLoadingCategories(false);
    }
    load();
  }, []);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (errors.category_ids) {
      setErrors((prev) => ({ ...prev, category_ids: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const validation = validateSubscription({
      name,
      email,
      category_ids: selectedCategories,
      consent,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitSubscription({
        name: name.trim(),
        email: email.trim(),
        category_ids: selectedCategories,
        consent,
        hp_company: honeypot,
      });

      if (res.success) {
        setSubmitSuccess(
          res.message ||
            "If this email address is valid, a confirmation link has been sent to your inbox."
        );
        setName("");
        setEmail("");
        setSelectedCategories([]);
        setConsent(false);
      } else {
        setSubmitError(res.error || "Failed to process your subscription. Please try again.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-gold-400">
          <BellRing className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-white sm:text-xl">
            Subscribe to Tax Deadline Reminders
          </h3>
          <p className="text-xs text-white/70">
            FBR & provincial filing alerts for our District Court Sahiwal office clients.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-emerald-200">Confirmation Sent!</p>
              <p className="mt-1 text-xs leading-relaxed">{submitSuccess}</p>
              <p className="mt-2 text-[11px] text-emerald-400/80">
                Please check your inbox (and spam folder) to activate your reminders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {submitError && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-red-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <p className="text-xs leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {/* Spam Honeypot - hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="hp_company">Company</label>
          <input
            id="hp_company"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="reminder_name" className="block text-xs font-semibold uppercase tracking-wider text-white/80">
            Full Name <span className="text-gold-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
              <User className="h-4 w-4" />
            </span>
            <input
              id="reminder_name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Muhammad Ali"
              className={`w-full rounded-lg border bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500/80 focus:ring-red-500/30"
                  : "border-white/15 focus:border-gold-400/60 focus:ring-gold-400/20"
              }`}
              disabled={isSubmitting}
              required
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="reminder_email" className="block text-xs font-semibold uppercase tracking-wider text-white/80">
            Email Address <span className="text-gold-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="reminder_email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="e.g. client@example.com"
              className={`w-full rounded-lg border bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500/80 focus:ring-red-500/30"
                  : "border-white/15 focus:border-gold-400/60 focus:ring-gold-400/20"
              }`}
              disabled={isSubmitting}
              required
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        {/* Tax Categories */}
        <div>
          <fieldset>
            <legend className="block text-xs font-semibold uppercase tracking-wider text-white/80">
              Select Tax Categories <span className="text-gold-400">*</span>
            </legend>
            <p className="mt-0.5 text-[11px] text-white/50">
              Select the filing deadlines you wish to be reminded about:
            </p>

            {isLoadingCategories ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-400" />
                Loading active categories...
              </div>
            ) : (
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {categories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                        isChecked
                          ? "border-gold-400/60 bg-gold-400/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat.id)}
                        disabled={isSubmitting}
                        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-gold-500 focus:ring-gold-400/40"
                      />
                      <div>
                        <span className="font-semibold block">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[11px] text-white/50 line-clamp-1">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {errors.category_ids && (
              <p className="mt-1.5 text-xs text-red-400">{errors.category_ids}</p>
            )}
          </fieldset>
        </div>

        {/* Unchecked Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-white/80">
            <input
              id="reminder_consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
              }}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-gold-500 focus:ring-gold-400/40"
              required
            />
            <span className="leading-relaxed">
              I consent to receive automated tax filing deadline reminders via email from Ch Composing Estamp and Tax Advisor relating to services provided at Sharki Gate Chamber No 121, District Court Sahiwal. I can unsubscribe at any time.
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-400">{errors.consent}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold-400 py-3 px-6 text-sm font-bold text-navy-950 shadow-lg hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Confirmation...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Get Tax Deadline Reminders
              </>
            )}
          </button>
        </div>

        {/* Plain-Language Notice */}
        <p className="text-[11px] leading-relaxed text-center text-white/50">
          🔒 Double opt-in: We send a verification link to confirm ownership. We never sell or share your email address.
        </p>
      </form>
    </div>
  );
}
