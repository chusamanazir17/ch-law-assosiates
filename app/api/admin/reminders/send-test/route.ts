import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/admin";
import { getAdminDatabaseClient } from "@/lib/supabase/service";
import { sendRawEmail, BUSINESS } from "@/lib/email/emailService";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

const sendTestSchema = z.object({
  deadline_id: z.string().uuid("deadline_id must be a valid UUID"),
  reminder_interval: z.enum(["7_days", "30_days"]).default("7_days"),
});

/**
 * Server-side test-reminder dispatch for admins.
 *
 * The Supabase Edge Function `send-test-reminder` requires a Supabase Auth JWT
 * with is_admin — which cookie-session (local) admins do not have. This route
 * performs the same job server-side under the admin cookie session (RBAC via
 * getAdminSession) and sends strictly to the administrator's own email.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = sendTestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  const { deadline_id, reminder_interval } = parsed.data;
  const adminEmail = session.user.email;
  if (!adminEmail) {
    return NextResponse.json(
      { success: false, error: "Administrator email is not available for this session." },
      { status: 400 }
    );
  }

  try {
    const supabase = await getAdminDatabaseClient();
    const { data: deadline, error } = await supabase
      .from("tax_deadlines")
      .select("id, title, tax_year_or_period, filing_deadline, tax_categories ( name )")
      .eq("id", deadline_id)
      .single();

    if (error || !deadline) {
      return NextResponse.json(
        { success: false, error: "Deadline not found." },
        { status: 404 }
      );
    }

    const relation = deadline.tax_categories as { name?: string } | Array<{ name?: string }> | null;
    const categoryName = Array.isArray(relation)
      ? relation[0]?.name || "General Tax"
      : relation?.name || "General Tax";
    const daysRemaining = reminder_interval === "30_days" ? 30 : 7;
    const dueDate = new Date(deadline.filing_deadline).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const subject = `[TEST] Tax Reminder: ${deadline.title} — due ${dueDate}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #0B1F36; color: #fff; padding: 20px 28px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 18px;">${BUSINESS.fullName}</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;">TEST reminder email — no action required</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px 28px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 14px;">This is a <strong>test</strong> of the statutory tax reminder system.</p>
          <table style="font-size: 14px; margin: 16px 0;">
            <tr><td style="color: #64748b; padding: 4px 12px 4px 0;">Deadline</td><td><strong>${deadline.title}</strong></td></tr>
            <tr><td style="color: #64748b; padding: 4px 12px 4px 0;">Category</td><td>${categoryName}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 12px 4px 0;">Period</td><td>${deadline.tax_year_or_period || "—"}</td></tr>
            <tr><td style="color: #64748b; padding: 4px 12px 4px 0;">Filing due</td><td><strong>${dueDate}</strong> (${daysRemaining} days before)</td></tr>
          </table>
          <p style="font-size: 12px; color: #64748b;">Sent to ${adminEmail} from the Chamber 121 admin panel.</p>
        </div>
      </div>`;
    const text = `[TEST] ${BUSINESS.fullName} — tax reminder test\n\nDeadline: ${deadline.title}\nCategory: ${categoryName}\nPeriod: ${deadline.tax_year_or_period || "—"}\nFiling due: ${dueDate} (${daysRemaining} days before)\n\nSent to ${adminEmail} from the Chamber 121 admin panel.`;

    const result = await sendRawEmail({ to: adminEmail, subject, html, text });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to dispatch test email." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${adminEmail}`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Admin Send Test Reminder]", error);
    return NextResponse.json(
      { success: false, error: "Unable to process test email request." },
      { status: 500 }
    );
  }
}
