import React from "react";
import ServicesCatalogManager from "@/features/admin/ServicesCatalogManager";

export const metadata = {
  title: "Services Catalog CMS | Ch-Law Associates Admin",
  description: "Manage practice areas, turnaround times, fees, required documents, and hero images for all legal services.",
};

export default function AdminServicesPage() {
  return <ServicesCatalogManager />;
}
