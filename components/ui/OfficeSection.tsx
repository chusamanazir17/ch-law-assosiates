import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Phone, CheckCircle2, Shield, ExternalLink } from "lucide-react";
import { SITE, buildWhatsAppUrl } from "@/lib/site";
import FadeIn from "@/components/motion/FadeIn";
import { useLanguage } from "@/providers/LanguageProvider";
import { WhatsAppIcon, OfficialWhatsAppButton } from "@/components/ui/WhatsAppIcon";
import { useCms } from "@/lib/hooks/useCms";

export default function OfficeSection({
  title,
  text,
  addressText,
  weekdayHours,
  saturdayHours,
  guideTitle,
  guidePoints,
  whatsappBtnText,
  callBtnText,
}: {
  title?: string;
  text?: string;
  addressText?: string;
  weekdayHours?: string;
  saturdayHours?: string;
  guideTitle?: string;
  guidePoints?: string[];
  whatsappBtnText?: string;
  callBtnText?: string;
}) {
  const { isUrdu, t } = useLanguage();
  const { settings, homeSections } = useCms();
  const officeSec = homeSections?.officeSection;

  const sectionTitle = title || officeSec?.title || t.officeSection.title;
  const sectionText = text || officeSec?.subtitle || t.officeSection.subtitle;
  const displayAddress = addressText || settings?.address || (isUrdu
    ? "شرقی گیٹ چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال۔ کچہری احاطے کے مرکزی شرقی گیٹ پر واقع، سائلین، وکلاء اور کاروباری حضرات کے لیے انتہائی آسان رسائی۔"
    : `${SITE.address}. Situated right at Sharki Gate within the District Court premises for seamless accessibility.`);
  const displayWeekday = weekdayHours || settings?.hours?.weekdays || (isUrdu ? "9:00 بجے صبح تا 6:00 بجے شام" : "9:00 AM - 6:00 PM");
  const displaySaturday = saturdayHours || settings?.hours?.saturday || (isUrdu ? "9:00 بجے صبح تا 3:00 بجے دوپہر" : "9:00 AM - 3:00 PM");
  const displayGuideTitle = guideTitle || (isUrdu ? "کچہری تشریف آوری سے پہلے رہنمائی" : "Court Premises Visiting Guide");
  const defaultGuidePoints = [
    isUrdu
      ? "ڈسٹرکٹ کورٹ کے شرقی گیٹ سے داخل ہوتے ہی سامنے گراؤنڈ فلور پر چیمبر 121 واقع ہے۔"
      : "Enter via Sharki Gate — Chamber 121 is directly accessible on the ground floor legal corridor.",
    isUrdu
      ? "ای سٹامپ اور ٹیکس دستاویزات کے لیے پیشگی واٹس ایپ پر تفصیلات بھیج سکتے ہیں۔"
      : "Send required documents on WhatsApp before visiting for accelerated same-day processing.",
    isUrdu
      ? "تمام قانونی ڈرافٹنگ، معاہدہ جات اور بیعانہ سروسز موقع پر دستیاب ہیں۔"
      : "All legal drafting, agreements, sale deeds, and tax filings processed on-site.",
  ];
  const displayGuidePoints = guidePoints && guidePoints.length > 0 ? guidePoints : defaultGuidePoints;
  const displayWhatsAppBtn = whatsappBtnText || (isUrdu ? "واٹس ایپ پر پیشگی رہنمائی لیں" : "Chat with Chamber on WhatsApp");
  const displayCallBtn = callBtnText || (isUrdu ? "چیمبر فون رابطہ" : "Call Chamber Desk");

  const phone = settings?.phone || SITE.phone;
  const whatsappPhone = settings?.whatsappSettings?.number || settings?.whatsapp || SITE.whatsapp;
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, settings?.whatsappSettings?.sectionMessages?.office || "Hello, I am on my way to Chamber 121 District Court Sahiwal.");
  const mapsUrl = settings?.mapsUrl || SITE.mapsUrl;

  return (
    <section id="office" className="bg-white dark:bg-[#05162B] py-14 sm:py-20 transition-colors duration-200 overflow-hidden">
      <div className="container-x">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="section-title text-[#0B1F36] dark:text-white">{sectionTitle}</h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-[#657184] dark:text-[#8792A1]">{sectionText}</p>
        </FadeIn>

        <div className="mt-10 sm:mt-12 grid gap-6 lg:grid-cols-12">
          {/* Office info card */}
          <FadeIn direction="right" className="lg:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-xl sm:rounded-2xl border border-[#E3E7EC] dark:border-white/10 bg-white dark:bg-[#102943] p-5 sm:p-7 lg:p-8 shadow-card text-[#0B1F36] dark:text-white">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/12 text-gold-500">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold text-[#0B1F36] dark:text-white">
                    {isUrdu ? "ہمارا ساہیوال چیمبر" : "Our Sahiwal Chamber"}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#657184] dark:text-[#8792A1]">
                  {displayAddress}
                </p>
              </div>

              <div className="mt-6 space-y-3 border-t border-[#E3E7EC] dark:border-white/10 pt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#8792A1]">
                    {isUrdu ? "پیر تا جمعہ" : "Weekdays"}
                  </span>
                  <span className="font-semibold text-[#0B1F36] dark:text-slate-100">
                    {displayWeekday}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#8792A1]">
                    {isUrdu ? "ہفتہ" : "Saturdays"}
                  </span>
                  <span className="font-semibold text-[#0B1F36] dark:text-slate-100">
                    {displaySaturday}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Live Interactive Map Card */}
          <FadeIn delay={0.1} className="lg:col-span-4">
            <div className="flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[#E3E7EC] dark:border-white/10 bg-white dark:bg-[#102943] shadow-card text-[#0B1F36] dark:text-white">
              {/* Map Card Header with Live GPS indicator */}
              <div className="flex items-center justify-between border-b border-[#E3E7EC] dark:border-white/10 px-4 py-3 sm:px-5 bg-[#F7F9FB] dark:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide text-[#0B1F36] dark:text-white">
                    {isUrdu ? "براہ راست GPS لوکیشن" : "Live GPS Map"}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-gold-600 dark:text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                  {SITE.coordinates.lat.toFixed(4)}, {SITE.coordinates.lng.toFixed(4)}
                </span>
              </div>

              {/* Interactive Google Map iframe */}
              <div className="relative flex-1 min-h-[260px] sm:min-h-[300px] w-full bg-slate-100 dark:bg-slate-900">
                <iframe
                  title="Ch Composing & Tax Consultancy Chamber 121 Sahiwal Live Map"
                  src={`https://maps.google.com/maps?q=${SITE.coordinates.lat},${SITE.coordinates.lng}&hl=${isUrdu ? "ur" : "en"}&z=17&output=embed`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map Footer Info and Direct Directions Action */}
              <div className="border-t border-[#E3E7EC] dark:border-white/10 p-4 sm:p-5 bg-white dark:bg-[#102943] space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-[#0B1F36] dark:text-white">
                      {isUrdu
                        ? "شرقی گیٹ چیمبر نمبر 121، ڈسٹرکٹ کورٹ ساہیوال"
                        : "Chamber 121, Sharki Gate, District Court Sahiwal"}
                    </p>
                    <p className="text-[11px] text-[#657184] dark:text-[#8792A1] mt-0.5">
                      {isUrdu ? "ساہیوال، پنجاب، پاکستان" : "Sahiwal, Punjab, Pakistan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={settings?.mapsUrl || SITE.directionsUrl || SITE.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold flex-1 text-center py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-medium shadow-sm hover:shadow"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{isUrdu ? "گوگل میپس پر راستہ حاصل کریں" : "Get Directions"}</span>
                  </a>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#E3E7EC] dark:border-white/15 p-2 text-xs font-semibold text-[#0B1F36] dark:text-slate-200 hover:bg-navy-50 dark:hover:bg-white/5 transition flex items-center justify-center"
                    title={isUrdu ? "بڑے گوگل میپ پر کھولیں" : "Open in Google Maps"}
                    aria-label="Open in Google Maps"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Visiting Guidance & Direct Official WhatsApp Action */}
          <FadeIn direction="left" className="lg:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-[#05162B] p-5 sm:p-7 lg:p-8 text-white shadow-card">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                    {isUrdu ? "چیمبر گائیڈ" : "Chamber Guide"}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-lg font-bold text-white">
                  {displayGuideTitle}
                </h3>

                <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#8792A1]">
                  {displayGuidePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                <OfficialWhatsAppButton
                  href={whatsappUrl}
                  label={displayWhatsAppBtn}
                  size="md"
                  className="w-full text-center"
                />
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="w-full rounded-lg border border-white/20 py-2.5 text-center text-xs font-semibold text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 text-gold-400" />
                  <span>{displayCallBtn}</span>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
