"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ArrowRight,
  Phone,
  MessageCircle,
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  Globe,
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
import { SERVICE_CATEGORIES, ServiceCategory, SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";
import { useAppTheme } from "@/lib/ThemeContext";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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

function getSubServiceIcon(idx: number, titleEn: string) {
  return ICON_MAP[titleEn] || FileText;
}

function Logo({ isUrdu, isDark }: { isUrdu: boolean; isDark: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 shadow-sm border border-gold-500/20">
        <FileText className="h-5 w-5 text-gold-400" />
      </span>
      <span className="leading-none">
        <span className={`block font-serif text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-navy-900"}`}>
          {isUrdu ? "لیگل اسسٹ" : SITE.name}
        </span>
        <span className="block text-[10px] font-bold tracking-[0.28em] text-gold-500">
          {isUrdu ? "پاکستان" : SITE.country}
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [expandedMobileServices, setExpandedMobileServices] = React.useState<Record<string, boolean>>({});
  const [mobileServicesRootOpen, setMobileServicesRootOpen] = React.useState(true);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const { isUrdu, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useAppTheme();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleMobileCategory = (id: string) => {
    setExpandedMobileServices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Primary categories featured directly in desktop nav
  const taxCategory = SERVICE_CATEGORIES.find((c) => c.id === "tax")!;
  const estampCategory = SERVICE_CATEGORIES.find((c) => c.id === "e-stamping")!;
  const businessCategory = SERVICE_CATEGORIES.find((c) => c.id === "business-registration")!;
  const propertyCategory = SERVICE_CATEGORIES.find((c) => c.id === "property-land")!;

  // Grouped remaining legal categories
  const legalGroupCategories = SERVICE_CATEGORIES.filter((c) =>
    ["registry-deeds", "family-legal", "banking-financial", "legal-documentation", "trademark-ipo"].includes(c.id)
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? isDark
              ? "rgba(7, 18, 36, 0.96)"
              : "rgba(255,255,255,0.97)"
            : isDark
            ? "rgba(7, 18, 36, 1)"
            : "rgba(255,255,255,1)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled
            ? isDark
              ? "0 6px 30px rgba(0,0,0,0.45)"
              : "0 6px 30px rgba(6,18,38,0.10)"
            : isDark
            ? "0 1px 0 rgba(255,255,255,0.08)"
            : "0 1px 0 rgba(11,29,56,0.06)",
          transition: "all .3s ease",
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
          <div className="flex h-[72px] items-center justify-between">
            <Logo isUrdu={isUrdu} isDark={isDark} />

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 xl:gap-2.5 lg:flex" onMouseLeave={handleMouseLeave}>
              {/* 1. Tax Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("tax")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "tax" ? null : "tax")}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname === "/services/tax" || activeDropdown === "tax"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20"
                        : "text-gold-600 bg-gold-400/10"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "tax"}
                >
                  <span>{t.nav.taxServices}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "tax"
                        ? "rotate-180 text-gold-400"
                        : isDark
                        ? "text-slate-300"
                        : "text-navy-400"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "tax" && (
                    <CategoryDropdownPanel
                      category={taxCategory}
                      categoryTrans={t.categories["tax"]}
                      onClose={() => setActiveDropdown(null)}
                      align={isUrdu ? "right" : "left"}
                      isUrdu={isUrdu}
                      isDark={isDark}
                      t={t}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 2. E-Stamping Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("e-stamping")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "e-stamping" ? null : "e-stamping")}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname === "/services/e-stamping" || activeDropdown === "e-stamping"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20"
                        : "text-gold-600 bg-gold-400/10"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "e-stamping"}
                >
                  <span>{t.nav.eStamping}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "e-stamping"
                        ? "rotate-180 text-gold-400"
                        : isDark
                        ? "text-slate-300"
                        : "text-navy-400"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "e-stamping" && (
                    <CategoryDropdownPanel
                      category={estampCategory}
                      categoryTrans={t.categories["e-stamping"]}
                      onClose={() => setActiveDropdown(null)}
                      align={isUrdu ? "right" : "left"}
                      isUrdu={isUrdu}
                      isDark={isDark}
                      t={t}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Business Registration Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("business")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "business" ? null : "business")}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname === "/services/business-registration" || activeDropdown === "business"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20"
                        : "text-gold-600 bg-gold-400/10"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "business"}
                >
                  <span>{t.nav.business}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "business"
                        ? "rotate-180 text-gold-400"
                        : isDark
                        ? "text-slate-300"
                        : "text-navy-400"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "business" && (
                    <CategoryDropdownPanel
                      category={businessCategory}
                      categoryTrans={t.categories["business-registration"]}
                      onClose={() => setActiveDropdown(null)}
                      align="center"
                      isUrdu={isUrdu}
                      isDark={isDark}
                      t={t}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Property & Land Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("property")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "property" ? null : "property")}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname === "/services/property-land" || activeDropdown === "property"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20"
                        : "text-gold-600 bg-gold-400/10"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "property"}
                >
                  <span>{t.nav.propertyLand}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "property"
                        ? "rotate-180 text-gold-400"
                        : isDark
                        ? "text-slate-300"
                        : "text-navy-400"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "property" && (
                    <CategoryDropdownPanel
                      category={propertyCategory}
                      categoryTrans={t.categories["property-land"]}
                      onClose={() => setActiveDropdown(null)}
                      align="center"
                      isUrdu={isUrdu}
                      isDark={isDark}
                      t={t}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* 5. Legal & Family Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("legal-group")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "legal-group" ? null : "legal-group")}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    activeDropdown === "legal-group"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20"
                        : "text-gold-600 bg-gold-400/10"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "legal-group"}
                >
                  <span>{t.nav.legalFamily}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "legal-group"
                        ? "rotate-180 text-gold-400"
                        : isDark
                        ? "text-slate-300"
                        : "text-navy-400"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "legal-group" && (
                    <LegalGroupDropdownPanel
                      categories={legalGroupCategories}
                      categoriesTrans={t.categories}
                      onClose={() => setActiveDropdown(null)}
                      isUrdu={isUrdu}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* About Link */}
              <Link
                href="/#about"
                className={`rounded-md px-3 py-2 text-[13px] font-semibold transition ${
                  isDark
                    ? "text-white hover:text-gold-400 hover:bg-white/10"
                    : "text-navy-800 hover:text-gold-600 hover:bg-navy-900/5"
                }`}
              >
                {t.nav.about}
              </Link>
            </nav>

            {/* Header Right Actions: Theme Toggle & Urdu Toggle (Zero background, minimalistic) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Minimalistic Theme Toggle: Only button, no background */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to bright mode" : "Switch to dark mode"}
                title={isDark ? "Switch to bright mode" : "Switch to dark mode"}
                className={`flex h-9 w-9 items-center justify-center transition-colors focus:outline-none ${
                  isDark
                    ? "text-gold-400 hover:text-gold-300"
                    : "text-navy-800 hover:text-gold-600"
                }`}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>

              {/* Minimalistic Urdu / English Toggle: Only button, no background */}
              <button
                onClick={toggleLanguage}
                aria-label="Toggle language between Urdu and English"
                title="Toggle Urdu / English"
                className={`flex items-center gap-1.5 px-2 py-1 text-[13px] font-bold transition-colors focus:outline-none ${
                  isDark
                    ? "text-white hover:text-gold-400"
                    : "text-navy-900 hover:text-gold-600"
                }`}
              >
                <Globe className="h-4 w-4 text-gold-500" />
                <span className={isUrdu ? "font-sans text-xs tracking-wider" : "font-serif text-sm font-bold"}>
                  {isUrdu ? "English" : "اردو"}
                </span>
              </button>

              {/* Mobile Hamburger */}
              <IconButton
                edge="end"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: { lg: "none" },
                  color: isDark ? "#ffffff" : "#0b1d38",
                  ml: 0.5,
                }}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
            </div>
          </div>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor={isUrdu ? "left" : "right"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "90%",
            maxWidth: 390,
            bgcolor: isDark ? "#071224" : "#f8fafc",
            color: isDark ? "#f1f5f9" : "#0b1d38",
          },
        }}
      >
        <div className={`flex items-center justify-between border-b ${isDark ? "border-white/10 bg-[#0a1830]" : "border-navy-900/10 bg-white"} p-4`}>
          <Logo isUrdu={isUrdu} />
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: isDark ? "#ffffff" : "#0b1d38" }}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Mobile Theme & Language bar inside drawer */}
          <div className="mb-3 flex items-center justify-between rounded-xl bg-navy-900/5 dark:bg-white/5 p-2.5">
            <span className="text-xs font-semibold text-navy-600 dark:text-slate-400">
              {isUrdu ? "ترتیبات" : "Preferences"}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1 text-xs font-semibold text-navy-800 dark:text-gold-400 hover:text-gold-600 focus:outline-none"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? (isUrdu ? "روشن موڈ" : "Bright") : isUrdu ? "ڈارک موڈ" : "Dark"}</span>
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-xs font-bold text-navy-900 dark:text-slate-100 hover:text-gold-600 focus:outline-none"
              >
                <Globe className="h-4 w-4 text-gold-500" />
                <span>{isUrdu ? "English" : "اردو"}</span>
              </button>
            </div>
          </div>

          <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-navy-400 dark:text-slate-400">
            {isUrdu ? "قانونی و دستاویزی خدمات" : "Legal & Documentation Services"}
          </div>

          <List component="nav" disablePadding>
            {/* Root Services Accordion */}
            <ListItemButton
              onClick={() => setMobileServicesRootOpen(!mobileServicesRootOpen)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                mb: 1,
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(11,29,56,0.05)",
                fontWeight: 700,
                color: isDark ? "#ffffff" : "#0b1d38",
              }}
            >
              <ListItemText
                primary={isUrdu ? "تمام خدمات اور فہرست" : "All Services & Categories"}
                primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
              />
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  mobileServicesRootOpen ? "rotate-180 text-gold-500" : "text-navy-500"
                }`}
              />
            </ListItemButton>

            <Collapse in={mobileServicesRootOpen} timeout="auto" unmountOnExit>
              <div className="space-y-1.5 pl-1">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isExpanded = !!expandedMobileServices[cat.id];
                  const Icon = getCategoryHeaderIcon(cat.id);
                  const catTrans = t.categories[cat.id] || {
                    title: cat.title,
                    tagline: cat.tagline,
                    items: cat.items,
                  };

                  return (
                    <div
                      key={cat.id}
                      className={`rounded-xl border ${
                        isDark ? "border-white/10 bg-[#0c1c33]" : "border-navy-900/8 bg-white"
                      } overflow-hidden shadow-xs`}
                    >
                      <button
                        onClick={() => toggleMobileCategory(cat.id)}
                        className="flex w-full items-center justify-between p-3 text-left transition hover:bg-gold-50/40 dark:hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 dark:bg-white/10 text-gold-500">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-navy-900 dark:text-white">{catTrans.title}</p>
                            <p className="text-[10px] text-navy-500 dark:text-slate-400 line-clamp-1">{catTrans.tagline}</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-navy-400 transition-transform ${
                            isExpanded ? "rotate-180 text-gold-500" : ""
                          }`}
                        />
                      </button>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <div className={`border-t ${isDark ? "border-white/10 bg-black/20" : "border-navy-900/5 bg-slate-50/70"} p-2 space-y-1`}>
                          {catTrans.items.map((item, idx) => {
                            const ItemIcon = getSubServiceIcon(idx, cat.items[idx]?.title || item.title);
                            return (
                              <Link
                                key={item.title}
                                href={cat.href}
                                onClick={() => setDrawerOpen(false)}
                                className={`flex items-start gap-2 rounded-lg p-2 transition ${
                                  isDark ? "hover:bg-white/10" : "hover:bg-white hover:shadow-xs"
                                } group`}
                              >
                                <ItemIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500 group-hover:text-gold-400" />
                                <div>
                                  <p className="text-xs font-semibold text-navy-900 dark:text-slate-100 group-hover:text-gold-500">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-navy-500 dark:text-slate-400 leading-tight">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}

                          <div className={`pt-1.5 mt-1 border-t ${isDark ? "border-white/10" : "border-navy-900/5"}`}>
                            <Link
                              href={cat.href}
                              onClick={() => setDrawerOpen(false)}
                              className="flex items-center justify-between rounded-md bg-gold-400/10 px-3 py-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:bg-gold-400/20 transition"
                            >
                              <span>{isUrdu ? `${catTrans.shortTitle} کی تمام خدمات` : `Explore All ${cat.shortTitle} Services`}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            </Collapse>

            <Divider sx={{ my: 2, borderColor: isDark ? "rgba(255,255,255,0.1)" : undefined }} />

            <ListItemButton
              component={Link}
              href="/#about"
              onClick={() => setDrawerOpen(false)}
              sx={{ borderRadius: 2, py: 1.2 }}
            >
              <ListItemText
                primary={t.nav.about}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          </List>
        </div>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : undefined }} />
        <div className={`p-3 ${isDark ? "bg-[#0a1830]" : "bg-white"}`}>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={SITE.phoneHref}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold ${
                isDark
                  ? "border-white/20 text-slate-200 hover:bg-white/5"
                  : "border-navy-900/20 text-navy-900 hover:bg-navy-900/5"
              }`}
            >
              <Phone className="h-3.5 w-3.5 text-gold-500" />
              {t.site.phoneLabel}
            </a>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              {t.site.whatsappLabel}
            </a>
          </div>
        </div>
      </Drawer>

      {/* fixed header spacer */}
      <div style={{ height: 72 }} aria-hidden />
    </>
  );
}

// Helper for category header icon
function getCategoryHeaderIcon(id: string) {
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

// -------------------------------------------------------------
// Component: Dedicated Dropdown Panel for a specific Service
// -------------------------------------------------------------
function CategoryDropdownPanel({
  category,
  categoryTrans,
  onClose,
  align = "left",
  isUrdu,
  isDark,
  t,
}: {
  category: ServiceCategory;
  categoryTrans: any;
  onClose: () => void;
  align?: "left" | "right" | "center";
  isUrdu: boolean;
  isDark: boolean;
  t: any;
}) {
  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
      ? "right-0"
      : "left-0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute top-full mt-2 w-[580px] ${alignClass} rounded-2xl border ${
        isDark
          ? "border-white/15 bg-[#0c1c33] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          : "border-navy-900/10 bg-white text-navy-900 shadow-2xl"
      } p-6 z-50 overflow-hidden`}
    >
      {/* Top Gold Accent Stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

      {/* Header bar */}
      <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? "border-white/10" : "border-navy-900/8"}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-400/15 text-gold-400">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <h3 className={`font-serif text-base font-bold ${isDark ? "text-white" : "text-navy-900"}`}>
              {categoryTrans.title}
            </h3>
          </div>
          <p className={`mt-1 text-[11px] leading-tight ${isDark ? "text-slate-300" : "text-navy-800/60"}`}>
            {categoryTrans.tagline} &bull; {categoryTrans.description}
          </p>
        </div>
        <Link
          href={category.href}
          onClick={onClose}
          className={`group inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
            isDark
              ? "bg-white/10 text-gold-400 hover:bg-gold-500 hover:text-navy-950"
              : "bg-navy-900/5 text-gold-600 hover:bg-gold-500 hover:text-white"
          }`}
        >
          <span>{t.nav.overview}</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2-column Grid of Sub-Services */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {categoryTrans.items.map((item: any, idx: number) => {
          const ItemIcon = getSubServiceIcon(idx, category.items[idx]?.title || item.title);
          return (
            <Link
              key={item.title}
              href={category.href}
              onClick={onClose}
              className={`group flex items-start gap-3 rounded-xl p-2.5 text-left transition border ${
                isDark
                  ? "border-transparent hover:border-gold-500/30 hover:bg-white/5"
                  : "border-transparent hover:border-gold-300/40 hover:bg-gold-50/50"
              }`}
            >
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                isDark
                  ? "bg-white/10 text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950"
                  : "bg-navy-900/5 text-navy-800 group-hover:bg-navy-900 group-hover:text-gold-400"
              }`}>
                <ItemIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold transition ${
                  isDark ? "text-white group-hover:text-gold-400" : "text-navy-900 group-hover:text-gold-600"
                }`}>
                  {item.title}
                </p>
                <p className={`mt-0.5 text-[11px] leading-tight line-clamp-2 ${
                  isDark ? "text-slate-300" : "text-navy-800/60"
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Notice / Pre-visit Tip */}
      <div className={`mt-4 flex items-center justify-between rounded-xl px-3.5 py-2.5 border text-[11px] ${
        isDark
          ? "bg-black/30 border-white/10 text-slate-200"
          : "bg-slate-50 border-navy-900/5 text-navy-800/70"
      }`}>
        <span className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-gold-500" />
          {t.nav.checklistTip} <strong className={isDark ? "text-white" : "text-navy-900"}>{SITE.phone}</strong>
        </span>
        <Link
          href={category.href}
          onClick={onClose}
          className="font-bold text-gold-400 hover:text-gold-300 hover:underline"
        >
          {t.nav.viewFullDetails} &rarr;
        </Link>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// Component: Legal & Family Multi-Category Dropdown Panel
// -------------------------------------------------------------
function LegalGroupDropdownPanel({
  categories,
  categoriesTrans,
  onClose,
  isUrdu,
  isDark,
}: {
  categories: ServiceCategory[];
  categoriesTrans: any;
  onClose: () => void;
  isUrdu: boolean;
  isDark: boolean;
}) {
  const alignClass = isUrdu ? "right-0" : "-left-48";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`absolute top-full mt-2 w-[680px] ${alignClass} rounded-2xl border ${
        isDark
          ? "border-white/15 bg-[#0c1c33] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          : "border-navy-900/10 bg-white text-navy-900 shadow-2xl"
      } p-6 z-50 overflow-hidden`}
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-navy-900" />

      <div className={`flex items-center justify-between pb-3 border-b ${isDark ? "border-white/10" : "border-navy-900/8"}`}>
        <div>
          <h3 className={`font-serif text-base font-bold ${isDark ? "text-white" : "text-navy-900"}`}>
            {isUrdu ? "قانونی، خاندانی، بینکنگ و آئی پی سروسز" : "Legal, Family, Banking & IP Services"}
          </h3>
          <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-navy-800/60"}`}>
            {isUrdu
              ? "عدالتی تصدیقات، رجسٹری دستاویزات، بینک فنانسنگ، اور انٹلیکچوئل پراپرٹی حقوق۔"
              : "Court certifications, registry deeds, banking documentation, and intellectual property."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {categories.map((cat) => {
          const HeaderIcon = getCategoryHeaderIcon(cat.id);
          const catTrans = categoriesTrans[cat.id] || cat;
          return (
            <div
              key={cat.id}
              className={`rounded-xl border p-3 ${
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-navy-900/5 bg-slate-50/50"
              }`}
            >
              <Link
                href={cat.href}
                onClick={onClose}
                className={`group flex items-center justify-between pb-2 border-b ${
                  isDark ? "border-white/10" : "border-navy-900/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <HeaderIcon className="h-4 w-4 text-gold-500" />
                  <span className={`text-xs font-bold transition ${
                    isDark ? "text-white group-hover:text-gold-400" : "text-navy-900 group-hover:text-gold-600"
                  }`}>
                    {catTrans.title}
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 text-gold-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <ul className="mt-2 space-y-1">
                {catTrans.items?.slice(0, 3).map((item: any) => (
                  <li key={item.title}>
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className={`text-[11px] transition block py-0.5 ${
                        isDark
                          ? "text-slate-300 hover:text-gold-400"
                          : "text-navy-800/70 hover:text-gold-600"
                      }`}
                    >
                      &bull; {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
