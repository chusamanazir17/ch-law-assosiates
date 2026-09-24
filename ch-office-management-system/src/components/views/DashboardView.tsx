import React from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { IncomeExpenseBarChart } from '../charts/IncomeExpenseBarChart';
import { DonutChart } from '../charts/DonutChart';
import { StatusBadge } from '../common/StatusBadge';
import {
  LayoutGrid,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Plus,
  Minus,
  ArrowRightLeft,
  Lock,
  FileCheck2,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Eye
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    stampStock,
    tasks,
    toggleTaskStatus,
    setIsQuickCashInOpen,
    setIsQuickCashOutOpen,
    setIsTransferModalOpen,
    setIsCloseDayModalOpen,
    setIsStampSaleModalOpen,
    setSelectedReceiptId,
    setActiveSection
  } = useOffice();

  // Compute stats
  const totalBankWallets = accountBalances.bankAccount + accountBalances.jazzCash + accountBalances.easyPaisa;
  const recentTransactions = transactions.slice(0, 6);

  const serviceDonutSegments = [
    { label: 'Income Tax Returns', value: 42, color: '#1473E6' },
    { label: 'Sales Tax Returns', value: 24, color: '#38BDF8' },
    { label: 'E-Stamp Paper', value: 18, color: '#10B981' },
    { label: 'NTN & Reg', value: 10, color: '#F59E0B' },
    { label: 'Legal Composing', value: 6, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<LayoutGrid className="w-6 h-6 text-white" />}
        title="Office Management Dashboard"
        subtitle="Track daily cash flow, payment accounts, stamp inventory, and business transactions."
        breadcrumb={['Office Management', 'Dashboard']}
        quote="“Compliance Today, Growth Tomorrow”"
      >
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsQuickCashInOpen(true)}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cash In</span>
          </button>

          <button
            onClick={() => setIsQuickCashOutOpen(true)}
            className="px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-semibold rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Cash Out</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setIsCloseDayModalOpen(true)}
            className="px-4 py-2.5 bg-[#0B1B2C] hover:bg-[#122B42] text-white text-sm font-semibold rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            <Lock className="w-4 h-4" />
            <span>Close Day</span>
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards Row (4 Columns) with roomier gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="CASH IN OFFICE (DRAWER)"
          value={`Rs. ${accountBalances.cashOffice.toLocaleString()}`}
          subValue="Ready for counter ops"
          change="+12% from yesterday"
          changeType="positive"
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          viewDetailsText="Register"
          onViewDetails={() => setActiveSection('cash')}
        />

        <KpiCard
          label="TODAY'S CASH IN"
          value="Rs. 42,500"
          subValue="22 In | 6 Out"
          change="+18% vs daily avg"
          changeType="positive"
          icon={<ArrowDownLeft className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
          viewDetailsText="Cash In"
          onViewDetails={() => setIsQuickCashInOpen(true)}
        />

        <KpiCard
          label="TODAY'S CASH OUT"
          value="Rs. 8,200"
          subValue="5 expense entries"
          change="-4% within budget"
          changeType="positive"
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          viewDetailsText="Expenses"
          onViewDetails={() => setActiveSection('expenses')}
        />

        <KpiCard
          label="BANK & WALLETS"
          value={`Rs. ${totalBankWallets.toLocaleString()}`}
          subValue="HBL, JazzCash, EasyPaisa"
          change="Reconciled Today"
          changeType="neutral"
          icon={<Landmark className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
          viewDetailsText="Accounts"
          onViewDetails={() => setActiveSection('cash')}
        />
      </div>

      {/* Analytics & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Income vs Expenses Bar Chart (2 columns span) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <IncomeExpenseBarChart height={250} />
        </div>

        {/* Service-wise Breakdown Donut (1 column) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <div className="text-lg font-bold font-heading text-slate-900 mb-2 tracking-tight">Service-wise Income</div>
          <DonutChart
            centerPrimaryText="Rs. 486K"
            centerSecondaryText="Total Revenue"
            segments={serviceDonutSegments}
            size={155}
            strokeWidth={22}
          />
        </div>
      </div>

      {/* Account Status & Stamp Quick Sale Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Accounts Status */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 tracking-tight">Payment Accounts</h3>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="text-xs sm:text-sm text-[#1473E6] hover:text-[#0F62C4] hover:underline font-semibold cursor-pointer transition-colors"
            >
              Transfer Funds &rarr;
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  ₨
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Cash in Office (Drawer)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Physical Register Sahiwal</div>
                </div>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base font-mono">
                Rs. {accountBalances.cashOffice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100/90 dark:border-blue-900/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  HBL
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">HBL Bank Current Account</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Title: CH Composing & Tax</div>
                </div>
              </div>
              <span className="font-bold text-blue-700 dark:text-blue-400 text-base font-mono">
                Rs. {accountBalances.bankAccount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/90 dark:border-amber-900/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  JC
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">JazzCash Wallet</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">0300-1234567 (Chaudhry H.)</div>
                </div>
              </div>
              <span className="font-bold text-amber-800 dark:text-amber-400 text-base font-mono">
                Rs. {accountBalances.jazzCash.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100/90 dark:border-teal-900/40 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  EP
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">EasyPaisa Wallet</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">0345-7654321 (Usama Ali)</div>
                </div>
              </div>
              <span className="font-bold text-teal-800 dark:text-teal-400 text-base font-mono">
                Rs. {accountBalances.easyPaisa.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stamp Stock Status & Fast Sale */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 tracking-tight">Stamp Inventory Alerts</h3>
              <button
                onClick={() => setActiveSection('stamps')}
                className="text-xs sm:text-sm text-[#1473E6] dark:text-[#38BDF8] hover:text-[#0F62C4] hover:underline font-semibold cursor-pointer transition-colors"
              >
                All Stock &rarr;
              </button>
            </div>

            {/* Quick sell buttons */}
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">
                Quick Counter Stamp Sale:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 500, 1000].map(den => (
                  <button
                    key={den}
                    onClick={() => setIsStampSaleModalOpen(true)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-[#1473E6] hover:bg-blue-50/60 dark:hover:bg-slate-800 text-center cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">Rs.{den}</div>
                    <div className="text-xs text-[#1473E6] dark:text-[#38BDF8] font-bold">Issue</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alert List */}
            <div className="space-y-2 text-xs">
              {stampStock
                .filter(s => s.status !== 'OK')
                .map(item => (
                  <div
                    key={item.denomination}
                    className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <div className="text-sm">
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. {item.denomination}</span> Stamp Paper
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-rose-700 dark:text-rose-400 font-bold font-mono">{item.remaining} left</span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={() => setIsStampSaleModalOpen(true)}
            className="w-full mt-4 py-3 bg-[#1473E6] hover:bg-[#0F62C4] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Open Stamp Dispenser</span>
          </button>
        </div>

        {/* Tasks & Upcoming Deadlines */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 tracking-tight">Urgent Tasks & Deadlines</h3>
              <button
                onClick={() => setActiveSection('tasks')}
                className="text-xs sm:text-sm text-[#1473E6] dark:text-[#38BDF8] hover:text-[#0F62C4] hover:underline font-semibold cursor-pointer transition-colors"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {tasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    task.status === 'Completed'
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-[#111C2E] border-slate-200/90 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 shadow-2xs'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'Completed'}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-[#1473E6] cursor-pointer w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-slate-900 dark:text-slate-100 text-sm truncate ${task.status === 'Completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      <span>Due: {task.dueDate}</span>
                      <span>•</span>
                      <span className="text-[#1473E6] dark:text-[#38BDF8] font-semibold">{task.assignedStaff || task.assignedTo || 'Chamber Staff'}</span>
                    </div>
                  </div>
                  <StatusBadge status={task.priority} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 text-center font-normal">
            Click task checkbox to mark as complete in real-time.
          </div>
        </div>
      </div>

      {/* Central Transactions Table (Bottom Section) */}
      <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 tracking-tight">Recent Ledger Transactions</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Real-time audit entries for cash, bank, receipts, and stamp sales
            </p>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs sm:text-sm text-[#1473E6] dark:text-[#38BDF8] hover:text-[#0F62C4] hover:underline font-semibold cursor-pointer transition-colors"
          >
            Full Central Ledger &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A1424] text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Client / Payee</th>
                <th className="py-3.5 px-4">Service / Category</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-sm">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono text-xs">{tx.dateTime}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        tx.type === 'IN'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : tx.type === 'OUT'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {tx.clientOrPayee}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{tx.serviceOrCategory}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">{tx.account}</td>
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap font-mono text-sm">
                    <span className={tx.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : tx.type === 'OUT' ? 'text-rose-600 dark:text-rose-400' : 'text-[#1473E6] dark:text-[#38BDF8]'}>
                      {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : ''} Rs. {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {tx.receiptNo ? (
                      <button
                        onClick={() => {
                          setSelectedReceiptId(tx.receiptNo || null);
                          setActiveSection('receipts');
                        }}
                        className="px-2.5 py-1 hover:bg-blue-50 dark:hover:bg-slate-800 text-[#1473E6] dark:text-[#38BDF8] rounded-md font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-mono">{tx.receiptNo.replace('REC-2025-', '#')}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
