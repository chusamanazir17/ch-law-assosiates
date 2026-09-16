import React from "react";
import MediaManager from "@/features/admin/MediaManager";

export const metadata = {
  title: "Media & Image Assets | Ch-Law Admin",
  description: "Upload and manage website image assets and photo galleries.",
};

export default function AdminMediaPage() {
  return <MediaManager />;
}
