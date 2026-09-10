"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("legalassist_theme") as ThemeMode;
      if (savedTheme === "light" || savedTheme === "dark") {
        setModeState(savedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // Default to light unless previously chosen
        setModeState("light");
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("legalassist_theme", mode);
    } catch {
      // Ignore localStorage errors
    }

    if (typeof document !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [mode, mounted]);

  const toggleTheme = () => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const isDark = mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, isDark, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
}
