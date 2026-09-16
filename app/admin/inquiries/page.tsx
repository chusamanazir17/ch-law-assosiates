import React from "react";
import InquiriesManager from "@/features/admin/InquiriesManager";

export const metadata = {
  title: "Client Inquiries & Leads | Ch-Law Admin",
  description: "Manage client consultation requests and contact submissions.",
};

export default function AdminInquiriesPage() {
  return <InquiriesManager />;
}
