export type Language = "en" | "ur";

export interface SubServiceTrans {
  title: string;
  description: string;
}

export interface CategoryTrans {
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  items: SubServiceTrans[];
}

export interface ServiceCardTrans {
  title: string;
  meta?: string;
  description: string;
  listLabel?: string;
  bullets?: string[];
  linkLabel?: string;
}

export interface FeatureTrans {
  title: string;
  text: string;
}

export interface ServicePageTrans {
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  noticeLabel: string;
  noticeTitle: string;
  noticeText: string;
  noticeCta: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  cards: ServiceCardTrans[];
  whyEyebrow: string;
  whyTitle: string;
  whyParagraphs: string[];
  whyFeatures: FeatureTrans[];
  imageTip?: string;
  disclaimerBox?: string;
  checklistBannerTitle: string;
  checklistBannerDesc: string;
}

export interface Translations {
  site: {
    name: string;
    country: string;
    badge: string;
    phoneLabel: string;
    whatsappLabel: string;
    officeDirections: string;
  };
  nav: {
    home: string;
    taxServices: string;
    eStamping: string;
    business: string;
    propertyLand: string;
    legalFamily: string;
    about: string;
    viewAll: string;
    overview: string;
    checklistTip: string;
    viewFullDetails: string;
  };
  hero: {
    eyebrow: string;
    titlePart1: string;
    countryHighlight: string;
    description: string;
    visitOfficeBtn: string;
    whatsappBtn: string;
    govVerified: string;
    sameDay: string;
    confidential: string;
  };
  servicesSection: {
    title: string;
    subtitle: string;
    learnMore: string;
  };
  prepareVisit: {
    badge: string;
    title: string;
    description: string;
    callNowBtn: string;
    requestChecklistBtn: string;
    officeCardTitle: string;
    officeCardDesc: string;
    getDirectionsBtn: string;
    steps: {
      title: string;
      text: string;
    }[];
  };
  whyTrust: {
    title: string;
    yearsMetric: string;
    yearsLabel: string;
    features: {
      title: string;
      text: string;
    }[];
  };
  finalCta: {
    title: string;
    description: string;
    callSupport: string;
    whatsappDirect: string;
    visitHours: string;
    hoursVal: string;
    visitOfficeBtn: string;
  };
  officeSection: {
    title: string;
    subtitle: string;
    addressLabel: string;
    hoursLabel: string;
    getDirectionsBtn: string;
  };
  form: {
    cardTitle: string;
    cardSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    service: string;
    selectService: string;
    services: {
      tax: string;
      estamp: string;
      property: string;
      business: string;
      legal: string;
    };
    message: string;
    messagePlaceholder: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
  };
  common: {
    home: string;
    backToHome: string;
    backToServices: string;
    speakToExpert: string;
    visitOurOffice: string;
    whatsappUs: string;
    callNow: string;
    callSupport: string;
    getDirections: string;
    learnMore: string;
    requirementDetails: string;
    inPersonInquiry: string;
    officialProcessing: string;
    requiredDocs: string;
    institutionalExcellence: string;
    officialCompliance: string;
    needChecklist: string;
    needChecklistDesc: string;
    fastContact: string;
    physicalVerificationNotice: string;
    publicDealingHours: string;
    weekdays: string;
    weekdaysHours: string;
    saturdays: string;
    saturdayHours: string;
    closed: string;
    immediateAssistance: string;
    immediateAssistanceDesc: string;
  };
  footer: {
    contactUs: string;
    businessHours: string;
    quickLinks: string;
    followUs: string;
    disclaimer: string;
    rights: string;
    privacy: string;
    terms: string;
  };
  categories: Record<string, CategoryTrans>;
  servicePages: Record<string, ServicePageTrans>;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    site: {
      name: "LegalAssist",
      country: "PAKISTAN",
      badge: "Authorized Documentation Experts",
      phoneLabel: "Call Support",
      whatsappLabel: "WhatsApp Us",
      officeDirections: "Get Directions",
    },
    nav: {
      home: "Home",
      taxServices: "Tax Services",
      eStamping: "E-Stamping",
      business: "Business",
      propertyLand: "Property & Land",
      legalFamily: "Legal & Family",
      about: "About",
      viewAll: "View All",
      overview: "Overview",
      checklistTip: "Pre-visit checklist & helpline:",
      viewFullDetails: "View Full Details",
    },
    hero: {
      eyebrow: "Authorized Documentation Experts",
      titlePart1: "Premium Legal Documentation Services in",
      countryHighlight: "Pakistan",
      description:
        "Providing reliable E-Stamping, property registry, and business registration solutions with absolute transparency and professional excellence.",
      visitOfficeBtn: "Visit Our Office",
      whatsappBtn: "WhatsApp Us",
      govVerified: "Government Verified",
      sameDay: "Same-Day Processing",
      confidential: "100% Confidential",
    },
    servicesSection: {
      title: "Our Specialized Services",
      subtitle:
        "Comprehensive legal and administrative support tailored to simplify complex documentation processes for individuals and corporations.",
      learnMore: "Learn More",
    },
    prepareVisit: {
      badge: "Important Requirement Notice",
      title: "Prepare Before You Visit",
      description:
        "To ensure a seamless experience and avoid multiple trips, we strongly advise all clients to contact our office for a document checklist before visiting. Most legal processes require specific government-issued IDs and previous records.",
      callNowBtn: "Call Now",
      requestChecklistBtn: "Request Checklist",
      officeCardTitle: "Main Office Location",
      officeCardDesc:
        "Office 402, Business Tower, Blue Area, Islamabad. Situated in the heart of the business district for easy accessibility.",
      getDirectionsBtn: "Get Directions",
      steps: [
        {
          title: "Call for Document Checklist",
          text: "Different processes require specific original documents. Call us to save time.",
        },
        {
          title: "Schedule Appointment",
          text: "We limit daily visitors to ensure quality one-on-one professional attention.",
        },
        {
          title: "Verification Visit",
          text: "Bring your original CNIC and required documents to our Blue Area office.",
        },
      ],
    },
    whyTrust: {
      title: "Why Pakistan's Leading Firms Trust Us",
      yearsMetric: "15+",
      yearsLabel: "Years of Service",
      features: [
        {
          title: "Verified Credentials",
          text: "Officially recognized and registered entity providing authorized government services.",
        },
        {
          title: "Fast-Track Processing",
          text: "Optimized workflows that significantly reduce waiting times compared to standard channels.",
        },
        {
          title: "Expert Advisory",
          text: "Our consultants hold years of experience in Pakistani property law and corporate regulation.",
        },
        {
          title: "100% Transparency",
          text: "Clear fee structures with no hidden costs. Every transaction is documented and receipted.",
        },
      ],
    },
    finalCta: {
      title: "Ready to Finalize Your Documentation?",
      description:
        "Skip the long queues and confusing paperwork. Connect with our experts today to schedule an appointment or get immediate assistance with your requirements.",
      callSupport: "Call Support",
      whatsappDirect: "WhatsApp Direct",
      visitHours: "Visit Hours",
      hoursVal: "Mon - Fri: 9am - 6pm",
      visitOfficeBtn: "Visit Our Office",
    },
    officeSection: {
      title: "Visit Us for Professional Service",
      subtitle:
        "No online applications. All legal documentation must be processed physically to ensure authenticity and legal validity.",
      addressLabel: "Office Address",
      hoursLabel: "Working Hours",
      getDirectionsBtn: "Get Directions on Google Maps",
    },
    form: {
      cardTitle: "Quick Consultation Request",
      cardSubtitle: "Leave your details and our documentation specialist will contact you.",
      fullName: "Full Name",
      fullNamePlaceholder: "e.g. Muhammad Ali",
      phone: "Phone Number",
      phonePlaceholder: "e.g. 0300 1234567",
      service: "Required Service",
      selectService: "Select a Service Category",
      services: {
        tax: "Tax & FBR Services",
        estamp: "E-Stamping & Stamp Papers",
        property: "Property & Land Verification",
        business: "Business Registration (SECP)",
        legal: "Legal Drafting & Certification",
      },
      message: "Case / Requirement Details",
      messagePlaceholder: "Briefly explain the documents or services you need assistance with...",
      submitBtn: "Submit Consultation Request",
      submitting: "Submitting...",
      successTitle: "Request Received Successfully",
      successDesc: "Thank you. Our legal documentation specialist will call you shortly to assist.",
    },
    common: {
      home: "Home",
      backToHome: "Back to Home",
      backToServices: "Back to Services",
      speakToExpert: "Speak to an Expert",
      visitOurOffice: "Visit Our Office",
      whatsappUs: "WhatsApp Us",
      callNow: "Call Now",
      callSupport: "Call Support",
      getDirections: "Get Directions",
      learnMore: "Learn More",
      requirementDetails: "Requirement Details",
      inPersonInquiry: "In-Person Inquiry",
      officialProcessing: "Official Processing",
      requiredDocs: "Required Documents",
      institutionalExcellence: "Institutional Excellence",
      officialCompliance: "Official Compliance",
      needChecklist: "Need a Document Checklist?",
      needChecklistDesc: "Don't risk multiple trips. Call us now and we'll tell you exactly what you need to bring for your specific case.",
      fastContact: "Fast Contact Options",
      physicalVerificationNotice: "Note: We do not accept online applications. Physical verification of original documents is required.",
      publicDealingHours: "Public Dealing Hours",
      weekdays: "Monday – Friday",
      weekdaysHours: "9:00 AM – 6:00 PM",
      saturdays: "Saturday",
      saturdayHours: "10:00 AM – 2:00 PM",
      closed: "Sunday: Closed",
      immediateAssistance: "Immediate Assistance",
      immediateAssistanceDesc: "Get in touch with our document experts to confirm your requirements or navigate to our office for immediate processing.",
    },
    footer: {
      contactUs: "Contact Us",
      businessHours: "Business Hours",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      disclaimer:
        "Authorized documentation facilitation. All documents are verified in person at our Islamabad office.",
      rights: "© 2026 LegalAssist Pakistan. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    categories: {
      tax: {
        title: "Tax Services",
        shortTitle: "Tax Services",
        tagline: "Federal Board of Revenue & Iris Compliance",
        description:
          "FBR tax filings, NTN registrations, sales tax, and audit compliance for individuals and firms.",
        items: [
          { title: "NTN Registration", description: "Salaried, business, and freelance Iris portal setup and issuance" },
          { title: "Income Tax Filing", description: "Annual tax return & wealth statements for Active Taxpayer status" },
          { title: "Sales Tax Registration (STRN)", description: "GST / STRN registration for manufacturers, traders, and services" },
          { title: "Tax Exemption Certificates", description: "Withholding tax exemptions and special industrial certificates" },
          { title: "FBR Audit Response", description: "Professional drafting and representation for section 177 / 214C notices" },
          { title: "Chamber of Commerce", description: "ICCI & RCCI chamber membership processing and documentation" },
        ],
      },
      "e-stamping": {
        title: "E-Stamp & Stamp Paper",
        shortTitle: "E-Stamping",
        tagline: "Authorized Government Stamp Vendor",
        description:
          "Official digital stamp papers processed instantly with government portal verification.",
        items: [
          { title: "Non-Judicial E-Stamp", description: "PKR 50 to 1,000+ for commercial agreements, affidavits & contracts" },
          { title: "High-Value Judicial", description: "For court petitions, formal litigation, and legal declarations" },
          { title: "Property Sale Deed", description: "Calculated at official 1% DC rate for plot and house transfers" },
          { title: "Partnership Deed", description: "Authorized stamp papers for business partnerships and firm deeds" },
          { title: "Bank Documentation", description: "Custom stamp papers for loan agreements and mortgage deeds" },
          { title: "Verification & Challan 32-A", description: "Official online verification and accurate challan generation" },
        ],
      },
      "business-registration": {
        title: "Business Registration",
        shortTitle: "Business",
        tagline: "SECP & Corporate Documentation",
        description:
          "End-to-end corporate formation with SECP, FBR, and local municipal chambers.",
        items: [
          { title: "SECP Incorporation", description: "Private Limited (Pvt. Ltd.) & SMC company registration with MOA/AOA" },
          { title: "Sole Proprietorship", description: "Fast-track registration of individual business entities with FBR" },
          { title: "Partnership Deeds (Form C)", description: "Professional drafting and registration with the Registrar of Firms" },
          { title: "NTN & Sales Tax (GST)", description: "Corporate tax registration, STRN certification & bank opening papers" },
          { title: "Chamber Membership", description: "Corporate membership for Islamabad & Rawalpindi chambers of commerce" },
          { title: "Trade License (CDA/DMC)", description: "Municipal licenses, signboard permissions & professional tax certificates" },
        ],
      },
      "property-land": {
        title: "Property & Land Services",
        shortTitle: "Property & Land",
        tagline: "Real Estate Legal Verification",
        description:
          "Complete assistance for property transfers, sale deeds, and title verification across Pakistan.",
        items: [
          { title: "Sale Deed Documentation", description: "Baya-Nama drafting, stamp duty processing & Sub-Registrar execution" },
          { title: "Transfer Letter Services", description: "End-to-end facilitation for CDA, LDA, DHA, and housing societies" },
          { title: "Legal Search & Title Audit", description: "Thorough verification of property titles and Non-Encumbrance (NEC)" },
          { title: "Registry & Attestation", description: "Authorized assistance for property registration before Sub-Registrar" },
          { title: "Succession Certificates", description: "Inheritance documentation and legal heirship transfers for real estate" },
          { title: "Power of Attorney (GPA/SPA)", description: "Drafting & registration of Power of Attorney for property management" },
        ],
      },
      "registry-deeds": {
        title: "Registry & Deeds",
        shortTitle: "Registry & Deeds",
        tagline: "Sub-Registrar & Revenue Records",
        description:
          "Sub-registrar office registrations, gift deeds, mortgage deeds, and certified records.",
        items: [
          { title: "Sale Deed (Baye Nama)", description: "Full transfer of ownership rights before the Sub-Registrar" },
          { title: "Gift Deed (Hiba Nama)", description: "Official legal recording of property transferred as a gift to family" },
          { title: "Power of Attorney", description: "Authorized registration of General and Special POA" },
          { title: "Title Search & Verification", description: "Record verification from Sub-Registrar and Revenue offices" },
          { title: "Mortgage Deed Registration", description: "Official collateral registration with banks and lenders" },
          { title: "Certified Copies (Nakal)", description: "Attested copies of historical deeds from government archives" },
        ],
      },
      "banking-financial": {
        title: "Banking & Financial",
        shortTitle: "Banking & Finance",
        tagline: "Financial Institution Documentation",
        description:
          "Loan documentation, corporate hypothecation deeds, bank guarantees, and affidavits.",
        items: [
          { title: "Loan Documentation", description: "Personal, auto, and mortgage agreements with private and state banks" },
          { title: "Corporate Finance Docs", description: "Commercial loans, charge creation (Form 10/12), and hypothecation" },
          { title: "Financial Affidavits", description: "Source of income affidavits, loss of chequebook, and bank NOCs" },
          { title: "Mortgage & Collateral", description: "Legal registration of real estate as banking security" },
        ],
      },
      "family-legal": {
        title: "Family & Legal Documents",
        shortTitle: "Family & Legal",
        tagline: "Family Law & NADRA Certification",
        description:
          "Marriage registration, succession certificates, guardianship, and divorce documentation.",
        items: [
          { title: "Nikahnama Registration", description: "Official NADRA and Union Council marriage registration and certs" },
          { title: "Succession Certificates", description: "Court application and NADRA certificate for estate & bank accounts" },
          { title: "Divorce Documents", description: "Talaq-nama, Khula notices, and Arbitration Council facilitation" },
          { title: "Child Guardianship", description: "Guardian court documentation and legal custody representation" },
        ],
      },
      "legal-documentation": {
        title: "Legal Documentation",
        shortTitle: "Legal Docs",
        tagline: "Contracts & Attestations",
        description:
          "Affidavits, power of attorney, lease agreements, and formal legal notice drafting.",
        items: [
          { title: "Affidavits & Oaths", description: "Oath commissioner attested affidavits, undertakings & indemnity bonds" },
          { title: "Power of Attorney (Local/Overseas)", description: "Embassy and Foreign Office attested POA for overseas Pakistanis" },
          { title: "Rent & Lease Agreements", description: "Residential and commercial tenancy agreements compliant with law" },
          { title: "Formal Legal Notices", description: "Drafting notices for civil disputes, debt recovery & breach of contracts" },
        ],
      },
      "trademark-ipo": {
        title: "Trademark & IPO Registration",
        shortTitle: "Trademark & IPO",
        tagline: "IPO Pakistan Registration",
        description:
          "Intellectual property registration, brand names, logos, copyrights, and patents.",
        items: [
          { title: "Brand Trademark Filing", description: "Brand name, logo & slogan protection across all 45 classes" },
          { title: "IPO Search Reports", description: "Pre-filing trademark search to ensure unique availability" },
          { title: "Copyright Registration", description: "Legal protection for software, books, artwork & architectural designs" },
          { title: "Patent Advisory", description: "Technical drafting and filing for innovative inventions with IPO" },
          { title: "Objection Defense", description: "Replying to registry objections and representing in hearings" },
        ],
      },
    },
    servicePages: {
      "e-stamping": {
        heroBadge: "Authorized Government Vendor",
        heroTitle: "E-Stamp & Stamp Paper Services",
        heroDesc: "Legally recognized judicial and non-judicial stamp papers for all your legal, property, and business requirements. Fast, verified, and professional processing at our Blue Area office.",
        noticeLabel: "Pre-Visit Consultation Required",
        noticeTitle: "Pre-Visit Consultation Required",
        noticeText: "Stamp paper requirements vary significantly based on the purpose (e.g. Sale Deed, Affidavit, Rental Agreement). Please contact us before visiting to ensure you bring the correct documentation and CNIC.",
        noticeCta: "Check Requirements",
        portfolioTitle: "Complete Stamp Paper Solutions",
        portfolioSubtitle: "We provide a comprehensive range of e-stamping services tailored for legal professionals, corporate entities, and private individuals.",
        cards: [
          {
            title: "Non-Judicial E-Stamp",
            meta: "Value: PKR 50 to PKR 1,000+",
            description: "Standard digital stamp papers for commercial agreements, affidavits, and general legal documentation.",
            listLabel: "Common Applications",
            bullets: ["Rental Agreements", "Affidavits", "Indemnity Bonds", "Undertakings"],
            linkLabel: "Requirement Details",
          },
          {
            title: "High-Value Judicial",
            meta: "Value: Variable based on court fees",
            description: "Stamp papers required for court proceedings, litigation, and formal legal representation in Pakistani courts.",
            listLabel: "Common Applications",
            bullets: ["Power of Attorney", "Court Petitions", "Legal Declarations", "Succession Papers"],
            linkLabel: "Requirement Details",
          },
          {
            title: "Property Sale Deed",
            meta: "Value: 1% of Property DC Rate",
            description: "Specific E-stamping required for the transfer of immovable property, including plots and houses.",
            listLabel: "Common Applications",
            bullets: ["Sale Deeds", "Gift Deeds", "Transfer Letters", "Relinquishment Deeds"],
            linkLabel: "Requirement Details",
          },
          {
            title: "Partnership Deed",
            meta: "Value: PKR 2,000 to PKR 5,000",
            description: "Authorized stamp papers for registering business partnerships and joint venture agreements.",
            listLabel: "Common Applications",
            bullets: ["Partnership Registration", "Business Agreements", "LLP Documents"],
            linkLabel: "Requirement Details",
          },
          {
            title: "Bank Documentation",
            meta: "Value: Based on Loan Amount",
            description: "Stamp papers customized for banking facilities, loan agreements, and financial mortgages.",
            listLabel: "Common Applications",
            bullets: ["Loan Agreements", "Mortgage Deeds", "Guarantees", "Charge Forms"],
            linkLabel: "Requirement Details",
          },
          {
            title: "Verification Services",
            meta: "Service Fee Only",
            description: "Official verification of existing E-stamp papers to ensure authenticity and validity via government portal.",
            listLabel: "Common Applications",
            bullets: ["Document Audit", "Verification Certificate", "Fraud Prevention Check"],
            linkLabel: "Requirement Details",
          },
        ],
        whyEyebrow: "Institutional Standards",
        whyTitle: "Why Professional E-Stamping Matters in Pakistan",
        whyParagraphs: [
          "The Government of Pakistan has transitioned to a digital E-Stamping system to prevent fraud and simplify verification. However, selecting the correct category, value, and challan details remains a complex task that requires precise legal knowledge.",
          "Our authorized team ensures your stamp papers comply fully with the Stamp Act 1899, preventing costly legal challenges or rejections at government departments.",
        ],
        whyFeatures: [
          { title: "Accurate Challan Generation", text: "We handle generation of 32-A Challans with the correct Head of Account to avoid payment errors." },
          { title: "Authenticity Verification", text: "Every e-stamp paper we issue is verified through the official portal and stamped with our vendor mark." },
          { title: "Same-Day Issuance", text: "Bring your required documents before 12:00 PM and we process your stamp paper on the same business day." },
        ],
        imageTip: "Ensure the stamp paper value matches the legal obligation it is intended to fulfill (per applicable laws).",
        disclaimerBox: "LegalAssist Pakistan is an authorized facilitator. All documents must be collected in person after verification.",
        checklistBannerTitle: "Need a Document Checklist?",
        checklistBannerDesc: "Don't risk multiple trips. Call us now and we'll tell you exactly what you need to bring for your specific stamp paper request.",
      },
      tax: {
        heroBadge: "FBR & Iris Compliance",
        heroTitle: "Tax Services & Advisory",
        heroDesc: "Expert tax consultancy and documentation services for individuals and corporations in Pakistan. We simplify FBR compliance so you can focus on growth.",
        noticeLabel: "Mandatory Requirement Notice",
        noticeTitle: "Mandatory Requirement Notice",
        noticeText: "Tax documentation requirements in Pakistan vary significantly based on your source of income (Salary, Business, Property, or Foreign Remittance). Please contact our office to receive a customized document checklist before your physical visit.",
        noticeCta: "Request Checklist",
        portfolioTitle: "Our Tax Service Portfolio",
        portfolioSubtitle: "Comprehensive solutions for individuals, freelancers, and small-to-medium enterprises seeking professional documentation support.",
        cards: [
          {
            title: "NTN Registration",
            meta: "Individuals & Businesses",
            description: "Issuance of National Tax Number for salaried persons, freelancers, and business firms with Iris portal credential setup.",
            bullets: ["CNIC & Bank Certificate", "Utility Bill & Rental Deed", "Iris Portal Verification"],
            linkLabel: "Official Processing",
          },
          {
            title: "Income Tax Filing",
            meta: "Active Taxpayer List (ATL)",
            description: "Annual income tax return and wealth statement filing for individuals and corporate entities to secure active filer benefits.",
            bullets: ["Withholding Tax Credits", "Asset & Liability Declaration", "Active Filer Status"],
            linkLabel: "Official Processing",
          },
          {
            title: "Sales Tax Registration",
            meta: "STRN / GST Issuance",
            description: "STRN registration for manufacturers, importers, and service providers under the Sales Tax Act 1990.",
            bullets: ["Biometric Verification", "Bank Account Certificate", "Premises Inspection Help"],
            linkLabel: "Official Processing",
          },
          {
            title: "Tax Exemption Certificates",
            meta: "Withholding Tax Exemptions",
            description: "Documentation and legal filing for withholding tax exemption certificates under relevant sections of the Income Tax Ordinance.",
            bullets: ["Section 153/159 Filing", "Financial Statement Audit", "Fast Commissioner Approval"],
            linkLabel: "Official Processing",
          },
          {
            title: "FBR Audit Response",
            meta: "Notice 177 / 214C Defense",
            description: "Professional drafting and legal representation for audit notices, inquiries, and show-cause orders from FBR.",
            bullets: ["Notice Reply Drafting", "Record Reconciliations", "Advisory & Representation"],
            linkLabel: "Official Processing",
          },
          {
            title: "Chamber Membership",
            meta: "ICCI & RCCI Certification",
            description: "Complete documentation and processing for Islamabad and Rawalpindi Chambers of Commerce and Industry membership.",
            bullets: ["Corporate Registration", "Tax Clearance Proof", "Official Chamber Card"],
            linkLabel: "Official Processing",
          },
        ],
        whyEyebrow: "Institutional Excellence",
        whyTitle: "Why Professional Tax Assistance Matters",
        whyParagraphs: [
          "Navigating the Federal Board of Revenue (FBR) regulations in Pakistan requires precision and up-to-date knowledge of the current Finance Act. Incorrect filings or missed deadlines can result in heavy penalties and legal complications.",
          "LegalAssist Pakistan provides a bridge between complex tax laws and your financial peace of mind. Our team of certified consultants ensures that every document is verified, every exemption is explored, and every submission is timely.",
        ],
        whyFeatures: [
          { title: "Fully Compliant", text: "Adhering strictly to latest FBR guidelines and legal frameworks." },
          { title: "Transparent Fee", text: "Fixed service charges with no hidden consultancy costs." },
        ],
        checklistBannerTitle: "Schedule Your Consultation",
        checklistBannerDesc: "Our Blue Area office is open Monday through Saturday for walk-in consultations and pre-scheduled appointments.",
      },
      "property-land": {
        heroBadge: "Real Estate & Documentation",
        heroTitle: "Property & Land Services",
        heroDesc: "Expert assistance for property transfers, title verification, registry documentation, and legal searches across Islamabad and major districts of Pakistan.",
        noticeLabel: "Title Verification Advisory",
        noticeTitle: "Critical Title Verification Advisory",
        noticeText: "Property transactions demand rigorous verification before any token payment. Contact our legal search experts to verify original ownership records and non-encumbrance status.",
        noticeCta: "Verify Title",
        portfolioTitle: "Property Legal Services",
        portfolioSubtitle: "Comprehensive assistance for property buyers, sellers, and heirs navigating Pakistani land registry departments.",
        cards: [
          {
            title: "Sale Deed Documentation",
            meta: "Baya-Nama Drafting",
            description: "Complete legal drafting and processing of Sale Deeds for residential, commercial, and agricultural properties.",
            bullets: ["Title History Tracing", "Stamp Duty Calculation", "Sub-Registrar Execution"],
            linkLabel: "In-Person Inquiry",
          },
          {
            title: "Transfer Letter Services",
            meta: "CDA, LDA & Housing Societies",
            description: "End-to-end facilitation for transfer of allotment letters in CDA, LDA, DHA, and approved private housing schemes.",
            bullets: ["NDC Clearance", "Biometric Scheduling", "Allotment Letter Issuance"],
            linkLabel: "In-Person Inquiry",
          },
          {
            title: "Legal Search Reports",
            meta: "Non-Encumbrance (NEC)",
            description: "Thorough verification of property titles, mortgage encumbrance certificates, and Sub-Registrar record inspection.",
            bullets: ["Record Room Verification", "Bank Charge Clearance", "Dispute History Audit"],
            linkLabel: "In-Person Inquiry",
          },
          {
            title: "Registry & Attestation",
            meta: "Sub-Registrar Office",
            description: "Authorized assistance for property registration before the Sub-Registrar and official stamp duty challan generation.",
            bullets: ["Witness Coordination", "Biometric Attestation", "Original Deed Delivery"],
            linkLabel: "In-Person Inquiry",
          },
          {
            title: "Succession Certificates",
            meta: "Real Estate Inheritance",
            description: "Legal support for obtaining succession and legal heirship certificates for real estate transfer and division.",
            bullets: ["Family Tree Verification", "Court / NADRA Processing", "Mutation (Inteqal) Filing"],
            linkLabel: "In-Person Inquiry",
          },
          {
            title: "Power of Attorney",
            meta: "GPA & SPA Registration",
            description: "Drafting and registration of General (GPA) and Special (SPA) Power of Attorney for property management and sale.",
            bullets: ["Sub-Registrar Registration", "Overseas MOFA Attestation", "Specific Authority Scrutiny"],
            linkLabel: "In-Person Inquiry",
          },
        ],
        whyEyebrow: "Asset Protection",
        whyTitle: "Secure Your Property Assets with Legal Precision",
        whyParagraphs: [
          "In Pakistan, property transactions demand meticulous attention to detail to prevent future disputes. LegalAssist provides a specialized team dedicated to the rigorous verification of land titles, e-stamping, and the preparation of comprehensive sale deeds.",
          "We bridge the gap between clients and government authorities (Patwari, CDA, LDA, etc.), ensuring every document complies with current provincial laws and regulatory standards.",
        ],
        whyFeatures: [
          { title: "Authentic Verification", text: "Verification directly from relevant land record authorities and revenue departments." },
          { title: "Expert Drafting", text: "Bespoke sale deeds tailored to protect buyer and seller rights completely." },
          { title: "Sub-Registrar Filing", text: "Complete representation during registration and biometric witness proceedings." },
          { title: "Dispute Avoidance", text: "Pre-transaction audits that eliminate risks of duplicate registry or legal encumbrance." },
        ],
        checklistBannerTitle: "Planning a Property Purchase?",
        checklistBannerDesc: "Consult our real estate legal specialists before issuing token or earnest money to guarantee clean title.",
      },
      "business-registration": {
        heroBadge: "SECP & Corporate Services",
        heroTitle: "Business Registration & Corporate Services",
        heroDesc: "End-to-end corporate formation with SECP, partnership deeds with Registrar of Firms, NTN/STRN, and municipal licensing in Pakistan.",
        noticeLabel: "Corporate Compliance Notice",
        noticeTitle: "SECP Incorporation Guidelines",
        noticeText: "Company registration requires valid digital signatures, name availability approval, and verified identification for all proposed directors.",
        noticeCta: "Check Availability",
        portfolioTitle: "Corporate Registration Services",
        portfolioSubtitle: "Professional incorporation pathways tailored for startups, SMEs, and foreign direct investors entering Pakistan.",
        cards: [
          {
            title: "SECP Company Incorporation",
            meta: "Pvt. Ltd. & SMC",
            description: "Complete formation of Private Limited and Single Member Companies with Memorandum (MOA) and Articles of Association (AOA).",
            bullets: ["Name Reservation", "Digital Signature Setup", "Certificate of Incorporation"],
            linkLabel: "Start Incorporation",
          },
          {
            title: "Sole Proprietorship",
            meta: "Fast-Track FBR Filing",
            description: "Immediate legal registration of individual proprietorships with NTN, bank opening facilitation letter, and business certificates.",
            bullets: ["Same-Day Filing", "Iris Account Linked", "Bank Verification Ready"],
            linkLabel: "Start Incorporation",
          },
          {
            title: "Partnership Registration (Form C)",
            meta: "Registrar of Firms",
            description: "Drafting of legal Partnership Deeds and formal registration with the Registrar of Firms for Form C issuance.",
            bullets: ["Deed Drafting on Stamp", "Registrar Submission", "Form C Certification"],
            linkLabel: "Start Incorporation",
          },
          {
            title: "Corporate NTN & Sales Tax (GST)",
            meta: "FBR Corporate Iris",
            description: "Corporate National Tax Number issuance and Sales Tax Registration (STRN) for domestic and export businesses.",
            bullets: ["Corporate Tax Profile", "STRN Active Status", "Withholding Exemption Setup"],
            linkLabel: "Start Incorporation",
          },
          {
            title: "Chamber of Commerce",
            meta: "ICCI & RCCI Membership",
            description: "Full assistance in acquiring corporate membership with the Islamabad and Rawalpindi Chambers of Commerce.",
            bullets: ["Application Documentation", "Corporate Attestation", "Executive Membership"],
            linkLabel: "Start Incorporation",
          },
          {
            title: "Trade License & Municipal Clearances",
            meta: "CDA / Municipal Approval",
            description: "Procurement of trade licenses, signboard clearances, and commercial operation NOCs from local municipal authorities.",
            bullets: ["Zoning Compliance", "Professional Tax Clear", "Operating License Issuance"],
            linkLabel: "Start Incorporation",
          },
        ],
        whyEyebrow: "Corporate Standards",
        whyTitle: "Launch Your Business on Solid Legal Foundations",
        whyParagraphs: [
          "Operating an unregistered or improperly structured business exposes founders to personal financial liability and regulatory penalties. LegalAssist ensures your company is incorporated in strict compliance with the Companies Act 2017.",
          "From reserving your corporate name to opening your corporate commercial bank account, we manage every administrative hurdle with absolute efficiency.",
        ],
        whyFeatures: [
          { title: "SECP Fast-Track", text: "Direct online portal processing with prompt SECP compliance queries resolution." },
          { title: "Complete Documentation", text: "Tailored MOA & AOA drafted by seasoned corporate attorneys." },
          { title: "Post-Incorporation Compliance", text: "Filing Form 29, annual returns, and corporate secretarial services." },
          { title: "Banking Advisory", text: "Assistance with documentation required for corporate account opening." },
        ],
        checklistBannerTitle: "Ready to Register Your Company?",
        checklistBannerDesc: "Speak with our corporate registration lawyers today to select the optimal legal structure for your enterprise.",
      },
      "registry-deeds": {
        heroBadge: "Sub-Registrar & Revenue Department",
        heroTitle: "Registry & Deeds Documentation",
        heroDesc: "Authorized facilitation for Sub-Registrar registrations, gift deeds (Hiba Nama), sale deeds (Baye Nama), mortgage deeds, and certified revenue records.",
        noticeLabel: "Sub-Registrar Biometric Notice",
        noticeTitle: "Biometric & Witness Mandate",
        noticeText: "All parties, sellers, buyers, and two witnesses with original valid CNICs must appear in person before the Sub-Registrar for biometric verification and statement recording.",
        noticeCta: "Consult Specialist",
        portfolioTitle: "Deeds & Registry Solutions",
        portfolioSubtitle: "Official legal registration of property documents, deeds of conveyance, and historical record retrieval.",
        cards: [
          {
            title: "Sale Deed (Baye Nama)",
            meta: "Absolute Title Transfer",
            description: "Drafting, stamp duty assessment, and official execution of sale deeds before the Sub-Registrar office.",
            bullets: ["Official Stamp Paper", "Biometric Thumb Impression", "Endorsement on Record"],
            linkLabel: "Registry Inquiry",
          },
          {
            title: "Gift Deed (Hiba Nama)",
            meta: "Blood-Relation Transfers",
            description: "Legally sound drafting and registration of property gifts between blood relatives under Islamic and civil law.",
            bullets: ["Legal Offer & Acceptance", "Stamp Duty Concessions", "Sub-Registrar Registration"],
            linkLabel: "Registry Inquiry",
          },
          {
            title: "Power of Attorney (POA)",
            meta: "GPA & SPA Attestation",
            description: "Authorized registration of General and Special Power of Attorney for representation before courts and land registries.",
            bullets: ["Specific Powers Drafting", "Sub-Registrar Recording", "Revocation Advisory"],
            linkLabel: "Registry Inquiry",
          },
          {
            title: "Title Search & Record Audit",
            meta: "Revenue & Sub-Registrar",
            description: "Exhaustive verification of property ownership history through Sub-Registrar archives and Patwari revenue registers.",
            bullets: ["Record Room Search", "No-Litigation Audit", "Certified Record Abstract"],
            linkLabel: "Registry Inquiry",
          },
          {
            title: "Mortgage Deed Registration",
            meta: "Collateral & Banking",
            description: "Legal registration of registered mortgages and memoranda of deposit of title deeds in favor of financial institutions.",
            bullets: ["Charge Formalization", "Sub-Registrar Entry", "Redemption Formalities"],
            linkLabel: "Registry Inquiry",
          },
          {
            title: "Certified Copies (Nakal)",
            meta: "Historical Archive Copies",
            description: "Procurement of attested historical copies of lost or archived registered deeds from government record rooms.",
            bullets: ["Archive Registry Search", "Attested Official Copy", "Urgent Processing Option"],
            linkLabel: "Registry Inquiry",
          },
        ],
        whyEyebrow: "Revenue Record Authority",
        whyTitle: "Official Recording for Absolute Ownership Security",
        whyParagraphs: [
          "An unregistered deed or oral agreement holds negligible evidentiary value in Pakistani courts when property ownership is disputed. Sub-Registrar registration provides statutory presumption of authenticity and public notice.",
          "Our team coordinates directly with the office of the Sub-Registrar to ensure every challan, stamp duty, and biometric verification is handled flawlessly.",
        ],
        whyFeatures: [
          { title: "Sub-Registrar Execution", text: "Hands-on facilitation on the day of registration to prevent bureaucratic delays." },
          { title: "Biometric Verification", text: "Accurate coordination of biometric signatures and NADRA identity verification." },
          { title: "Revenue Search", text: "Reconciliation of registry records with current Patwari and Tehsil registers." },
          { title: "Certified Copies", text: "Retrieval of certified true copies directly from official archives." },
        ],
        checklistBannerTitle: "Need to Execute a Legal Deed?",
        checklistBannerDesc: "Call our registry department to calculate exact stamp duty challans and schedule your appointment.",
      },
      "banking-financial": {
        heroBadge: "Financial Documentation",
        heroTitle: "Banking & Financial Documentation",
        heroDesc: "Specialized legal documentation for commercial loans, mortgage collateral, charge creation (Form 10/12), hypothecation deeds, and financial affidavits.",
        noticeLabel: "SBP & Banking Notice",
        noticeTitle: "Banking Compliance Verification",
        noticeText: "Banking security documents and mortgage creation must comply strictly with State Bank of Pakistan (SBP) guidelines and SECP regulations.",
        noticeCta: "Speak to Consultant",
        portfolioTitle: "Financial Legal Portfolio",
        portfolioSubtitle: "Rigorous documentation ensuring enforceability and institutional compliance for banks, borrowers, and investors.",
        cards: [
          {
            title: "Loan Documentation",
            meta: "Commercial & Personal Facilities",
            description: "Comprehensive review and execution of credit facility agreements, repayment schedules, and personal guarantees.",
            bullets: ["Facility Agreements", "Personal Guarantees", "Enforceability Review"],
            linkLabel: "Consult Specialist",
          },
          {
            title: "Corporate Finance & Charges",
            meta: "Form 10/12 SECP Filing",
            description: "Drafting of hypothecation deeds, floating charges, and official charge registration with SECP within statutory deadlines.",
            bullets: ["Hypothecation Agreements", "Form 10/12 Filing", "Certificate of Charge Registration"],
            linkLabel: "Consult Specialist",
          },
          {
            title: "Financial Affidavits & Undertakings",
            meta: "Notarized & Attested",
            description: "Legally binding affidavits regarding income verification, asset declaration, loss of negotiable instruments, and bank NOCs.",
            bullets: ["Source of Funds Affidavits", "Loss of Cheque Undertakings", "Bank Clearance Affidavits"],
            linkLabel: "Consult Specialist",
          },
          {
            title: "Mortgage & Collateral Security",
            meta: "Equitable & Registered Mortgage",
            description: "Creation and registration of legal mortgages on real estate assets, title verification, and clearance certificates for lenders.",
            bullets: ["Title Search Report", "Mortgage Deed Registration", "Redemption & NOC Formalities"],
            linkLabel: "Consult Specialist",
          },
        ],
        whyEyebrow: "Financial Rigor",
        whyTitle: "Bridging Legal Rigor and Banking Standards",
        whyParagraphs: [
          "Financial contracts in Pakistan must withstand intense judicial scrutiny while satisfying the prudential regulations of the State Bank. Flawed drafting can render multi-million rupee security interests unenforceable.",
          "We offer corporate treasuries, banking officers, and individual borrowers reliable legal backing for flawless commercial transactions.",
        ],
        whyFeatures: [
          { title: "Bank Compliance", text: "Complete adherence to SBP prudential regulations and commercial banking norms." },
          { title: "Charge Creation (SECP)", text: "Timely registration of Form 10 and 12 to ensure priority of creditors." },
          { title: "Collateral Verification", text: "Independent legal search on mortgaged assets to confirm clear titles." },
          { title: "Expedited Drafting", text: "Rapid turnarounds on urgent loan agreements and banking undertakings." },
        ],
        checklistBannerTitle: "Finalizing a Bank Loan or Mortgage?",
        checklistBannerDesc: "Consult our financial documentation specialists for swift drafting and verification.",
      },
      "family-legal": {
        heroBadge: "Family & Civil Law",
        heroTitle: "Family & Civil Documentation",
        heroDesc: "Compassionate, confidential documentation assistance for Nikahnama registration, NADRA certificates, succession certificates, guardianship, and divorce facilitation.",
        noticeLabel: "Confidentiality Notice",
        noticeTitle: "Private Family Matter Advisory",
        noticeText: "All family law consultations are handled with complete confidentiality and sensitivity under Pakistani family law statutes.",
        noticeCta: "Confidential Inquiry",
        portfolioTitle: "Family Legal Documentation",
        portfolioSubtitle: "Official documentation ensuring legal security and civil rights for families and legal heirs.",
        cards: [
          {
            title: "Nikahnama Registration",
            meta: "NADRA Marriage Certificate",
            description: "Official registration of marriage contracts with Union Councils and issuance of NADRA computerized marriage registration certificates.",
            bullets: ["Union Council Endorsement", "Computerized NADRA Certificate", "Foreign Embassy Attestation"],
            linkLabel: "Confidential Help",
          },
          {
            title: "Succession Certificates",
            meta: "Estate & Bank Account Transfer",
            description: "Processing court and NADRA succession certificates for transferring deceased bank accounts, prize bonds, and investments.",
            bullets: ["NADRA Succession Processing", "Court Application & Notice", "Legal Heir Identification"],
            linkLabel: "Confidential Help",
          },
          {
            title: "Divorce Documents & Arbitration",
            meta: "Talaq & Khula Facilitation",
            description: "Drafting of Talaq-Nama, Khula decrees, notice issuance to Arbitration Council, and obtaining NADRA divorce certificates.",
            bullets: ["Notice to Chairman Council", "90-Day Arbitration Tracking", "Final Certificate Issuance"],
            linkLabel: "Confidential Help",
          },
          {
            title: "Child Guardianship",
            meta: "Guardian Court Petitions",
            description: "Preparation of petitions for guardianship certificate of minors before Family / Guardian Courts for custody and asset administration.",
            bullets: ["Guardian Court Drafting", "Asset Administration Orders", "Passport / Travel Clearances"],
            linkLabel: "Confidential Help",
          },
        ],
        whyEyebrow: "Compassionate Counsel",
        whyTitle: "Dignified Legal Support for Your Family's Rights",
        whyParagraphs: [
          "Family legal matters involve deep personal sensitivity alongside complex civil procedures. Navigating NADRA, Union Councils, and Guardian Courts requires seasoned expertise to avoid prolonged delays.",
          "Our consultants handle every matter with the utmost confidentiality, dignity, and prompt attention to protect your family's interests.",
        ],
        whyFeatures: [
          { title: "NADRA Integration", text: "Direct familiarity with NADRA computerized civil registration procedures." },
          { title: "Absolute Discretion", text: "Strict privacy safeguards for all sensitive domestic and marital documents." },
          { title: "Court Representation", text: "Experienced legal advocates for Succession and Guardian Court petitions." },
          { title: "Family Welfare Focus", text: "Prioritizing fast and conflict-minimized resolution for legal heirs." },
        ],
        checklistBannerTitle: "Need Family Documentation Assistance?",
        checklistBannerDesc: "Speak confidentially with our civil and family law documentation specialists today.",
      },
      "legal-documentation": {
        heroBadge: "Certification & Attestation",
        heroTitle: "Legal Documentation & Attestations",
        heroDesc: "Professional drafting and attestation of affidavits, oaths, general/special power of attorney, tenancy agreements, and formal legal notices.",
        noticeLabel: "Attestation Mandate",
        noticeTitle: "Oath Commissioner In-Person Requirement",
        noticeText: "All affidavits, undertakings, and indemnity bonds must be signed in person before an authorized Oath Commissioner or Notary Public with original CNIC.",
        noticeCta: "Check Checklist",
        portfolioTitle: "Legal Drafting Portfolio",
        portfolioSubtitle: "Precision-drafted contracts, undertakings, and official declarations compliant with Pakistani statutory law.",
        cards: [
          {
            title: "Affidavits & Oaths",
            meta: "Oath Commissioner Attested",
            description: "Standard and customized affidavits for identity verification, lost documents, financial declarations, and court submissions.",
            bullets: ["Oath Commissioner Attestation", "Notary Public Verification", "Indemnity Bonds"],
            linkLabel: "Draft Request",
          },
          {
            title: "Power of Attorney (Local/Overseas)",
            meta: "Local Execution & MOFA",
            description: "Drafting of General and Special Power of Attorney, including Embassy and Foreign Office (MOFA) attestation facilitation.",
            bullets: ["Overseas Embassy Endorsement", "Foreign Office (MOFA) Attestation", "Sub-Registrar Endorsement"],
            linkLabel: "Draft Request",
          },
          {
            title: "Rent & Tenancy Agreements",
            meta: "Residential & Commercial Leases",
            description: "Drafting of tenancy agreements compliant with the Punjab / Islamabad Tenancy Act, protecting landlord and tenant rights.",
            bullets: ["Rent Act Compliance", "Security Deposit Terms", "Police Verification Support"],
            linkLabel: "Draft Request",
          },
          {
            title: "Formal Legal Notices",
            meta: "Advocate Notice Drafting",
            description: "Professional drafting and registered postal service of legal notices for breach of contract, recovery, and property disputes.",
            bullets: ["Advocate Endorsement", "Registered Post & TCS Service", "Proof of Delivery Maintenance"],
            linkLabel: "Draft Request",
          },
        ],
        whyEyebrow: "Binding Precision",
        whyTitle: "Ironclad Agreements and Professional Attestations",
        whyParagraphs: [
          "A poorly drafted affidavit or rental contract can lead to protracted disputes and severe financial loss. Every word in a legal declaration has evidentiary consequences.",
          "Our documentation specialists craft contracts that are legally enforceable, clear, and specifically aligned with applicable Pakistani regulations.",
        ],
        whyFeatures: [
          { title: "Authorized Oath Attestation", text: "In-house authorized Oath Commissioners and Notary Public services." },
          { title: "MOFA & Embassy Guidance", text: "Specialized assistance for documents required by overseas Pakistanis." },
          { title: "Enforceable Drafting", text: "Clauses designed to protect client interests and withstand legal scrutiny." },
          { title: "Rapid Turnaround", text: "Same-day drafting and attestation for standard affidavits and agreements." },
        ],
        checklistBannerTitle: "Require Urgent Legal Attestation?",
        checklistBannerDesc: "Call our documentation helpline or visit our Blue Area office for immediate processing.",
      },
      "trademark-ipo": {
        heroBadge: "Intellectual Property Organization",
        heroTitle: "Trademark & IPO Registration",
        heroDesc: "Protect your brand identity, logos, slogans, copyrights, and inventions with IPO Pakistan. Full filing, search, and hearing representation.",
        noticeLabel: "Pre-Filing Advisory",
        noticeTitle: "Mandatory Trademark Search Notice",
        noticeText: "Before filing a new brand or logo, conduct an official IPO search to avoid identical or confusingly similar citations and examination rejections.",
        noticeCta: "Search Brand",
        portfolioTitle: "Intellectual Property Services",
        portfolioSubtitle: "Comprehensive protection for your trademarks, copyrights, and commercial intellectual assets across Pakistan.",
        cards: [
          {
            title: "Brand Trademark Filing",
            meta: "TM-1 Form Across 45 Classes",
            description: "Registration of brand names, corporate logos, and taglines under the Trade Marks Ordinance 2001.",
            bullets: ["Class Specification Selection", "Official TM-1 Application", "Acknowledgment Receipt"],
            linkLabel: "Protect Brand",
          },
          {
            title: "IPO Search Reports",
            meta: "Pre-Filing Search",
            description: "Exhaustive search through official IPO registers to identify conflicting marks before investing in marketing.",
            bullets: ["Phonetic Similarity Check", "Official Database Query", "Risk Assessment Report"],
            linkLabel: "Protect Brand",
          },
          {
            title: "Copyright Registration",
            meta: "Creative & Software Rights",
            description: "Legal protection for software source code, architectural drawings, literature, and digital creative works.",
            bullets: ["Copyright Office Filing", "Newspaper Advertisement", "Official Certificate Issuance"],
            linkLabel: "Protect Brand",
          },
          {
            title: "Patent Advisory",
            meta: "Inventions & Industrial Designs",
            description: "Advisory and procedural documentation for patent applications and design registration with IPO Pakistan.",
            bullets: ["Patent Specification Drafting", "Novelty Assessment", "Patent Office Prosecution"],
            linkLabel: "Protect Brand",
          },
          {
            title: "Objection Defense & Hearings",
            meta: "Show-Cause Response",
            description: "Drafting counter-statements to examiner objections, opposition defense, and advocate representation before Registrar.",
            bullets: ["Examination Reply Drafting", "Evidence of Use Preparation", "Registrar Hearing Representation"],
            linkLabel: "Protect Brand",
          },
        ],
        whyEyebrow: "Intellectual Asset Security",
        whyTitle: "Defend Your Brand Equity in Pakistan",
        whyParagraphs: [
          "Building a business without registering your trademark leaves you vulnerable to counterfeiters and brand infringement. An unregistered brand has no statutory defense under Pakistani law.",
          "Our intellectual property attorneys secure your proprietary rights from initial clearance search to final registration certificate issuance.",
        ],
        whyFeatures: [
          { title: "All 45 Classes Search", text: "Comprehensive search covering goods and services classifications." },
          { title: "Official IPO Filing", text: "Prompt submission with certified electronic and physical receipts." },
          { title: "Show-Cause Notice Defense", text: "Professional legal responses to registry citations and objections." },
          { title: "Lifetime Brand Protection", text: "10-year renewal management and infringement surveillance." },
        ],
        checklistBannerTitle: "Ready to Protect Your Brand Name?",
        checklistBannerDesc: "Contact our IPO consultants today for an immediate trademark availability search.",
      },
    },
  },
  ur: {
    site: {
      name: "لیگل اسسٹ",
      country: "پاکستان",
      badge: "مجاز قانونی دستاویزات کے ماہرین",
      phoneLabel: "فون رابطہ",
      whatsappLabel: "واٹس ایپ رابطہ",
      officeDirections: "راستہ معلوم کریں",
    },
    nav: {
      home: "ہوم",
      taxServices: "ٹیکس سروسز",
      eStamping: "ای سٹامپنگ",
      business: "بزنس رجسٹریشن",
      propertyLand: "پراپرٹی و اراضی",
      legalFamily: "قانونی و خاندانی",
      about: "ہمارے بارے میں",
      viewAll: "تمام دیکھیں",
      overview: "خلاصہ",
      checklistTip: "دفتر آمد سے قبل چیک لسٹ اور رہنمائی:",
      viewFullDetails: "مکمل تفصیلات دیکھیں",
    },
    hero: {
      eyebrow: "مجاز و منظور شدہ قانونی ماہرین",
      titlePart1: "پاکستان میں اعلیٰ ترین قانونی و دستاویزی خدمات کا",
      countryHighlight: "معتبر ادارہ",
      description:
        "ای سٹامپنگ، جائیداد کی رجسٹری، اور کاروباری رجسٹریشن کی تمام خدمات مکمل شفافیت اور پیشہ ورانہ مہارت کے ساتھ فراہم کی جاتی ہیں۔",
      visitOfficeBtn: "ہمارے دفتر تشریف لائیں",
      whatsappBtn: "واٹس ایپ پر رابطہ کریں",
      govVerified: "حکومتی تصدیق شدہ",
      sameDay: "اسی دن سروس کی فراہمی",
      confidential: "100% مکمل راز داری",
    },
    servicesSection: {
      title: "ہماری خصوصی قانونی خدمات",
      subtitle:
        "افراد اور کاروباری اداروں کے لیے قانونی و دستاویزی مراحل کو آسان اور شفاف بنانے کے لیے جامع قانونی رہنمائی۔",
      learnMore: "مزید تفصیلات",
    },
    prepareVisit: {
      badge: "اہم ترین ضروری ہدایت",
      title: "دفتر تشریف لانے سے قبل تیاری کریں",
      description:
        "غیر ضروری تاخیر اور بار بار چکر لگانے سے بچنے کے لیے، ہم تمام معزز کلائنٹس کو سختی سے مشورہ دیتے ہیں کہ دفتر آنے سے قبل مطلوبہ دستاویزات کی چیک لسٹ ضرور حاصل کریں۔ زیادہ تر قانونی امور کے لیے مخصوص اصل شناختی کارڈ اور سابقہ ریکارڈز ضروری ہوتے ہیں۔",
      callNowBtn: "ابھی کال کریں",
      requestChecklistBtn: "چیک لسٹ طلب کریں",
      officeCardTitle: "مرکزی دفتر کا پتہ",
      officeCardDesc:
        "آفس نمبر 402، بزنس ٹاور، بلیو ایریا، اسلام آباد۔ شہر کے مرکزی کاروباری مرکز میں انتہائی آسان رسائی۔",
      getDirectionsBtn: "گوگل میپ پر راستہ دیکھیں",
      steps: [
        {
          title: "دستاویزات کی چیک لسٹ کے لیے کال کریں",
          text: "مختلف قانونی کارروائیوں کے لیے مخصوص اصل کاغذات درکار ہوتے ہیں۔ اپنا وقت بچانے کے لیے پہلے رابطہ کریں۔",
        },
        {
          title: "ملاقات کا وقت طے کریں",
          text: "ہم روزانہ محدود افراد کو مدعو کرتے ہیں تاکہ ہر سائل کو مکمل پیشہ ورانہ توجہ دی جا سکے۔",
        },
        {
          title: "تصدیقی تشریف آوری",
          text: "اپنا اصل قومی شناختی کارڈ اور ضروری کاغذات ہمراہ لے کر ہمارے بلیو ایریا دفتر تشریف لائیں۔",
        },
      ],
    },
    whyTrust: {
      title: "پاکستان کے بڑے کاروباری و قانونی ادارے ہم پر اعتماد کیوں کرتے ہیں؟",
      yearsMetric: "15+",
      yearsLabel: "سالہ شاندار تجربہ",
      features: [
        {
          title: "مجاز و رجسٹرڈ ادارہ",
          text: "حکومتی قواعد کے تحت باقاعدہ تسلیم شدہ اور سرکاری پورٹلز سے تصدیق شدہ سہولیات۔",
        },
        {
          title: "تیز ترین کارروائی",
          text: "منظم طریقہ کار جس سے عام سرکاری دفاتر کے مقابلے میں آپ کا قیمتی وقت بچتا ہے۔",
        },
        {
          title: "ماہر قانونی مشیران",
          text: "پراپرٹی قوانین، کارپوریٹ رجسٹریشن اور ٹیکسیشن کے سینئر قانونی ماہرین کی نگرانی۔",
        },
        {
          title: "100% شفاف فیس پالیسی",
          text: "بغیر کسی پوشیدہ چارجز کے واضح فیس کا شیڈول۔ ہر فیس کی باقاعدہ رسید جاری کی جاتی ہے۔",
        },
      ],
    },
    finalCta: {
      title: "کیا آپ اپنے قانونی کاغذات تیار کروانے کے لیے تیار ہیں؟",
      description:
        "طویل قطاروں اور پیچیدہ دفتری جھنجھٹوں سے نجات پائیں۔ آج ہی ہمارے قانونی ماہرین سے رابطہ کریں اور باآسانی اپنا کام مکمل کروائیں۔",
      callSupport: "فون پر رہنمائی",
      whatsappDirect: "براہ راست واٹس ایپ",
      visitHours: "اوقات کار",
      hoursVal: "پیر تا جمعہ: 9 بجے صبح تا 6 بجے شام",
      visitOfficeBtn: "ہمارے دفتر تشریف لائیں",
    },
    officeSection: {
      title: "پیشہ ورانہ خدمت کے لیے ہمارے دفتر تشریف لائیں",
      subtitle:
        "کوئی آن لائن درخواست قابل قبول نہیں ہوتی۔ قانونی جواز اور جعلسازی سے پاک کارروائی کے لیے فزیکل تصدیق لازمی ہے۔",
      addressLabel: "دفتر کا پتہ",
      hoursLabel: "دفتری اوقات کار",
      getDirectionsBtn: "گوگل میپس پر راستہ دیکھیں",
    },
    form: {
      cardTitle: "فوری مشاورتی درخواست",
      cardSubtitle: "اپنی تفصیلات درج کریں، ہمارے قانونی ماہر جلد آپ سے رابطہ کریں گے۔",
      fullName: "پورا نام",
      fullNamePlaceholder: "مثلاً: محمد علی",
      phone: "فون نمبر",
      phonePlaceholder: "مثلاً: 03001234567",
      service: "مطلوبہ سروس",
      selectService: "سروس کا انتخاب کریں",
      services: {
        tax: "ٹیکس و ایف بی آر سروسز",
        estamp: "ای سٹامپ و سٹامپ پیپرز",
        property: "پراپرٹی و اراضی دستاویزات",
        business: "کمپنی و بزنس رجسٹریشن (SECP)",
        legal: "قانونی وثائق و سرٹیفیکیشن",
      },
      message: "مختصر تفصیل / درکار رہنمائی",
      messagePlaceholder: "اپنے کیس یا مطلوبہ دستاویزات کے بارے میں مختصراً تحریر کریں...",
      submitBtn: "درخواست ارسال کریں",
      submitting: "ارسال ہو رہا ہے...",
      successTitle: "درخواست موصول ہو گئی ہے",
      successDesc: "شکریہ! ہمارے قانونی دستاویزاتی ماہر بہت جلد آپ سے فون پر رابطہ کریں گے۔",
    },
    common: {
      home: "ہوم",
      backToHome: "ہوم پر واپس جائیں",
      backToServices: "سروسز پر واپس جائیں",
      speakToExpert: "ماہر سے گفتگو کریں",
      visitOurOffice: "ہمارے دفتر تشریف لائیں",
      whatsappUs: "واٹس ایپ پر رابطہ کریں",
      callNow: "ابھی کال کریں",
      callSupport: "فون پر رہنمائی",
      getDirections: "راستہ معلوم کریں",
      learnMore: "مزید تفصیلات",
      requirementDetails: "مطلوبہ تفصیلات",
      inPersonInquiry: "دفتری معلومات",
      officialProcessing: "سرکاری کارروائی",
      requiredDocs: "مطلوبہ دستاویزات",
      institutionalExcellence: "اعلیٰ ادارہ جاتی معیار",
      officialCompliance: "قانونی و حکومتی مطابقت",
      needChecklist: "دستاویزات کی چیک لسٹ درکار ہے؟",
      needChecklistDesc: "بار بار چکر لگانے کی زحمت سے بچیں۔ ابھی فون کریں اور مطلوبہ دستاویزات کی مکمل فہرست حاصل کریں۔",
      fastContact: "فوری رابطہ کی سہولیات",
      physicalVerificationNotice: "نوٹ: آن لائن درخواستیں قابل قبول نہیں ہوتیں۔ اصل دستاویزات کی فزیکل تصدیق لازمی ہے۔",
      publicDealingHours: "عوامی ملاقات کے اوقات کار",
      weekdays: "پیر تا جمعہ",
      weekdaysHours: "9:00 بجے صبح تا 6:00 بجے شام",
      saturdays: "ہفتہ",
      saturdayHours: "10:00 بجے صبح تا 2:00 بجے دوپہر",
      closed: "اتوار: بند ہے",
      immediateAssistance: "فوری دفتری و فون معاونت",
      immediateAssistanceDesc: "ہمارے دستاویزی ماہرین سے رابطہ کر کے مطلوبہ کاغذات کی تصدیق کریں یا فوری کارروائی کے لیے دفتر تشریف لائیں۔",
    },
    footer: {
      contactUs: "رابطہ کی تفصیلات",
      businessHours: "دفتری اوقات",
      quickLinks: "فوری لنکس",
      followUs: "ہمیں فالو کریں",
      disclaimer:
        "مجاز قانونی دستاویزی سہولت کار۔ تمام قانونی دستاویزات اسلام آباد دفتر میں فزیکل تصدیق کے بعد جاری کیے جاتے ہیں۔",
      rights: "© 2026 لیگل اسسٹ پاکستان۔ جملہ حقوق محفوظ ہیں۔",
      privacy: "پرائیویسی پالیسی",
      terms: "شرائط و ضوابط",
    },
    categories: {
      tax: {
        title: "ٹیکس سروسز (FBR)",
        shortTitle: "ٹیکس سروسز",
        tagline: "ایف بی آر اور آئرس پورٹل قانونی معاملات",
        description:
          "انکم ٹیکس ریٹرن، این ٹی این رجسٹریشن، سیلز ٹیکس اور آڈٹ نوٹسز کا باضابطہ قانونی حل۔",
        items: [
          { title: "این ٹی این (NTN) رجسٹریشن", description: "تنخواہ دار افراد، بزنس اور فری لانسرز کے لیے Iris اکاؤنٹ کی تیاری" },
          { title: "انکم ٹیکس گوشوارے جمع کروانا", description: "سالانہ ٹیکس ریٹرن اور ایکٹو فائلر لسٹ (ATL) میں شمولیت" },
          { title: "سیلز ٹیکس رجسٹریشن (STRN)", description: "مینوفیکچررز، درآمد کنندگان اور تاجروں کے لیے GST رجسٹریشن" },
          { title: "ٹیکس استثنیٰ سرٹیفکیٹس", description: "ودہولڈنگ ٹیکس چھوٹ اور خصوصی قانونی استثنیٰ دستاویزات" },
          { title: "ایف بی آر آڈٹ و شوکاز کا جواب", description: "سیکشن 177 اور 214C نوٹسز کا پیشہ ورانہ ڈرافٹنگ اور پیروی" },
          { title: "چیمبر آف کامرس رکنیت", description: "اسلام آباد اور راولپنڈی چیمبر آف کامرس کی باضابطہ رکنیت" },
        ],
      },
      "e-stamping": {
        title: "ای سٹامپ و اسٹامپ پیپر",
        shortTitle: "ای سٹامپنگ",
        tagline: "حکومت سے منظور شدہ باضابطہ وینڈر",
        description:
          "عدالتی و غیر عدالتی سرکاری ڈیجیٹل ای سٹامپ پیپرز کا فوری اور تصدیق شدہ اجراء۔",
        items: [
          { title: "غیر عدالتی ای سٹامپ", description: "کرایہ نامہ، حلف نامہ، اقرار نامہ اور عام تجارتی معاہدات (50 تا 1000+ روپے)" },
          { title: "ہائی ویلیو عدالتی سٹامپ", description: "عدالتی چالان، مقدمات، قانونی دعوے اور پاور آف اٹارنی کے لیے" },
          { title: "پراپرٹی بیع نامہ ای سٹامپ", description: "پلاٹ، مکان اور زمین کی منتقلی کے لیے سرکاری 1% ڈی سی ریٹ چالان" },
          { title: "شراکت داری معاہدہ (پارٹنرشپ)", description: "بزنس پارٹنرشپ اور فرم رجسٹریشن کے مجاز اسٹامپ پیپرز" },
          { title: "بینک دستاویزات اسٹامپ", description: "قرضہ جات، مارگیج اور مالیاتی گارنٹیوں کے لیے اسٹامپ پیپرز" },
          { title: "آن لائن تصدیق و چالان 32-A", description: "سرکاری پورٹل کے ذریعے فوری آن لائن تصدیق اور درست ہیڈ آف اکاؤنٹ چالان" },
        ],
      },
      "business-registration": {
        title: "کاروباری و کمپنی رجسٹریشن",
        shortTitle: "بزنس رجسٹریشن",
        tagline: "ایس ای سی پی و کارپوریٹ امور",
        description:
          "ایس ای سی پی کے تحت پرائیویٹ لمیٹڈ کمپنی، سنگل ممبر کمپنی اور فرم رجسٹریشن۔",
        items: [
          { title: "SECP کمپنی رجسٹریشن", description: "پرائیویٹ لمیٹڈ اور ایس ایم سی کی قانونی تشکیل بمع MOA اور AOA" },
          { title: "سول پروپرائٹر شپ (انفرادی کاروبار)", description: "ایف بی آر اور متعلقہ اداروں سے فوری بزنس رجسٹریشن" },
          { title: "پارٹنرشپ ڈیڈ (فارم سی)", description: "رجسٹرار آف فرمز کے پاس شراکت داری کا باقاعدہ قانونی اندراج" },
          { title: "کارپوریٹ NTN اور GST", description: "کمپنی کا ٹیکس نمبر، سیلز ٹیکس رجسٹریشن اور بینک اکاؤنٹ کاغذات" },
          { title: "چیمبر آف کامرس رکنیت", description: "اسلام آباد و راولپنڈی چیمبرز میں کارپوریٹ ممبرشپ کی سہولت" },
          { title: "ٹریڈ لائسنس (CDA / DMC)", description: "لوکل باڈیز اور بلدیہ سے باضابطہ تجارتی و پیشہ ورانہ لائسنس کا حصول" },
        ],
      },
      "property-land": {
        title: "اراضی و جائیداد کی خدمات",
        shortTitle: "پراپرٹی و اراضی",
        tagline: "جائیداد کی قانونی جانچ پڑتال و ٹرانسفر",
        description:
          "پلاٹ، مکان، کمرشل اراضی کی خرید و فروخت، ٹائٹل تصدیق اور انتقال اراضی۔",
        items: [
          { title: "بیع نامہ (سیل ڈیڈ) ڈرافٹنگ", description: "پلاٹ و مکان کی قانونی دستاویز بیع نامہ کی پروفیشنل تیاری و رجسٹری" },
          { title: "ٹرانسفر لیٹر سروسز", description: "سی ڈی اے (CDA)، ایل ڈی اے اور ہاؤسنگ سوسائٹیز میں ٹرانسفر فائلنگ" },
          { title: "لیگل سرچ و ٹائٹل تصدیق", description: "جائیداد کے اصل مالکانہ حقوق اور این ای سی (NEC) کی مکمل تصدیق" },
          { title: "سب رجسٹرار رجسٹری و تصدیق", description: "سب رجسٹرار کے روبرو باضابطہ بیان اور بائیو میٹرک رجسٹری کا عمل" },
          { title: "وراثتی جانشینی سرٹیفکیٹ", description: "جائیداد کی قانونی وراثتی تقسیم اور انتقال کے مکمل کاغذات" },
          { title: "مختار نامہ (GPA / SPA)", description: "پراپرٹی کی دیکھ بھال اور خرید و فروخت کے لیے قانونی پاور آف اٹارنی" },
        ],
      },
      "registry-deeds": {
        title: "رجسٹری و قانونی وثائق",
        shortTitle: "رجسٹری و وثائق",
        tagline: "سب رجسٹرار و ریونیو ریکارڈز",
        description:
          "بیع نامہ، ہبہ نامہ، رینٹ ایگریمنٹ اور سب رجسٹرار آفس میں دستاویزات کا اندراج۔",
        items: [
          { title: "بیع نامہ کی باضابطہ رجسٹری", description: "خرید و فروخت کی مکمل قانونی دستاویز کا سب رجسٹرار کے ہاں اندراج" },
          { title: "ہبہ نامہ (خونی رشتہ تحفہ)", description: "خونی رشتہ داروں میں جائیداد کے قانونی تحفے (ہبہ) کا باضابطہ عمل" },
          { title: "مختار نامہ عام و خاص", description: "جائیداد اور قانونی مقدمات کے لیے مصدقہ پاور آف اٹارنی کا اندراج" },
          { title: "ریونیو ریکارڈ تصدیق و فرد", description: "پٹواری اور ریونیو ریکارڈ سے فرد ملکیت کی قانونی جانچ پڑتال" },
          { title: "رہن نامہ (Mortgage Deed)", description: "بینکوں اور مالیاتی اداروں کے لیے پراپرٹی رہن رکھنے کی رجسٹری" },
          { title: "سابقہ ریکارڈز کی نقول (نقل)", description: "محکمہ اراضی اور سب رجسٹرار کے پرانے ریکارڈز کی مصدقہ نقول کا حصول" },
        ],
      },
      "banking-financial": {
        title: "بینکنگ و مالیاتی دستاویزات",
        shortTitle: "بینکنگ و فنانس",
        tagline: "مالیاتی اداروں کے قانونی تقاضے",
        description:
          "بینک قرضہ جات، مارگیج، ہائپوتھیکیشن اور فنانس دستاویزات کی قانونی جانچ۔",
        items: [
          { title: "قرضہ جات دستاویزات", description: "پرسنل، ہوم اور آٹو فنانس کے لیے قانونی معاہدات کی جانچ" },
          { title: "کارپوریٹ فنانس ڈیڈز", description: "ورکنگ کیپیٹل، بینک گارنٹی اور فارم 10/12 چارج کریشن" },
          { title: "مالیاتی حلف نامے (Affidavits)", description: "آمدن کا حلف نامہ، چیک بک گمشدگی اور بینک این او سی" },
          { title: "پراپرٹی رہن و سیکیورٹی", description: "بینک قرض کے تحفظ کے لیے جائیداد کے قانونی کاغذات کی تیاری" },
        ],
      },
      "family-legal": {
        title: "خاندانی و عائلی امور",
        shortTitle: "خاندانی و عائلی",
        tagline: "فیملی کورٹس و نادرا سرٹیفکیٹس",
        description:
          "نکاح نامہ رجسٹریشن، جانشینی سرٹیفکیٹ، سرپرستی اور طلاق و خلع کی قانونی رہنمائی۔",
        items: [
          { title: "نکاح نامہ و نادرا رجسٹریشن", description: "کمپیوٹرائزڈ نکاح نامہ، یونین کونسل اندراج اور بین الاقوامی تصدیق" },
          { title: "جانشینی سرٹیفکیٹ (Succession)", description: "مرحوم کے بنک کھاتوں اور اثاثہ جات کی منتقلی کے لیے نادرا و عدالتی سرٹیفکیٹ" },
          { title: "طلاق و خلع کے کاغذات", description: "طلاق نامہ، خلع کا نوٹس اور ثالثی کونسل کی باضابطہ قانونی پیروی" },
          { title: "بچوں کی سرپرستی (گارڈین شپ)", description: "گارڈین عدالت سے بچوں کی قانونی تحویل اور کسٹڈی سرٹیفکیٹ کا حصول" },
        ],
      },
      "legal-documentation": {
        title: "قانونی دستاویزات و سرٹیفیکیشن",
        shortTitle: "قانونی وثائق",
        tagline: "حلف نامہ جات، ایگریمنٹس و نوٹسز",
        description:
          "اووتھ کمشنر حلف نامے، کرایہ نامے، زر تلافی بانڈز اور قانونی نوٹسز کی ڈرافٹنگ۔",
        items: [
          { title: "حلف نامے و اقرار نامے", description: "اووتھ کمشنر سے تصدیق شدہ عمومی و خصوصی حلف نامے اور انڈیمنٹی بانڈز" },
          { title: "اوورسیز پاکستانی پاور آف اٹارنی", description: "پاکستانی سفارت خانے اور وزارت خارجہ سے تصدیق شدہ مختار نامہ کی توثیق" },
          { title: "کرایہ نامہ و لیز ایگریمنٹ", description: "کرایہ داری ایکٹ کے مطابق رہائشی و کمرشل معیاری کرایہ نامے کی تیاری" },
          { title: "باضابطہ قانونی نوٹسز", description: "رقم کی واپسی، معاہدے کی خلاف ورزی اور دیوانی تنازعات کے قانونی نوٹسز" },
        ],
      },
      "trademark-ipo": {
        title: "ٹریڈ مارک و کاپی رائٹ (IPO)",
        shortTitle: "ٹریڈ مارک و IPO",
        tagline: "آئی پی او پاکستان برانڈ رجسٹریشن",
        description:
          "برانڈ نام، لوگو، کاپی رائٹ اور پیٹنٹ کی سرکاری رجسٹری اور قانونی تحفظ۔",
        items: [
          { title: "برانڈ نام و لوگو رجسٹریشن", description: "تمام 45 کلاسز میں اپنے کاروباری نام اور لوگو کا قانونی تحفظ" },
          { title: "آئی پی او سرچ رپورٹس", description: "رجسٹریشن سے قبل نام کی دستیابی اور مماثلت کی جامع رپورٹ" },
          { title: "کاپی رائٹ رجسٹریشن", description: "سافٹ ویئر، کتب، میڈیا، فن پاروں اور ڈیزائنز کا سرکاری تحفظ" },
          { title: "پیٹنٹ مشاورتی خدمات", description: "نئی ایجادات اور سائنسی و صنعتی ڈیزائنز کے پیٹنٹ کا اندراج" },
          { title: "رجسٹری اعتراضات کا جواب", description: "آئی پی او شوکاز نوٹسز کے جوابات اور سماعت میں قانونی نمائندگی" },
        ],
      },
    },
    servicePages: {
      "e-stamping": {
        heroBadge: "حکومت سے منظور شدہ وینڈر",
        heroTitle: "ای سٹامپ و اسٹامپ پیپر سروسز",
        heroDesc: "تمام قانونی، کاروباری اور جائیداد کے امور کے لیے سرکاری و قانونی ای سٹامپ پیپرز۔ ہمارے اسلام آباد بلیو ایریا دفتر سے فوری اور تصدیق شدہ فراہمی۔",
        noticeLabel: "آمد سے قبل رابطہ لازمی ہے",
        noticeTitle: "دفتر تشریف لانے سے قبل رہنمائی حاصل کریں",
        noticeText: "سٹامپ پیپر کی شرائط مقصد کے لحاظ سے مختلف ہوتی ہیں (مثلاً بیع نامہ، حلف نامہ، کرایہ نامہ)۔ غیر ضروری تاخیر سے بچنے کے لیے دفتر آنے سے قبل مطلوبہ دستاویزات کی تصدیق ضرور کر لیں۔",
        noticeCta: "ضروریات معلوم کریں",
        portfolioTitle: "ای سٹامپ پیپرز کی مکمل سہولیات",
        portfolioSubtitle: "وکلاء، کارپوریٹ اداروں اور عام شہریوں کے لیے تمام عدالتی اور غیر عدالتی اسٹامپ پیپرز کی قانونی و فنی تیاری۔",
        cards: [
          {
            title: "غیر عدالتی ای سٹامپ",
            meta: "مالیت: 50 تا 1000+ روپے",
            description: "تجارتی معاہدات، بیع نامہ، کرایہ نامہ، حلف نامہ اور اقرار نامہ جات کے لیے باضابطہ سرکاری ڈیجیٹل ای سٹامپ۔",
            listLabel: "عام استعمالات",
            bullets: ["کرایہ نامہ جات", "حلف نامے اور ضمانت نامے", "انڈیمنٹی بانڈز", "اقرار نامے"],
            linkLabel: "مطلوبہ تفصیلات",
          },
          {
            title: "ہائی ویلیو عدالتی سٹامپ",
            meta: "مالیت: عدالتی فیس شیڈول کے مطابق",
            description: "عدالتی کارروائی، دعویٰ جات، اپیل اور قانونی پیروی کے لیے درکار مجاز سرکاری عدالتی اسٹامپ پیپرز۔",
            listLabel: "عام استعمالات",
            bullets: ["پاور آف اٹارنی", "عدالتی پٹیشن و دعویٰ", "قانونی بیانات", "وراثتی کاغذات"],
            linkLabel: "مطلوبہ تفصیلات",
          },
          {
            title: "پراپرٹی بیع نامہ ای سٹامپ",
            meta: "مالیت: ڈی سی ریٹ کا 1%",
            description: "پلاٹ، مکان اور زرعی و کمرشل اراضی کی باضابطہ رجسٹری و منتقلی کے لیے خصوصی ای سٹامپ چالان۔",
            listLabel: "عام استعمالات",
            bullets: ["بیع نامہ (سیل ڈیڈ)", "ہبہ نامہ (تحفہ)", "ٹرانسفر لیٹرز", "دستبرداری نامہ"],
            linkLabel: "مطلوبہ تفصیلات",
          },
          {
            title: "شراکت داری معاہدہ (پارٹنرشپ)",
            meta: "مالیت: 2000 تا 5000 روپے",
            description: "بزنس شراکت داری، فرم رجسٹریشن اور تجارتی معاہدات کی تیاری کے لیے باضابطہ اسٹامپ پیپرز۔",
            listLabel: "عام استعمالات",
            bullets: ["پارٹنرشپ رجسٹریشن", "بزنس ایگریمنٹس", "ایل ایل پی دستاویزات"],
            linkLabel: "مطلوبہ تفصیلات",
          },
          {
            title: "بینک دستاویزات اسٹامپ",
            meta: "مالیت: قرضہ رقم کے تناسب سے",
            description: "بینکوں اور مالیاتی اداروں کے قرضہ جات، مارگیج اور مالیاتی ضمانتوں کے لیے درکار قانونی اسٹامپ پیپرز۔",
            listLabel: "عام استعمالات",
            bullets: ["لون ایگریمنٹس", "رہن نامہ دستاویزات", "بینک گارنٹی", "چارج کریشن فارمز"],
            linkLabel: "مطلوبہ تفصیلات",
          },
          {
            title: "آن لائن تصدیقی سہولیات",
            meta: "صرف سروس فیس",
            description: "جاری شدہ ای سٹامپ پیپرز کی سرکاری پورٹل سے باضابطہ تصدیق تاکہ جعل سازی کا سدباب ہو سکے۔",
            listLabel: "عام استعمالات",
            bullets: ["دستاویزات کی قانونی جانچ", "ویریفیکیشن سرٹیفکیٹ", "جعلسازی سے بچاؤ"],
            linkLabel: "مطلوبہ تفصیلات",
          },
        ],
        whyEyebrow: "ادارہ جاتی قانونی معیار",
        whyTitle: "پاکستان میں پروفیشنل ای سٹامپنگ کیوں ضروری ہے؟",
        whyParagraphs: [
          "حکومت پاکستان نے جعل سازی کے خاتمے کے لیے ای سٹامپنگ سسٹم متعارف کرایا ہے۔ لیکن درست کٹیگری، مطلوبہ مالیت اور چالان کا انتخاب قانونی مہارت کا متقاضی ہے۔",
          "ہماری مجاز ٹیم اسٹامپ ایکٹ 1899 کے عین مطابق آپ کے کاغذات تیار کرتی ہے تاکہ آئندہ کسی عدالتی یا دفتری رکاوٹ کا سامنا نہ کرنا پڑے۔",
        ],
        whyFeatures: [
          { title: "درست چالان 32-A جنریشن", text: "درست ہیڈ آف اکاؤنٹ کے ساتھ چالان بنانا تاکہ رقم غلط اکاؤنٹ میں نہ جائے اور وقت بچے۔" },
          { title: "حکومتی پورٹل تصدیق", text: "ہر جاری شدہ ای سٹامپ پیپر سرکاری پورٹل سے تصدیق شدہ اور مجاز وینڈر مہر کا حامل ہوتا ہے۔" },
          { title: "اسی دن سروس فراہمی", text: "دوپہر 12 بجے سے قبل مطلوبہ کاغذات لانے پر اسی دن سٹامپ پیپر کا اجراء ممکن بنایا جاتا ہے۔" },
        ],
        imageTip: "یقینی بنائیں کہ سٹامپ پیپر کی مالیت متعلقہ قانونی ذمہ داری اور ڈی سی ریٹ کے عین مطابق ہو۔",
        disclaimerBox: "لیگل اسسٹ پاکستان ایک مجاز سہولت کار ہے۔ فزیکل تصدیق کے بعد تمام دستاویزات دستی وصول کیے جاتے ہیں۔",
        checklistBannerTitle: "کیا آپ کو مطلوبہ کاغذات کی چیک لسٹ چاہیے؟",
        checklistBannerDesc: "بار بار چکر لگانے کی زحمت سے بچیں۔ ابھی فون کریں اور اپنے اسٹامپ پیپر کے لیے درکار اصل کاغذات کی تفصیل معلوم کریں۔",
      },
      tax: {
        heroBadge: "ایف بی آر و آئرس پورٹل سروسز",
        heroTitle: "ٹیکس کنسلٹنسی و فائلنگ سروسز",
        heroDesc: "افراد اور کاروباری اداروں کے لیے ایف بی آر ٹیکس قوانین، گوشوارے اور قانونی نمائندگی۔ ہم آپ کے ٹیکس معاملات آسان بناتے ہیں۔",
        noticeLabel: "اہم ضروری ہدایت",
        noticeTitle: "ٹیکس دستاویزات کی پیشگی فراہمی",
        noticeText: "پاکستان میں ٹیکس فائلنگ کے تقاضے آمدنی کے ذرائع (تنخواہ، بزنس، پراپرٹی یا ترسیلات زر) کے مطابق مختلف ہوتے ہیں۔ دفتر تشریف لانے سے قبل مطلوبہ چیک لسٹ حاصل کریں۔",
        noticeCta: "چیک لسٹ حاصل کریں",
        portfolioTitle: "ہماری ٹیکس سروسز کا دائرہ کار",
        portfolioSubtitle: "تنخواہ دار افراد، فری لانسرز، اور درمیانے درجے کے کاروباری اداروں کے لیے قانونی و دستاویزی حل۔",
        cards: [
          {
            title: "این ٹی این (NTN) رجسٹریشن",
            meta: "تنخواہ دار و بزنس افراد",
            description: "تنخواہ دار افراد، فری لانسرز اور کاروباری فرمز کے لیے نیشنل ٹیکس نمبر کا اجراء اور آئرس پورٹل کا قیام۔",
            bullets: ["شناختی کارڈ و بینک سرٹیفکیٹ", "یوٹیلٹی بل و کرایہ نامہ", "آئرس اکاؤنٹ ایکٹیویشن"],
            linkLabel: "سرکاری کارروائی",
          },
          {
            title: "انکم ٹیکس گوشوارے (ATL)",
            meta: "ایکٹو ٹیکس پیئر لسٹ",
            description: "سالانہ انکم ٹیکس ریٹرن اور ویلتھ سٹیٹمنٹ فائلنگ تاکہ آپ ایکٹو فائلر بن کر اضافی ٹیکسوں سے بچ سکیں۔",
            bullets: ["ودہولڈنگ ٹیکس ایڈجسٹمنٹ", "اثاثہ جات اور آمدن کا اندراج", "فائلر لسٹ میں شمولیت"],
            linkLabel: "سرکاری کارروائی",
          },
          {
            title: "سیلز ٹیکس رجسٹریشن (STRN)",
            meta: "جی ایس ٹی نمبر کا اجراء",
            description: "سیلز ٹیکس ایکٹ 1990 کے تحت درآمد کنندگان، مینوفیکچررز اور تاجروں کے لیے باضابطہ STRN رجسٹریشن۔",
            bullets: ["بائیو میٹرک تصدیق", "بینک اکاؤنٹ سرٹیفکیٹ", "کاروباری پتہ کا معائنہ"],
            linkLabel: "سرکاری کارروائی",
          },
          {
            title: "ٹیکس استثنیٰ سرٹیفکیٹس",
            meta: "ودہولڈنگ چھوٹ",
            description: "انکم ٹیکس آرڈیننس کے متعلقہ سیکشنز کے تحت ودہولڈنگ ٹیکس میں چھوٹ اور استثنیٰ سرٹیفکیٹ کا قانونی حصول۔",
            bullets: ["سیکشن 153/159 فائلنگ", "آڈٹ شدہ اکاؤنٹس دستاویزات", "کمشنر سے قانونی منظوری"],
            linkLabel: "سرکاری کارروائی",
          },
          {
            title: "ایف بی آر آڈٹ و شوکاز کا جواب",
            meta: "سیکشن 177 / 214C دفاع",
            description: "ایف بی آر سے موصول ہونے والے آڈٹ نوٹسز، شوکاز اور استفسار کے نوٹسز کا قانونی ڈرافٹنگ اور پیروی۔",
            bullets: ["پیشہ ورانہ جواب کی تیاری", "بینک ریکارڈز کی مفاہمت", "قانونی مشاورتی نمائندگی"],
            linkLabel: "سرکاری کارروائی",
          },
          {
            title: "چیمبر آف کامرس رکنیت",
            meta: "ICCI و RCCI ممبرشپ",
            description: "اسلام آباد اور راولپنڈی چیمبر آف کامرس اینڈ انڈسٹری کی کارپوریٹ اور انفرادی ممبرشپ کے مکمل کاغذات۔",
            bullets: ["بزنس رجسٹریشن پروف", "ٹیکس کلیئرنس ریکارڈ", "باضابطہ چیمبر ممبرشپ کارڈ"],
            linkLabel: "سرکاری کارروائی",
          },
        ],
        whyEyebrow: "ادارہ جاتی مہارت",
        whyTitle: "ٹیکس معاملات میں قانونی رہنمائی کیوں لازمی ہے؟",
        whyParagraphs: [
          "پاکستان میں ایف بی آر قوانین اور نئے فنانس ایکٹ کی باریکیوں کو سمجھے بغیر فائلنگ کرنے سے بھاری جرمانے اور آڈٹ نوٹسز کا خطرہ لاحق ہو سکتا ہے۔",
          "لیگل اسسٹ پاکستان آپ کو قانونی تحفظ اور ذہنی سکون فراہم کرتا ہے۔ ہماری ماہر ٹیم آپ کی تمام چھوٹ کو یقینی بناتی ہے اور بروقت قانونی ریٹرن جمع کرواتی ہے۔",
        ],
        whyFeatures: [
          { title: "مکمل قانونی عملداری", text: "ایف بی آر کی تازہ ترین گائیڈ لائنز اور قواعد و ضوابط کی مکمل پابندی۔" },
          { title: "واضح و شفاف فیس", text: "بغیر کسی پوشیدہ چارجز کے طے شدہ فیس پالیسی۔" },
        ],
        checklistBannerTitle: "مشاورت کا وقت طے کریں",
        checklistBannerDesc: "ہمارا بلیو ایریا دفتر پیر تا ہفتہ کھلا ہے۔ اپنے ٹیکس معاملات مجاز قانونی ماہرین سے باآسانی حل کروائیں۔",
      },
      "property-land": {
        heroBadge: "اراضی و ریئل اسٹیٹ دستاویزات",
        heroTitle: "پراپرٹی و اراضی خدمات",
        heroDesc: "پلاٹ و جائیداد کی ٹرانسفر، ٹائٹل تصدیق، سب رجسٹرار رجسٹری اور اسلام آباد و پنجاب میں اراضی کی قانونی جانچ پڑتال۔",
        noticeLabel: "اہم تصدیقی انتباہ",
        noticeTitle: "اراضی ٹائٹل کی پیشگی تصدیق لازمی ہے",
        noticeText: "پراپرٹی کے لین دین میں جعلسازی سے بچنے کے لیے پیشگی بیعانہ دینے سے قبل سرکاری ریکارڈ اور این ای سی (NEC) کی جانچ پڑتال لازمی کروائیں۔",
        noticeCta: "ٹائٹل تصدیق کروائیں",
        portfolioTitle: "پراپرٹی کی قانونی خدمات",
        portfolioSubtitle: "خریداروں، فروخت کنندگان اور وارثان کے لیے جائیداد کے جملہ قانونی مراحل کی جامع معاونت۔",
        cards: [
          {
            title: "بیع نامہ (سیل ڈیڈ) ڈرافٹنگ",
            meta: "ملکیت کی باضابطہ منتقلی",
            description: "رہائشی، کمرشل اور زرعی اراضی کے لیے بیع نامہ کی مکمل قانونی ڈرافٹنگ، اسٹامپ ڈیوٹی اور سب رجسٹرار رجسٹری۔",
            bullets: ["مالکانہ حقوق کی تاریخ", "اسٹامپ ڈیوٹی کا درست تعین", "سب رجسٹرار کے ہاں بیان"],
            linkLabel: "دفتری معلومات",
          },
          {
            title: "ٹرانسفر لیٹر سروسز",
            meta: "سی ڈی اے، ایل ڈی اے، ڈی ایچ اے",
            description: "سی ڈی اے، ایل ڈی اے اور منظور شدہ ہاؤسنگ سوسائٹیز میں پلاٹ الاٹمنٹ لیٹر کے تبادلے کی مکمل قانونی کارروائی۔",
            bullets: ["این ڈی سی کلیئرنس", "بائیو میٹرک شیڈولنگ", "نئے الاٹمنٹ لیٹر کا اجراء"],
            linkLabel: "دفتری معلومات",
          },
          {
            title: "لیگل سرچ و ٹائٹل تصدیق",
            meta: "این ای سی (NEC) رپورٹ",
            description: "سب رجسٹرار ریکارڈ اور ریونیو دفتر سے اصل مالکانہ حقوق اور غیر منقولہ جائیداد پر کسی بھی قرض یا رہن کی جانچ۔",
            bullets: ["ریکارڈ روم سے جانچ", "بینک چارج کلیئرنس", "تنازعات کی عدم موجودگی رپورٹ"],
            linkLabel: "دفتری معلومات",
          },
          {
            title: "رجسٹری و تصدیق",
            meta: "سب رجسٹرار آفس",
            description: "سب رجسٹرار کے روبرو باضابطہ رجسٹری، گواہان کی بائیو میٹرک تصدیق اور سرکاری چالان 32-A کا عمل۔",
            bullets: ["گواہان کی قانونی تیاری", "بائیو میٹرک تصدیق", "اصل رجسٹری کی فراہمی"],
            linkLabel: "دفتری معلومات",
          },
          {
            title: "وراثتی جانشینی سرٹیفکیٹ",
            meta: "اراضی وراثت کی تقسیم",
            description: "مرحومین کی جائیداد قانونی وارثان کے نام منتقل کرنے کے لیے نادرا و عدالتی وراثتی سرٹیفکیٹ کی تیاری۔",
            bullets: ["فیملی ٹری (شجرہ نسب)", "نادرا و عدالتی پیروی", "انتقال اراضی (انتقال) کا اندراج"],
            linkLabel: "دفتری معلومات",
          },
          {
            title: "مختار نامہ عام و خاص",
            meta: "GPA و SPA رجسٹریشن",
            description: "پراپرٹی کی دیکھ بھال، خرید و فروخت کے لیے جنرل اور اسپیشل پاور آف اٹارنی کی تیاری اور رجسٹری۔",
            bullets: ["اختیارات کی واضح ڈرافٹنگ", "سب رجسٹرار کے ہاں اندراج", "اوورسیز سفارت خانہ تصدیق"],
            linkLabel: "دفتری معلومات",
          },
        ],
        whyEyebrow: "اثاثہ جات کا تحفظ",
        whyTitle: "اپنی جائیداد کو قانونی درستگی کے ساتھ محفوظ بنائیں",
        whyParagraphs: [
          "پاکستان میں رئیل اسٹیٹ ٹرانزیکشن میں ادنیٰ سی غفلت مستقبل کے طویل تنازعات اور مالی نقصان کا سبب بن سکتی ہے۔ لیگل اسسٹ کی قانونی ٹیم ٹائٹل اور ای سٹامپنگ کی مکمل جانچ کرتی ہے۔",
          "ہم پٹواری، ریونیو افسران اور ہاؤسنگ اتھارٹیز کے مابین ایک شفاف پل بن کر آپ کے حقوق کا مکمل تحفظ کرتے ہیں۔",
        ],
        whyFeatures: [
          { title: "مصدقہ حکومتی تصدیق", text: "متعلقہ لینڈ ریکارڈ اتھارٹیز اور پٹوار خانوں سے اصل ریکارڈ کی براہ راست جانچ۔" },
          { title: "ماہرانہ قانونی ڈرافٹنگ", text: "خریدار اور فروخت کنندہ کے جملہ حقوق کے تحفظ کے لیے جامع بیع نامہ۔" },
          { title: "سب رجسٹرار پیروی", text: "رجسٹری کے دن بائیو میٹرک اور گواہان کے باضابطہ بیان کا مکمل اہتمام۔" },
          { title: "تنازعات سے تحفظ", text: "پیشگی آڈٹ جس سے دہری رجسٹری یا غیر قانونی رہن کے خطرات ختم ہو جاتے ہیں۔" },
        ],
        checklistBannerTitle: "کیا آپ جائیداد خریدنے کا ارادہ رکھتے ہیں؟",
        checklistBannerDesc: "بیعانہ دینے سے قبل ہمارے پراپرٹی قانونی ماہرین سے مشورہ کریں اور صاف شفاف ٹائٹل کو یقینی بنائیں۔",
      },
      "business-registration": {
        heroBadge: "ایس ای سی پی و کارپوریٹ رجسٹریشن",
        heroTitle: "کاروباری و کمپنی رجسٹریشن سروسز",
        heroDesc: "ایس ای سی پی کے تحت پرائیویٹ لمیٹڈ کمپنی، سنگل ممبر کمپنی، شراکت داری فرم (Form C)، اور کارپوریٹ ٹیکس کا باضابطہ قیام۔",
        noticeLabel: "کارپوریٹ گائیڈ لائنز",
        noticeTitle: "ایس ای سی پی کمپنی رجسٹریشن شرائط",
        noticeText: "کمپنی رجسٹریشن کے لیے تمام ڈائریکٹرز کے تصدیق شدہ شناختی کارڈ، ڈیجیٹل دستخط، نام کی منظوری اور رجسٹرڈ آفس کا پتہ درکار ہوتا ہے۔",
        noticeCta: "نام کی دستیابی چیک کریں",
        portfolioTitle: "کارپوریٹ رجسٹریشن حل",
        portfolioSubtitle: "سٹارٹ اپس، تاجروں اور کمپنیوں کے لیے سرکاری قواعد کے مطابق تیز رفتار کمپنی تشکیل۔",
        cards: [
          {
            title: "SECP پرائیویٹ لمیٹڈ کمپنی",
            meta: "Pvt. Ltd. و SMC",
            description: "میمورنڈم (MOA) اور آرٹیکلز (AOA) کے ساتھ پرائیویٹ لمیٹڈ اور سنگل ممبر کمپنی کی مکمل قانونی تشکیل۔",
            bullets: ["کمپنی نام کی منظوری", "ڈیجیٹل سگنیچر کارڈ", "سرٹیفکیٹ آف انکارپوریشن"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
          {
            title: "سول پروپرائٹر شپ (انفرادی)",
            meta: "فوری ایف بی آر رجسٹریشن",
            description: "انفرادی کاروبار کا باقاعدہ این ٹی این، بزنس سرٹیفکیٹ اور بینک اکاؤنٹ کھولنے کے لیے قانونی تصدیقی لیٹر۔",
            bullets: ["اسی دن رجسٹریشن", "آئرس پورٹل سے لنک", "بینک اکاؤنٹ کی تیاری"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
          {
            title: "پارٹنرشپ رجسٹریشن (فارم سی)",
            meta: "رجسٹرار آف فرمز",
            description: "پارٹنرشپ ڈیڈ کی تیاری اور رجسٹرار آف فرمز کے پاس باضابطہ فارم سی کا قانونی اندراج۔",
            bullets: ["اسٹامپ پیپر پر معاہدہ", "رجسٹرار آفس میں جمع", "فارم سی کی باضابطہ فراہمی"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
          {
            title: "کارپوریٹ NTN اور سیلز ٹیکس (GST)",
            meta: "FBR کارپوریٹ پورٹل",
            description: "کمپنی کا ٹیکس نمبر اور لوکل و ایکسپورٹ بزنس کے لیے سیلز ٹیکس رجسٹریشن (STRN)۔",
            bullets: ["کارپوریٹ ٹیکس پروفائل", "ایکٹو STRN سرٹیفکیٹ", "ودہولڈنگ ٹیکس چھوٹ"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
          {
            title: "چیمبر آف کامرس رکنیت",
            meta: "ICCI اور RCCI ممبرشپ",
            description: "اسلام آباد اور راولپنڈی چیمبرز میں کارپوریٹ ممبرشپ کی مکمل فائلنگ اور دستاویزاتی عمل۔",
            bullets: ["ممبرشپ فائل کی تیاری", "کارپوریٹ تصدیق", "چیمبر ایگزیکٹو کارڈ"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
          {
            title: "ٹریڈ لائسنس و بلدیاتی این او سی",
            meta: "CDA / بلدیہ لائسنس",
            description: "تجارتی سرگرمیوں کے لیے بلدیہ اور لوکل باڈیز سے باضابطہ ٹریڈ لائسنس اور پروفیشنل ٹیکس کلیئرنس۔",
            bullets: ["زوننگ مطابقت", "پروفیشنل ٹیکس کلیئرنس", "آپریٹنگ لائسنس کا اجراء"],
            linkLabel: "کمپنی رجسٹر کریں",
          },
        ],
        whyEyebrow: "کارپوریٹ قانونی بنیادیں",
        whyTitle: "اپنے کاروبار کا آغاز مضبوط قانونی بنیادوں پر کریں",
        whyParagraphs: [
          "غیر رجسٹرڈ کاروبار چلانے سے کاروباری مالکان کو ذاتی مالیاتی خطرات اور حکومتی جرمانوں کا سامنا ہو سکتا ہے۔ ہم کمپنیز ایکٹ 2017 کے مطابق شفاف رجسٹریشن فراہم کرتے ہیں۔",
          "نام کی ریزرویشن سے لے کر کارپوریٹ بینک اکاؤنٹ کھولنے تک ہر انتظامی رکاوٹ کو پیشہ ورانہ انداز میں حل کیا جاتا ہے۔",
        ],
        whyFeatures: [
          { title: "فاسٹ ٹریک ایس ای سی پی سروس", text: "آن لائن پورٹل پر بغیر کسی رکاوٹ کے فوری پروسیسنگ اور فالو اپ۔" },
          { title: "جامع قانونی ڈرافٹنگ", text: "تجربہ کار کارپوریٹ وکلاء کے تیار کردہ شفاف MOA اور AOA۔" },
          { title: "رجسٹریشن کے بعد قانونی معاونت", text: "فارم 29، سالانہ ریٹرن اور کمپنی سیکریٹریل سروسز۔" },
          { title: "بینک اکاؤنٹ مشاورتی سہولت", text: "کمپنی بینک اکاؤنٹ کھولنے کے جملہ قانونی تقاضوں کی تکمیل۔" },
        ],
        checklistBannerTitle: "کیا آپ اپنی کمپنی رجسٹر کروانا چاہتے ہیں؟",
        checklistBannerDesc: "آج ہی ہمارے کارپوریٹ وکلاء سے رابطہ کریں اور اپنے کاروبار کے لیے بہترین قانونی ڈھانچے کا انتخاب کریں۔",
      },
      "registry-deeds": {
        heroBadge: "سب رجسٹرار و ریونیو ڈیپارٹمنٹ",
        heroTitle: "رجسٹری و قانونی وثائق",
        heroDesc: "سب رجسٹرار آفس میں بیع نامہ، ہبہ نامہ، پاور آف اٹارنی، رہن نامہ کی رجسٹری اور پرانے ریکارڈز کی مصدقہ نقول کا حصول۔",
        noticeLabel: "بائیو میٹرک و گواہان کی شرط",
        noticeTitle: "سب رجسٹرار کے روبرو پیشی کی لازمی شرط",
        noticeText: "فروخت کنندہ، خریدار اور دو گواہان کا اصل شناختی کارڈ کے ہمراہ سب رجسٹرار کے سامنے بائیو میٹرک تصدیق اور بیان کے لیے پیش ہونا لازمی ہے۔",
        noticeCta: "مشاورت حاصل کریں",
        portfolioTitle: "رجسٹری اور دستاویزی وثائق",
        portfolioSubtitle: "جائیداد کی سرکاری منتقلی، مصدقہ دستاویزات اور سرکاری آرکائیو سے پرانے ریکارڈز کا حصول۔",
        cards: [
          {
            title: "بیع نامہ کی باضابطہ رجسٹری",
            meta: "ملکیت کی مکمل منتقلی",
            description: "سب رجسٹرار کے روبرو بیع نامہ کی ڈرافٹنگ، اسٹامپ ڈیوٹی چالان اور قانونی اندراج۔",
            bullets: ["سرکاری اسٹامپ پیپر", "بائیو میٹرک نشان انگوٹھا", "سرکاری ریکارڈ پر باقاعدہ اندراج"],
            linkLabel: "رجسٹری معلومات",
          },
          {
            title: "ہبہ نامہ (خونی رشتہ تحفہ)",
            meta: "قریبی رشتہ داروں میں منتقلی",
            description: "اسلامی قوانین اور رجسٹریشن ایکٹ کے مطابق خونی رشتہ داروں کو جائیداد ہبہ (تحفہ) کرنے کی رجسٹری۔",
            bullets: ["ایجاب و قبول کی دستاویز", "اسٹامپ ڈیوٹی میں قانونی رعایت", "سب رجسٹرار کے ہاں تصدیق"],
            linkLabel: "رجسٹری معلومات",
          },
          {
            title: "مختار نامہ عام و خاص",
            meta: "پاور آف اٹارنی کی رجسٹری",
            description: "عدالتی کارروائی اور اراضی امور کے لیے جنرل اور اسپیشل پاور آف اٹارنی کا مجاز اندراج۔",
            bullets: ["اختیارات کا محتاط تعین", "سب رجسٹرار کے پاس اندراج", "منسوخی کے ضوابط"],
            linkLabel: "رجسٹری معلومات",
          },
          {
            title: "ٹائٹل سرچ و ریکارڈ تصدیق",
            meta: "ریونیو و سب رجسٹرار",
            description: "سب رجسٹرار آرکائیو اور پٹواری رجسٹرز کے ذریعے پچھلے 30 سالہ مالکانہ حقوق کی تفصیلی جانچ۔",
            bullets: ["ریکارڈ روم سے جانچ", "عدالتی تنازعات کی جانچ", "مصدقہ خلاصہ ملکیت"],
            linkLabel: "رجسٹری معلومات",
          },
          {
            title: "رہن نامہ (Mortgage Deed)",
            meta: "بینک و مالیاتی ادارے",
            description: "بینکوں اور قرض دینے والے اداروں کے حق میں جائیداد رہن رکھنے کے قانونی دستاویز کی رجسٹری۔",
            bullets: ["بینک چارج کا اندراج", "سب رجسٹرار کے ہاں توثیق", "واپسی رہن کی باضابطہ کارروائی"],
            linkLabel: "رجسٹری معلومات",
          },
          {
            title: "پرانے ریکارڈز کی نقول (نقل)",
            meta: "سرکاری ریکارڈ روم نقول",
            description: "گمشدہ یا پرانی رجسٹریوں کی سرکاری ریکارڈ روم سے تصدیق شدہ نقول (نقل) کا حصول۔",
            bullets: ["آرکائیو رجسٹری تلاش", "مصدقہ سرکاری نقل", "ارجنٹ پروسیسنگ سہولت"],
            linkLabel: "رجسٹری معلومات",
          },
        ],
        whyEyebrow: "سرکاری ریکارڈ کی سند",
        whyTitle: "مکمل مالکانہ تحفظ کے لیے سرکاری رجسٹری کیوں ضروری ہے؟",
        whyParagraphs: [
          "غیر رجسٹرڈ تحریر یا زبانی اقرار نامے کی عدالت میں کوئی خاص قانونی حیثیت نہیں ہوتی۔ سب رجسٹرار آفس کی رجسٹری ملکیت کا حتمی ثبوت فراہم کرتی ہے۔",
          "ہماری ٹیم سب رجسٹرار آفس کے ساتھ مربوط ہو کر اس بات کو یقینی بناتی ہے کہ ہر چالان اور بائیو میٹرک عمل بروقت مکمل ہو۔",
        ],
        whyFeatures: [
          { title: "سب رجسٹرار دفتری معاونت", text: "رجسٹری کے دن ذاتی نگرانی تاکہ سائلین کو غیر ضروری تاخیر کا سامنا نہ ہو۔" },
          { title: "بائیو میٹرک تصدیق", text: "نادرا شناختی کارڈ اور فنگر پرنٹ تصدیق کا درست و فوری اہتمام۔" },
          { title: "ریونیو ریکارڈ تلاش", text: "رجسٹری کا پٹوار خانے اور تحصیل ریکارڈ کے ساتھ مکمل موازنہ۔" },
          { title: "مصدقہ نقول کی فراہمی", text: "سرکاری آرکائیو سے اصل ریکارڈ کی باضابطہ نقول کا حصول۔" },
        ],
        checklistBannerTitle: "کیا آپ رجسٹری کروانا چاہتے ہیں؟",
        checklistBannerDesc: "درست اسٹامپ ڈیوٹی چالان بنوانے اور وقت طے کرنے کے لیے ہمارے رجسٹری ڈیپارٹمنٹ سے رابطہ کریں۔",
      },
      "banking-financial": {
        heroBadge: "مالیاتی دستاویزات",
        heroTitle: "بینکنگ و مالیاتی دستاویزات",
        heroDesc: "تجارتی قرضوں، رہن نامہ، SECP فارم 10/12 چارج کریشن، ہائپوتھیکیشن ڈیڈز اور مالیاتی حلف ناموں کی قانونی ڈرافٹنگ۔",
        noticeLabel: "اسٹیٹ بینک ضوابط",
        noticeTitle: "بینکنگ قواعد و ضوابط کی پاسداری",
        noticeText: "بینک ضمانتوں اور مارگیج دستاویزات کا اسٹیٹ بینک آف پاکستان اور ایس ای سی پی قوانین کے مطابق ہونا لازمی ہے۔",
        noticeCta: "ماہر سے بات کریں",
        portfolioTitle: "مالیاتی قانونی سروسز",
        portfolioSubtitle: "بینکوں، قرض دہندگان اور کاروباری افراد کے لیے ٹھوس قانونی معاہدات کی تیاری۔",
        cards: [
          {
            title: "قرضہ جات دستاویزات",
            meta: "کمرشل و پرسنل لون",
            description: "کریڈٹ سہولیات، واپسی کے شیڈول اور ذاتی ضمانتوں کے معاہدات کی قانونی جانچ اور تیاری۔",
            bullets: ["قرضہ معاہدات", "ذاتی ضمانت کے بانڈز", "قانونی نفاذ کا جائزہ"],
            linkLabel: "مشاورت حاصل کریں",
          },
          {
            title: "کارپوریٹ فنانس و چارجز",
            meta: "SECP فارم 10/12 اندراج",
            description: "ہائپوتھیکیشن ڈیڈز، فلوٹنگ چارجز اور ایس ای سی پی میں مقررہ مدت کے اندر چارج کا قانونی اندراج۔",
            bullets: ["ہائپوتھیکیشن معاہدات", "فارم 10/12 فائلنگ", "چارج رجسٹریشن سرٹیفکیٹ"],
            linkLabel: "مشاورت حاصل کریں",
          },
          {
            title: "مالیاتی حلف نامے و اقرار نامے",
            meta: "اووتھ کمشنر تصدیق شدہ",
            description: "آمدن کی تصدیق، اثاثہ جات کا اقرار، چیک بک گمشدگی اور بینک این او سی کے لیے قانونی حلف نامے۔",
            bullets: ["آمدن کے ذرائع کا حلف نامہ", "چیک گمشدگی اقرار نامہ", "بینک کلیئرنس حلف نامہ"],
            linkLabel: "مشاورت حاصل کریں",
          },
          {
            title: "رہن نامہ و کولیٹرل سیکیورٹی",
            meta: "رجسٹرڈ و ایکویٹیبل مارگیج",
            description: "بینک قرض کے تحفظ کے لیے جائیداد رہن رکھنے کے معاہدات، ٹائٹل تصدیق اور کلیئرنس سرٹیفکیٹس۔",
            bullets: ["ٹائٹل سرچ رپورٹ", "رہن نامہ کی رجسٹری", "قرض ادائیگی پر واپسی این او سی"],
            linkLabel: "مشاورت حاصل کریں",
          },
        ],
        whyEyebrow: "مالیاتی قانونی مہارت",
        whyTitle: "بینکنگ معیارات اور قانونی تقاضوں میں ہم آہنگی",
        whyParagraphs: [
          "پاکستان میں مالیاتی معاہدات کا اسٹیٹ بینک کے پرڈینشل ریگولیشنز کے عین مطابق ہونا لازمی ہے۔ مبہم ڈرافٹنگ کروڑوں روپے کے اثاثوں کو خطرے میں ڈال سکتی ہے۔",
          "ہم کارپوریٹ اداروں، بینکوں اور عام قرض داروں کو مستند قانونی معاونت فراہم کرتے ہیں۔",
        ],
        whyFeatures: [
          { title: "بینکنگ قواعد کی پابندی", text: "اسٹیٹ بینک اور کمرشل بینکوں کے قواعد کے عین مطابق دستاویزات۔" },
          { title: "ایس ای سی پی چارج رجسٹریشن", text: "قرض دہندگان کے تحفظ کے لیے فارم 10 اور 12 کا بروقت اندراج۔" },
          { title: "کولیٹرل جائیداد کی تصدیق", text: "رہن رکھی جانے والی جائیداد کے صاف شفاف ٹائٹل کی آزادانہ تصدیق۔" },
          { title: "فوری قانونی ڈرافٹنگ", text: "ضروری لون ایگریمنٹس اور بینک انڈرٹیکنگز کی فوری تیاری۔" },
        ],
        checklistBannerTitle: "کیا آپ بینک قرض یا مارگیج فائنل کر رہے ہیں؟",
        checklistBannerDesc: "فوری ڈرافٹنگ اور قانونی تصدیق کے لیے ہمارے مالیاتی دستاویزی ماہرین سے رابطہ کریں۔",
      },
      "family-legal": {
        heroBadge: "خاندانی و عائلی قانون",
        heroTitle: "خاندانی و قانونی دستاویزات",
        heroDesc: "نکاح نامہ رجسٹریشن، نادرا سرٹیفکیٹس، جانشینی سرٹیفکیٹ (Succession)، کسٹڈی سرٹیفکیٹ اور طلاق و خلع کے کاغذات کی بااعتماد تیاری۔",
        noticeLabel: "مکمل رازداری کی ضمانت",
        noticeTitle: "خاندانی و عائلی امور کی رازداری",
        noticeText: "خاندانی معاملات کے تمام قانونی کاغذات کو مکمل راز داری اور پاکستانی فیملی لاز کے احترام کے ساتھ حل کیا جاتا ہے۔",
        noticeCta: "بھروسے سے رابطہ کریں",
        portfolioTitle: "خاندانی دستاویزی خدمات",
        portfolioSubtitle: "وارثان، خاندانوں اور بچوں کے قانونی حقوق کے تحفظ کے لیے باضابطہ دستاویزی رہنمائی۔",
        cards: [
          {
            title: "نکاح نامہ و نادرا سرٹیفکیٹ",
            meta: "یونین کونسل و نادرا اندراج",
            description: "نکاح نامہ کا یونین کونسل میں قانونی اندراج اور نادرا کمپیوٹرائزڈ میرج رجسٹریشن سرٹیفکیٹ کا حصول۔",
            bullets: ["یونین کونسل باضابطہ تصدیق", "کمپیوٹرائزڈ نادرا سرٹیفکیٹ", "سفارت خانوں کے لیے تصدیق"],
            linkLabel: "خفیہ رہنمائی",
          },
          {
            title: "جانشینی سرٹیفکیٹ (Succession)",
            meta: "بینک اکاؤنٹ و اثاثہ منتقلی",
            description: "مرحوم کے بینک کھاتوں، شیئرز اور قومی بچت کے اثاثوں کی تقسیم کے لیے نادرا و عدالتی جانشینی سرٹیفکیٹ۔",
            bullets: ["نادرا سکسیشن پروسیسنگ", "عدالتی پٹیشن و اخبار اشتہار", "قانونی وارثان کا اندراج"],
            linkLabel: "خفیہ رہنمائی",
          },
          {
            title: "طلاق و خلع کے کاغذات",
            meta: "ثالثی کونسل و نادرا سرٹیفکیٹ",
            description: "طلاق نامہ، خلع کی ڈگری، ثالثی کونسل میں نوٹسز اور نادرا ڈیوورس سرٹیفکیٹ کے باضابطہ مراحل۔",
            bullets: ["چیئرمین کونسل کو نوٹس", "90 روزہ ثالثی عمل کی پیروی", "حتمی نادرا طلاق سرٹیفکیٹ"],
            linkLabel: "خفیہ رہنمائی",
          },
          {
            title: "بچوں کی سرپرستی (گارڈین شپ)",
            meta: "گارڈین عدالت سرٹیفکیٹ",
            description: "بچوں کی قانونی تحویل، کفالت اور اثاثہ جات کی دیکھ بھال کے لیے گارڈین کورٹ سے سرٹیفکیٹ کا حصول۔",
            bullets: ["گارڈین عدالت درخواست", "اثاثوں کے تحفظ کے احکامات", "پاسپورٹ و سفر کی اجازت"],
            linkLabel: "خفیہ رہنمائی",
          },
        ],
        whyEyebrow: "محترم قانونی معاونت",
        whyTitle: "آپ کے خاندانی حقوق کے لیے باوقار قانونی سہولت",
        whyParagraphs: [
          "خاندانی معاملات انتہائی حساس ہوتے ہیں۔ نادرا، یونین کونسل اور فیملی کورٹس کے پیچیدہ مراحل کو سلجھانے کے لیے قابل اعتماد قانونی مشورے کی ضرورت ہوتی ہے۔",
          "ہماری ٹیم مکمل وقار، رازداری اور سنجیدگی کے ساتھ آپ کے قانونی حقوق کا تحفظ یقینی بناتی ہے۔",
        ],
        whyFeatures: [
          { title: "نادرا سسٹم سے ہم آہنگی", text: "کمپیوٹرائزڈ فیملی رجسٹریشن اور نادرا ریکارڈز کی مکمل معلومات۔" },
          { title: "مکمل رازداری", text: "ازدواجی اور عائلی دستاویزات کی 100% پرائیویسی کی ضمانت۔" },
          { title: "عدالتی نمائندگی", text: "سکسیشن اور گارڈین کورٹس میں تجربہ کار وکلاء کی خدمات۔" },
          { title: "وارثان کی قانونی بہبود", text: "باہمی تنازعات سے بچتے ہوئے پرامن اور تیز رفتار حل۔" },
        ],
        checklistBannerTitle: "کیا آپ کو خاندانی دستاویزات میں مدد چاہیے؟",
        checklistBannerDesc: "آج ہی مکمل رازداری کے ساتھ ہمارے خاندانی قانونی مشیروں سے رابطہ کریں۔",
      },
      "legal-documentation": {
        heroBadge: "تصدیق و اووتھ کمشنر",
        heroTitle: "قانونی دستاویزات و تصدیقات",
        heroDesc: "اووتھ کمشنر سے مصدقہ حلف نامے، مختار نامہ عام و خاص، کرایہ نامہ، اور وکیل کے ذریعے باضابطہ قانونی نوٹسز کی تیاری۔",
        noticeLabel: "اووتھ کمشنر شرط",
        noticeTitle: "اووتھ کمشنر کے سامنے ذاتی پیشی کی شرط",
        noticeText: "حلف ناموں، انڈرٹیکنگز اور ضمانت ناموں پر اووتھ کمشنر یا نوٹری پبلک کے روبرو اصل شناختی کارڈ کے ساتھ دستخط لازمی ہیں۔",
        noticeCta: "چیک لسٹ دیکھیں",
        portfolioTitle: "قانونی وثائق کی ڈرافٹنگ",
        portfolioSubtitle: "قواعد و ضوابط کے مطابق عدالتوں اور سرکاری محکموں میں قابل قبول قانونی دستاویزات۔",
        cards: [
          {
            title: "حلف نامے و اقرار نامے",
            meta: "اووتھ کمشنر مصدقہ",
            description: "شناختی کارڈ درستگی، گمشدگی کاغذات، مالیاتی بیانات اور عدالتی جمع کروانے کے لیے اووتھ کمشنر مصدقہ حلف نامے۔",
            bullets: ["اووتھ کمشنر تصدیق", "نوٹری پبلک مہر", "انڈیمنٹی بانڈز"],
            linkLabel: "ڈرافٹ کی درخواست",
          },
          {
            title: "مختار نامہ عام و خاص (Local/Overseas)",
            meta: "لوکل و وزارت خارجہ (MOFA)",
            description: "جنرل اور اسپیشل پاور آف اٹارنی کی تیاری اور اوورسیز پاکستانیوں کے لیے سفارت خانہ اور فارن آفس سے تصدیق۔",
            bullets: ["پاکستانی سفارت خانہ تصدیق", "وزارت خارجہ (MOFA) تصدیق", "سب رجسٹرار آفس توثیق"],
            linkLabel: "ڈرافٹ کی درخواست",
          },
          {
            title: "کرایہ نامہ و لیز ایگریمنٹ",
            meta: "رہائشی و کمرشل معاہدات",
            description: "پنجاب و اسلام آباد رینٹ ریسٹرکشن ایکٹ کے مطابق کرایہ نامہ کی تیاری، مالک اور کرایہ دار کے حقوق کا تحفظ۔",
            bullets: ["رینٹ ایکٹ کی پابندی", "سیکیورٹی ڈیپازٹ تحفظ", "پولیس اندراج معاونت"],
            linkLabel: "ڈرافٹ کی درخواست",
          },
          {
            title: "باضابطہ قانونی نوٹسز",
            meta: "وکیل نوٹس ڈرافٹنگ",
            description: "معاہدے کی خلاف ورزی، رقم کی واپسی اور دیوانی تنازعات پر وکیل کی طرف سے باضابطہ قانونی نوٹس کی تیاری و ترسیل۔",
            bullets: ["وکیل کی مہر و دستخط", "رجسٹرڈ ڈاک و ٹی سی ایس ترسیل", "ڈلیوری ثبوت کا اندراج"],
            linkLabel: "ڈرافٹ کی درخواست",
          },
        ],
        whyEyebrow: "ٹھوس قانونی معاہدات",
        whyTitle: "مضبوط قانونی تحریر اور پیشہ ورانہ تصدیقات",
        whyParagraphs: [
          "کمزور تحریر شدہ حلف نامہ یا کرایہ نامہ مستقبل میں شدید تنازعات اور مالی نقصان کا سبب بنتا ہے۔ قانونی اقرار کا ہر لفظ وزنی ہوتا ہے۔",
          "ہمارے دستاویزی ماہرین ایسے معاہدات تیار کرتے ہیں جو عدالت میں چیلنج نہ ہو سکیں اور آپ کے حقوق کا مکمل تحفظ کریں۔",
        ],
        whyFeatures: [
          { title: "مجاز اووتھ کمشنر سہولت", text: "ہمارے دفتر میں باضابطہ اووتھ کمشنر اور نوٹری پبلک کی دستیابی۔" },
          { title: "وزارت خارجہ (MOFA) رہنمائی", text: "بیرون ملک مقیم پاکستانیوں کے مختار ناموں کی تصدیق کی خصوصی معاونت۔" },
          { title: "مضبوط قانونی زبان", text: "قوانین پاکستان کے مطابق مؤثر اور عدالتوں میں قابل نفاذ ڈرافٹنگ۔" },
          { title: "اسی دن ڈرافٹنگ", text: "عام حلف ناموں اور کرایہ ناموں کی اسی دن تیاری اور باقاعدہ تصدیق۔" },
        ],
        checklistBannerTitle: "کیا آپ کو فوری قانونی تصدیق کی ضرورت ہے؟",
        checklistBannerDesc: "ہماری ہیلپ لائن پر رابطہ کریں یا فوری کارروائی کے لیے ہمارے اسلام آباد دفتر تشریف لائیں۔",
      },
      "trademark-ipo": {
        heroBadge: "انٹلیکچوئل پراپرٹی آرگنائزیشن",
        heroTitle: "ٹریڈ مارک و آئی پی او رجسٹریشن",
        heroDesc: "اپنے برانڈ نام، لوگو، کاپی رائٹ اور ایجادات کو آئی پی او پاکستان کے تحت سرکاری تحفظ فراہم کروائیں۔ مکمل فائلنگ و قانونی نمائندگی۔",
        noticeLabel: "فائلنگ سے قبل انتباہ",
        noticeTitle: "ٹریڈ مارک سرچ رپورٹ کی اہمیت",
        noticeText: "کسی بھی نئے برانڈ نام یا لوگو کی درخواست جمع کروانے سے قبل آئی پی او کی سرکاری سرچ کروانا لازمی ہے تاکہ مماثلت کے باعث فیس ضائع نہ ہو۔",
        noticeCta: "برانڈ سرچ کروائیں",
        portfolioTitle: "انٹلیکچوئل پراپرٹی سروسز",
        portfolioSubtitle: "پاکستان بھر میں آپ کے کاروباری ٹریڈ مارک اور تخلیقی حقوق کا مکمل قانونی تحفظ۔",
        cards: [
          {
            title: "برانڈ و لوگو ٹریڈ مارک",
            meta: "تمام 45 کلاسز میں TM-1",
            description: "ٹریڈ مارکس آرڈیننس 2001 کے تحت برانڈ نام، لوگو، اور سلوگن کی سرکاری رجسٹریشن۔",
            bullets: ["درست کلاس کا انتخاب", "سرکاری TM-1 درخواست", "باضابطہ وصولی رسید"],
            linkLabel: "برانڈ محفوظ کریں",
          },
          {
            title: "آئی پی او سرچ رپورٹس",
            meta: "فائلنگ سے قبل سرچ",
            description: "آئی پی او ریکارڈ کی تفصیلی چھان بین تاکہ معلوم ہو سکے کہ آپ کا برانڈ نام پہلے سے رجسٹرڈ تو نہیں۔",
            bullets: ["صوتی مماثلت کی جانچ", "سرکاری ڈیٹا بیس تلاش", "رسک اسسمنٹ رپورٹ"],
            linkLabel: "برانڈ محفوظ کریں",
          },
          {
            title: "کاپی رائٹ رجسٹریشن",
            meta: "تخلیقی فن پارے و سافٹ ویئر",
            description: "سافٹ ویئر سورس کوڈ، کتب، میڈیا، ڈیزائنز اور آرکیٹیکچرل نقشہ جات کا باضابطہ سرکاری تحفظ۔",
            bullets: ["کاپی رائٹ آفس فائلنگ", "اخبار اشتہار کا عمل", "سرکاری سرٹیفکیٹ کا اجراء"],
            linkLabel: "برانڈ محفوظ کریں",
          },
          {
            title: "پیٹنٹ مشاورتی خدمات",
            meta: "ایجادات و صنعتی ڈیزائنز",
            description: "نئی سائنسی و تکنیکی ایجادات اور انڈسٹریل ڈیزائنز کی آئی پی او پاکستان میں پیٹنٹ فائلنگ۔",
            bullets: ["پیٹنٹ ڈرافٹنگ", "جدت کا معائنہ", "پیٹنٹ آفس کارروائی"],
            linkLabel: "برانڈ محفوظ کریں",
          },
          {
            title: "رجسٹری اعتراضات کا دفاع",
            meta: "شوکاز نوٹس کا جواب",
            description: "ایگزامینر کے اعتراضات کے قانونی جوابات، اپوزیشن کا دفاع، اور رجسٹرار کے روبرو باضابطہ پیشی۔",
            bullets: ["شوکاز نوٹس کا قانونی جواب", "استعمال کے ثبوت کی تیاری", "رجسٹرار سماعت میں نمائندگی"],
            linkLabel: "برانڈ محفوظ کریں",
          },
        ],
        whyEyebrow: "کاروباری برانڈ کا تحفظ",
        whyTitle: "پاکستان میں اپنے برانڈ کی ساکھ کا دفاع کریں",
        whyParagraphs: [
          "برانڈ رجسٹر کروائے بغیر کاروبار کرنے سے کوئی بھی آپ کے نام پر جعلی پروڈکٹ فروخت کر سکتا ہے۔ بغیر رجسٹریشن کے عدالت میں برانڈ کا دفاع کرنا انتہائی مشکل ہوتا ہے۔",
          "ہمارے ٹریڈ مارک وکلاء نام کی جانچ سے لے کر حتمی رجسٹریشن سرٹیفکیٹ کے اجراء تک آپ کے حقوق کی حفاظت کرتے ہیں۔",
        ],
        whyFeatures: [
          { title: "تمام 45 کلاسز میں سرچ", text: "اشیاء اور خدمات کی تمام کٹیگریز میں مماثلت کی جامع رپورٹ۔" },
          { title: "آئی پی او باضابطہ فائلنگ", text: "فوری اور مصدقہ الیکٹرانک اور فزیکل وصولی رسید کے ساتھ فائلنگ۔" },
          { title: "شوکاز نوٹسز کا قانونی دفاع", text: "رجسٹری کے اعتراضات اور سائلین کی مخالفت کا ٹھوس قانونی جواب۔" },
          { title: "10 سالہ تحفظ و تجدید", text: "رجسٹریشن کے بعد 10 سالہ تجدید اور غیر قانونی نقل پر کڑی نظر۔" },
        ],
        checklistBannerTitle: "کیا آپ اپنا برانڈ محفوظ کروانا چاہتے ہیں؟",
        checklistBannerDesc: "فوری ٹریڈ مارک سرچ اور فائلنگ کے لیے آج ہی ہمارے آئی پی او کنسلٹنٹس سے رابطہ کریں۔",
      },
    },
  },
};
