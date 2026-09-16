/**
 * Resend Email Delivery Client with Idempotency and Safe Dev Mode
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Ch Composing Reminders <reminders@chcomposing.pk>";
  const isDevMode = Deno.env.get("DEVELOPMENT_MODE") === "true";
  const devNotificationEmail = Deno.env.get("DEV_NOTIFICATION_EMAIL");

  if (!apiKey) {
    console.warn("[Resend] Missing RESEND_API_KEY. Email skipped in unconfigured environment.");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  // Safe development mode redirect
  let targetTo = options.to;
  let subject = options.subject;
  if (isDevMode) {
    if (!devNotificationEmail) {
      console.warn("[Resend] Safe Dev Mode is active, but DEV_NOTIFICATION_EMAIL is not set. Email skipped.");
      return {
        success: false,
        error: "Development mode active but DEV_NOTIFICATION_EMAIL not configured.",
      };
    }
    subject = `[DEV MODE -> ${options.to}] ${options.subject}`;
    targetTo = devNotificationEmail;
  }

  const reqHeaders: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (options.idempotencyKey) {
    reqHeaders["Idempotency-Key"] = options.idempotencyKey;
  }

  try {
    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: [targetTo],
      subject: subject,
      html: options.html,
      text: options.text || "",
    };

    if (options.headers) {
      payload.headers = options.headers;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMessage = data?.message || `Resend API returned HTTP ${response.status}`;
      return {
        success: false,
        error: errMessage,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email dispatch error";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
