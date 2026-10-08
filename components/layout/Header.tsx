"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Award,
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

/**
 * Lightweight slide-down/up region replacing MUI's Collapse.
 * Animates height via the grid-template-rows trick; content stays mounted
 * (mobile nav is small) but is hidden from assistive tech when closed.
 */
function SlideDown({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} ${className}`}
    >
      <div className="overflow-hidden" aria-hidden={!open}>
        {children}
      </div>
    </div>
  );
}

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
      : "bg-gold-500/10 text-gold-600 ring-1 ring-gold-500/25";
  }

  return isDark
    ? "text-white hover:bg-white/10 hover:text-gold-400"
    : "text-[#0B1F36] hover:bg-[#0B1F36]/5 hover:text-[#05162B]";
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
        className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
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
            isOpen ? "rotate-180 text-gold-500" : isDark ? "text-slate-300" : "text-[#657184]"
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

  // Mobile drawer: Escape closes it and body scroll locks while open.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

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

  const homeNavItem = settings?.navigationMenu?.find((item) => item.id === "home");
  const homeLabel = homeNavItem?.label || t.nav.home;
  const homeHref = homeNavItem?.href || "/";
  const homeVisible = homeNavItem?.enabled !== false;

  const aboutNavItem = settings?.navigationMenu?.find((item) => item.id === "about");
  const aboutLabel = aboutNavItem?.label || t.nav.about;
  const aboutHref = aboutNavItem?.href || "/about";
  const aboutVisible = aboutNavItem?.enabled !== false;

  const updatesNavItem = settings?.navigationMenu?.find((item) => item.id === "updates");
  const updatesLabel = updatesNavItem?.label || (isUrdu ? "قانونی رہنمائی" : "Legal Updates");
  const updatesHref = updatesNavItem?.href || "/updates";
  const updatesVisible = updatesNavItem?.enabled !== false;

  if (pathname.startsWith("/admin") || pathname.startsWith("/office")) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1100] backdrop-blur-[14px] transition-[background-color,box-shadow] duration-200 ${
          scrolled
            ? isDark
              ? "bg-[rgba(5,22,43,0.96)] shadow-[0_8px_30px_rgba(0,0,0,0.28)]"
              : "bg-[rgba(255,255,255,0.96)] shadow-[0_8px_30px_rgba(5,22,43,0.06)]"
            : isDark
              ? "bg-[#05162B]"
              : "bg-white"
        } ${isDark ? "border-b border-white/[0.08]" : "border-b border-[#E3E7EC]"}`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            <Logo isUrdu={isUrdu} isDark={isDark} />

            <nav
              aria-label="Primary navigation"
              className="hidden min-w-0 items-center gap-0.5 lg:flex 2xl:gap-1.5"
              onMouseLeave={closeDropdownSoon}
            >
              {homeVisible && (
                <Link
                  href={homeHref}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
                    pathname === "/",
                    isDark
                  )}`}
                >
                  {homeLabel}
                </Link>
              )}

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
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
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
                        : "text-[#657184]"
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

              {aboutVisible && (
                <Link
                  href={aboutHref}
                  aria-current={pathname.startsWith("/about") ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
                    pathname.startsWith("/about"),
                    isDark
                  )}`}
                >
                  {aboutLabel}
                </Link>
              )}
              {updatesVisible && (
                <Link
                  href={updatesHref}
                  aria-current={pathname.startsWith("/updates") ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
                    pathname.startsWith("/updates"),
                    isDark
                  )}`}
                >
                  {updatesLabel}
                </Link>
              )}
              {settings?.navigationMenu
                ?.filter((item) => item.enabled && !["home", "services", "about", "updates", "reminders", "contact"].includes(item.id))
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noreferrer noopener" : undefined}
                    className={`rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors 2xl:px-3 ${desktopLinkClass(
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

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className={`ml-1 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 lg:hidden ${
                  isDark ? "text-white hover:bg-white/10" : "text-[#0b1d38] hover:bg-navy-900/5"
                }`}
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer (Tailwind slide-over; replaces MUI Drawer) */}
      <div
        className={`fixed inset-0 z-[1200] lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`absolute inset-y-0 right-0 flex w-[90%] max-w-[390px] flex-col shadow-2xl transition-transform duration-300 ease-out ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          } ${isDark ? "bg-[#071224] text-[#f1f5f9]" : "bg-[#f8fafc] text-[#0b1d38]"}`}
        >
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? "border-white/10 bg-[#0a1830]" : "border-navy-900/10 bg-white"
          }`}
        >
          <Logo isUrdu={isUrdu} isDark={isDark} />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
              isDark ? "text-white hover:bg-white/10" : "text-[#0b1d38] hover:bg-navy-900/5"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
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

          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                aria-current={pathname === "/" ? "page" : undefined}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  pathname === "/"
                    ? "bg-[rgba(200,151,61,0.12)] text-[#c8973d] dark:bg-[rgba(212,164,76,0.18)]"
                    : isDark
                      ? "text-white hover:bg-white/5"
                      : "text-[#0b1d38] hover:bg-navy-900/5"
                }`}
              >
                {t.nav.home}
              </Link>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setMobileServicesRootOpen((current) => !current)}
                aria-expanded={mobileServicesRootOpen}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  isDark ? "bg-white/[0.06] text-white" : "bg-[rgba(11,29,56,0.05)] text-[#0b1d38]"
                }`}
              >
                <span className="flex-1 text-left text-sm font-bold">
                  {isUrdu ? "تمام خدمات اور فہرست" : "All Services & Categories"}
                </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  mobileServicesRootOpen ? "rotate-180 text-gold-500" : "text-navy-500"
                }`}
              />
            </button>
            </li>

            <SlideDown open={mobileServicesRootOpen}>
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
                        className="flex w-full items-center gap-1 p-3 text-left transition hover:bg-gold-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400 dark:hover:bg-white/5"
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

                      <SlideDown open={isExpanded}>
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
                      </SlideDown>
                    </div>
                  );
                })}
              </div>
            </SlideDown>

            <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-navy-900/10"}`} />

            {aboutVisible && (
              <li>
                <Link
                  href={aboutHref}
                  onClick={() => setDrawerOpen(false)}
                  aria-current={pathname.startsWith("/about") ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    pathname.startsWith("/about")
                      ? "bg-[rgba(200,151,61,0.12)] text-[#c8973d] dark:bg-[rgba(212,164,76,0.18)]"
                      : isDark
                        ? "text-white hover:bg-white/5"
                        : "text-[#0b1d38] hover:bg-navy-900/5"
                  }`}
                >
                  <span className="block text-sm font-semibold">{aboutLabel}</span>
                  <span className={`mt-0.5 block text-[11px] ${isDark ? "text-slate-400" : "text-navy-500"}`}>
                    {isUrdu ? "بانی و چیمبر 121 کی تاریخ" : "Our Founder, Story & Leadership"}
                  </span>
                </Link>
              </li>
            )}
            {updatesVisible && (
              <li>
                <Link
                  href={updatesHref}
                  onClick={() => setDrawerOpen(false)}
                  aria-current={pathname.startsWith("/updates") ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    pathname.startsWith("/updates")
                      ? "bg-[rgba(200,151,61,0.12)] text-[#c8973d] dark:bg-[rgba(212,164,76,0.18)]"
                      : isDark
                        ? "text-white hover:bg-white/5"
                        : "text-[#0b1d38] hover:bg-navy-900/5"
                  }`}
                >
                  {updatesLabel}
                </Link>
              </li>
            )}
            {settings?.navigationMenu
              ?.filter((item) => item.enabled && !["home", "services", "about", "updates", "reminders", "contact"].includes(item.id))
              .map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noreferrer noopener" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      isDark ? "text-white hover:bg-white/5" : "text-[#0b1d38] hover:bg-navy-900/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={`border-t ${isDark ? "border-white/10" : "border-navy-900/10"}`} />
        <div className={`p-3 space-y-2 ${isDark ? "bg-[#0a1830]" : "bg-white"}`}>
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
        </aside>
      </div>

      <div style={{ height: 72 }} aria-hidden="true" />
    </>
  );
}
