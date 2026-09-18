import React from "react";
import PagesContentManager from "@/features/admin/PagesContentManager";

export const metadata = {
  title: "Pages Content CMS | Ch-Law Associates Admin",
  description: "Manage and edit headlines, banners, CTAs, and metadata for every public website page.",
};

export default function AdminPagesRoute() {
  return <PagesContentManager />;
}
