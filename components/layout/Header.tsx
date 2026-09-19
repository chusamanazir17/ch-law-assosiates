"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Collapse,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Menu as MenuIcon,
  Moon,
  Phone,
  Sun,
  X,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { SERVICE_CATEGORIES, SITE, type ServiceCategory, buildWhatsAppUrl } from "@/lib/site";
import type { CategoryTrans, Translations } from "@/lib/translations";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAppTheme } from "@/providers/ThemeProvider";
import { getCategoryHeaderIcon, getSubServiceIcon } from "@/lib/icon-map";
import Logo from "./Logo";
import { CategoryDropdownPanel, LegalGroupDropdownPanel } from "./NavDropdown";
import { useCms } from "@/lib/hooks/useCms";

type DropdownAlign = "left" | "right" | "center";

interface DesktopCategoryNavItemProps {
  category: ServiceCategory;
  categoryTrans: CategoryTrans;
  label: string;
  activeDropdown: string | null;
  pathname: string;
  isUrdu: boolean;
  isDark: boolean;
  align: DropdownAlign;
  t: Translations;
  onOpen: (id: string) => void;
  onCloseSoon: () => void;
  onClose: () => void;
}

function desktopLinkClass(active: boolean, isDark: boolean) {
  if (active) {
    return isDark
      ? "bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/25"
      : "bg-gold-400/10 text-gold-700 ring-1 ring-gold-400/20";
  }

  return isDark
    ? "text-white hover:bg-white/10 hover:text-gold-400"
    : "text-navy-900 hover:bg-navy-900/5 hover:text-gold-700";
}

function DesktopCategoryNavItem({
  category,
  categoryTrans,
  label,
  activeDropdown,
  pathname,
  isUrdu,
  isDark,
  align,
  t,
  onOpen,
  onCloseSoon,
  onClose,
}: DesktopCategoryNavItemProps) {
  const isOpen = activeDropdown === category.id;
  const isActive = pathname.startsWith(category.href) || isOpen;

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen(category.id)}
      onMouseLeave={onCloseSoon}
      onFocus={() => onOpen(category.id)}
    >
      <Link
        id={`nav-button-${category.id}`}
        href={category.href}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
          isActive,
          isDark
        )}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`nav-dropdown-${category.id}`}
        aria-current={pathname.startsWith(category.href) ? "page" : undefined}
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-gold-500" : isDark ? "text-slate-300" : "text-navy-400"
          }`}
        />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <CategoryDropdownPanel
            id={`nav-dropdown-${category.id}`}
            category={category}
            categoryTrans={categoryTrans}
            onClose={onClose}
            align={align}
            isUrdu={isUrdu}
            isDark={isDark}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [expandedMobileServices, setExpandedMobileServices] = React.useState<Record<string, boolean>>({});
  const [mobileServicesRootOpen, setMobileServicesRootOpen] = React.useState(true);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() || "";

  const { isUrdu, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useAppTheme();
  const { settings } = useCms();

  React.useEffect(() => {
    let lastScrolled = window.scrollY > 20;
    setScrolled(lastScrolled);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 20;
        if (nextScrolled !== lastScrolled) {
          lastScrolled = nextScrolled;
          setScrolled(nextScrolled);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setDrawerOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const openDropdown = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const closeDropdownSoon = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 160);
  };

  const closeDropdown = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(null);
  };

  const toggleMobileCategory = (id: string) => {
    setExpandedMobileServices((current) => ({ ...current, [id]: !current[id] }));
  };

  const categoryMap = React.useMemo(
    () => new Map(SERVICE_CATEGORIES.map((category) => [category.id, category])),
    []
  );

  const primaryNav = [
    {
      id: "tax",
      label: t.nav.taxServices,
      align: "left",
    },
    {
      id: "e-stamping",
      label: t.nav.eStamping,
      align: "left",
    },
    {
      id: "business-registration",
      label: t.nav.business,
      align: "center",
    },
    {
      id: "property-land",
      label: t.nav.propertyLand,
      align: "right",
    },
  ] satisfies Array<{ id: string; label: string; align: DropdownAlign }>;

  const legalGroupCategories = SERVICE_CATEGORIES.filter((category) =>
    ["registry-deeds", "family-legal", "banking-financial", "legal-documentation", "trademark-ipo"].includes(
      category.id
    )
  );
  const legalGroupActive =
    legalGroupCategories.some((category) => pathname.startsWith(category.href)) || activeDropdown === "legal-group";

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: scrolled
            ? isDark
              ? "rgba(7, 18, 36, 0.96)"
              : "rgba(255,255,255,0.96)"
            : isDark
            ? "#071224"
            : "#ffffff",
          backdropFilter: "blur(14px)",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(11,29,56,0.07)",
          boxShadow: scrolled
            ? isDark
              ? "0 8px 30px rgba(0,0,0,0.28)"
              : "0 8px 30px rgba(6,18,38,0.08)"
            : "none",
          transition: "background-color 0.2s ease, box-shadow 0.2s ease",
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Logo isUrdu={isUrdu} isDark={isDark} />

            <nav
              aria-label="Primary navigation"
              className="hidden min-w-0 items-center gap-0.5 lg:flex 2xl:gap-1.5"
              onMouseLeave={closeDropdownSoon}
            >
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={`rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
                  pathname === "/",
                  isDark
                )}`}
              >
                {t.nav.home}
              </Link>

              {primaryNav.map((item) => {
                const category = categoryMap.get(item.id);
                const categoryTrans = t.categories[item.id];
                if (!category || !categoryTrans) return null;

                return (
                  <DesktopCategoryNavItem
                    key={item.id}
                    category={category}
                    categoryTrans={categoryTrans}
                    label={item.label}
                    activeDropdown={activeDropdown}
                    pathname={pathname}
                    isUrdu={isUrdu}
                    isDark={isDark}
                    align={item.align}
                    t={t}
                    onOpen={openDropdown}
                    onCloseSoon={closeDropdownSoon}
                    onClose={closeDropdown}
                  />
                );
              })}

              <div
                className="relative"
                onMouseEnter={() => openDropdown("legal-group")}
                onMouseLeave={closeDropdownSoon}
                onFocus={() => openDropdown("legal-group")}
              >
                <Link
                  id="nav-button-legal-group"
                  href="/services/registry-deeds"
                  onClick={closeDropdown}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeDropdown();
                  }}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
                    legalGroupActive,
                    isDark
                  )}`}
                  aria-expanded={activeDropdown === "legal-group"}
                  aria-haspopup="true"
                  aria-controls="nav-dropdown-legal-group"
                >
                  <span>{t.nav.legalFamily}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "legal-group"
                        ? "rotate-180 text-gold-500"
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
                      onClose={closeDropdown}
                      isUrdu={isUrdu}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/#about"
                className={`rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
                  false,
                  isDark
                )}`}
              >
                {t.nav.about}
              </Link>
              <Link
                href="/updates"
                aria-current={pathname.startsWith("/updates") ? "page" : undefined}
                className={`rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
                  pathname.startsWith("/updates"),
                  isDark
                )}`}
              >
                {isUrdu ? "قانونی رہنمائی" : "Legal Updates"}
              </Link>
              {settings?.navigationMenu
                ?.filter((item) => item.enabled && !["home", "services", "updates", "reminders", "contact"].includes(item.id))
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noreferrer noopener" : undefined}
                    className={`rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-colors 2xl:px-3 2xl:text-[13px] ${desktopLinkClass(
                      pathname === item.href,
                      isDark
                    )}`}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  isDark ? "text-gold-400 hover:bg-white/10" : "text-navy-800 hover:bg-navy-900/5 hover:text-gold-700"
                }`}
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                aria-label="Toggle language between Urdu and English"
                title="Toggle Urdu / English"
                className={`hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:flex ${
                  isDark ? "text-white hover:bg-white/10 hover:text-gold-400" : "text-navy-900 hover:bg-navy-900/5 hover:text-gold-700"
                }`}
              >
                <Globe className="h-4 w-4 text-gold-500" />
                <span>{isUrdu ? "English" : "اردو"}</span>
              </button>

              <IconButton
                edge="end"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: { xs: "inline-flex", lg: "none" },
                  color: isDark ? "#ffffff" : "#0b1d38",
                  ml: 0.25,
                }}
                className="lg:!hidden"
                aria-label="Open navigation menu"
              >
                <MenuIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
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
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? "border-white/10 bg-[#0a1830]" : "border-navy-900/10 bg-white"
          }`}
        >
          <Logo isUrdu={isUrdu} isDark={isDark} />
          <IconButton
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            sx={{ color: isDark ? "#ffffff" : "#0b1d38" }}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-navy-900/5 p-2.5 dark:bg-white/5">
            <span className="text-xs font-semibold text-navy-600 dark:text-slate-400">
              {isUrdu ? "ترتیبات" : "Preferences"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1 text-xs font-semibold text-navy-800 hover:text-gold-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:text-gold-400"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? (isUrdu ? "روشن موڈ" : "Light") : isUrdu ? "ڈارک موڈ" : "Dark"}</span>
              </button>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-xs font-bold text-navy-900 hover:text-gold-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:text-slate-100"
              >
                <Globe className="h-4 w-4 text-gold-500" />
                <span>{isUrdu ? "English" : "اردو"}</span>
              </button>
            </div>
          </div>

          <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-navy-400 dark:text-slate-400">
            {isUrdu ? "قانونی و دستاویزی خدمات" : "Legal & Documentation Services"}
          </div>

          <List component="nav" aria-label="Mobile navigation" disablePadding>
            <ListItemButton
              component={Link}
              href="/"
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                mb: 1,
                bgcolor: pathname === "/" ? (isDark ? "rgba(212,164,76,0.18)" : "rgba(200,151,61,0.12)") : "transparent",
                color: pathname === "/" ? "#c8973d" : isDark ? "#ffffff" : "#0b1d38",
              }}
            >
              <ListItemText primary={t.nav.home} primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
            </ListItemButton>

            <ListItemButton
              onClick={() => setMobileServicesRootOpen((current) => !current)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                mb: 1,
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(11,29,56,0.05)",
                color: isDark ? "#ffffff" : "#0b1d38",
              }}
              aria-expanded={mobileServicesRootOpen}
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
                {SERVICE_CATEGORIES.map((category) => {
                  const isExpanded = Boolean(expandedMobileServices[category.id]);
                  const Icon = getCategoryHeaderIcon(category.id);
                  const categoryTrans = t.categories[category.id] || {
                    title: category.title,
                    shortTitle: category.shortTitle,
                    tagline: category.tagline,
                    description: category.description,
                    items: category.items,
                  };

                  return (
                    <div
                      key={category.id}
                      className={`overflow-hidden rounded-xl border shadow-sm ${
                        isDark ? "border-white/10 bg-[#0c1c33]" : "border-navy-900/10 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleMobileCategory(category.id)}
                        className="flex w-full items-center justify-between p-3 text-left transition hover:bg-gold-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400 dark:hover:bg-white/5"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900/5 text-gold-500 dark:bg-white/10">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-navy-900 dark:text-white">{categoryTrans.title}</p>
                            <p className="line-clamp-1 text-[10px] text-navy-500 dark:text-slate-400">{categoryTrans.tagline}</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${
                            isExpanded ? "rotate-180 text-gold-500" : ""
                          }`}
                        />
                      </button>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <div
                          className={`space-y-1 border-t p-2 ${
                            isDark ? "border-white/10 bg-black/20" : "border-navy-900/5 bg-slate-50/70"
                          }`}
                        >
                          {categoryTrans.items.map((item, index) => {
                            const ItemIcon = getSubServiceIcon(index, category.items[index]?.title || item.title);
                            return (
                              <Link
                                key={item.title}
                                href={category.href}
                                onClick={() => setDrawerOpen(false)}
                                className={`group flex items-start gap-2 rounded-lg p-2 transition ${
                                  isDark ? "hover:bg-white/10" : "hover:bg-white hover:shadow-sm"
                                }`}
                              >
                                <ItemIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" />
                                <div>
                                  <p className="text-xs font-semibold text-navy-900 group-hover:text-gold-600 dark:text-slate-100 dark:group-hover:text-gold-400">
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] leading-tight text-navy-500 dark:text-slate-400">{item.description}</p>
                                </div>
                              </Link>
                            );
                          })}

                          <div className={`mt-1 border-t pt-1.5 ${isDark ? "border-white/10" : "border-navy-900/5"}`}>
                            <Link
                              href={category.href}
                              onClick={() => setDrawerOpen(false)}
                              className="flex items-center justify-between rounded-md bg-gold-400/10 px-3 py-1.5 text-xs font-bold text-gold-700 transition hover:bg-gold-400/20 dark:text-gold-400"
                            >
                              <span>
                                {isUrdu
                                  ? `${categoryTrans.shortTitle} کی تمام خدمات`
                                  : `Explore All ${category.shortTitle} Services`}
                              </span>
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

            <ListItemButton component={Link} href="/#about" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, py: 1.2 }}>
              <ListItemText primary={t.nav.about} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
            </ListItemButton>
            <ListItemButton component={Link} href="/updates" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, py: 1.2 }}>
              <ListItemText
                primary={isUrdu ? "قانونی رہنمائی اور اپ ڈیٹس" : "Legal Updates & Guides"}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          </List>
        </div>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : undefined }} />
        <div className={`p-3 ${isDark ? "bg-[#0a1830]" : "bg-white"}`}>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={settings?.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : SITE.phoneHref}
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
              href={
                settings?.whatsappSettings
                  ? buildWhatsAppUrl(settings.whatsappSettings.number, settings.whatsappSettings.defaultMessage)
                  : SITE.whatsappHref
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/20 transition"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {t.site.whatsappLabel}
            </a>
          </div>
        </div>
      </Drawer>

      <div className="h-[72px]" aria-hidden="true" />
    </>
  );
}
