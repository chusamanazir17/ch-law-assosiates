import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import { SITE, HERO_IMAGES } from "@/lib/site";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

// The whole SiteSettings document is persisted as a single JSONB row.
const SETTINGS_KEY = "site";
const CACHE_KEY = "cms:site-settings";

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  enabled: boolean;
}

export interface ContactPerson {
  name: string;
  nameUrdu: string;
  role: string;
  roleUrdu: string;
  phone: string;
  whatsapp: string;
}

export interface WhatsAppSettings {
  number: string;
  defaultMessage: string;
  floatingButtonEnabled: boolean;
  floatingButtonMessage: string;
  sectionMessages: {
    hero?: string;
    services?: string;
    about?: string;
    office?: string;
    finalCta?: string;
  };
}

export interface HeaderSettings {
  logoText: string;
  logoSubtitle: string;
  phone: string;
  whatsapp: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  primaryCtaEnabled: boolean;
}

export interface FooterSettings {
  description: string;
  descriptionUrdu: string;
  copyrightText: string;
  showSocials: boolean;
}

export interface SiteSettings {
  name: string;
  fullName: string;
  tagline: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressShort: string;
  city: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  mapsUrl: string;
  contacts: ContactPerson[];
  navigationMenu: NavMenuItem[];
  heroImages: Record<string, string>;
  whatsappSettings: WhatsAppSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  updatedAt: string;
}

function getDefaultSettings(): SiteSettings {
  return {
    name: SITE.name,
    fullName: SITE.fullName,
    tagline: SITE.tagline,
    country: SITE.country,
    phone: SITE.phone,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    address: SITE.address,
    addressShort: SITE.addressShort,
    city: SITE.city,
    hours: {
      weekdays: SITE.hours.weekdays,
      saturday: SITE.hours.saturday,
      sunday: SITE.hours.sunday,
    },
    mapsUrl: SITE.mapsUrl,
    contacts: [
      {
        name: "Haji Nazir Ahmad",
        nameUrdu: "حاجی نذیر احمد",
        role: "Senior Consultant",
        roleUrdu: "سینئر کنسلٹنٹ",
        phone: "0301-6922573",
        whatsapp: "0301-6922573",
      },
      {
        name: "Usama Nazir Ch",
        nameUrdu: "اسامہ نذیر چوہدری",
        role: "E-Stamp & Tax Advisor",
        roleUrdu: "ای سٹامپ و ٹیکس ایڈوائزر",
        phone: "0305-7902744",
        whatsapp: "0305-7902744",
      },
    ],
    navigationMenu: [
      { id: "home", label: "Home", href: "/", enabled: true },
      { id: "services", label: "Services", href: "/#services", enabled: true },
      { id: "updates", label: "Legal Updates", href: "/updates", enabled: true },
      { id: "reminders", label: "Tax Reminders", href: "/#reminders", enabled: true },
      { id: "contact", label: "Contact Office", href: "/#contact", enabled: true },
    ],
    heroImages: { ...HERO_IMAGES },
    whatsappSettings: {
      number: "0305-7902744",
      defaultMessage: "Hello, I would like to inquire about legal documentation and tax advisory services.",
      floatingButtonEnabled: true,
      floatingButtonMessage: "Chat with Tax & Legal Consultant",
      sectionMessages: {
        hero: "Hello, I visited your homepage and would like immediate assistance with legal documentation.",
        services: "Hello, I am interested in consulting about your chamber legal services.",
        about: "Hello, please send me the required documents checklist for visiting Chamber 121.",
        office: "Hello, I am on my way to Chamber 121 District Court Sahiwal.",
        finalCta: "Hello, I need urgent legal/tax consultation from Chamber 121.",
      },
    },
    headerSettings: {
      logoText: "Ch Composing",
      logoSubtitle: "Estamp & Tax Advisor",
      phone: "0305-7902744",
      whatsapp: "0305-7902744",
      primaryCtaText: "Visit Chamber",
      primaryCtaHref: "/#office",
      primaryCtaEnabled: true,
    },
    footerSettings: {
      description:
        "Authorized legal documentation & tax advisory firm providing verified E-Stamping, property registration, and corporate compliance services at District Court Sahiwal.",
      descriptionUrdu:
        "ڈسٹرکٹ کورٹ ساہیوال میں ای سٹامپنگ، پراپرٹی رجسٹری، ٹیکس اور قانونی دستاویزات کا مستند و بااعتماد ادارہ۔",
      copyrightText: `© ${new Date().getFullYear()} Ch Composing Estamp and Tax Advisor. Chamber 121 District Court Sahiwal. All rights reserved.`,
      showSocials: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const cached = cmsCacheGet<SiteSettings>(CACHE_KEY);
  if (cached) return cached;

  const defaults = getDefaultSettings();

  if (!isCmsBackendConfigured()) return defaults;

  try {
    const client = await getCmsClient();
    if (!client) return defaults;
    const db = client as CmsDbClient;

    const { data, error } = await db
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error) throw error;

    if (!data?.value) {
      // First run on a fresh database: persist the defaults.
      if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
        const { error: insertError } = await db
          .from("site_settings")
          .upsert({ key: SETTINGS_KEY, value: JSON.parse(JSON.stringify(defaults)) }, { onConflict: "key" });
        if (insertError) throw insertError;
        console.info("[SiteSettingsStore] Seeded default site settings into Supabase.");
      }
      return defaults;
    }

    const settings: SiteSettings = { ...defaults, ...(data.value as Partial<SiteSettings>) };
    cmsCacheSet(CACHE_KEY, settings);
    return settings;
  } catch (err) {
    console.error("[SiteSettingsStore] Failed to read settings from Supabase, falling back to defaults:", err);
    return defaults;
  }
}

export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await db
    .from("site_settings")
    .upsert({ key: SETTINGS_KEY, value: JSON.parse(JSON.stringify(updated)) }, { onConflict: "key" });
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  return updated;
}
