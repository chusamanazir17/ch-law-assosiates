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
    role: "Founder & Pioneer",
    roleUrdu: "بانی و رہنما (مرحوم)",
    status: "late",
    badge: "Late Founder",
    badgeUrdu: "بانی (مرحوم)",
    image: "/images/owners/haji-faqir-muhammad.jpg",
    initials: "HFM",
    bio: "Pioneered legal documentation, stamp services, and public trust at Chamber 121, District Court Sahiwal.",
    bioUrdu: "ڈسٹرکٹ کورٹ ساہیوال میں چیمبر 121 کی بنیاد رکھی اور دیانت دارانہ عوامی خدمت کی لازوال مثال قائم کی۔",
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
