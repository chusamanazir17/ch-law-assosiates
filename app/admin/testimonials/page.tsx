import React from "react";
import type { Metadata } from "next";
import TestimonialsManager from "@/features/admin/TestimonialsManager";

export const metadata: Metadata = {
  title: "Client Testimonials | Chamber 121 CMS",
  description: "Manage client reviews, star ratings, and featured testimonials for the website.",
};

export default function AdminTestimonialsPage() {
  return <TestimonialsManager />;
}
