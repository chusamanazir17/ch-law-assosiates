export const SITE = {
  name: "Ch Composing",
  fullName: "Ch Composing Estamp and Tax Advisor",
  tagline: "E-Stamp and Tax Advisor",
  country: "E-STAMP & TAX ADVISOR",
  phone: "0305-7902744",
  phoneHref: "tel:+923057902744",
  whatsapp: "0305-7902744",
  whatsappHref: "https://wa.me/923057902744",
  email: "contact@chcomposing.pk",
  address: "Sharki Gate Chamber No 121 District Court Sahiwal",
  addressShort: "Chamber No 121, District Court Sahiwal",
  city: "Sahiwal",
  contacts: [
    {
      name: "Haji Nazir Ahmed",
      nameUrdu: "حاجی نذیر احمد",
      role: "Stamp Vendor & Consultant",
      roleUrdu: "اسٹامپ وینڈر و کنسلٹنٹ",
      phone: "0301-6922573",
      phoneHref: "tel:+923016922573",
      whatsappHref: "https://wa.me/923016922573",
    },
    {
      name: "Usama Ch",
      nameUrdu: "اسامہ چوہدری",
      role: "LL.B Student | Legal & Tax Services",
      roleUrdu: "ایل ایل بی طالب علم | قانونی و ٹیکس خدمات",
      phone: "0305-7902744",
      phoneHref: "tel:+923057902744",
      whatsappHref: "https://wa.me/923057902744",
    },
  ],
  hours: {
    weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
    saturday: "Saturday: 9:00 AM - 3:00 PM",
    sunday: "Sunday: Closed",
  },
  coordinates: {
    lat: 30.665373,
    lng: 73.097928,
    label: "30.665373, 73.097928",
  },
  mapsUrl: "https://www.google.com/maps?q=30.665373,73.097928",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=30.665373,73.097928",
};

export function buildWhatsAppUrl(phone?: string, message?: string): string {
  const rawNumber = (phone || SITE.whatsapp || "0305-7902744").replace(/[^\d]/g, "");
  const normalizedNumber = rawNumber.startsWith("92")
    ? rawNumber
    : rawNumber.startsWith("0")
    ? `92${rawNumber.slice(1)}`
    : `92${rawNumber}`;

  if (!message || !message.trim()) {
    return `https://wa.me/${normalizedNumber}`;
  }
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message.trim())}`;
}

export type NavService = {
  title: string;
  href: string;
  short: string;
};

export type SubServiceItem = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export type ServiceCategory = {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  description: string;
  tagline: string;
  items: SubServiceItem[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "tax",
    title: "Tax Services",
    shortTitle: "Tax Services",
    href: "/services/tax",
    description: "FBR tax filings, NTN registrations, sales tax, and audit compliance for individuals and firms.",
    tagline: "Federal Board of Revenue & Iris Compliance",
    items: [
      {
        title: "NTN Registration",
        description: "Salaried, business, and freelance Iris portal setup and issuance",
        href: "/services/tax",
      },
      {
        title: "Income Tax Filing",
        description: "Annual tax return & wealth statements for Active Taxpayer status",
        href: "/services/tax",
      },
      {
        title: "Sales Tax Registration (STRN)",
        description: "GST / STRN registration for manufacturers, traders, and services",
        href: "/services/tax",
      },
      {
        title: "Tax Exemption Certificates",
        description: "Withholding tax exemptions and special industrial certificates",
        href: "/services/tax",
      },
      {
        title: "FBR Audit Response",
        description: "Professional drafting and representation for section 177 / 214C notices",
        href: "/services/tax",
      },
      {
        title: "Chamber of Commerce",
        description: "ICCI & RCCI chamber membership processing and documentation",
        href: "/services/tax",
      },
    ],
  },
  {
    id: "e-stamping",
    title: "E-Stamp & Stamp Paper",
    shortTitle: "E-Stamping",
    href: "/services/e-stamping",
    description: "Official digital stamp papers processed instantly with government portal verification.",
    tagline: "Authorized Government Stamp Vendor",
    items: [
      {
        title: "Non-Judicial E-Stamp",
        description: "PKR 50 to 1,000+ for commercial agreements, affidavits & contracts",
        href: "/services/e-stamping",
      },
      {
        title: "High-Value Non-Judicial",
        description: "For high-value transactions, commercial contracts, and legal declarations",
        href: "/services/e-stamping",
      },
      {
        title: "Property Sale Deed",
        description: "Calculated at official 1% DC rate for plot and house transfers",
        href: "/services/e-stamping",
      },
      {
        title: "Partnership Deed",
        description: "Authorized stamp papers for business partnerships and firm deeds",
        href: "/services/e-stamping",
      },
      {
        title: "Bank Documentation",
        description: "Custom stamp papers for loan agreements and mortgage deeds",
        href: "/services/e-stamping",
      },
      {
        title: "Verification & Challan 32-A",
        description: "Official online verification and accurate challan generation",
        href: "/services/e-stamping",
      },
    ],
  },
  {
    id: "business-registration",
    title: "Business Registration",
    shortTitle: "Business",
    href: "/services/business-registration",
    description: "End-to-end corporate formation with SECP, FBR, and local municipal chambers.",
    tagline: "SECP & Corporate Documentation",
    items: [
      {
        title: "SECP Incorporation",
        description: "Private Limited (Pvt. Ltd.) & SMC company registration with MOA/AOA",
        href: "/services/business-registration",
      },
      {
        title: "Sole Proprietorship",
        description: "Fast-track registration of individual business entities with FBR",
        href: "/services/business-registration",
      },
      {
        title: "Partnership Deeds (Form C)",
        description: "Professional drafting and registration with the Registrar of Firms",
        href: "/services/business-registration",
      },
      {
        title: "NTN & Sales Tax (GST)",
        description: "Corporate tax registration, STRN certification & bank opening papers",
        href: "/services/business-registration",
      },
      {
        title: "Chamber Membership",
        description: "Corporate membership for Islamabad & Rawalpindi chambers of commerce",
        href: "/services/business-registration",
      },
      {
        title: "Trade License (CDA/DMC)",
        description: "Municipal licenses, signboard permissions & professional tax certificates",
        href: "/services/business-registration",
      },
    ],
  },
  {
    id: "property-land",
    title: "Property & Land Services",
    shortTitle: "Property & Land",
    href: "/services/property-land",
    description: "Complete assistance for property transfers, sale deeds, and title verification across Pakistan.",
    tagline: "Real Estate Legal Verification",
    items: [
      {
        title: "Sale Deed Documentation",
        description: "Baya-Nama drafting, stamp duty processing & Sub-Registrar execution",
        href: "/services/property-land",
      },
      {
        title: "Transfer Letter Services",
        description: "End-to-end facilitation for CDA, LDA, DHA, and housing societies",
        href: "/services/property-land",
      },
      {
        title: "Legal Search & Title Audit",
        description: "Thorough verification of property titles and Non-Encumbrance (NEC)",
        href: "/services/property-land",
      },
      {
        title: "Registry & Attestation",
        description: "Authorized assistance for property registration before Sub-Registrar",
        href: "/services/property-land",
      },
      {
        title: "Succession Certificates",
        description: "Inheritance documentation and legal heirship transfers for real estate",
        href: "/services/property-land",
      },
      {
        title: "Power of Attorney (GPA/SPA)",
        description: "Drafting & registration of Power of Attorney for property management",
        href: "/services/property-land",
      },
    ],
  },
  {
    id: "registry-deeds",
    title: "Registry & Deeds",
    shortTitle: "Registry & Deeds",
    href: "/services/registry-deeds",
    description: "Sub-registrar office registrations, gift deeds, mortgage deeds, and certified records.",
    tagline: "Sub-Registrar & Revenue Records",
    items: [
      {
        title: "Sale Deed (Baye Nama)",
        description: "Full transfer of ownership rights before the Sub-Registrar",
        href: "/services/registry-deeds",
      },
      {
        title: "Gift Deed (Hiba Nama)",
        description: "Official legal recording of property transferred as a gift to family",
        href: "/services/registry-deeds",
      },
      {
        title: "Power of Attorney",
        description: "Authorized registration of General and Special POA",
        href: "/services/registry-deeds",
      },
      {
        title: "Title Search & Verification",
        description: "Record verification from Sub-Registrar and Revenue offices",
        href: "/services/registry-deeds",
      },
      {
        title: "Mortgage Deed Registration",
        description: "Official collateral registration with banks and lenders",
        href: "/services/registry-deeds",
      },
      {
        title: "Certified Copies (Nakal)",
        description: "Attested copies of historical deeds from government archives",
        href: "/services/registry-deeds",
      },
    ],
  },
  {
    id: "banking-financial",
    title: "Banking & Financial",
    shortTitle: "Banking & Finance",
    href: "/services/banking-financial",
    description: "Loan documentation, corporate hypothecation deeds, bank guarantees, and affidavits.",
    tagline: "Financial Institution Documentation",
    items: [
      {
        title: "Loan Documentation",
        description: "Personal, auto, and mortgage agreements with private and state banks",
        href: "/services/banking-financial",
      },
      {
        title: "Corporate Finance Docs",
        description: "Commercial loans, charge creation (Form 10/12), and hypothecation",
        href: "/services/banking-financial",
      },
      {
        title: "Financial Affidavits",
        description: "Source of income affidavits, loss of chequebook, and bank NOCs",
        href: "/services/banking-financial",
      },
      {
        title: "Mortgage & Collateral",
        description: "Legal registration of real estate as banking security",
        href: "/services/banking-financial",
      },
    ],
  },
  {
    id: "family-legal",
    title: "Family & Legal Documents",
    shortTitle: "Family & Legal",
    href: "/services/family-legal",
    description: "Marriage registration, succession certificates, guardianship, and divorce documentation.",
    tagline: "Family Law & NADRA Certification",
    items: [
      {
        title: "Nikahnama Registration",
        description: "Official NADRA and Union Council marriage registration and certs",
        href: "/services/family-legal",
      },
      {
        title: "Succession Certificates",
        description: "Court application and NADRA certificate for estate & bank accounts",
        href: "/services/family-legal",
      },
      {
        title: "Divorce Documents",
        description: "Talaq-nama, Khula notices, and Arbitration Council facilitation",
        href: "/services/family-legal",
      },
      {
        title: "Child Guardianship",
        description: "Guardian court documentation and legal custody representation",
        href: "/services/family-legal",
      },
    ],
  },
  {
    id: "legal-documentation",
    title: "Legal Documentation",
    shortTitle: "Legal Docs",
    href: "/services/legal-documentation",
    description: "Affidavits, power of attorney, lease agreements, and formal legal notice drafting.",
    tagline: "Contracts & Attestations",
    items: [
      {
        title: "Affidavits & Oaths",
        description: "Oath commissioner attested affidavits, undertakings & indemnity bonds",
        href: "/services/legal-documentation",
      },
      {
        title: "Power of Attorney (Local/Overseas)",
        description: "Embassy and Foreign Office attested POA for overseas Pakistanis",
        href: "/services/legal-documentation",
      },
      {
        title: "Rent & Lease Agreements",
        description: "Residential and commercial tenancy agreements compliant with law",
        href: "/services/legal-documentation",
      },
      {
        title: "Formal Legal Notices",
        description: "Drafting notices for civil disputes, debt recovery & breach of contracts",
        href: "/services/legal-documentation",
      },
    ],
  },
  {
    id: "trademark-ipo",
    title: "Trademark & IPO Registration",
    shortTitle: "Trademark & IPO",
    href: "/services/trademark-ipo"	,
    description: "Intellectual property registration, brand names, logos, copyrights, and patents.",
    tagline: "IPO Pakistan Registration",
    items: [
      {
        title: "Brand Trademark Filing",
        description: "Brand name, logo & slogan protection across all 45 classes",
        href: "/services/trademark-ipo",
      },
      {
        title: "IPO Search Reports",
        description: "Pre-filing trademark search to ensure unique availability",
        href: "/services/trademark-ipo",
      },
      {
        title: "Copyright Registration",
        description: "Legal protection for software, books, artwork & architectural designs",
        href: "/services/trademark-ipo",
      },
      {
        title: "Patent Advisory",
        description: "Technical drafting and filing for innovative inventions with IPO",
        href: "/services/trademark-ipo",
      },
      {
        title: "Objection & Show Cause Defense",
        description: "Replying to registry objections and representing in hearings",
        href: "/services/trademark-ipo",
      },
    ],
  },
];

export const SERVICES: NavService[] = [
  { title: "E-Stamping", short: "E-Stamp & Stamp Paper", href: "/services/e-stamping" },
  { title: "Property Registry", short: "Property & Land Services", href: "/services/property-land" },
  { title: "Registry & Deeds", short: "Registry & Deeds", href: "/services/registry-deeds" },
  { title: "Business Registration", short: "Business Registration", href: "/services/business-registration" },
  { title: "Tax Services", short: "Tax Services", href: "/services/tax" },
  { title: "Banking & Finance", short: "Banking & Financial Documentation", href: "/services/banking-financial" },
  { title: "Family & Legal", short: "Family & Legal Documents", href: "/services/family-legal" },
  { title: "Legal Certification", short: "Legal Documentation & Certification", href: "/services/legal-documentation" },
  { title: "Trademark & IPO", short: "Trademark & IPO Registration", href: "/services/trademark-ipo" },
];

export const HOME_SERVICES = [
  {
    title: "E-Stamping",
    href: "/services/e-stamping",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=480&q=70",
    description:
      "Digital judicial and non-judicial stamp papers processed instantly with government verification.",
  },
  {
    title: "Property Registry",
    href: "/services/property-land",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=480&q=70",
    description:
      "Complete assistance for property transfers, sale deeds, and title verification across Pakistan.",
  },
  {
    title: "Business Registry",
    href: "/services/business-registration",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=480&q=70",
    description:
      "Register your private limited or sole proprietorship with SECP and relevant chambers efficiently.",
  },
  {
    title: "Tax Services",
    href: "/services/tax",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=480&q=70",
    description:
      "FBR tax filings, NTN registrations, and sales tax certifications for individuals and firms.",
  },
];

export const HERO_IMAGES = {
  home: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=70",
  banking:
    "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1280&q=70",
  business:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1280&q=70",
  estamp:
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1280&q=70",
  family: "/images/services/family-court.jpg",
  legal:
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1280&q=70",
  property:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1280&q=70",
  registry:
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1280&q=70",
  tax: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1280&q=70",
  trademark: "/images/services/trademark-ipo.jpg",
};
