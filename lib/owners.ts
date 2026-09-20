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
    name: "Haji Nazir Ahmed",
    nameUrdu: "حاجی نذیر احمد",
    role: "Stamp Vendor & Consultant",
    roleUrdu: "اسٹامپ وینڈر و کنسلٹنٹ",
    status: "current",
    badge: "Senior Owner",
    badgeUrdu: "سربراہ چیمبر",
    image: "/images/owners/haji-nazir-ahmad.jpg",
    initials: "HNA",
    bio: "Haji Nazir Ahmed worked alongside Haji Faqir Muhammad and later continued the practice after his passing. He carries forward the same tradition of professional documentation, stamp vending, and consultancy services.",
    bioUrdu: "حاجی نذیر احمد نے حاجی فقیر محمد (مرحوم) کے ساتھ کام کیا اور ان کے بعد اس روایت کو دیانت داری سے آگے بڑھایا۔ وہ پیشہ ورانہ دستاویزی تیاری، اسٹامپ وینڈنگ اور مشاورتی خدمات کی اسی روایت کو جاری رکھے ہوئے ہیں۔",
    phone: "0301-6922573",
    phoneHref: "tel:+923016922573",
    whatsapp: "0301-6922573",
  },
  {
    id: "usama-nazir-ch",
    name: "Usama Ch",
    nameUrdu: "اسامہ چوہدری",
    role: "LL.B Student | Legal & Tax Services",
    roleUrdu: "ایل ایل بی طالب علم | قانونی و ٹیکس خدمات",
    status: "current",
    badge: "LL.B Student",
    badgeUrdu: "ایل ایل بی سٹوڈنٹ",
    image: "/images/owners/usama-nazir-ch.jpg",
    initials: "UC",
    bio: "Usama Ch represents the next generation of the practice. While pursuing his LL.B, he is involved in taxation, documentation, legal support, and consultancy services, helping continue the professional values established since 1988.",
    bioUrdu: "اسامہ چوہدری چیمبر کی نئی نسل کی نمائندگی کرتے ہیں۔ وہ ایل ایل بی کی تعلیم حاصل کرنے کے ساتھ ساتھ ٹیکسیشن، قانونی دستاویزات کی تیاری، قانونی معاونت اور مشاورتی خدمات میں معاونت فراہم کر رہے ہیں اور 1988 سے قائم کردہ پیشہ ورانہ اقدار کو آگے بڑھا رہے ہیں۔",
    phone: "0305-7902744",
    phoneHref: "tel:+923057902744",
    whatsapp: "0305-7902744",
  },
];
