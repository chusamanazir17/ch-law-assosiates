import React from "react";
import type { Metadata } from "next";
import AdminPortalSelector from "@/components/admin/AdminPortalSelector";

export const metadata: Metadata = {
  title: "Admin Portal Gateway | CH Law Associates",
  description: "Select between Website Administration CMS and Office Management System.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortalGatewayPage() {
  return <AdminPortalSelector />;
}
