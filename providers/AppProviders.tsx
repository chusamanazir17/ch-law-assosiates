"use client";

import type { ReactNode } from "react";
import { AppThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AppThemeProvider>
  );
}
