"use client";

import { createTheme } from "@mui/material/styles";

export function getTheme(mode: "light" | "dark" = "light") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#dfbb6e" : "#0b1d38",
        dark: mode === "dark" ? "#c8973d" : "#061226",
        light: mode === "dark" ? "#eed69e" : "#1b3258",
        contrastText: mode === "dark" ? "#0b1d38" : "#ffffff",
      },
      secondary: {
        main: "#c8973d",
        dark: "#ad7831",
        light: "#dfbb6e",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "dark" ? "#071224" : "#f5f7fa",
        paper: mode === "dark" ? "#0c1a30" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f1f5f9" : "#0b1d38",
        secondary: mode === "dark" ? "#94a3b8" : "#46586f",
      },
    },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: "10px 22px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 8px 20px rgba(11,29,56,0.18)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #132543 0%, #0b1d38 100%)",
          color: "#ffffff",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #d4a44c 0%, #c8973d 100%)",
          color: "#ffffff",
        },
        outlined: {
          borderColor: "rgba(11,29,56,.23)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.08em",
          fontSize: 11,
        },
      },
    },
  },
  });
}

const defaultTheme = getTheme("light");
export default defaultTheme;
