import { NextResponse } from "next/server";
import { getActiveNotice } from "@/lib/repositories/announcementsRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeNotice = await getActiveNotice();
    return NextResponse.json({ success: true, announcement: activeNotice });
  } catch (error) {
    console.error("[CmsAnnouncementsAPI] Failed to fetch active notice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load active notice" },
      { status: 500 }
    );
  }
}
