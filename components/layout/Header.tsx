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
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { SERVICE_CATEGORIES, ServiceCategory, SITE } from "@/lib/site";
import { useLanguage } from "@/lib/LanguageContext";
import { useAppTheme } from "@/lib/ThemeContext";

import Logo from "./Logo";
import { CategoryDropdownPanel, LegalGroupDropdownPanel } from "./NavDropdown";
import { getSubServiceIcon, getCategoryHeaderIcon } from "@/lib/icon-map";

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
    let lastScrolled = window.scrollY > 20;
    setScrolled(lastScrolled);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isNowScrolled = window.scrollY > 20;
          if (isNowScrolled !== lastScrolled) {
            lastScrolled = isNowScrolled;
            setScrolled(isNowScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

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
              ? "rgba(7, 18, 36, 0.98)"
              : "rgba(255,255,255,0.98)"
            : isDark
            ? "rgba(7, 18, 36, 1)"
            : "rgba(255,255,255,1)",
          backdropFilter: "blur(8px)",
          boxShadow: scrolled
            ? isDark
              ? "0 4px 20px rgba(0,0,0,0.35)"
              : "0 4px 20px rgba(6,18,38,0.08)"
            : isDark
            ? "0 1px 0 rgba(255,255,255,0.08)"
            : "0 1px 0 rgba(11,29,56,0.06)",
          transition: "background-color 0.2s ease, box-shadow 0.2s ease",
          zIndex: 1100,
          willChange: "transform",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
          <div className="flex h-[72px] items-center justify-between">
            <Logo isUrdu={isUrdu} isDark={isDark} />

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 xl:gap-2.5 lg:flex" onMouseLeave={handleMouseLeave}>
              {/* Home Link */}
              <Link
                href="/"
                className={`rounded-md px-3 py-2 text-[13px] font-semibold transition ${
                  pathname === "/"
                    ? isDark
                      ? "text-gold-400 bg-gold-400/20"
                      : "text-gold-600 bg-gold-400/10"
                    : isDark
                    ? "text-white hover:text-gold-400 hover:bg-white/10"
                    : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                }`}
              >
                {t.nav.home}
              </Link>

              {/* 1. Tax Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter("tax")}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  id="nav-button-tax"
                  href="/services/tax"
                  onClick={() => setActiveDropdown(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname.startsWith("/services/tax") || activeDropdown === "tax"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20 shadow-xs ring-1 ring-gold-400/30"
                        : "text-gold-600 bg-gold-400/10 shadow-xs ring-1 ring-gold-400/25"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "tax"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-tax"
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
                </Link>

                <AnimatePresence>
                  {activeDropdown === "tax" && (
                    <CategoryDropdownPanel
                      id="nav-dropdown-tax"
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
                <Link
                  id="nav-button-e-stamping"
                  href="/services/e-stamping"
                  onClick={() => setActiveDropdown(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname.startsWith("/services/e-stamping") || activeDropdown === "e-stamping"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20 shadow-xs ring-1 ring-gold-400/30"
                        : "text-gold-600 bg-gold-400/10 shadow-xs ring-1 ring-gold-400/25"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "e-stamping"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-e-stamping"
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
                </Link>

                <AnimatePresence>
                  {activeDropdown === "e-stamping" && (
                    <CategoryDropdownPanel
                      id="nav-dropdown-e-stamping"
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
                <Link
                  id="nav-button-business"
                  href="/services/business-registration"
                  onClick={() => setActiveDropdown(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname.startsWith("/services/business-registration") || activeDropdown === "business"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20 shadow-xs ring-1 ring-gold-400/30"
                        : "text-gold-600 bg-gold-400/10 shadow-xs ring-1 ring-gold-400/25"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "business"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-business"
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
                </Link>

                <AnimatePresence>
                  {activeDropdown === "business" && (
                    <CategoryDropdownPanel
                      id="nav-dropdown-business"
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
                <Link
                  id="nav-button-property"
                  href="/services/property-land"
                  onClick={() => setActiveDropdown(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname.startsWith("/services/property-land") || activeDropdown === "property"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20 shadow-xs ring-1 ring-gold-400/30"
                        : "text-gold-600 bg-gold-400/10 shadow-xs ring-1 ring-gold-400/25"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "property"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-property"
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
                </Link>

                <AnimatePresence>
                  {activeDropdown === "property" && (
                    <CategoryDropdownPanel
                      id="nav-dropdown-property"
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
                <Link
                  id="nav-button-legal-group"
                  href="/services/registry-deeds"
                  onClick={() => setActiveDropdown(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setActiveDropdown(null); }}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                    pathname.startsWith("/services/registry-deeds") ||
                    pathname.startsWith("/services/family-legal") ||
                    pathname.startsWith("/services/banking-financial") ||
                    pathname.startsWith("/services/legal-documentation") ||
                    pathname.startsWith("/services/trademark-ipo") ||
                    activeDropdown === "legal-group"
                      ? isDark
                        ? "text-gold-400 bg-gold-400/20 shadow-xs ring-1 ring-gold-400/30"
                        : "text-gold-600 bg-gold-400/10 shadow-xs ring-1 ring-gold-400/25"
                      : isDark
                      ? "text-white hover:text-gold-400 hover:bg-white/10"
                      : "text-navy-900 hover:text-gold-600 hover:bg-navy-900/5"
                  }`}
                  aria-expanded={activeDropdown === "legal-group"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-legal-group"
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
                </Link>

                <AnimatePresence>
                  {activeDropdown === "legal-group" && (
                    <LegalGroupDropdownPanel
                      id="nav-dropdown-legal-group"
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
          <Logo isUrdu={isUrdu} isDark={isDark} />
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
            {/* Mobile Home Link */}
            <ListItemButton
              component={Link}
              href="/"
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                mb: 1,
                bgcolor: pathname === "/" ? (isDark ? "rgba(212,164,76,0.18)" : "rgba(200,151,61,0.12)") : "transparent",
                fontWeight: 700,
                color: pathname === "/" ? "#dfbb6e" : isDark ? "#ffffff" : "#0b1d38",
              }}
            >
              <ListItemText
                primary={t.nav.home}
                primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
              />
            </ListItemButton>

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
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
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

