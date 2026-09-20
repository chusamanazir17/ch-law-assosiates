import fs from "fs";
import path from "path";

export interface BusinessDetails {
  name: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  whatsappHref: string;
  address: string;
  city: string;
}

export const BUSINESS: BusinessDetails = {
  name: "Ch Composing & Tax Advisor",
  fullName: "Ch Composing Estamp & Tax Advisor",
  phone: "0305-7902744",
  whatsapp: "0305-7902744",
  whatsappHref: "https://wa.me/923057902744",
  address: "Sharki Gate Chamber No 121, District Court Sahiwal",
  city: "Sahiwal",
};

export interface SendEmailOptions {
  to: string;
  name: string;
  categoryNames: string[];
  confirmUrl?: string;
  unsubscribeUrl?: string;
}

export interface EmailResult {
  success: boolean;
  provider?: "resend" | "local_log";
  messageId?: string;
  error?: string;
  reason?: "missing_api_key" | "api_error" | "network_error";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderConfirmationEmail(options: SendEmailOptions) {
  const clientName = options.name ? escapeHtml(options.name) : "Valued Client";
  const categoriesHtml =
    options.categoryNames.length > 0
      ? options.categoryNames.map((c) => `<li style="margin-bottom: 6px; color: #1e293b;">${escapeHtml(c)}</li>`).join("")
      : `<li style="color: #1e293b;">General FBR &amp; Provincial Tax Deadlines</li>`;
  const categoriesText =
    options.categoryNames.length > 0
      ? options.categoryNames.map((c) => `- ${c}`).join("\n")
      : "- General FBR & Provincial Tax Deadlines";

  const subject = `Tax Deadline Reminders Confirmation - ${BUSINESS.name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(11, 29, 56, 0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0b1d38; padding: 28px 32px; text-align: left; border-bottom: 3px solid #c8973d;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">${BUSINESS.fullName}</h1>
              <p style="margin: 6px 0 0 0; color: #d4a44c; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                District Court Sahiwal &bull; Chamber 121
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; margin-bottom: 16px; border: 1px solid #a7f3d0;">
                &#10003; Reminders Registered
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0b1d38; line-height: 1.3;">
                Welcome, ${clientName}!
              </h2>

              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Thank you for subscribing to statutory tax deadline reminders from <strong>${BUSINESS.fullName}</strong>. You will receive statutory notifications before key cutoff dates to ensure timely compliance and prevent late surcharges or penalties.
              </p>

              <!-- Selected Categories Card -->
              <div style="background-color: #f8fafc; border-left: 4px solid #c8973d; padding: 16px 20px; margin: 24px 0; border-radius: 6px;">
                <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0b1d38; text-transform: uppercase; letter-spacing: 0.5px;">
                  Your Subscribed Reminder Categories:
                </p>
                <ul style="margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7;">
                  ${categoriesHtml}
                </ul>
              </div>

              <!-- In-person Office Info -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase;">
                  In-Person Office Assistance
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #78350f;">
                  Our expert advisors are available on-site at Chamber 121, District Court Sahiwal to prepare your Iris income tax return, e-stamp duty, property documentation, and corporate compliance files.
                </p>
              </div>

              <!-- Quick Contact Buttons -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0 12px 0;">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="${BUSINESS.whatsappHref}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #25D366;">
                      Chat on WhatsApp
                    </a>
                  </td>
                  <td>
                    <a href="tel:+923057902744" style="display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #0b1d38; text-decoration: none; border-radius: 6px; background-color: #e2e8f0; border: 1px solid #cbd5e1;">
                      Call: ${BUSINESS.phone}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 6px 0;">
                <strong>Office Location:</strong> ${BUSINESS.address}
              </p>
              <p style="margin: 0; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                You received this email because this address was registered on the official website of ${BUSINESS.fullName}.
                ${options.unsubscribeUrl ? `<br><a href="${options.unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe from these reminders</a>` : ""}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Tax Deadline Reminders Registered - ${BUSINESS.fullName}

Hello ${clientName},

Thank you for subscribing to statutory tax deadline reminders from ${BUSINESS.fullName}.

Subscribed Categories:
${categoriesText}

Office Location:
${BUSINESS.address}

Direct Phone: ${BUSINESS.phone}
WhatsApp: ${BUSINESS.whatsappHref}
`;

  return { subject, html, text };
}

export async function sendSubscriptionConfirmationEmail(
  options: SendEmailOptions
): Promise<EmailResult> {
  const { subject, html, text } = renderConfirmationEmail(options);
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. If RESEND_API_KEY is configured, dispatch via Resend REST API
  if (resendApiKey) {
    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "Ch Composing Reminders <onboarding@resend.dev>";

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [options.to],
          subject,
          html,
          text,
        }),
      });

      const data = (await resp.json()) as { id?: string; message?: string };

      if (resp.ok && data?.id) {
        logEmailDispatch({
          to: options.to,
          name: options.name,
          categories: options.categoryNames,
          subject,
          status: "delivered",
          provider: "resend",
          messageId: data.id,
        });

        return { success: true, provider: "resend", messageId: data.id };
      }

      console.warn("[EmailService] Resend API error response:", data);
      logEmailDispatch({
        to: options.to,
        name: options.name,
        categories: options.categoryNames,
        subject,
        status: "failed",
        provider: "resend",
        error: data?.message || `HTTP ${resp.status}`,
      });

      return {
        success: false,
        reason: "api_error",
        error: data?.message || `Resend returned HTTP ${resp.status}`,
      };
    } catch (err) {
      console.error("[EmailService] Resend network error:", err);
      return {
        success: false,
        reason: "network_error",
        error: err instanceof Error ? err.message : "Network error contacting Resend API",
      };
    }
  }

  // 2. RESEND_API_KEY not configured
  console.warn(
    `[EmailService] RESEND_API_KEY is not configured in environment variables. Email to ${options.to} was not sent.`
  );

  logEmailDispatch({
    to: options.to,
    name: options.name,
    categories: options.categoryNames,
    subject,
    status: "unconfigured_api_key",
    provider: "local_log",
    note: "RESEND_API_KEY environment variable is not set. Add RESEND_API_KEY in Vercel or .env.local to enable live delivery.",
  });

  return {
    success: false,
    reason: "missing_api_key",
    error: "RESEND_API_KEY is not configured in environment variables.",
  };
}

function logEmailDispatch(entry: {
  to: string;
  name: string;
  categories: string[];
  subject: string;
  status: string;
  provider: string;
  messageId?: string;
  error?: string;
  note?: string;
}) {
  try {
    const logDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, "email_logs.json");
    let logs: any[] = [];
    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, "utf8"));
      } catch {
        logs = [];
      }
    }
    logs.unshift({
      id: `mail-${Date.now()}`,
      dispatched_at: new Date().toISOString(),
      ...entry,
    });
    fs.writeFileSync(logFile, JSON.stringify(logs.slice(0, 100), null, 2), "utf8");
  } catch (e) {
    console.error("[EmailService] Failed to write email log:", e);
  }
}
