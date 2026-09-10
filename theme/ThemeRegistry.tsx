"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./theme";
import { AppThemeProvider, useAppTheme } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/LanguageContext";

function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useAppTheme();
  const currentTheme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <AppThemeProvider>
        <LanguageProvider>
          <MuiThemeProvider>{children}</MuiThemeProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </AppRouterCacheProvider>
  );
}
