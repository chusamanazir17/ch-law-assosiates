import React from "react";
import type { Metadata } from "next";
import AdminOverview from "@/features/admin/AdminOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard | Tax Compliance & Reminders",
};

export default function AdminPage() {
  return <AdminOverview />;
}
