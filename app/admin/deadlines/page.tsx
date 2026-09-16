import React from "react";
import type { Metadata } from "next";
import DeadlinesManager from "@/features/admin/DeadlinesManager";

export const metadata: Metadata = {
  title: "Tax Deadlines | Admin Compliance Portal",
};

export default function AdminDeadlinesPage() {
  return <DeadlinesManager />;
}
