"use client";

import React, { use } from "react";
import { App } from "@/features/office/App";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function OfficeCatchAllPage({ params }: PageProps) {
  // Unwrap params promise in Next.js 15
  use(params);
  return <App />;
}
