import React from "react";
import type { Metadata } from "next";
import AdminOverview from "@/features/admin/AdminOverview";

export const metadata: Metadata = {
  title: "Website Administration | Chamber 121 CMS",
  description: "Manage public website content, legal updates, announcements, and inquiries.",
};

export default function WebsiteAdminDashboardPage() {
  return <AdminOverview />;
}
