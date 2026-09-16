import React from "react";
import type { Metadata } from "next";
import SubscribersManager from "@/features/admin/SubscribersManager";

export const metadata: Metadata = {
  title: "Subscribers | Admin Compliance Portal",
};

export default function AdminSubscribersPage() {
  return <SubscribersManager />;
}
