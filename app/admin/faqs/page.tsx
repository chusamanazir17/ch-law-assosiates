import React from "react";
import type { Metadata } from "next";
import FaqsManager from "@/features/admin/FaqsManager";

export const metadata: Metadata = {
  title: "FAQ Knowledgebase | Chamber 121 CMS",
  description: "Manage frequently asked questions, answers, categorization, and ordering.",
};

export default function AdminFaqsPage() {
  return <FaqsManager />;
}
