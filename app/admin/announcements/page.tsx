import React from "react";
import AnnouncementsManager from "@/features/admin/AnnouncementsManager";

export const metadata = {
  title: "Site Announcements & Tickers | Ch-Law Admin",
  description: "Configure website alert banners and tax deadline extension notices.",
};

export default function AdminAnnouncementsPage() {
  return <AnnouncementsManager />;
}
