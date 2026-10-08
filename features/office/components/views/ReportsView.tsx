import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { IncomeExpenseBarChart } from '../charts/IncomeExpenseBarChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { exportToCsv } from '../../lib/csv';
import { pkMonthKey, pkMonthKeyLabel, parseLedgerDate, pkIsoDate } from '../utils/pkDates';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  PieChart,
  Award
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    receipts,
    stampStock,
    taxCases,
    clients,
    tasks
  } = useOffice();

  const [activeReportTab, setActiveReportTab] = useState<
    'executive' | 'pnl' | 'cashflow' | 'stamp' | 'clients' | 'staff'
  >('executive');

  // Compute Financials — from the live Supabase-backed context
  const incomeTx = transactions.filter(t => t.type === 'IN');
  const expenseTx = transactions.filter(t => t.type === 'OUT');
  const totalRevenue = incomeTx.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpense = expenseTx.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;
  const totalStockValue = stampStock.reduce((acc, s) => acc + s.stockValue, 0);
  const totalOutstanding = clients.reduce((acc, c) => acc + Number(c.outstanding || 0), 0);
  const outstandingClients = clients.filter(c => Number(c.outstanding || 0) > 0).length;

  // Revenue by category (from live IN transactions)
  const revByCategory = (() => {
    const map = new Map<string, number>();
    incomeTx.forEach(t => {
      const key = t.serviceOrCategory || 'Other';
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
    });
    const colors = ['bg-[#B8832A]', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500'];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount], idx) => ({
        name,
        pct: totalRevenue > 0 ? `${Math.round((amount / totalRevenue) * 100)}%` : '0%',
        amount: `Rs. ${amount.toLocaleString()}`,
        color: colors[idx % colors.length]
      }));
  })();

  // Income vs Expenses chart data — grouped per day from live transactions
  const incomeExpenseChartData = (() => {
    const byDate = new Map<string, { income: number; expense: number }>();
    transactions.forEach(t => {
      const label = t.dateTime || '';
      const key = label.includes(' ') ? label.split(' ')[0] : label;
      const entry = byDate.get(key) || { income: 0, expense: 0 };
      if (t.type === 'IN') entry.income += Number(t.amount || 0);
      else entry.expense += Number(t.amount || 0);
      byDate.set(key, entry);
    });
    return Array.from(byDate.entries())
      .slice(-8)
      .map(([label, v]) => ({ label: label.slice(0, 6), ...v }));
  })();

  // Top revenue-contributing clients (by lifetime billing)
  const topClients = [...clients]
    .sort((a, b) => Number(b.totalBilling || 0) - Number(a.totalBilling || 0))
    .slice(0, 5)
    .map(c => ({
      name: c.name,
      cases: c.documents?.length || 0,
      invoiced: Number(c.totalBilling || 0),
      paid: Number(c.paidAmount || 0),
      bal: Number(c.outstanding || 0)
    }));

  // Staff performance from the live task list.
  // Note: turnaround-in-days is not derivable from the task data we have, so
  // it is shown as "—" rather than a fabricated figure (FIN-09).
  const staffRanking = (() => {
    const byStaff = new Map<string, { role: string; completed: number; pending: number }>();
    tasks.forEach(t => {
      const key = t.assignedStaff || 'Unassigned';
      const entry = byStaff.get(key) || { role: 'Staff', completed: 0, pending: 0 };
      if (t.status === 'Completed') entry.completed += 1; else entry.pending += 1;
      byStaff.set(key, entry);
    });
    const uniqueStaff = byStaff.size;
    const ranked = Array.from(byStaff.entries())
      .sort((a, b) => b[1].completed - a[1].completed)
      .slice(0, 5)
      .map(([staff, s]) => ({
        staff,
        role: s.role,
        completed: s.completed,
        pending: s.pending,
        turnaround: '—',
        score: s.completed + s.pending > 0 ? `${Math.round((s.completed / (s.completed + s.pending)) * 100)}%` : '—'
      }));
    return { ranked, uniqueStaff };
  })();

  // Monthly income for the last 6 months (live ledger, PK timezone) — replaces
  // the old hardcoded "1,840 Units" demo chart.
  const monthlyRevenue = (() => {
    const buckets = new Map<string, number>();
    const d = new Date();
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const dd = new Date(d.getFullYear(), d.getMonth() - i, 15);
      const key = pkMonthKey(dd);
      keys.push(key);
      buckets.set(key, 0);
    }
    incomeTx.forEach(t => {
      const parsed = parseLedgerDate(t.dateTime);
      if (!parsed) return;
      const key = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + Number(t.amount || 0));
    });
    return keys.map(k => ({ month: pkMonthKeyLabel(k), value: buckets.get(k) || 0 }));
  })();

  // Real growth: second-half vs first-half of the charted daily buckets.
  const incomeGrowth = (() => {
    const buckets = incomeExpenseChartData.map(b => b.income);
    if (buckets.length < 4) return null;
    const half = Math.floor(buckets.length / 2);
    const prev = buckets.slice(0, half).reduce((a, v) => a + v, 0);
    const curr = buckets.slice(half).reduce((a, v) => a + v, 0);
    if (prev <= 0) return curr > 0 ? 100 : null;
    return Math.round(((curr - prev) / prev) * 100);
  })();

  // Collection channels derived from the live IN ledger by account.
  const channelSplit = (() => {
    let cash = 0, bank = 0, wallets = 0;
    incomeTx.forEach(t => {
      const a = String(t.account || '').toLowerCase();
      const amt = Number(t.amount || 0);
      if (a.includes('bank') || a.includes('hbl') || a.includes('meezan')) bank += amt;
      else if (a.includes('jazz') || a.includes('easy') || a.includes('paisa') || a.includes('raast')) wallets += amt;
      else cash += amt;
    });
    const total = cash + bank + wallets;
    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
    return {
      total,
      cash: { pct: pct(cash), amount: cash },
      bank: { pct: pct(bank), amount: bank },
      wallets: { pct: pct(wallets), amount: wallets },
    };
  })();

  // P&L line items grouped from live transactions — no hardcoded figures.
  const groupByCategory = (txs: typeof transactions) => {
    const map = new Map<string, number>();
    txs.forEach(t => {
      const key = t.serviceOrCategory || t.description || 'Other';
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  };
  const revenueLines = groupByCategory(incomeTx);
  const expenseLines = groupByCategory(expenseTx);
  const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : null;

  const handlePrint = () => {
    window.print();
  };

  // Real CSV export of the active report tab (the header button is labelled
  // "Export CSV" — it must export, not print).
  const handleExportCsv = () => {
    if (activeReportTab === 'pnl') {
      exportToCsv(`pnl-statement-${pkIsoDate()}.csv`, ['Section', 'Line Item', 'Amount (PKR)'], [
        ...revenueLines.map(([n, a]) => ['Revenue', n, a] as Array<string | number>),
        ['Revenue', 'TOTAL GROSS REVENUE', totalRevenue],
        ...expenseLines.map(([n, a]) => ['Expense', n, a] as Array<string | number>),
        ['Expense', 'TOTAL OPERATING EXPENSES', totalExpense],
        ['Result', 'NET OPERATING SURPLUS', netProfit],
      ]);
    } else if (activeReportTab === 'cashflow') {
      exportToCsv(`cash-balances-${pkIsoDate()}.csv`, ['Account', 'Balance (PKR)'], [
        ['Cash (Office)', accountBalances.cashOffice || 0],
        ['Bank (HBL)', accountBalances.bankAccount || 0],
        ['JazzCash', accountBalances.jazzCash || 0],
        ['EasyPaisa', accountBalances.easyPaisa || 0],
      ]);
    } else if (activeReportTab === 'stamp') {
      exportToCsv(`stamp-inventory-${pkIsoDate()}.csv`, ['Denomination', 'Purchased', 'Sold', 'In Vault', 'Valuation (PKR)'], stampStock.map(s => [
        s.denomination, s.purchased || 0, s.sold || 0, s.remaining || 0, s.stockValue || 0,
      ]));
    } else if (activeReportTab === 'clients') {
      exportToCsv(`client-accounts-${pkIsoDate()}.csv`, ['Client', 'Phone', 'Type', 'Total Invoiced', 'Balance Due'], clients.map(c => [
        c.name, c.mobile || c.phone || 'N/A', c.businessType || c.type || 'Individual', c.totalBilling || 0, c.outstanding || 0,
      ]));
    } else if (activeReportTab === 'staff') {
      exportToCsv(`staff-sla-${pkIsoDate()}.csv`, ['Staff', 'Completed', 'Pending', 'SLA Score'], staffRanking.ranked.map(s => [
        s.staff, s.completed, s.pending, s.score,
      ]));
    } else {
      exportToCsv(`transactions-${pkIsoDate()}.csv`, ['Date', 'Type', 'Description', 'Client/Payee', 'Category', 'Account', 'Amount (PKR)'], transactions.map(t => [
        t.dateTime || '', t.type, t.description || '', t.clientOrPayee || '', t.serviceOrCategory || '', t.account || '', t.amount || 0,
      ]));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        title="Reports, Intelligence & Analytics"
        subtitle="Audited P&L statements, multi-account cash balances, stamp inventory turnover, and tax compliance metrics."
        breadcrumb={['Office Management', 'Reports & Analytics']}
        quote="“Clarity in Numbers, Confidence in Strategy”"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#DCE6F1] text-slate-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#B8832A] hover:bg-[#96691B] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Statement</span>
          </button>
        </div>
      </PageHeader>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Gross Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          subValue="Recorded inflows to date"
          change={`${incomeTx.length} collections`}
          changeType="neutral"
          icon={<DollarSign className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#B8832A]"
        />
        <KpiCard
          label="Op. Expenses"
          value={`Rs. ${totalExpense.toLocaleString()}`}
          subValue="Chamber overheads & paper"
          change="Within budget"
          changeType="neutral"
          icon={<TrendingDown className="w-4 h-4" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="Net Profit"
          value={`Rs. ${netProfit.toLocaleString()}`}
          subValue={netMargin !== null ? `${netMargin}% net margin` : 'Margin unavailable'}
          change={netProfit >= 0 ? 'Surplus' : 'Deficit'}
          changeType={netProfit >= 0 ? 'positive' : 'negative'}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Outstanding"
          value={`Rs. ${totalOutstanding.toLocaleString()}`}
          subValue={`${outstandingClients} clients pending`}
          change={totalRevenue > 0 ? `${Math.round((1 - totalOutstanding / Math.max(1, totalRevenue)) * 100)}% collected` : "No data yet"}
          changeType="neutral"
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Stamp Asset"
          value={`Rs. ${totalStockValue.toLocaleString()}`}
          subValue="Liquid inventory in safe"
          change="Current cost value"
          changeType="neutral"
          icon={<Wallet className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Avg Turnaround"
          value="—"
          subValue="Completion-time data unavailable"
          change="Turnaround tracking not set up"
          changeType="neutral"
          icon={<Award className="w-4 h-4" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Sub Navigation Tabs — pinned while report content scrolls */}
      <div className="sticky-subbar -mx-1 px-1 flex items-center gap-1.5 py-2.5 border-b border-slate-200 dark:border-slate-700/80 rounded-t-xl overflow-x-auto no-scrollbar">
        {[
          { key: 'executive', label: 'Executive Analytics' },
          { key: 'pnl', label: 'Profit & Loss Statement' },
          { key: 'cashflow', label: 'Treasury & Cash Flow' },
          { key: 'stamp', label: 'Stamp Inventory Turnover' },
          { key: 'clients', label: 'Client Accounts Intelligence' },
          { key: 'staff', label: 'Staff Performance SLA' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReportTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeReportTab === tab.key
                ? 'bg-[#B8832A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Executive Analytics (Default with 4 Charts + 2 Tables) */}
      <div className="pt-4">
      {activeReportTab === 'executive' && (
        <div className="space-y-6">
          {/* 4 Analytics Visual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chart 1: Revenue vs Expense Trend */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-[#0D2344]">6-Month Revenue vs Expense Performance</h4>
                  <p className="text-[10px] text-slate-400">Monthly fiscal trajectory</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${incomeGrowth === null ? 'text-slate-500 bg-slate-100' : incomeGrowth >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {incomeGrowth === null ? '— Growth data' : `${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth}% Period Growth`}
                </span>
              </div>
              <div className="h-48 pt-2">
                {incomeExpenseChartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">
                    No transactions recorded yet — the chart will populate from live data
                  </div>
                ) : (
                  <IncomeExpenseBarChart data={incomeExpenseChartData} />
                )}
              </div>
            </div>

            {/* Chart 2: Revenue Stream Breakdown */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-[#0D2344]">Revenue Sources Breakdown</h4>
                  <p className="text-[10px] text-slate-400">Departmental contributions</p>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Rs. {totalRevenue.toLocaleString()} Total</span>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                {revByCategory.map(item => (
                  <div key={item.name}>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-[#0D2344] tabular-nums">{item.amount} ({item.pct})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Payment Collection Channels */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-[#0D2344]">Payment Collection Channels</h4>
                  <p className="text-[10px] text-slate-400">Cash vs Electronic settlements</p>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{incomeTx.length} transactions</span>
              </div>
              {channelSplit.total <= 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No income recorded yet — channels will split here from live data
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Cash at Desk</div>
                    <div className="text-lg font-black text-[#0D2344] mt-1">{channelSplit.cash.pct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rs. {channelSplit.cash.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Bank Direct</div>
                    <div className="text-lg font-black text-[#0D2344] mt-1">{channelSplit.bank.pct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rs. {channelSplit.bank.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                    <div className="text-[10px] font-bold text-purple-700 uppercase">Wallets / Raast</div>
                    <div className="text-lg font-black text-[#0D2344] mt-1">{channelSplit.wallets.pct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rs. {channelSplit.wallets.amount.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart 4: Monthly Income Performance — live ledger, last 6 months */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-[#0D2344]">Monthly Income Trend</h4>
                  <p className="text-[10px] text-slate-400">Live income, last 6 months</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {monthlyRevenue.every(m => m.value === 0)
                    ? 'No data yet'
                    : `Rs. ${monthlyRevenue.reduce((a, m) => a + m.value, 0).toLocaleString()} (6 mo)`}
                </span>
              </div>
              <div className="h-44 pt-2">
                <MonthlyBarChart data={monthlyRevenue} />
              </div>
            </div>
          </div>

          {/* Performance Ranking Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Revenue Clients */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2">
                <h4 className="font-bold text-[#0D2344] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Top Revenue Contributing Clients</span>
                </h4>
                <span className="text-[10px] text-slate-400">This Fiscal Year</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5">Client / Firm</th>
                      <th className="py-2 px-2.5 text-center">Cases</th>
                      <th className="py-2 px-2.5 text-right">Invoiced</th>
                      <th className="py-2 px-2.5 text-right">Paid</th>
                      <th className="py-2 px-2.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {topClients.map(c => (
                      <tr key={c.name} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5 font-bold text-[#0D2344]">{c.name}</td>
                        <td className="py-2.5 px-2.5 text-center text-slate-600">{c.cases}</td>
                        <td className="py-2.5 px-2.5 text-right text-slate-700">{c.invoiced}</td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-emerald-600">{c.paid}</td>
                        <td className="py-2.5 px-2.5 text-right tabular-nums font-bold text-rose-600">{c.bal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Performance Ranking */}
            <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2">
                <h4 className="font-bold text-[#0D2344] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#B8832A]" />
                  <span>Staff Case Filing & SLA Compliance</span>
                </h4>
                <span className="text-[10px] text-slate-400">{staffRanking.uniqueStaff > 0 ? `${staffRanking.uniqueStaff} staff tracked` : 'No staff data yet'}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5">Staff Associate</th>
                      <th className="py-2 px-2.5 text-center">Completed</th>
                      <th className="py-2 px-2.5 text-center">Pending</th>
                      <th className="py-2 px-2.5 text-center">Turnaround</th>
                      <th className="py-2 px-2.5 text-center">SLA Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {staffRanking.ranked.map(s => (
                      <tr key={s.staff} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2.5">
                          <div className="font-bold text-[#0D2344]">{s.staff}</div>
                          <div className="text-[10px] text-slate-400">{s.role}</div>
                        </td>
                        <td className="py-2.5 px-2.5 text-center font-bold text-emerald-600">{s.completed}</td>
                        <td className="py-2.5 px-2.5 text-center text-slate-600">{s.pending}</td>
                        <td className="py-2.5 px-2.5 text-center tabular-nums text-slate-700">{s.turnaround}</td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {s.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Profit & Loss Statement */}
      {activeReportTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D2344]">Statement of Profit and Loss</h3>
              <p className="text-xs text-slate-500">For the period ended {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })} • Currency: PKR</p>
            </div>
            <div className="text-right text-xs font-semibold text-slate-600">
              Chamber No. 121, Kachahri Sahiwal
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 mb-2">
                1. Operating Revenue
              </div>
              <div className="space-y-1.5 pl-2 font-medium">
                {revenueLines.length === 0 ? (
                  <div className="py-3 text-center text-slate-400">No revenue lines recorded yet</div>
                ) : (
                  revenueLines.map(([name, amount]) => (
                    <div key={name} className="flex justify-between text-slate-700">
                      <span>{name}</span>
                      <span className="font-semibold tabular-nums">Rs. {amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Gross Revenue</span>
                  <span className="text-blue-700">Rs. {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 mb-2">
                2. Operating Expenses
              </div>
              <div className="space-y-1.5 pl-2 font-medium">
                {expenseLines.length === 0 ? (
                  <div className="py-3 text-center text-slate-400">No expense lines recorded yet</div>
                ) : (
                  expenseLines.map(([name, amount]) => (
                    <div key={name} className="flex justify-between text-slate-700">
                      <span>{name}</span>
                      <span className="font-semibold tabular-nums">Rs. {amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Operating Expenses</span>
                  <span className="text-rose-700">- Rs. {totalExpense.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-sm">
              <span className="font-bold text-emerald-900">Net Operating Surplus (Profit):</span>
              <span className="font-black text-emerald-800 text-base">
                Rs. {netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Treasury & Cash Flow */}
      {activeReportTab === 'cashflow' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0D2344]">Multi-Account Liquid Reserves</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-500">Cash in Office Drawer</div>
              <div className="text-lg font-bold text-[#0D2344] mt-1">
                Rs. {accountBalances.cashOffice.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="text-blue-700">HBL Bank Current Account</div>
              <div className="text-lg font-bold text-blue-900 mt-1">
                Rs. {accountBalances.bankAccount.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="text-amber-800">JazzCash Digital Wallet</div>
              <div className="text-lg font-bold text-amber-900 mt-1">
                Rs. {accountBalances.jazzCash.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
              <div className="text-teal-800">EasyPaisa Digital Wallet</div>
              <div className="text-lg font-bold text-teal-900 mt-1">
                Rs. {accountBalances.easyPaisa.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stamp Inventory Turnover */}
      {activeReportTab === 'stamp' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#0D2344]">Stamp Inventory Audit & Valuation</h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Denomination</th>
                  <th className="py-2.5 px-3 text-center">Purchased</th>
                  <th className="py-2.5 px-3 text-center">Sold</th>
                  <th className="py-2.5 px-3 text-center">In Vault</th>
                  <th className="py-2.5 px-3 text-right">Valuation (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stampStock.map(s => (
                  <tr key={s.denomination}>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Rs. {s.denomination} Stamp</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{s.purchased}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{s.sold}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700">{s.remaining}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      Rs. {s.stockValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Client Intelligence */}
      {activeReportTab === 'clients' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#0D2344]">Client Accounts & Recovery Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Client</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Total Invoiced</th>
                  <th className="py-2 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {clients.map(c => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-[#0D2344]">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 tabular-nums">{c.mobile || c.phone || 'N/A'}</td>
                    <td className="py-2.5 px-3">{c.businessType || c.type || 'Individual'}</td>
                    <td className="py-2.5 px-3 text-right">Rs. {(c.totalBilling || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">Rs. {(c.outstanding || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Staff Performance */}
      {activeReportTab === 'staff' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#0D2344]">Chamber Staff & Associate Operational SLA</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">Designation</th>
                  <th className="py-2 px-3 text-center">Cases Completed</th>
                  <th className="py-2 px-3 text-center">Pending Files</th>
                  <th className="py-2 px-3 text-center">Turnaround</th>
                  <th className="py-2 px-3 text-center">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {staffRanking.ranked.map(s => (
                  <tr key={s.staff}>
                    <td className="py-2.5 px-3 font-bold text-[#0D2344]">{s.staff}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.role}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{s.completed}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{s.pending}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-slate-700">{s.turnaround}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {s.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
