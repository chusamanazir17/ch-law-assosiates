import React from "react";
import SiteSettingsManager from "@/features/admin/SiteSettingsManager";

export const metadata = {
  title: "Site Settings & Navigation CMS | Ch-Law Associates Admin",
  description: "Configure office address, emergency hotlines, consultants roster, hours, and navigation menus.",
};

export default function AdminSettingsRoute() {
  return <SiteSettingsManager />;
}
