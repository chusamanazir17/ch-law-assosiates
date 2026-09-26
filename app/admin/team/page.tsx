import React from "react";
import type { Metadata } from "next";
import TeamManager from "@/features/admin/TeamManager";

export const metadata: Metadata = {
  title: "Team & Lawyers | Chamber 121 CMS",
  description: "Manage chamber advocates, consultants, stamp vendors, and legal team directory.",
};

export default function AdminTeamPage() {
  return <TeamManager />;
}
