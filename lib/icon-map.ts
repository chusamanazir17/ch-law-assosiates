import type { ComponentType } from "react";
import {
  ContactRound,
  FileSpreadsheet,
  TrendingUp,
  BadgePercent,
  FileSearch2,
  Building2,
  Stamp,
  Scale,
  Home,
  Handshake,
  Landmark,
  User,
  ReceiptText,
  Globe2,
  FileBadge,
  FileSignature,
  Send,
  SearchCheck,
  ScrollText,
  FileKey,
  Gift,
  CopyCheck,
  Briefcase,
  HeartHandshake,
  FileX2,
  ShieldPlus,
  Gavel,
  KeySquare,
  MailWarning,
  Search,
  Copyright,
  Lightbulb,
  MessageSquareWarning,
  FileText,
  BadgeCheck,
} from "lucide-react";

export type IconComponent = ComponentType<{ className?: string }>;

export const ICON_MAP: Record<string, IconComponent> = {
  // Tax
  "NTN Registration": ContactRound,
  "Income Tax Filing": FileSpreadsheet,
  "Sales Tax Registration (STRN)": TrendingUp,
  "Tax Exemption Certificates": BadgePercent,
  "FBR Audit Response": FileSearch2,
  "Chamber of Commerce": Building2,
  // E-Stamping
  "Non-Judicial E-Stamp": Stamp,
  "High-Value Judicial": Scale,
  "Property Sale Deed": Home,
  "Partnership Deed": Handshake,
  "Bank Documentation": Landmark,
  "Verification & Challan 32-A": BadgeCheck,
  // Business
  "SECP Incorporation": Building2,
  "Sole Proprietorship": User,
  "Partnership Deeds (Form C)": Handshake,
  "NTN & Sales Tax (GST)": ReceiptText,
  "Chamber Membership": Globe2,
  "Trade License (CDA/DMC)": FileBadge,
  // Property
  "Sale Deed Documentation": FileSignature,
  "Transfer Letter Services": Send,
  "Legal Search & Title Audit": SearchCheck,
  "Registry & Attestation": Landmark,
  "Succession Certificates": ScrollText,
  "Power of Attorney (GPA/SPA)": FileKey,
  // Registry & Deeds
  "Sale Deed (Baye Nama)": FileSignature,
  "Gift Deed (Hiba Nama)": Gift,
  "Power of Attorney": FileKey,
  "Title Search & Verification": SearchCheck,
  "Mortgage Deed Registration": Landmark,
  "Certified Copies (Nakal)": CopyCheck,
  // Banking
  "Loan Documentation": FileSignature,
  "Corporate Finance Docs": Briefcase,
  "Financial Affidavits": FileBadge,
  "Mortgage & Collateral": Home,
  // Family
  "Nikahnama Registration": HeartHandshake,
  "Divorce Documents": FileX2,
  "Child Guardianship": ShieldPlus,
  // Legal
  "Affidavits & Oaths": Gavel,
  "Power of Attorney (Local/Overseas)": FileSignature,
  "Rent & Lease Agreements": KeySquare,
  "Formal Legal Notices": MailWarning,
  // Trademark
  "Brand Trademark Filing": Stamp,
  "IPO Search Reports": Search,
  "Copyright Registration": Copyright,
  "Patent Advisory": Lightbulb,
  "Objection Defense": MessageSquareWarning,
};

export function getSubServiceIcon(_idx: number, titleEn: string): IconComponent {
  return ICON_MAP[titleEn] || FileText;
}

export function getCategoryHeaderIcon(id: string): IconComponent {
  switch (id) {
    case "tax":
      return ReceiptText;
    case "e-stamping":
      return Stamp;
    case "business-registration":
      return Building2;
    case "property-land":
      return Home;
    case "registry-deeds":
      return ScrollText;
    case "banking-financial":
      return Landmark;
    case "family-legal":
      return HeartHandshake;
    case "legal-documentation":
      return Gavel;
    case "trademark-ipo":
      return BadgeCheck;
    default:
      return FileText;
  }
}
