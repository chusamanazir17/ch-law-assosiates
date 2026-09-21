"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isReady: boolean;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({
  children,
  initialCollapsed = false,
}: {
  children: React.ReactNode;
  initialCollapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("office_cms_sidebar_collapsed");
      if (saved !== null) {
        const val = saved === "true";
        setIsCollapsed(val);
        document.cookie = `office_cms_sidebar_collapsed=${val}; path=/; max-age=31536000; SameSite=Lax`;
      } else if (initialCollapsed) {
        localStorage.setItem("office_cms_sidebar_collapsed", "true");
        document.cookie = `office_cms_sidebar_collapsed=true; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Non-fatal if localStorage/cookies are restricted
    }

    // Enable transitions only after initial mount is painted, preventing the open-then-close glitch on reload
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, [initialCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("office_cms_sidebar_collapsed", String(next));
        document.cookie = `office_cms_sidebar_collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem("office_cms_sidebar_collapsed", String(collapsed));
      document.cookie = `office_cms_sidebar_collapsed=${collapsed}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }
  };

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        isReady,
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
  }
  return context;
}

