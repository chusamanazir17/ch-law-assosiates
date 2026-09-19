import { NextResponse } from "next/server";
import { getActiveNotice } from "@/lib/repositories/announcementsRepository";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let supabase = null;
    try {
      supabase = createClient();
    } catch {
      // Supabase optional
    }

    const activeNotice = await getActiveNotice(supabase);
    return NextResponse.json({ success: true, announcement: activeNotice });
  } catch (error) {
    console.error("[CmsAnnouncementsAPI] Failed to fetch active notice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load active notice" },
      { status: 500 }
    );
  }
}
