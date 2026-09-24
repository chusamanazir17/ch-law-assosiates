import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/services/auth.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getUnifiedSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, role: null });
    }

    return NextResponse.json({
      authenticated: true,
      role: session.role,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.profile?.full_name || session.user.user_metadata?.name || "Admin",
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, role: null });
  }
}
