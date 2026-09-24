import { createClient } from "@/lib/supabase/server";

export interface OfficeDashboardStats {
  totalClients: number;
  activeCases: number;
  hearingsToday: number;
  hearingsThisWeek: number;
  unpaidInvoicesCount: number;
  totalReceivable: number;
  totalCashBalance: number;
  todayCashIn: number;
  todayCashOut: number;
  stampLowStockCount: number;
  pendingTasksCount: number;
  activeTaxCasesCount: number;
  pendingServiceOrdersCount: number;
  recentHearings: any[];
  recentTransactions: any[];
  recentCases: any[];
}

export async function getOfficeDashboardStats(): Promise<OfficeDashboardStats> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // 7 days from now
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().split("T")[0];

  // Run queries in parallel
  const [
    clientsRes,
    casesRes,
    hearingsTodayRes,
    hearingsWeekRes,
    invoicesRes,
    accountsRes,
    todayLedgerRes,
    stampsRes,
    tasksRes,
    taxCasesRes,
    serviceOrdersRes,
    recentHearingsRes,
    recentTxRes,
    recentCasesRes,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("hearings").select("id", { count: "exact", head: true }).eq("hearing_date", today),
    supabase.from("hearings").select("id", { count: "exact", head: true }).gte("hearing_date", today).lte("hearing_date", nextWeek),
    supabase.from("invoices").select("total_amount, paid_amount, status").neq("status", "paid"),
    supabase.from("payment_accounts").select("current_balance").eq("active", true),
    supabase.from("financial_ledger").select("entry_type, amount").gte("created_at", `${today}T00:00:00.000Z`),
    supabase.from("stamp_products").select("current_stock, minimum_stock").eq("active", true),
    supabase.from("tasks").select("id", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
    supabase.from("tax_cases").select("id", { count: "exact", head: true }).neq("status", "Completed"),
    supabase.from("service_orders").select("id", { count: "exact", head: true }).in("status", ["Pending", "In Progress"]),
    supabase
      .from("hearings")
      .select(`
        id, hearing_date, purpose, status, court_room, judge_name,
        case:cases(case_number, title)
      `)
      .gte("hearing_date", today)
      .order("hearing_date", { ascending: true })
      .limit(5),
    supabase
      .from("financial_ledger")
      .select(`
        id, created_at, entry_type, amount, category, description,
        account:payment_accounts(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("cases")
      .select("id, case_number, title, court_name, stage, status, filing_date")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Compute receivables
  let unpaidCount = 0;
  let totalReceivable = 0;
  if (invoicesRes.data) {
    for (const inv of invoicesRes.data) {
      if (inv.status !== "paid" && inv.status !== "cancelled") {
        unpaidCount++;
        totalReceivable += (Number(inv.total_amount) - Number(inv.paid_amount));
      }
    }
  }

  // Compute total balance
  const totalCashBalance = (accountsRes.data || []).reduce(
    (sum, a) => sum + Number(a.current_balance || 0),
    0
  );

  // Compute today cash in / out
  let todayCashIn = 0;
  let todayCashOut = 0;
  if (todayLedgerRes.data) {
    for (const tx of todayLedgerRes.data) {
      if (tx.entry_type === "credit") todayCashIn += Number(tx.amount || 0);
      if (tx.entry_type === "debit") todayCashOut += Number(tx.amount || 0);
    }
  }

  // Compute low stamp products
  const stampLowStockCount = (stampsRes.data || []).filter(
    (s) => s.current_stock <= s.minimum_stock
  ).length;

  return {
    totalClients: clientsRes.count || 0,
    activeCases: casesRes.count || 0,
    hearingsToday: hearingsTodayRes.count || 0,
    hearingsThisWeek: hearingsWeekRes.count || 0,
    unpaidInvoicesCount: unpaidCount,
    totalReceivable,
    totalCashBalance,
    todayCashIn,
    todayCashOut,
    stampLowStockCount,
    pendingTasksCount: tasksRes.count || 0,
    activeTaxCasesCount: taxCasesRes.count || 0,
    pendingServiceOrdersCount: serviceOrdersRes.count || 0,
    recentHearings: (recentHearingsRes.data || []).map((row: any) => ({
      ...row,
      case_number: row.case?.case_number,
      case_title: row.case?.title,
    })),
    recentTransactions: (recentTxRes.data || []).map((row: any) => ({
      ...row,
      account_name: row.account?.name,
    })),
    recentCases: recentCasesRes.data || [],
  };
}
