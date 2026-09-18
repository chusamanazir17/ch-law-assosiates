import fs from "fs";
import path from "path";
import { SITE, HERO_IMAGES } from "@/lib/site";

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
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "siteSettings.json");

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
    updatedAt: new Date().toISOString(),
  };
}

export function getSiteSettings(): SiteSettings {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(SETTINGS_FILE)) {
      const defaults = getDefaultSettings();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaults, null, 2), "utf-8");
      return defaults;
    }

    const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return { ...getDefaultSettings(), ...parsed };
  } catch (err) {
    console.error("[SiteSettingsStore] Failed to read settings, falling back to defaults:", err);
    return getDefaultSettings();
  }
}

export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const current = getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    // Atomic write
    const tempFile = `${SETTINGS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(updated, null, 2), "utf-8");
    fs.renameSync(tempFile, SETTINGS_FILE);

    return updated;
  } catch (err) {
    console.error("[SiteSettingsStore] Failed to update settings:", err);
    throw err;
  }
}
