import { escapeHtml } from "./validation.ts";

export interface BusinessDetails {
  name: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  whatsappHref: string;
  address: string;
  city: string;
}

export const DEFAULT_BUSINESS: BusinessDetails = {
  name: "Ch Composing",
  fullName: "Ch Composing Estamp and Tax Advisor",
  phone: "0305-7902744",
  whatsapp: "0305-7902744",
  whatsappHref: "https://wa.me/923057902744",
  address: "Sharki Gate Chamber No 121 District Court Sahiwal",
  city: "Sahiwal",
};

/**
 * 1. Double Opt-in Confirmation Email
 */
export function renderConfirmationEmail(params: {
  name: string;
  confirmUrl: string;
  categories: string[];
  business?: BusinessDetails;
}) {
  const b = params.business || DEFAULT_BUSINESS;
  const safeName = params.name ? escapeHtml(params.name) : "Valued Client";
  const safeConfirmUrl = escapeHtml(params.confirmUrl);
  const categoriesList = params.categories.length > 0
    ? params.categories.map((c) => `<li>${escapeHtml(c)}</li>`).join("")
    : `<li>General Tax Reminders</li>`;

  const subject = `Please confirm your tax deadline reminders - ${b.name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(11, 29, 56, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0b1d38; padding: 28px 32px; text-align: left; border-bottom: 3px solid #c8973d;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(b.fullName)}</h1>
              <p style="margin: 4px 0 0 0; color: #d4a44c; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">District Court Sahiwal • Chamber 121</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #0f172a;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                We received a request to subscribe this email address to official tax filing deadline reminders from our documentation firm.
              </p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #c8973d; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0b1d38; text-transform: uppercase; letter-spacing: 0.5px;">Selected Tax Categories:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
                  ${categoriesList}
                </ul>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Please click the button below to confirm your subscription. This confirmation is required so you only receive reminders you requested.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #c8973d;">
                    <a href="${safeConfirmUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #0b1d38; text-decoration: none; border-radius: 6px; background-color: #c8973d; border: 1px solid #ad7831;">
                      Confirm My Subscription
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not request these reminders, simply ignore this email. Your email will remain inactive and no reminders will be sent.
              </p>
            </td>
          </tr>

          <!-- Office Notice -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #0b1d38; text-transform: uppercase; letter-spacing: 0.8px;">Physical Office Services</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #475569;">
                Our tax filing, e-stamping, and legal documentation services are provided in person at:
                <br><strong>${escapeHtml(b.address)}</strong>.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #475569;">
                Direct Call: <a href="tel:+923057902744" style="color: #0b1d38; font-weight: 600; text-decoration: none;">${escapeHtml(b.phone)}</a> &bull; WhatsApp: <a href="${escapeHtml(b.whatsappHref)}" style="color: #059669; font-weight: 600; text-decoration: none;">${escapeHtml(b.whatsapp)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Please confirm your tax deadline reminders - ${b.name}

Hello ${params.name || "Valued Client"},

We received a request to subscribe this email address to tax deadline reminders from ${b.fullName}.

Selected Tax Categories:
${params.categories.map((c) => `- ${c}`).join("\n")}

To confirm your subscription, open this URL in your browser:
${params.confirmUrl}

If you did not request these reminders, you can ignore this email.

---
Physical Office Notice:
Our tax consultation and document composing services are provided in person at:
${b.address}

Phone: ${b.phone}
WhatsApp: ${b.whatsappHref}
`;

  return { subject, html, text };
}

/**
 * 2. Tax Deadline Reminder Email (30-day & 7-day)
 */
export function renderTaxReminderEmail(params: {
  name: string;
  categoryName: string;
  deadlineTitle: string;
  deadlinePeriod: string;
  deadlineDate: string;
  daysRemaining: number;
  officialSourceUrl?: string | null;
  unsubscribeUrl: string;
  business?: BusinessDetails;
}) {
  const b = params.business || DEFAULT_BUSINESS;
  const safeName = params.name ? escapeHtml(params.name) : "Valued Client";
  const safeCat = escapeHtml(params.categoryName);
  const safeTitle = escapeHtml(params.deadlineTitle);
  const safePeriod = escapeHtml(params.deadlinePeriod);
  const safeDate = escapeHtml(params.deadlineDate);
  const safeUnsub = escapeHtml(params.unsubscribeUrl);

  const subject = `Tax return reminder: deadline approaching on ${safeDate}`;

  const urgencyLabel = params.daysRemaining <= 7
    ? "Upcoming Deadline (7 Days Left)"
    : "Advance Reminder (30 Days Left)";
  const urgencyColor = params.daysRemaining <= 7 ? "#b91c1c" : "#0b1d38";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(11, 29, 56, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0b1d38; padding: 28px 32px; text-align: left; border-bottom: 3px solid #c8973d;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">${escapeHtml(b.fullName)}</h1>
              <p style="margin: 4px 0 0 0; color: #d4a44c; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">E-Stamping • FBR Tax Consultations • Legal Documentation</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #f1f5f9; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${urgencyColor}; margin-bottom: 16px;">
                ${urgencyLabel}
              </div>

              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0b1d38; line-height: 1.3;">
                ${safeTitle}
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Dear <strong>${safeName}</strong>,
                <br>This is an automated tax deadline reminder regarding your <strong>${safeCat}</strong> filing obligations.
              </p>

              <!-- Deadline Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Filing Category:</td>
                        <td style="font-size: 14px; font-weight: 600; color: #0b1d38; text-align: right; padding-bottom: 6px;">${safeCat}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Tax Period:</td>
                        <td style="font-size: 14px; font-weight: 600; color: #0b1d38; text-align: right; padding-bottom: 6px;">${safePeriod}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-weight: 700; color: #0b1d38; padding-top: 6px; border-top: 1px dashed #cbd5e1;">Filing Deadline:</td>
                        <td style="font-size: 16px; font-weight: 700; color: #b91c1c; text-align: right; padding-top: 6px; border-top: 1px dashed #cbd5e1;">${safeDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- In-person Office Reminder -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase;">In-Person Assistance Available</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #78350f;">
                  If you need assistance preparing, composing, or filing your documentation before this deadline, please visit our office or reach out to our team in advance to avoid late-filing penalties.
                </p>
              </div>

              <!-- Contact Actions -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="${escapeHtml(b.whatsappHref)}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #25D366;">
                      Chat on WhatsApp
                    </a>
                  </td>
                  <td>
                    <a href="tel:+923057902744" style="display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #0b1d38; text-decoration: none; border-radius: 6px; background-color: #e2e8f0;">
                      Call: ${escapeHtml(b.phone)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Office Address -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 6px 0;">
                <strong>Office Location:</strong> ${escapeHtml(b.address)}
              </p>
              <p style="margin: 0 0 12px 0;">
                <em>Notice: Deadlines are verified against official tax authority announcements. Tax laws and gazette notifications are subject to statutory revisions.</em>
              </p>
              <p style="margin: 0; padding-top: 10px; border-top: 1px solid #cbd5e1;">
                You are receiving this because you subscribed to tax deadline reminders for ${safeCat}.
                <br>
                <a href="${safeUnsub}" style="color: #64748b; text-decoration: underline;">Unsubscribe from these reminders</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Tax Return Reminder: Deadline approaching on ${params.deadlineDate}

Dear ${params.name || "Valued Client"},

This is an automated tax deadline reminder regarding your ${params.categoryName} filing obligations.

Title: ${params.deadlineTitle}
Category: ${params.categoryName}
Tax Period: ${params.deadlinePeriod}
Filing Deadline: ${params.deadlineDate} (${params.daysRemaining} days remaining)

In-Person Assistance:
Our tax consultation and document composing services are provided in person at:
${b.address}

To get assistance before the deadline:
Phone: ${b.phone}
WhatsApp: ${b.whatsappHref}

---
To unsubscribe from these tax reminders, visit:
${params.unsubscribeUrl}
`;

  return { subject, html, text };
}

/**
 * 3. Test Email Template (for Admin-Only Verification)
 */
export function renderTestReminderEmail(params: {
  adminEmail: string;
  categoryName: string;
  deadlineTitle: string;
  deadlinePeriod: string;
  deadlineDate: string;
  daysRemaining: number;
  business?: BusinessDetails;
}) {
  const b = params.business || DEFAULT_BUSINESS;
  const safeDate = escapeHtml(params.deadlineDate);
  const safeTitle = escapeHtml(params.deadlineTitle);
  const safeCat = escapeHtml(params.categoryName);

  const subject = `[TEST REMINDER] Tax deadline test: ${safeTitle} (${safeDate})`;

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px;">
  <div style="max-width: 560px; margin: auto; background: #fff; padding: 24px; border: 1px solid #cbd5e1; border-radius: 8px;">
    <div style="background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 4px; font-weight: bold; margin-bottom: 16px;">
      [ADMINISTRATOR TEST EMAIL]
    </div>
    <h2 style="color: #0b1d38; margin-top: 0;">${safeTitle}</h2>
    <p>This is a live test email sent from the ${escapeHtml(b.fullName)} admin portal.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #64748b;">Category:</td><td style="font-weight: bold;">${safeCat}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Period:</td><td style="font-weight: bold;">${escapeHtml(params.deadlinePeriod)}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Filing Date:</td><td style="font-weight: bold; color: #b91c1c;">${safeDate}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Days Remaining:</td><td style="font-weight: bold;">${params.daysRemaining} days</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Office:</td><td style="font-weight: bold;">${escapeHtml(b.address)}</td></tr>
    </table>
    <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
      Test executed by admin: ${escapeHtml(params.adminEmail)}
    </p>
  </div>
</body>
</html>`;

  const text = `[ADMIN TEST REMINDER]
Title: ${params.deadlineTitle}
Category: ${params.categoryName}
Period: ${params.deadlinePeriod}
Filing Date: ${params.deadlineDate} (${params.daysRemaining} days remaining)
Office: ${b.address}
Sent to admin: ${params.adminEmail}
`;

  return { subject, html, text };
}
