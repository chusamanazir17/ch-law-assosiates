"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, Translations, TRANSLATIONS } from "./translations";

interface LanguageContextType {
  language: Language;
  isUrdu: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("legalassist_lang") as Language;
      if (savedLang === "en" || savedLang === "ur") {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("legalassist_lang", language);
    } catch {
      // Ignore localStorage errors
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
      if (language === "ur") {
        document.documentElement.classList.add("lang-urdu");
      } else {
        document.documentElement.classList.remove("lang-urdu");
      }
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "ur" : "en"));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const isUrdu = language === "ur";
  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        isUrdu,
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
