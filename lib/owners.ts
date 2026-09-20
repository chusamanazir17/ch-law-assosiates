export interface OwnerProfile {
  id: string;
  name: string;
  nameUrdu: string;
  role: string;
  roleUrdu: string;
  status: "late" | "current";
  badge: string;
  badgeUrdu: string;
  image: string;
  initials: string;
  bio: string;
  bioUrdu: string;
  phone?: string;
  phoneHref?: string;
  whatsapp?: string;
}

export const OWNERS: OwnerProfile[] = [
  {
    id: "haji-faqir-muhammad",
    name: "Haji Faqir Muhammad (Late)",
    nameUrdu: "حاجی فقیر محمد (مرحوم)",
    role: "Founder | Stamp Vendor | Documentation Advisor | Consultant",
    roleUrdu: "بانی | اسٹامپ وینڈر | دستاویزی مشیر | کنسلٹنٹ",
    status: "late",
    badge: "1988–2014",
    badgeUrdu: "1988–2014",
    image: "/images/owners/haji-faqir-muhammad.jpg",
    initials: "HFM",
    bio: "Haji Faqir Muhammad dedicated more than two decades to stamp vending, documentation, consultancy, and client guidance. His experience and commitment laid the foundation for the practice that continues today.",
    bioUrdu: "حاجی فقیر محمد (مرحوم) نے دو دہائیوں سے زائد عرصہ اسٹامپ وینڈنگ، قانونی دستاویزات کی تیاری، مشاورتی خدمات اور سائلین کی مخلصانہ رہنمائی کے لیے وقف کیا۔ ان کا وسیع تجربہ اور دیانت دارانہ لگن اس بااعتماد قانونی ادارے کی وہ مضبوط بنیاد ہے جو آج بھی کامیابی کے ساتھ جاری ہے۔",
  },
  {
    id: "haji-nazir-ahmad",
    name: "Haji Nazir Ahmad",
    nameUrdu: "حاجی نذیر احمد",
    role: "Senior Owner & Legal Advisor",
    roleUrdu: "سربراہ و سینئر مشیر",
    status: "current",
    badge: "Senior Owner",
    badgeUrdu: "سربراہ چیمبر",
    image: "/images/owners/haji-nazir-ahmad.jpg",
    initials: "HNA",
    bio: "Over 35 years of specialized expertise in E-Stamping, property registry deeds, and court documentation.",
    bioUrdu: "ای اسٹیمپنگ، رجسٹری بیعنامہ، عدالتی دستاویزات اور قانونی مشاورت کا 35 سال سے زائد وسیع تجربہ۔",
    phone: "0301-6922573",
    phoneHref: "tel:+923016922573",
    whatsapp: "0301-6922573",
  },
  {
    id: "usama-nazir-ch",
    name: "Usama Nazir Ch",
    nameUrdu: "اسامہ نذیر چوہدری",
    role: "Managing Partner & Tax Consultant",
    roleUrdu: "مینیجنگ پارٹنر و ٹیکس کنسلٹنٹ",
    status: "current",
    badge: "Managing Partner",
    badgeUrdu: "مینیجنگ پارٹنر",
    image: "/images/owners/usama-nazir-ch.jpg",
    initials: "UNC",
    bio: "Certified advisor specializing in FBR income tax, sales tax, PRA, SECP corporate affairs, and digital legal solutions.",
    bioUrdu: "ایف بی آر انکم ٹیکس، سیلز ٹیکس، پی آر اے، ایس ای سی پی کارپوریٹ رجسٹریشن اور جدید ٹیکس ایڈوائزری۔",
    phone: "0305-7902744",
    phoneHref: "tel:+923057902744",
    whatsapp: "0305-7902744",
  },
];
