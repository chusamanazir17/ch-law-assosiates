import {
  cmsCacheGet,
  cmsCacheSet,
  getCmsClient,
  invalidateCmsCache,
  isCmsBackendConfigured,
} from "@/lib/db/cmsClient";
import { HERO_IMAGES } from "@/lib/site";
import type { Database } from "@/types/database.types";

type CmsDbClient = import("@supabase/supabase-js").SupabaseClient<Database>;

export interface SubService {
  id: string;
  title: string;
  description: string;
  href?: string;
  badge?: string;
}

export interface CmsService {
  id: string;
  slug: string;
  name: string;
  nameUrdu: string;
  category: string;
  description: string;
  tagline: string;
  heroImage: string;
  turnaroundTime: string;
  requiredDocuments: string[];
  governmentFeeInfo: string;
  items: SubService[];
  active: boolean;
  order: number;
  updatedAt: string;
}

const INITIAL_SERVICES: CmsService[] = [
  {
    id: "e-stamping",
    slug: "e-stamping",
    name: "E-Stamping & Stamp Paper",
    nameUrdu: "ای سٹامپنگ و چالان 32-A",
    category: "Court Document Services",
    description: "Official digital stamp papers processed instantly with government portal verification, Challan 32-A generation, and biometric compliance.",
    tagline: "Authorized Government Stamp Vendor",
    heroImage: HERO_IMAGES.estamp,
    turnaroundTime: "Same-day (15 to 30 mins)",
    requiredDocuments: ["CNIC copies of buyer/seller", "Property details / plot number", "Challan 32-A payment slip"],
    governmentFeeInfo: "Calculated at official 1% DC rate for transfer of property; PKR 50–1,000 for standard affidavits.",
    items: [
      { id: "es-1", title: "Non-Judicial E-Stamp", description: "PKR 50 to 1,000+ for commercial agreements, affidavits & contracts" },
      { id: "es-2", title: "High-Value Non-Judicial", description: "For high-value commercial agreements, formal contracts, and legal declarations" },
      { id: "es-3", title: "Property Sale Deed", description: "Calculated at official 1% DC rate for plot and house transfers" },
      { id: "es-4", title: "Partnership Deed", description: "Authorized stamp papers for business partnerships and firm deeds" },
      { id: "es-5", title: "Bank Documentation", description: "Custom stamp papers for loan agreements and mortgage deeds" },
      { id: "es-6", title: "Verification & Challan 32-A", description: "Official online verification and accurate challan generation" },
    ],
    active: true,
    order: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "property-land",
    slug: "property-land",
    name: "Property & Land Services",
    nameUrdu: "پراپرٹی رجسٹری و انتقال",
    category: "Revenue & Land Services",
    description: "Complete assistance for property transfers, sale deeds, Fard Malkiat verification, and title verification across Punjab and Pakistan.",
    tagline: "Real Estate Legal Verification",
    heroImage: HERO_IMAGES.property,
    turnaroundTime: "1 to 3 Business Days",
    requiredDocuments: ["Original allotment / transfer letter", "Fard Malkiat from Arazi Record Center", "CNIC of parties & witnesses"],
    governmentFeeInfo: "Subject to District Collector (DC) property valuation table and provincial stamp duties.",
    items: [
      { id: "pl-1", title: "Sale Deed Documentation", description: "Baya-Nama drafting, stamp duty processing & Sub-Registrar execution" },
      { id: "pl-2", title: "Transfer Letter Services", description: "End-to-end facilitation for CDA, LDA, DHA, and housing societies" },
      { id: "pl-3", title: "Legal Search & Title Audit", description: "Thorough verification of property titles and Non-Encumbrance (NEC)" },
      { id: "pl-4", title: "Registry & Attestation", description: "Authorized assistance for property registration before Sub-Registrar" },
      { id: "pl-5", title: "Succession Certificates", description: "Inheritance documentation and legal heirship transfers for real estate" },
      { id: "pl-6", title: "Power of Attorney (GPA/SPA)", description: "Drafting & registration of Power of Attorney for property management" },
    ],
    active: true,
    order: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "registry-deeds",
    slug: "registry-deeds",
    name: "Registry & Deeds",
    nameUrdu: "رجسٹری و قانونی دستاویزات",
    category: "Revenue & Land Services",
    description: "Sub-registrar office registrations, gift deeds, mortgage deeds, and certified revenue records with zero administrative delays.",
    tagline: "Sub-Registrar & Revenue Records",
    heroImage: HERO_IMAGES.registry,
    turnaroundTime: "2 to 4 Business Days",
    requiredDocuments: ["Title deed (Sanad / Baye-Nama)", "No Objection Certificate (NOC)", "Witness biometric verification"],
    governmentFeeInfo: "Registration fee fixed per deed value plus local municipal council taxes.",
    items: [
      { id: "rd-1", title: "Sale Deed (Baye Nama)", description: "Full transfer of ownership rights before the Sub-Registrar" },
      { id: "rd-2", title: "Gift Deed (Hiba Nama)", description: "Official legal recording of property transferred as a gift to family" },
      { id: "rd-3", title: "Power of Attorney", description: "Authorized registration of General and Special POA" },
      { id: "rd-4", title: "Title Search & Verification", description: "Record verification from Sub-Registrar and Revenue offices" },
      { id: "rd-5", title: "Mortgage Deed Registration", description: "Official collateral registration with banks and lenders" },
      { id: "rd-6", title: "Certified Copies (Nakal)", description: "Attested copies of historical deeds from government archives" },
    ],
    active: true,
    order: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax",
    slug: "tax",
    name: "Tax Services & FBR Compliance",
    nameUrdu: "انکم ٹیکس ریٹرن و فائلر اسٹیٹس",
    category: "Taxation",
    description: "FBR Iris tax filings, Active Taxpayer List (ATL) status, NTN registrations, sales tax (GST/PRA), and audit representation for individuals and firms.",
    tagline: "Federal Board of Revenue & Iris Compliance",
    heroImage: HERO_IMAGES.tax,
    turnaroundTime: "24 Hours (NTN / ATL)",
    requiredDocuments: ["CNIC", "Salary certificate / Bank statement", "Utility bill of business premises"],
    governmentFeeInfo: "ATL late surcharge varies (PKR 1,000 for individuals; PKR 10,000 to 20,000 for companies).",
    items: [
      { id: "tx-1", title: "NTN Registration", description: "Salaried, business, and freelance Iris portal setup and issuance" },
      { id: "tx-2", title: "Income Tax Filing", description: "Annual tax return & wealth statements for Active Taxpayer status" },
      { id: "tx-3", title: "Sales Tax Registration (STRN)", description: "GST / STRN registration for manufacturers, traders, and services" },
      { id: "tx-4", title: "Tax Exemption Certificates", description: "Withholding tax exemptions and special industrial certificates" },
      { id: "tx-5", title: "FBR Audit Response", description: "Professional drafting and representation for section 177 / 214C notices" },
      { id: "tx-6", title: "Chamber of Commerce", description: "ICCI & RCCI chamber membership processing and documentation" },
    ],
    active: true,
    order: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "business-registration",
    slug: "business-registration",
    name: "Business Registration & SECP",
    nameUrdu: "بزنس و کمپنی رجسٹریشن",
    category: "Corporate Services",
    description: "End-to-end corporate formation with SECP, FBR, and local municipal chambers. Private Limited, Single Member, and Partnership registrations.",
    tagline: "SECP & Corporate Documentation",
    heroImage: HERO_IMAGES.business,
    turnaroundTime: "3 to 7 Business Days",
    requiredDocuments: ["CNICs of all directors/partners", "Company name options", "Registered office lease agreement"],
    governmentFeeInfo: "SECP incorporation fees start at PKR 2,500 based on authorized capital.",
    items: [
      { id: "br-1", title: "SECP Incorporation", description: "Private Limited (Pvt. Ltd.) & SMC company registration with MOA/AOA" },
      { id: "br-2", title: "Sole Proprietorship", description: "Fast-track registration of individual business entities with FBR" },
      { id: "br-3", title: "Partnership Deeds (Form C)", description: "Professional drafting and registration with the Registrar of Firms" },
      { id: "br-4", title: "NTN & Sales Tax (GST)", description: "Corporate tax registration, STRN certification & bank opening papers" },
      { id: "br-5", title: "Chamber Membership", description: "Corporate membership for Sahiwal, Lahore & Islamabad chambers" },
      { id: "br-6", title: "Trade License (CDA/DMC)", description: "Municipal licenses, signboard permissions & professional tax certificates" },
    ],
    active: true,
    order: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "trademark-ipo",
    slug: "trademark-ipo",
    name: "Trademark & IPO Pakistan",
    nameUrdu: "ٹریڈ مارک و آئی پی او پاکستان",
    category: "Intellectual Property",
    description: "Intellectual property registration, brand names, logos, copyrights, and patents filed directly with the Intellectual Property Organization (IPO Pakistan).",
    tagline: "IPO Pakistan Registration",
    heroImage: HERO_IMAGES.trademark,
    turnaroundTime: "Search in 48h; Registration 6–12 months",
    requiredDocuments: ["Brand logo in high resolution", "Applicant CNIC / Certificate of Incorporation", "Goods & services description"],
    governmentFeeInfo: "Official TM-1 application fee is PKR 3,000 per class.",
    items: [
      { id: "tm-1", title: "Brand Trademark Filing", description: "Brand name, logo & slogan protection across all 45 classes" },
      { id: "tm-2", title: "IPO Search Reports", description: "Pre-filing trademark search to ensure unique availability" },
      { id: "tm-3", title: "Copyright Registration", description: "Legal protection for software, books, artwork & architectural designs" },
      { id: "tm-4", title: "Patent Advisory", description: "Technical drafting and filing for innovative inventions with IPO" },
      { id: "tm-5", title: "Objection & Show Cause Defense", description: "Replying to registry objections and representing in hearings" },
    ],
    active: true,
    order: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "legal-documentation",
    slug: "legal-documentation",
    name: "Legal Documentation & Affidavits",
    nameUrdu: "قانونی دستاویزات و بیان حلفی",
    category: "Legal Documentation",
    description: "Affidavits, power of attorney, lease agreements, undertakings, and formal legal notice drafting attested by Oath Commissioner.",
    tagline: "Contracts & Attestations",
    heroImage: HERO_IMAGES.legal,
    turnaroundTime: "Same-Day (within 1 hour)",
    requiredDocuments: ["Original CNIC of deponent", "Relevant subject matter details"],
    governmentFeeInfo: "Standard stamp duty plus oath commissioner attestation fee.",
    items: [
      { id: "ld-1", title: "Affidavits & Oaths", description: "Oath commissioner attested affidavits, undertakings & indemnity bonds" },
      { id: "ld-2", title: "Power of Attorney (Local/Overseas)", description: "Embassy and Foreign Office attested POA for overseas Pakistanis" },
      { id: "ld-3", title: "Rent & Lease Agreements", description: "Residential and commercial tenancy agreements compliant with law" },
      { id: "ld-4", title: "Formal Legal Notices", description: "Drafting notices for civil disputes, debt recovery & breach of contracts" },
    ],
    active: true,
    order: 7,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "family-legal",
    slug: "family-legal",
    name: "Family Court & Succession",
    nameUrdu: "فیملی کورٹ و جانشینی سرٹیفکیٹ",
    category: "Civil & Family Law",
    description: "Marriage registration, succession certificates, NADRA legal heirship documentation, child guardianship, and inheritance division.",
    tagline: "Family Law & NADRA Certification",
    heroImage: HERO_IMAGES.family,
    turnaroundTime: "1 to 2 Weeks",
    requiredDocuments: ["Death certificate of deceased", "Family Registration Certificate (FRC)", "CNIC copies of all legal heirs"],
    governmentFeeInfo: "NADRA succession application fee plus newspaper publication charges.",
    items: [
      { id: "fl-1", title: "Nikahnama Registration", description: "Official NADRA and Union Council marriage registration and certs" },
      { id: "fl-2", title: "Succession Certificates", description: "Court application and NADRA certificate for estate & bank accounts" },
      { id: "fl-3", title: "Divorce Documents", description: "Talaq-nama, Khula notices, and Arbitration Council facilitation" },
      { id: "fl-4", title: "Child Guardianship", description: "Guardian court documentation and legal custody representation" },
    ],
    active: true,
    order: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "banking-financial",
    slug: "banking-financial",
    name: "Banking & Financial Legal Services",
    nameUrdu: "بینکنگ و مالی قانونی خدمات",
    category: "Financial Legal Services",
    description: "Loan documentation, mortgage charge creation with SECP (Form 10/12), bank guarantees, corporate hypothecation deeds, and financial affidavits.",
    tagline: "Financial Institution Documentation",
    heroImage: HERO_IMAGES.banking,
    turnaroundTime: "1 to 3 Business Days",
    requiredDocuments: ["Sanction letter from bank", "Property documents for mortgage", "Board resolution (for corporate loans)"],
    governmentFeeInfo: "Stamp duty levied according to loan / mortgage value schedule.",
    items: [
      { id: "bf-1", title: "Loan Documentation", description: "Personal, auto, and mortgage agreements with private and state banks" },
      { id: "bf-2", title: "Corporate Finance Docs", description: "Commercial loans, charge creation (Form 10/12), and hypothecation" },
      { id: "bf-3", title: "Financial Affidavits", description: "Source of income affidavits, loss of chequebook, and bank NOCs" },
      { id: "bf-4", title: "Mortgage & Collateral", description: "Legal registration of real estate as banking security" },
    ],
    active: true,
    order: 9,
    updatedAt: new Date().toISOString(),
  },
];

const CACHE_KEY = "cms:services";

type ServiceRow = Database["public"]["Tables"]["cms_services"]["Row"];

function rowToService(row: ServiceRow): CmsService {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameUrdu: row.name_urdu ?? "",
    category: row.category ?? "General Legal Services",
    description: row.description ?? "",
    tagline: row.tagline ?? "",
    heroImage: row.hero_image ?? "",
    turnaroundTime: row.turnaround_time ?? "",
    requiredDocuments: Array.isArray(row.required_documents) ? (row.required_documents as unknown as string[]) : [],
    governmentFeeInfo: row.government_fee_info ?? "",
    items: Array.isArray(row.items) ? (row.items as unknown as CmsService["items"]) : [],
    active: row.active ?? true,
    order: row.sort_order ?? 100,
    updatedAt: row.updated_at,
  };
}

function serviceToRow(service: CmsService) {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    name_urdu: service.nameUrdu ?? "",
    category: service.category ?? "General Legal Services",
    description: service.description ?? "",
    tagline: service.tagline ?? "",
    hero_image: service.heroImage ?? "",
    turnaround_time: service.turnaroundTime ?? "",
    required_documents: JSON.parse(JSON.stringify(service.requiredDocuments ?? [])),
    government_fee_info: service.governmentFeeInfo ?? "",
    items: JSON.parse(JSON.stringify(service.items ?? [])),
    active: service.active ?? true,
    sort_order: service.order ?? 100,
  };
}

async function seedServicesIfEmpty(client: CmsDbClient): Promise<boolean> {
  const { count, error } = await client.from("cms_services").select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return false;

  const rows = INITIAL_SERVICES.map((service, index) => ({
    ...serviceToRow(service),
    sort_order: service.order ?? index + 1,
  }));
  const { error: insertError } = await client.from("cms_services").insert(rows);
  if (insertError) throw insertError;
  console.info(`[ServicesStore] Seeded ${rows.length} default services into Supabase.`);
  return true;
}

export async function getAllServices(): Promise<CmsService[]> {
  const cached = cmsCacheGet<CmsService[]>(CACHE_KEY);
  if (cached) return cached;

  if (!isCmsBackendConfigured()) return INITIAL_SERVICES;

  try {
    const client = await getCmsClient();
    if (!client) return INITIAL_SERVICES;

    const { data, error } = await client
      .from("cms_services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // First run on a fresh database: seed the catalog defaults.
      if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
        await seedServicesIfEmpty(client as CmsDbClient);
        invalidateCmsCache(CACHE_KEY);
        return [...INITIAL_SERVICES].sort((a, b) => a.order - b.order);
      }
      console.warn("[ServicesStore] cms_services is empty; using built-in defaults.");
      return INITIAL_SERVICES;
    }

    const services = (data as ServiceRow[]).map(rowToService);
    cmsCacheSet(CACHE_KEY, services);
    return services;
  } catch (err) {
    console.error("[ServicesStore] Failed to read services from Supabase, using defaults:", err);
    return INITIAL_SERVICES;
  }
}

export async function getServiceBySlug(slug: string): Promise<CmsService | null> {
  const all = await getAllServices();
  return all.find((s) => s.slug === slug || s.id === slug) || null;
}

export async function saveService(serviceData: Partial<CmsService> & { name: string }): Promise<CmsService> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const all = await getAllServices();
  const slug = serviceData.slug || serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const existing = all.find((s) => s.id === serviceData.id || s.slug === slug) || null;

  const nowIso = new Date().toISOString();

  if (existing) {
    const updatedService: CmsService = {
      ...existing,
      ...serviceData,
      id: existing.id,
      slug,
      updatedAt: nowIso,
    };
    const { error } = await db.from("cms_services").update(serviceToRow(updatedService)).eq("id", existing.id);
    if (error) throw error;

    invalidateCmsCache(CACHE_KEY);
    return updatedService;
  }

  const createdService: CmsService = {
    id: serviceData.id || slug,
    slug,
    name: serviceData.name,
    nameUrdu: serviceData.nameUrdu || "",
    category: serviceData.category || "General Legal Services",
    description: serviceData.description || "",
    tagline: serviceData.tagline || "",
    heroImage: serviceData.heroImage || HERO_IMAGES.home,
    turnaroundTime: serviceData.turnaroundTime || "1 to 2 Business Days",
    requiredDocuments: serviceData.requiredDocuments || ["CNIC copy"],
    governmentFeeInfo: serviceData.governmentFeeInfo || "Per schedule",
    items: serviceData.items || [],
    active: serviceData.active !== undefined ? serviceData.active : true,
    order: serviceData.order ?? all.length + 1,
    updatedAt: nowIso,
  };
  const { error } = await db.from("cms_services").insert(serviceToRow(createdService));
  if (error) throw error;

  invalidateCmsCache(CACHE_KEY);
  return createdService;
}

export async function deleteService(idOrSlug: string): Promise<boolean> {
  const client = await getCmsClient();
  if (!client) {
    throw new Error("CMS backend is not configured: set NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_SERVICE_ROLE_KEY for writes).");
  }
  const db = client as CmsDbClient;

  const { data, error } = await db
    .from("cms_services")
    .delete()
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .select("id");

  if (error) throw error;
  const deleted = (data ?? []).length > 0;
  if (deleted) invalidateCmsCache(CACHE_KEY);
  return deleted;
}
