// Supabase Edge Function: send-test-reminder
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { renderTestReminderEmail } from "../_shared/emailTemplates.ts";
import { sendEmail } from "../_shared/resendClient.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseAdmin();

    // 1. Verify User from JWT
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid admin session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminEmail = userData.user.email;
    const adminId = userData.user.id;

    // 2. Verify Admin Membership
    const { data: isAdmin } = await supabase.rpc("is_admin", { p_user_id: adminId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized. Admin privileges required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { deadline_id, reminder_interval = "7_days" } = body;

    if (!deadline_id) {
      return new Response(JSON.stringify({ error: "Missing deadline_id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Fetch Deadline Details
    const { data: deadline, error: dlErr } = await supabase
      .from("tax_deadlines")
      .select(`
        id,
        title,
        tax_year_or_period,
        filing_deadline,
        tax_categories ( name )
      `)
      .eq("id", deadline_id)
      .single();

    if (dlErr || !deadline) {
      return new Response(JSON.stringify({ error: "Deadline not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const daysRemaining = reminder_interval === "30_days" ? 30 : 7;
    const categoryName = (deadline.tax_categories as any)?.name || "General Tax";

    const emailContent = renderTestReminderEmail({
      adminEmail,
      categoryName,
      deadlineTitle: deadline.title,
      deadlinePeriod: deadline.tax_year_or_period,
      deadlineDate: deadline.filing_deadline,
      daysRemaining,
    });

    // Send strictly to administrator's verified email
    const result = await sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error || "Failed to dispatch test email." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test email sent successfully to ${adminEmail}`,
        messageId: result.messageId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("[Test Email Error]", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unable to process test email request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
