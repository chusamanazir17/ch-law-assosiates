"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Language,
  type Translations,
  TRANSLATIONS,
} from "@/lib/translations";

interface LanguageContextValue {
  language: Language;
  isUrdu: boolean;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const STORAGE_KEY = "ch_composing_language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ur") setLanguageState(saved);
    } catch {
      // Storage may be unavailable in privacy-restricted browsers.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Preference persistence is non-critical.
    }

    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    document.documentElement.classList.toggle("lang-urdu", language === "ur");
  }, [hydrated, language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isUrdu: language === "ur",
      toggleLanguage: () => setLanguageState((current) => (current === "en" ? "ur" : "en")),
      setLanguage: setLanguageState,
      t: TRANSLATIONS[language],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
