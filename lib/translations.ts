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
    backToHome: string;
    backToServices: string;
    speakToExpert: string;
    visitOurOffice: string;
    whatsappUs: string;
    callNow: string;
    getDirections: string;
    learnMore: string;
    requiredDocs: string;
    institutionalExcellence: string;
    officialCompliance: string;
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
          {
            title: "NTN Registration",
            description: "Salaried, business, and freelance Iris portal setup and issuance",
          },
          {
            title: "Income Tax Filing",
            description: "Annual tax return & wealth statements for Active Taxpayer status",
          },
          {
            title: "Sales Tax Registration (STRN)",
            description: "GST / STRN registration for manufacturers, traders, and services",
          },
          {
            title: "Tax Exemption Certificates",
            description: "Withholding tax exemptions and special industrial certificates",
          },
          {
            title: "FBR Audit Response",
            description: "Professional drafting and representation for section 177 / 214C notices",
          },
          {
            title: "Chamber of Commerce",
            description: "ICCI & RCCI chamber membership processing and documentation",
          },
        ],
      },
      "e-stamping": {
        title: "E-Stamp & Stamp Paper",
        shortTitle: "E-Stamping",
        tagline: "Authorized Government Stamp Vendor",
        description:
          "Official digital stamp papers processed instantly with government portal verification.",
        items: [
          {
            title: "Non-Judicial E-Stamp",
            description: "PKR 50 to 1,000+ for commercial agreements, affidavits & contracts",
          },
          {
            title: "High-Value Judicial",
            description: "For court petitions, formal litigation, and legal declarations",
          },
          {
            title: "Property Sale Deed",
            description: "Calculated at official 1% DC rate for plot and house transfers",
          },
          {
            title: "Partnership Deed",
            description: "Authorized stamp papers for business partnerships and firm deeds",
          },
          {
            title: "Bank Documentation",
            description: "Custom stamp papers for loan agreements and mortgage deeds",
          },
          {
            title: "Verification & Challan 32-A",
            description: "Official online verification and accurate challan generation",
          },
        ],
      },
      "business-registration": {
        title: "Business Registration",
        shortTitle: "Business",
        tagline: "SECP & Corporate Documentation",
        description:
          "End-to-end corporate formation with SECP, FBR, and local municipal chambers.",
        items: [
          {
            title: "SECP Incorporation",
            description: "Private Limited (Pvt. Ltd.) & SMC company registration with MOA/AOA",
          },
          {
            title: "Sole Proprietorship",
            description: "Fast-track registration of individual business entities with FBR",
          },
          {
            title: "Partnership Deeds (Form C)",
            description: "Professional drafting and registration with the Registrar of Firms",
          },
          {
            title: "NTN & Sales Tax (GST)",
            description: "Corporate tax registration, STRN certification & bank opening papers",
          },
          {
            title: "Chamber Membership",
            description: "Corporate membership for Islamabad & Rawalpindi chambers of commerce",
          },
          {
            title: "Trade License (CDA/DMC)",
            description: "Municipal licenses, signboard permissions & professional tax certificates",
          },
        ],
      },
      "property-land": {
        title: "Property & Land Services",
        shortTitle: "Property & Land",
        tagline: "Real Estate Legal Verification",
        description:
          "Complete assistance for property transfers, sale deeds, and title verification across Pakistan.",
        items: [
          {
            title: "Sale Deed Documentation",
            description: "Baya-Nama drafting, stamp duty processing & Sub-Registrar execution",
          },
          {
            title: "Transfer Letter Services",
            description: "End-to-end facilitation for CDA, LDA, DHA, and housing societies",
          },
          {
            title: "Legal Search & Title Audit",
            description: "Thorough verification of property titles and Non-Encumbrance (NEC)",
          },
          {
            title: "Registry & Attestation",
            description: "Authorized assistance for property registration before Sub-Registrar",
          },
          {
            title: "Succession Certificates",
            description: "Inheritance documentation and legal heirship transfers for real estate",
          },
          {
            title: "Power of Attorney (GPA/SPA)",
            description: "Drafting & registration of Power of Attorney for property management",
          },
        ],
      },
      "registry-deeds": {
        title: "Registry & Deeds",
        shortTitle: "Registry & Deeds",
        tagline: "Sub-Registrar & Revenue Records",
        description:
          "Sub-registrar office registrations, gift deeds, mortgage deeds, and certified records.",
        items: [
          {
            title: "Sale Deed (Baye Nama)",
            description: "Full transfer of ownership rights before the Sub-Registrar",
          },
          {
            title: "Gift Deed (Hiba Nama)",
            description: "Official legal recording of property transferred as a gift to family",
          },
          {
            title: "Power of Attorney",
            description: "Authorized registration of General and Special POA",
          },
          {
            title: "Title Search & Verification",
            description: "Record verification from Sub-Registrar and Revenue offices",
          },
          {
            title: "Mortgage Deed Registration",
            description: "Official collateral registration with banks and lenders",
          },
          {
            title: "Certified Copies (Nakal)",
            description: "Attested copies of historical deeds from government archives",
          },
        ],
      },
      "banking-financial": {
        title: "Banking & Financial",
        shortTitle: "Banking & Finance",
        tagline: "Financial Institution Documentation",
        description:
          "Loan documentation, corporate hypothecation deeds, bank guarantees, and affidavits.",
        items: [
          {
            title: "Loan Documentation",
            description: "Personal, auto, and mortgage agreements with private and state banks",
          },
          {
            title: "Corporate Finance Docs",
            description: "Commercial loans, charge creation (Form 10/12), and hypothecation",
          },
          {
            title: "Financial Affidavits",
            description: "Source of income affidavits, loss of chequebook, and bank NOCs",
          },
          {
            title: "Mortgage & Collateral",
            description: "Legal registration of real estate as banking security",
          },
        ],
      },
      "family-legal": {
        title: "Family & Legal Documents",
        shortTitle: "Family & Legal",
        tagline: "Family Law & NADRA Certification",
        description:
          "Marriage registration, succession certificates, guardianship, and divorce documentation.",
        items: [
          {
            title: "Nikahnama Registration",
            description: "Official NADRA and Union Council marriage registration and certs",
          },
          {
            title: "Succession Certificates",
            description: "Court application and NADRA certificate for estate & bank accounts",
          },
          {
            title: "Divorce Documents",
            description: "Talaq-nama, Khula notices, and Arbitration Council facilitation",
          },
          {
            title: "Child Guardianship",
            description: "Guardian court documentation and legal custody representation",
          },
        ],
      },
      "legal-documentation": {
        title: "Legal Documentation",
        shortTitle: "Legal Docs",
        tagline: "Contracts & Attestations",
        description:
          "Affidavits, power of attorney, lease agreements, and formal legal notice drafting.",
        items: [
          {
            title: "Affidavits & Oaths",
            description: "Oath commissioner attested affidavits, undertakings & indemnity bonds",
          },
          {
            title: "Power of Attorney (Local/Overseas)",
            description: "Embassy and Foreign Office attested POA for overseas Pakistanis",
          },
          {
            title: "Rent & Lease Agreements",
            description: "Residential and commercial tenancy agreements compliant with law",
          },
          {
            title: "Formal Legal Notices",
            description: "Drafting notices for civil disputes, debt recovery & breach of contracts",
          },
        ],
      },
      "trademark-ipo": {
        title: "Trademark & IPO Registration",
        shortTitle: "Trademark & IPO",
        tagline: "IPO Pakistan Registration",
        description:
          "Intellectual property registration, brand names, logos, copyrights, and patents.",
        items: [
          {
            title: "Brand Trademark Filing",
            description: "Brand name, logo & slogan protection across all 45 classes",
          },
          {
            title: "IPO Search Reports",
            description: "Pre-filing trademark search to ensure unique availability",
          },
          {
            title: "Copyright Registration",
            description: "Legal protection for software, books, artwork & architectural designs",
          },
          {
            title: "Patent Advisory",
            description: "Technical drafting and filing for innovative inventions with IPO",
          },
          {
            title: "Objection Defense",
            description: "Replying to registry objections and representing in hearings",
          },
        ],
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
          {
            title: "این ٹی این (NTN) رجسٹریشن",
            description: "تنخواہ دار افراد، بزنس اور فری لانسرز کے لیے Iris اکاؤنٹ کی تیاری",
          },
          {
            title: "انکم ٹیکس گوشوارے جمع کروانا",
            description: "سالانہ ٹیکس ریٹرن اور ایکٹو فائلر لسٹ (ATL) میں شمولیت",
          },
          {
            title: "سیلز ٹیکس رجسٹریشن (STRN)",
            description: "مینوفیکچررز، درآمد کنندگان اور تاجروں کے لیے GST رجسٹریشن",
          },
          {
            title: "ٹیکس استثنیٰ سرٹیفکیٹس",
            description: "ودہولڈنگ ٹیکس چھوٹ اور خصوصی قانونی استثنیٰ دستاویزات",
          },
          {
            title: "ایف بی آر آڈٹ و شوکاز کا جواب",
            description: "سیکشن 177 اور 214C نوٹسز کا پیشہ ورانہ ڈرافٹنگ اور پیروی",
          },
          {
            title: "چیمبر آف کامرس رکنیت",
            description: "اسلام آباد اور راولپنڈی چیمبر آف کامرس کی باضابطہ رکنیت",
          },
        ],
      },
      "e-stamping": {
        title: "ای سٹامپ و اسٹامپ پیپر",
        shortTitle: "ای سٹامپنگ",
        tagline: "حکومت سے منظور شدہ باضابطہ وینڈر",
        description:
          "عدالتی و غیر عدالتی سرکاری ڈیجیٹل ای سٹامپ پیپرز کا فوری اور تصدیق شدہ اجراء۔",
        items: [
          {
            title: "غیر عدالتی ای سٹامپ",
            description: "کرایہ نامہ، حلف نامہ، اقرار نامہ اور عام تجارتی معاہدات (50 تا 1000+ روپے)",
          },
          {
            title: "ہائی ویلیو عدالتی سٹامپ",
            description: "عدالتی چالان، مقدمات، قانونی دعوے اور پاور آف اٹارنی کے لیے",
          },
          {
            title: "پراپرٹی بیع نامہ ای سٹامپ",
            description: "پلاٹ، مکان اور زمین کی منتقلی کے لیے سرکاری 1% ڈی سی ریٹ چالان",
          },
          {
            title: "شراکت داری معاہدہ (پارٹنرشپ)",
            description: "بزنس پارٹنرشپ اور فرم رجسٹریشن کے مجاز اسٹامپ پیپرز",
          },
          {
            title: "بینک دستاویزات اسٹامپ",
            description: "قرضہ جات، مارگیج اور مالیاتی گارنٹیوں کے لیے اسٹامپ پیپرز",
          },
          {
            title: "آن لائن تصدیق و چالان 32-A",
            description: "سرکاری پورٹل کے ذریعے فوری آن لائن تصدیق اور درست ہیڈ آف اکاؤنٹ چالان",
          },
        ],
      },
      "business-registration": {
        title: "کاروباری و کمپنی رجسٹریشن",
        shortTitle: "بزنس رجسٹریشن",
        tagline: "ایس ای سی پی و کارپوریٹ امور",
        description:
          "ایس ای سی پی کے تحت پرائیویٹ لمیٹڈ کمپنی، سنگل ممبر کمپنی اور فرم رجسٹریشن۔",
        items: [
          {
            title: "SECP کمپنی رجسٹریشن",
            description: "پرائیویٹ لمیٹڈ اور ایس ایم سی کی قانونی تشکیل بمع MOA اور AOA",
          },
          {
            title: "سول پروپرائٹر شپ (انفرادی کاروبار)",
            description: "ایف بی آر اور متعلقہ اداروں سے فوری بزنس رجسٹریشن",
          },
          {
            title: "پارٹنرشپ ڈیڈ (فارم سی)",
            description: "رجسٹرار آف فرمز کے پاس شراکت داری کا باقاعدہ قانونی اندراج",
          },
          {
            title: "کارپوریٹ NTN اور GST",
            description: "کمپنی کا ٹیکس نمبر، سیلز ٹیکس رجسٹریشن اور بینک اکاؤنٹ کاغذات",
          },
          {
            title: "چیمبر آف کامرس رکنیت",
            description: "اسلام آباد و راولپنڈی چیمبرز میں کارپوریٹ ممبرشپ کی سہولت",
          },
          {
            title: "ٹریڈ لائسنس (CDA / DMC)",
            description: "لوکل باڈیز اور بلدیہ سے باضابطہ تجارتی و پیشہ ورانہ لائسنس کا حصول",
          },
        ],
      },
      "property-land": {
        title: "اراضی و جائیداد کی خدمات",
        shortTitle: "پراپرٹی و اراضی",
        tagline: "جائیداد کی قانونی جانچ پڑتال و ٹرانسفر",
        description:
          "پلاٹ، مکان، کمرشل اراضی کی خرید و فروخت، ٹائٹل تصدیق اور انتقال اراضی۔",
        items: [
          {
            title: "بیع نامہ (سیل ڈیڈ) ڈرافٹنگ",
            description: "پلاٹ و مکان کی قانونی دستاویز بیع نامہ کی پروفیشنل تیاری و رجسٹری",
          },
          {
            title: "ٹرانسفر لیٹر سروسز",
            description: "سی ڈی اے (CDA)، ایل ڈی اے اور ہاؤسنگ سوسائٹیز میں ٹرانسفر فائلنگ",
          },
          {
            title: "لیگل سرچ و ٹائٹل تصدیق",
            description: "جائیداد کے اصل مالکانہ حقوق اور این ای سی (NEC) کی مکمل تصدیق",
          },
          {
            title: "سب رجسٹرار رجسٹری و تصدیق",
            description: "سب رجسٹرار کے روبرو باضابطہ بیان اور بائیو میٹرک رجسٹری کا عمل",
          },
          {
            title: "وراثتی جانشینی سرٹیفکیٹ",
            description: "جائیداد کی قانونی وراثتی تقسیم اور انتقال کے مکمل کاغذات",
          },
          {
            title: "مختار نامہ (GPA / SPA)",
            description: "پراپرٹی کی دیکھ بھال اور خرید و فروخت کے لیے قانونی پاور آف اٹارنی",
          },
        ],
      },
      "registry-deeds": {
        title: "رجسٹری و قانونی وثائق",
        shortTitle: "رجسٹری و وثائق",
        tagline: "سب رجسٹرار و ریونیو ریکارڈز",
        description:
          "بیع نامہ، ہبہ نامہ، رینٹ ایگریمنٹ اور سب رجسٹرار آفس میں دستاویزات کا اندراج۔",
        items: [
          {
            title: "بیع نامہ کی باضابطہ رجسٹری",
            description: "خرید و فروخت کی مکمل قانونی دستاویز کا سب رجسٹرار کے ہاں اندراج",
          },
          {
            title: "ہبہ نامہ (خونی رشتہ تحفہ)",
            description: "خونی رشتہ داروں میں جائیداد کے قانونی تحفے (ہبہ) کا باضابطہ عمل",
          },
          {
            title: "مختار نامہ عام و خاص",
            description: "جائیداد اور قانونی مقدمات کے لیے مصدقہ پاور آف اٹارنی کا اندراج",
          },
          {
            title: "ریونیو ریکارڈ تصدیق و فرد",
            description: "پٹواری اور ریونیو ریکارڈ سے فرد ملکیت کی قانونی جانچ پڑتال",
          },
          {
            title: "رہن نامہ (Mortgage Deed)",
            description: "بینکوں اور مالیاتی اداروں کے لیے پراپرٹی رہن رکھنے کی رجسٹری",
          },
          {
            title: "سابقہ ریکارڈز کی نقول (نقل)",
            description: "محکمہ اراضی اور سب رجسٹرار کے پرانے ریکارڈز کی مصدقہ نقول کا حصول",
          },
        ],
      },
      "banking-financial": {
        title: "بینکنگ و مالیاتی دستاویزات",
        shortTitle: "بینکنگ و فنانس",
        tagline: "مالیاتی اداروں کے قانونی تقاضے",
        description:
          "بینک قرضہ جات، مارگیج، ہائپوتھیکیشن اور فنانس دستاویزات کی قانونی جانچ۔",
        items: [
          {
            title: "قرضہ جات دستاویزات",
            description: "پرسنل، ہوم اور آٹو فنانس کے لیے قانونی معاہدات کی جانچ",
          },
          {
            title: "کارپوریٹ فنانس ڈیڈز",
            description: "ورکنگ کیپیٹل، بینک گارنٹی اور فارم 10/12 چارج کریشن",
          },
          {
            title: "مالیاتی حلف نامے (Affidavits)",
            description: "آمدن کا حلف نامہ، چیک بک گمشدگی اور بینک این او سی",
          },
          {
            title: "پراپرٹی رہن و سیکیورٹی",
            description: "بینک قرض کے تحفظ کے لیے جائیداد کے قانونی کاغذات کی تیاری",
          },
        ],
      },
      "family-legal": {
        title: "خاندانی و عائلی امور",
        shortTitle: "خاندانی و عائلی",
        tagline: "فیملی کورٹس و نادرا سرٹیفکیٹس",
        description:
          "نکاح نامہ رجسٹریشن، جانشینی سرٹیفکیٹ، سرپرستی اور طلاق و خلع کی قانونی رہنمائی۔",
        items: [
          {
            title: "نکاح نامہ و نادرا رجسٹریشن",
            description: "کمپیوٹرائزڈ نکاح نامہ، یونین کونسل اندراج اور بین الاقوامی تصدیق",
          },
          {
            title: "جانشینی سرٹیفکیٹ (Succession)",
            description: "مرحوم کے بنک کھاتوں اور اثاثہ جات کی منتقلی کے لیے نادرا و عدالتی سرٹیفکیٹ",
          },
          {
            title: "طلاق و خلع کے کاغذات",
            description: "طلاق نامہ، خلع کا نوٹس اور ثالثی کونسل کی باضابطہ قانونی پیروی",
          },
          {
            title: "بچوں کی سرپرستی (گارڈین شپ)",
            description: "گارڈین عدالت سے بچوں کی قانونی تحویل اور کسٹڈی سرٹیفکیٹ کا حصول",
          },
        ],
      },
      "legal-documentation": {
        title: "قانونی دستاویزات و سرٹیفیکیشن",
        shortTitle: "قانونی وثائق",
        tagline: "حلف نامہ جات، ایگریمنٹس و نوٹسز",
        description:
          "اووتھ کمشنر حلف نامے، کرایہ نامے، زر تلافی بانڈز اور قانونی نوٹسز کی ڈرافٹنگ۔",
        items: [
          {
            title: "حلف نامے و اقرار نامے",
            description: "اووتھ کمشنر سے تصدیق شدہ عمومی و خصوصی حلف نامے اور انڈیمنٹی بانڈز",
          },
          {
            title: "اوورسیز پاکستانی پاور آف اٹارنی",
            description: "پاکستانی سفارت خانے اور وزارت خارجہ سے تصدیق شدہ مختار نامہ کی توثیق",
          },
          {
            title: "کرایہ نامہ و لیز ایگریمنٹ",
            description: "کرایہ داری ایکٹ کے مطابق رہائشی و کمرشل معیاری کرایہ نامے کی تیاری",
          },
          {
            title: "باضابطہ قانونی نوٹسز",
            description: "رقم کی واپسی، معاہدے کی خلاف ورزی اور دیوانی تنازعات کے قانونی نوٹسز",
          },
        ],
      },
      "trademark-ipo": {
        title: "ٹریڈ مارک و کاپی رائٹ (IPO)",
        shortTitle: "ٹریڈ مارک و IPO",
        tagline: "آئی پی او پاکستان برانڈ رجسٹریشن",
        description:
          "برانڈ نام، لوگو، کاپی رائٹ اور پیٹنٹ کی سرکاری رجسٹری اور قانونی تحفظ۔",
        items: [
          {
            title: "برانڈ نام و لوگو رجسٹریشن",
            description: "تمام 45 کلاسز میں اپنے کاروباری نام اور لوگو کا قانونی تحفظ",
          },
          {
            title: "آئی پی او سرچ رپورٹس",
            description: "رجسٹریشن سے قبل نام کی دستیابی اور مماثلت کی جامع رپورٹ",
          },
          {
            title: "کاپی رائٹ رجسٹریشن",
            description: "سافٹ ویئر، کتب، میڈیا، فن پاروں اور ڈیزائنز کا سرکاری تحفظ",
          },
          {
            title: "پیٹنٹ مشاورتی خدمات",
            description: "نئی ایجادات اور سائنسی و صنعتی ڈیزائنز کے پیٹنٹ کا اندراج",
          },
          {
            title: "رجسٹری اعتراضات کا جواب",
            description: "آئی پی او شوکاز نوٹسز کے جوابات اور سماعت میں قانونی نمائندگی",
          },
        ],
      },
    },
  },
};
