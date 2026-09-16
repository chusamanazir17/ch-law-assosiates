// Supabase Edge Function: send-tax-reminders
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { generateToken, hashToken } from "../_shared/crypto.ts";
import { renderTaxReminderEmail } from "../_shared/emailTemplates.ts";
import { sendEmail } from "../_shared/resendClient.ts";

// Configurable Business Timezone (default: Asia/Karachi)
const BUSINESS_TIMEZONE = Deno.env.get("BUSINESS_TIMEZONE") || "Asia/Karachi";

/**
 * Returns formatted YYYY-MM-DD for a date object in the configured timezone
 */
function getDateInTimezone(date: Date, tz = BUSINESS_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // outputs YYYY-MM-DD
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // 1. Authorization: Verify CRON_SECRET or Service Role
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("authorization") || "";
  const customCronHeader = req.headers.get("x-cron-secret") || "";

  const isAuthorized =
    (cronSecret && (customCronHeader === cronSecret || authHeader === `Bearer ${cronSecret}`)) ||
    authHeader.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "never-match-empty");

  if (!isAuthorized && cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized invocation." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabaseAdmin();
  const todayStr = getDateInTimezone(new Date(), BUSINESS_TIMEZONE);
  const yesterdayStr = addDaysToDateStr(todayStr, -1);

  console.log(`[Tax Reminders Worker] Starting run for date: ${todayStr} (${BUSINESS_TIMEZONE})`);

  try {
    // 2. Queue Generation Step
    // Find all active, verified deadlines
    const { data: deadlines, error: dlError } = await supabase
      .from("tax_deadlines")
      .select(`
        id,
        category_id,
        tax_year_or_period,
        title,
        filing_deadline,
        official_source_url,
        revision,
        tax_categories ( id, name )
      `)
      .eq("is_active", true)
      .not("verified_at", "is", null);

    if (dlError) throw dlError;

    let queuedCount = 0;

    for (const dl of deadlines || []) {
      const filingDeadline = dl.filing_deadline; // 'YYYY-MM-DD'
      if (!filingDeadline) continue;

      // 30 days before deadline
      const target30 = addDaysToDateStr(filingDeadline, -30);
      // 7 days before deadline
      const target7 = addDaysToDateStr(filingDeadline, -7);

      // Check if today matches or matches downtime recovery (scheduled yesterday, but unsent and not past deadline)
      const intervalsToCheck: Array<{ interval: "30_days" | "7_days"; scheduledDate: string }> = [];

      if (todayStr === target30 || (yesterdayStr === target30 && todayStr < filingDeadline)) {
        intervalsToCheck.push({ interval: "30_days", scheduledDate: target30 });
      }
      if (todayStr === target7 || (yesterdayStr === target7 && todayStr < filingDeadline)) {
        intervalsToCheck.push({ interval: "7_days", scheduledDate: target7 });
      }

      for (const item of intervalsToCheck) {
        // Find matching active subscribers for this category
        const { data: subCats } = await supabase
          .from("subscriber_categories")
          .select("subscriber_id, subscribers!inner(id, status)")
          .eq("category_id", dl.category_id)
          .eq("subscribers.status", "active");

        for (const sc of subCats || []) {
          const subId = sc.subscriber_id;
          const idempotencyKey = `rem-${subId}-${dl.id}-r${dl.revision}-${item.interval}`;

          // Insert queued delivery record with unique constraint protection
          const { error: insertErr } = await supabase
            .from("reminder_deliveries")
            .insert({
              subscriber_id: subId,
              deadline_id: dl.id,
              deadline_revision: dl.revision,
              reminder_interval: item.interval,
              scheduled_date: item.scheduledDate,
              status: "queued",
              idempotency_key: idempotencyKey,
            });

          if (!insertErr) {
            queuedCount++;
          }
        }
      }
    }

    // 3. Mark Older Stale Reminders as Skipped (Downtime Recovery Rule: Never send past deadline)
    await supabase
      .from("reminder_deliveries")
      .update({ status: "skipped", updated_at: new Date().toISOString() })
      .eq("status", "queued")
      .lt("scheduled_date", yesterdayStr);

    console.log(`[Tax Reminders Worker] Newly queued: ${queuedCount}. Claiming batch for dispatch...`);

    // 4. Atomic Claiming & Sending Step
    // Call stored procedure claim_reminder_deliveries to lock and claim a batch
    const { data: claimedBatch, error: claimErr } = await supabase.rpc("claim_reminder_deliveries", {
      p_batch_size: 50,
    });

    if (claimErr) throw claimErr;

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
    };

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    for (const item of claimedBatch || []) {
      results.processed++;

      // Re-verify subscriber status immediately before dispatch
      const { data: currentSub } = await supabase
        .from("subscribers")
        .select("id, status, email, name")
        .eq("id", item.subscriber_id)
        .single();

      if (!currentSub || currentSub.status !== "active") {
        await supabase
          .from("reminder_deliveries")
          .update({
            status: "cancelled",
            error_details: "Subscriber no longer active at time of dispatch.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.delivery_id);
        continue;
      }

      // Generate or retrieve unsubscribe token
      const rawUnsubToken = generateToken(24);
      const unsubHash = await hashToken(rawUnsubToken);
      await supabase.from("subscription_tokens").insert({
        subscriber_id: currentSub.id,
        token_hash: unsubHash,
        purpose: "unsubscribe",
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
      });

      const unsubUrl = `${siteUrl}/reminders/unsubscribe?token=${rawUnsubToken}`;
      const oneClickUnsubUrl = `${siteUrl}/api/unsubscribe?token=${rawUnsubToken}`;

      const daysRemaining = item.reminder_interval === "30_days" ? 30 : 7;

      const emailContent = renderTaxReminderEmail({
        name: currentSub.name,
        categoryName: item.category_name,
        deadlineTitle: item.deadline_title,
        deadlinePeriod: item.deadline_period,
        deadlineDate: item.deadline_date,
        daysRemaining,
        unsubscribeUrl: unsubUrl,
      });

      // Send via Resend with provider idempotency key and RFC 8058 One-Click headers
      const sendResult = await sendEmail({
        to: currentSub.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        idempotencyKey: item.idempotency_key,
        headers: {
          "List-Unsubscribe": `<${oneClickUnsubUrl}>, <mailto:unsubscribe@chcomposing.pk?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendResult.success) {
        results.sent++;
        await supabase
          .from("reminder_deliveries")
          .update({
            status: "sent",
            provider_message_id: sendResult.messageId || null,
            sent_at: new Date().toISOString(),
            error_details: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.delivery_id);
      } else {
        results.failed++;
        const nextStatus = item.attempt_count >= 3 ? "failed" : "queued";
        await supabase
          .from("reminder_deliveries")
          .update({
            status: nextStatus,
            error_details: sendResult.error?.slice(0, 500) || "Delivery dispatch failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.delivery_id);
      }
    }

    console.log("[Tax Reminders Worker] Execution complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          date: todayStr,
          timezone: BUSINESS_TIMEZONE,
          queued: queuedCount,
          ...results,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("[Tax Reminders Error]", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Error executing reminder delivery worker",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
