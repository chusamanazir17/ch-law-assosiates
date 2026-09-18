"use client";

import { useMemo, type ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { getTheme } from "@/theme/theme";
import { AppThemeProvider, useAppTheme } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";

function DesignSystemProvider({ children }: { children: ReactNode }) {
  const { mode } = useAppTheme();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <AppThemeProvider>
        <LanguageProvider>
          <DesignSystemProvider>{children}</DesignSystemProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </AppRouterCacheProvider>
  );
}
