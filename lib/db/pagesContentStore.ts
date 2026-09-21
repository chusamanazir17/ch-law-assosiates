import fs from "fs";
import path from "path";
import { HERO_IMAGES, SITE } from "@/lib/site";

export interface PageContentItem {
  id: string;
  route: string;
  title: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  leadContent: string;
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PAGES_FILE = path.join(DATA_DIR, "pagesContent.json");

const DEFAULT_PAGES: PageContentItem[] = [
  {
    id: "home",
    route: "/",
    title: "Home Page",
    heroBadge: "AUTHORIZED DOCUMENTATION EXPERTS",
    heroHeadline: "Premium Legal Documentation Services in Pakistan",
    heroSubtitle: "Providing reliable E-Stamping, property registry, and business registration solutions with absolute transparency and professional excellence.",
    heroImage: HERO_IMAGES.home,
    primaryCtaText: "VISIT OUR OFFICE",
    primaryCtaHref: "#contact",
    secondaryCtaText: "WhatsApp Us",
    secondaryCtaHref: SITE.whatsappHref,
    leadContent: "Ch Composing Estamp and Tax Advisor has provided trusted court documentations, e-stamping, and FBR tax services for over 15 years from Chamber No 121, District Court Sahiwal.",
    metaTitle: "Ch Composing | E-Stamping, Property Registry & Tax Advisor Sahiwal",
    metaDescription: "Authorized legal documentation, e-stamping, property registry, and FBR tax services at Chamber 121, District Court Sahiwal.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "updates",
    route: "/updates",
    title: "Legal Updates & News",
    heroBadge: "STATUTORY REGULATORY BULLETINS",
    heroHeadline: "Official Regulatory Updates & Legal Guidance",
    heroSubtitle: "Stay updated on statutory tax filing deadlines, FBR notifications, provincial stamp duties, and corporate compliance regulations in Pakistan.",
    heroImage: HERO_IMAGES.tax,
    primaryCtaText: "Subscribe for Reminders",
    primaryCtaHref: "/#reminders",
    secondaryCtaText: "Tax Helpline",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Timely notifications and comprehensive advisories curated directly by authorized legal and tax practitioners.",
    metaTitle: "Legal Updates & Tax News | Ch Composing",
    metaDescription: "Latest tax deadline extensions, FBR active taxpayer lists, e-stamping procedural guides, and corporate law bulletins.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-estamping",
    route: "/services/e-stamping",
    title: "E-Stamping & Stamp Papers",
    heroBadge: "GOVERNMENT PORTAL AUTHORIZED",
    heroHeadline: "Official E-Stamping & Challan 32-A Services",
    heroSubtitle: "Instant processing of non-judicial and judicial digital stamp papers with live government portal validation and biometric compliance.",
    heroImage: HERO_IMAGES.estamp,
    primaryCtaText: "Issue E-Stamp Now",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call Advisor",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Avoid counter delays and inaccurate calculations. Our licensed vendors generate authentic e-stamp certificates verified via official QR code.",
    metaTitle: "E-Stamping & Challan 32-A Processing | Ch Composing Sahiwal",
    metaDescription: "Instant digital stamp papers, Challan 32-A, and deed papers generated with 100% official verification in Sahiwal.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-property",
    route: "/services/property-land",
    title: "Property & Land Registration",
    heroBadge: "REVENUE RECORD VERIFICATION",
    heroHeadline: "Property Registry, Inteqal & Title Verification",
    heroSubtitle: "Flawless legal documentation for property transfers, sale deeds, Fard Malkiat verification, and Sub-Registrar execution.",
    heroImage: HERO_IMAGES.property,
    primaryCtaText: "Book Property Consultation",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call Chamber",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Comprehensive legal vetting of title documents, non-encumbrance certificates (NEC), and complete assistance at the Sub-Registrar office.",
    metaTitle: "Property Registry & Land Services | Chamber 121 Sahiwal",
    metaDescription: "Property transfer deeds, Fard Malkiat verification, and registry execution assistance across Sahiwal and Punjab.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-tax",
    route: "/services/tax",
    title: "Tax Services & FBR Compliance",
    heroBadge: "FBR IRIS COMPLIANCE",
    heroHeadline: "Income Tax, Sales Tax (STRN) & Active Taxpayer Filing",
    heroSubtitle: "Professional FBR tax filings, wealth reconciliation, NTN registrations, and prompt audit notice defense for individuals and businesses.",
    heroImage: HERO_IMAGES.tax,
    primaryCtaText: "File Tax Return Today",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Inquire on Fees",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Become an active filer on the FBR Active Taxpayer List (ATL) to avoid 100% withholding tax penalties on banking transactions and property purchases.",
    metaTitle: "FBR Tax Returns & NTN Registration | Tax Advisor Sahiwal",
    metaDescription: "Fast-track FBR tax filings, NTN registration, PRA sales tax, and audit compliance representation in Chamber 121 Sahiwal.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-business",
    route: "/services/business-registration",
    title: "Business & Corporate Registration",
    heroBadge: "SECP & FBR CORPORATE DESK",
    heroHeadline: "Company Incorporation & SECP Registration",
    heroSubtitle: "Register your Private Limited (Pvt. Ltd.), Single Member Company (SMC), Partnership Firm, or Sole Proprietorship with zero red tape.",
    heroImage: HERO_IMAGES.business,
    primaryCtaText: "Incorporate Company",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Speak with Consultant",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Complete corporate legal support including Memorandum & Articles of Association (MOA/AOA), corporate bank account resolution, and chamber membership.",
    metaTitle: "Business Registration & SECP Incorporation | Ch Composing",
    metaDescription: "Pvt Ltd company formation, Form C partnership deeds, and corporate tax registration in Sahiwal.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-trademark",
    route: "/services/trademark-ipo",
    title: "Trademark & IPO Pakistan",
    heroBadge: "INTELLECTUAL PROPERTY PROTECTION",
    heroHeadline: "Brand Trademark, Logo Protection & Copyrights",
    heroSubtitle: "Protect your brand name, logo, slogan, and intellectual property with official IPO Pakistan trademark registrations.",
    heroImage: HERO_IMAGES.trademark,
    primaryCtaText: "Start Trademark Search",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Consult on IP",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Thorough pre-filing search reports, TM-1 application filing across all 45 classes, and vigorous defense against examiner show-cause notices.",
    metaTitle: "Trademark & Brand Registration | IPO Pakistan Advisory",
    metaDescription: "Official trademark registration, logo copyrights, and patent filing with IPO Pakistan.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-registry-deeds",
    route: "/services/registry-deeds",
    title: "Registry & Deeds",
    heroBadge: "SUB-REGISTRAR EXECUTION",
    heroHeadline: "Deed Registration, Gift Deeds & Powers of Attorney",
    heroSubtitle: "Official registration of Baya-Nama, Hiba-Nama (gift deeds), mortgage charges, and certified historical copies.",
    heroImage: HERO_IMAGES.registry,
    primaryCtaText: "Register a Deed",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call Office",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Authorized representation before the Sub-Registrar with verified stamp papers, biometric verification, and certified archival record retrieval.",
    metaTitle: "Registry & Legal Deeds | Sub-Registrar Documentation Sahiwal",
    metaDescription: "Sale deeds, gift deeds, mortgage deeds, and certified revenue records registered cleanly.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-legal-documentation",
    route: "/services/legal-documentation",
    title: "Legal Documentation & Affidavits",
    heroBadge: "OATH COMMISSIONER ATTESTED",
    heroHeadline: "Affidavits, Powers of Attorney & Tenancy Agreements",
    heroSubtitle: "Legally sound drafting of affidavits, indemnity bonds, overseas power of attorney, and tenancy contracts compliant with Pakistan law.",
    heroImage: HERO_IMAGES.legal,
    primaryCtaText: "Draft Document",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call Office",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Precision legal drafting prepared by seasoned court practitioners, fully attested and ready for court or institutional submission.",
    metaTitle: "Legal Documentation & Affidavits | District Court Sahiwal",
    metaDescription: "Affidavits, power of attorney, and legal contract drafting with oath commissioner attestation.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-family-legal",
    route: "/services/family-legal",
    title: "Family Court & Succession",
    heroBadge: "NADRA & FAMILY COURT DESK",
    heroHeadline: "Succession Certificates, NADRA Heirship & Family Law",
    heroSubtitle: "Compassionate and swift assistance for family inheritance, succession certificates, guardianship, and marriage registrations.",
    heroImage: HERO_IMAGES.family,
    primaryCtaText: "Family Consultation",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call for Advice",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Simplified NADRA succession processing and family court documentation to resolve inheritance and legal heirship without hassle.",
    metaTitle: "Succession Certificates & Family Law Services | Sahiwal",
    metaDescription: "NADRA succession certificates, heirship transfers, and family court documentation.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-banking-financial",
    route: "/services/banking-financial",
    title: "Banking & Financial Legal Services",
    heroBadge: "FINANCIAL LEGAL ADVISORY",
    heroHeadline: "Bank Loan Documents, Hypothecation & Mortgages",
    heroSubtitle: "Complete legal documentation for personal, auto, and corporate commercial financing with authorized banking institutions.",
    heroImage: HERO_IMAGES.banking,
    primaryCtaText: "Banking Assistance",
    primaryCtaHref: SITE.whatsappHref,
    secondaryCtaText: "Call Advisor",
    secondaryCtaHref: SITE.phoneHref,
    leadContent: "Charge creation (SECP Form 10/12), title search reports, mortgage deeds, and financial affidavits recognized by all major Pakistani banks.",
    metaTitle: "Banking & Financial Legal Services | Ch Composing",
    metaDescription: "Mortgage registration, loan agreements, bank guarantees, and corporate finance documentation.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "about",
    route: "/about",
    title: "About Us & Leadership",
    heroBadge: "OUR STORY. A STRONGER TOMORROW.",
    heroHeadline: "About Our Legal Chamber 121",
    heroSubtitle: "Ch Composing Estamp & Tax Advisor provides reliable e-stamp, property registry, tax advisory, and court documentation services in Sahiwal.",
    heroImage: HERO_IMAGES.home,
    primaryCtaText: "Visit Our Chamber",
    primaryCtaHref: "/#office",
    secondaryCtaText: "WhatsApp Us",
    secondaryCtaHref: SITE.whatsappHref,
    leadContent: "Founded by Late Haji Faqir Muhammad and managed by Haji Nazir Ahmed & Usama Ch, Chamber 121 has served clients across Punjab for decades.",
    metaTitle: "About Us & Leadership | Chamber 121 Sahiwal",
    metaDescription: "Learn about Chamber 121 Sahiwal, our history, and leadership team providing trusted legal and tax services.",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
];

export function getAllPagesContent(): PageContentItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(PAGES_FILE)) {
      fs.writeFileSync(PAGES_FILE, JSON.stringify(DEFAULT_PAGES, null, 2), "utf-8");
      return DEFAULT_PAGES;
    }

    const content = fs.readFileSync(PAGES_FILE, "utf-8");
    const parsed = JSON.parse(content) as PageContentItem[];
    return parsed;
  } catch (err) {
    console.error("[PagesContentStore] Failed to read pages, using defaults:", err);
    return DEFAULT_PAGES;
  }
}

export function getPageContentByRoute(route: string): PageContentItem | null {
  const all = getAllPagesContent();
  return all.find((p) => p.route === route || p.id === route) || null;
}

export function updatePageContent(pageData: Partial<PageContentItem>): PageContentItem {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const all = getAllPagesContent();
    const index = all.findIndex(
      (p) => (pageData.id && p.id === pageData.id) || (pageData.route && p.route === pageData.route)
    );

    let updated: PageContentItem;

    if (index >= 0) {
      updated = {
        ...all[index],
        ...pageData,
        updatedAt: new Date().toISOString(),
      };
      all[index] = updated;
    } else {
      const newId = pageData.id || pageData.route?.replace(/^\//, "").replace(/\//g, "-") || `page-${Date.now()}`;
      updated = {
        id: newId,
        route: pageData.route || `/${newId}`,
        title: pageData.title || "Custom Page",
        heroBadge: pageData.heroBadge || "OFFICIAL SERVICE",
        heroHeadline: pageData.heroHeadline || pageData.title || "Legal Services",
        heroSubtitle: pageData.heroSubtitle || "",
        heroImage: pageData.heroImage || HERO_IMAGES.home,
        primaryCtaText: pageData.primaryCtaText || "Contact Us",
        primaryCtaHref: pageData.primaryCtaHref || "/#contact",
        secondaryCtaText: pageData.secondaryCtaText || "WhatsApp",
        secondaryCtaHref: pageData.secondaryCtaHref || SITE.whatsappHref,
        leadContent: pageData.leadContent || "",
        metaTitle: pageData.metaTitle || pageData.title || "Legal Services",
        metaDescription: pageData.metaDescription || "",
        status: pageData.status || "published",
        updatedAt: new Date().toISOString(),
      };
      all.push(updated);
    }

    const tempFile = `${PAGES_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(all, null, 2), "utf-8");
    fs.renameSync(tempFile, PAGES_FILE);

    return updated;
  } catch (err) {
    console.error("[PagesContentStore] Failed to update page content:", err);
    throw err;
  }
}
