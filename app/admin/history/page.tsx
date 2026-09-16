import React from "react";
import type { Metadata } from "next";
import ReminderHistory from "@/features/admin/ReminderHistory";

export const metadata: Metadata = {
  title: "Reminder Logs | Admin Compliance Portal",
};

export default function AdminHistoryPage() {
  return <ReminderHistory />;
}
