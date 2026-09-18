// Supabase Edge Function: send-tax-reminders
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { generateToken, hashToken } from "../_shared/crypto.ts";
import { renderTaxReminderEmail } from "../_shared/emailTemplates.ts";
import { sendEmail } from "../_shared/resendClient.ts";

const BUSINESS_TIMEZONE = Deno.env.get("BUSINESS_TIMEZONE") || "Asia/Karachi";
const MAX_ATTEMPTS = 3;
const STALE_PROCESSING_MINUTES = 30;

function getDateInTimezone(date: Date, tz = BUSINESS_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Scheduled workers fail closed when required credentials are absent.
  const cronSecret = Deno.env.get("CRON_SECRET")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const authHeader = req.headers.get("authorization") || "";
  const customCronHeader = req.headers.get("x-cron-secret") || "";

  if (!cronSecret || !serviceRoleKey) {
    console.error("[Tax Reminders Worker] Missing CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY.");
    return jsonResponse({ error: "Worker is not configured." }, 503);
  }

  const isAuthorized =
    customCronHeader === cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    authHeader === `Bearer ${serviceRoleKey}`;

  if (!isAuthorized) {
    return jsonResponse({ error: "Unauthorized invocation." }, 401);
  }

  const supabase = getSupabaseAdmin();
  const todayStr = getDateInTimezone(new Date(), BUSINESS_TIMEZONE);
  const yesterdayStr = addDaysToDateStr(todayStr, -1);

  async function updateDelivery(
    deliveryId: string,
    values: Record<string, unknown>,
    context: string,
  ) {
    const { error } = await supabase
      .from("reminder_deliveries")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", deliveryId);

    if (error) {
      throw new Error(`${context}: ${error.message}`);
    }
  }

  console.log(`[Tax Reminders Worker] Starting run for date: ${todayStr} (${BUSINESS_TIMEZONE})`);

  try {
    // Recover deliveries left in processing by a terminated worker. Resend's
    // idempotency key prevents duplicate provider sends when a retry is needed.
    const staleBefore = new Date(
      Date.now() - STALE_PROCESSING_MINUTES * 60 * 1000,
    ).toISOString();

    const { error: recoverableError } = await supabase
      .from("reminder_deliveries")
      .update({
        status: "queued",
        error_details: "Recovered after an interrupted reminder worker run.",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "processing")
      .lt("last_attempt_at", staleBefore)
      .lt("attempt_count", MAX_ATTEMPTS);
    if (recoverableError) throw recoverableError;

    const { error: exhaustedError } = await supabase
      .from("reminder_deliveries")
      .update({
        status: "failed",
        error_details: "Maximum retry attempts reached after interrupted worker runs.",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "processing")
      .lt("last_attempt_at", staleBefore)
      .gte("attempt_count", MAX_ATTEMPTS);
    if (exhaustedError) throw exhaustedError;

    // Queue generation: only active, verified deadlines are eligible.
    const { data: deadlines, error: deadlineError } = await supabase
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
    if (deadlineError) throw deadlineError;

    let queuedCount = 0;

    for (const deadline of deadlines || []) {
      const filingDeadline = deadline.filing_deadline;
      if (!filingDeadline) continue;

      const target30 = addDaysToDateStr(filingDeadline, -30);
      const target7 = addDaysToDateStr(filingDeadline, -7);
      const intervals: Array<{ interval: "30_days" | "7_days"; scheduledDate: string }> = [];

      if (todayStr === target30 || (yesterdayStr === target30 && todayStr < filingDeadline)) {
        intervals.push({ interval: "30_days", scheduledDate: target30 });
      }
      if (todayStr === target7 || (yesterdayStr === target7 && todayStr < filingDeadline)) {
        intervals.push({ interval: "7_days", scheduledDate: target7 });
      }

      for (const item of intervals) {
        const { data: subscriberCategories, error: subscriberCategoriesError } = await supabase
          .from("subscriber_categories")
          .select("subscriber_id, subscribers!inner(id, status)")
          .eq("category_id", deadline.category_id)
          .eq("subscribers.status", "active");
        if (subscriberCategoriesError) throw subscriberCategoriesError;

        for (const subscriberCategory of subscriberCategories || []) {
          const subscriberId = subscriberCategory.subscriber_id;
          const idempotencyKey =
            `rem-${subscriberId}-${deadline.id}-r${deadline.revision}-${item.interval}`;

          const { error: insertError } = await supabase
            .from("reminder_deliveries")
            .insert({
              subscriber_id: subscriberId,
              deadline_id: deadline.id,
              deadline_revision: deadline.revision,
              reminder_interval: item.interval,
              scheduled_date: item.scheduledDate,
              status: "queued",
              idempotency_key: idempotencyKey,
            });

          if (!insertError) {
            queuedCount++;
          } else if (insertError.code !== "23505") {
            // Unique violations mean another run already queued this exact reminder.
            throw insertError;
          }
        }
      }
    }

    // Never send reminders after the one-day downtime recovery window.
    const { error: staleUpdateError } = await supabase
      .from("reminder_deliveries")
      .update({ status: "skipped", updated_at: new Date().toISOString() })
      .eq("status", "queued")
      .lt("scheduled_date", yesterdayStr);
    if (staleUpdateError) throw staleUpdateError;

    console.log(`[Tax Reminders Worker] Newly queued: ${queuedCount}. Claiming batch...`);

    const { data: claimedBatch, error: claimError } = await supabase.rpc(
      "claim_reminder_deliveries",
      { p_batch_size: 50 },
    );
    if (claimError) throw claimError;

    const results = { processed: 0, sent: 0, failed: 0, cancelled: 0 };
    const siteUrl = (Deno.env.get("SITE_URL") || "https://chcomposing.pk").replace(/\/$/, "");

    for (const item of claimedBatch || []) {
      results.processed++;

      const { data: currentSubscriber, error: subscriberError } = await supabase
        .from("subscribers")
        .select("id, status, email, name")
        .eq("id", item.subscriber_id)
        .single();

      if (subscriberError) {
        results.failed++;
        await updateDelivery(
          item.delivery_id,
          {
            status: "failed",
            error_details: `Subscriber lookup failed: ${subscriberError.message}`.slice(0, 500),
          },
          "Failed to persist subscriber lookup failure",
        );
        continue;
      }

      if (!currentSubscriber || currentSubscriber.status !== "active") {
        results.cancelled++;
        await updateDelivery(
          item.delivery_id,
          {
            status: "cancelled",
            error_details: "Subscriber no longer active at time of dispatch.",
          },
          "Failed to cancel reminder for inactive subscriber",
        );
        continue;
      }

      const rawUnsubscribeToken = generateToken(24);
      const unsubscribeHash = await hashToken(rawUnsubscribeToken);
      const { error: tokenError } = await supabase.from("subscription_tokens").insert({
        subscriber_id: currentSubscriber.id,
        token_hash: unsubscribeHash,
        purpose: "unsubscribe",
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (tokenError) {
        results.failed++;
        await updateDelivery(
          item.delivery_id,
          {
            status: "failed",
            error_details: `Unsubscribe token creation failed: ${tokenError.message}`.slice(0, 500),
          },
          "Failed to persist unsubscribe-token failure",
        );
        continue;
      }

      const unsubscribeUrl =
        `${siteUrl}/reminders/unsubscribe?token=${encodeURIComponent(rawUnsubscribeToken)}`;
      const oneClickUnsubscribeUrl =
        `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(rawUnsubscribeToken)}`;
      const daysRemaining = item.reminder_interval === "30_days" ? 30 : 7;

      const emailContent = renderTaxReminderEmail({
        name: currentSubscriber.name,
        categoryName: item.category_name,
        deadlineTitle: item.deadline_title,
        deadlinePeriod: item.deadline_period,
        deadlineDate: item.deadline_date,
        daysRemaining,
        unsubscribeUrl,
      });

      const sendResult = await sendEmail({
        to: currentSubscriber.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        idempotencyKey: item.idempotency_key,
        headers: {
          "List-Unsubscribe":
            `<${oneClickUnsubscribeUrl}>, <mailto:unsubscribe@chcomposing.pk?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendResult.success) {
        await updateDelivery(
          item.delivery_id,
          {
            status: "sent",
            provider_message_id: sendResult.messageId || null,
            sent_at: new Date().toISOString(),
            error_details: null,
          },
          "Email was dispatched but delivery state could not be persisted",
        );
        results.sent++;
      } else {
        const nextStatus = item.attempt_count >= MAX_ATTEMPTS ? "failed" : "queued";
        await updateDelivery(
          item.delivery_id,
          {
            status: nextStatus,
            error_details: sendResult.error?.slice(0, 500) || "Delivery dispatch failed",
          },
          "Failed to persist reminder delivery error",
        );
        results.failed++;
      }
    }

    console.log("[Tax Reminders Worker] Execution complete:", results);

    return jsonResponse({
      success: true,
      summary: {
        date: todayStr,
        timezone: BUSINESS_TIMEZONE,
        queued: queuedCount,
        ...results,
      },
    });
  } catch (err: unknown) {
    console.error("[Tax Reminders Error]", err);
    return jsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : "Error executing reminder delivery worker",
      },
      500,
    );
  }
});
