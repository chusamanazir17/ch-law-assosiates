import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { CashFlowTrendChart } from '../charts/CashFlowTrendChart';
import { StatusBadge } from '../common/StatusBadge';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Wallet,
  Plus,
  Minus,
  ArrowRightLeft,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CashManagementView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    dailyClosing,
    activeSubSection,
    setActiveSubSection,
    setIsQuickCashInOpen,
    setIsQuickCashOutOpen,
    setIsTransferModalOpen,
    setIsCloseDayModalOpen,
    setSelectedReceiptId,
    setActiveSection
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');

  // Sub-tabs
  const currentTab = activeSubSection || 'all';

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      t.clientOrPayee.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.serviceOrCategory.toLowerCase().includes(q) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(q));

    const matchType =
      typeFilter === 'ALL'
        ? true
        : typeFilter === 'IN'
        ? t.type === 'IN'
        : typeFilter === 'OUT'
        ? t.type === 'OUT'
        : t.type === 'TRANSFER';

    const matchAccount =
      accountFilter === 'ALL'
        ? true
        : t.account.toLowerCase().includes(accountFilter.toLowerCase());

    const matchTab =
      currentTab === 'cash-in'
        ? t.type === 'IN'
        : currentTab === 'cash-out'
        ? t.type === 'OUT'
        : true;

    return matchQuery && matchType && matchAccount && matchTab;
  });

  const totalBankWallets = accountBalances.bankAccount + accountBalances.jazzCash + accountBalances.easyPaisa;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<Wallet className="w-6 h-6 text-white" />}
        title="Cash & Treasury Management"
        subtitle="Live multi-account ledger for counter cash, bank deposits, and mobile wallet reconciliations."
        breadcrumb={['Office Management', 'Cash Management']}
        quote="“Precise Accounting, Total Peace of Mind”"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsQuickCashInOpen(true)}
            className="px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cash In</span>
          </button>

          <button
            onClick={() => setIsQuickCashOutOpen(true)}
            className="px-3.5 py-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Cash Out</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setIsCloseDayModalOpen(true)}
            className="px-3.5 py-2 bg-[#0B1B2C] hover:bg-[#122B42] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
          >
            <Lock className="w-4 h-4" />
            <span>Close Day</span>
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="CASH IN OFFICE (REGISTER)"
          value={`Rs. ${accountBalances.cashOffice.toLocaleString()}`}
          subValue="Available Physical Cash"
          change="+12% from yesterday"
          changeType="positive"
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="TODAY'S CASH IN"
          value={`Rs. ${dailyClosing.cashIn.toLocaleString()}`}
          subValue="Client collections"
          change="+18% vs weekly avg"
          changeType="positive"
          icon={<ArrowDownLeft className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="TODAY'S CASH OUT"
          value={`Rs. ${dailyClosing.cashOut.toLocaleString()}`}
          subValue="Office expenses"
          change="5 logged today"
          changeType="neutral"
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <KpiCard
          label="BANK & WALLETS TOTAL"
          value={`Rs. ${totalBankWallets.toLocaleString()}`}
          subValue="HBL, Jazz, EP"
          change="All Reconciled"
          changeType="positive"
          icon={<Landmark className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Account Balances Grid & 7-Day Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Accounts Detailed Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Connected Accounts & Vaults</h3>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="text-xs text-[#1473E6] hover:text-[#0F62C4] hover:underline font-semibold cursor-pointer transition-colors"
            >
              Move Funds &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-700">Office Counter Register</span>
                <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-100/60 px-2 py-0.5 rounded">Ready</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                Rs. {accountBalances.cashOffice.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1.5">Chamber 121 Cash Drawer</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/90 dark:border-blue-900/40 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">HBL Bank Current Account</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider bg-blue-100/60 dark:bg-blue-950/50 px-2 py-0.5 rounded">Online</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                Rs. {accountBalances.bankAccount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">Title: CH Composing & Tax Advisor</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/90 dark:border-amber-900/40 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">JazzCash Merchant Wallet</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider bg-amber-100/60 dark:bg-amber-950/50 px-2 py-0.5 rounded">Mobile</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                Rs. {accountBalances.jazzCash.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">0300-1234567 (Chaudhry H.)</div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100/90 dark:border-teal-900/40 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">EasyPaisa Digital Wallet</span>
                <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider bg-teal-100/60 dark:bg-teal-950/50 px-2 py-0.5 rounded">Mobile</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                Rs. {accountBalances.easyPaisa.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">0345-7654321 (Usama Ali)</div>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <CashFlowTrendChart height={190} />
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Daily target: Rs. 35,000</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md">Healthy Flow</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        {[
          { key: '', label: 'All Transactions' },
          { key: 'cash-in', label: 'Cash In' },
          { key: 'cash-out', label: 'Cash Out' },
          { key: 'daily-closing', label: 'Daily Closing Register' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubSection(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              currentTab === tab.key
                ? 'bg-[#1473E6] text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Daily Closing View */}
      {currentTab === 'daily-closing' ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daily Register Closing: {dailyClosing.date}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                End-of-day cash reconciliation and discrepancy audit log
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={dailyClosing.isClosed ? 'Closed & Locked' : 'Open (Active)'} />
              <button
                onClick={() => setIsCloseDayModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#0B1B2C] hover:bg-[#122B42] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{dailyClosing.isClosed ? 'View / Reopen' : 'Close Today\'s Register'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs">
              <div className="text-slate-500 font-medium mb-1">Opening Cash (Start of Day)</div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                Rs. {(dailyClosing.openingBalance ?? 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl shadow-2xs">
              <div className="text-emerald-700 font-medium mb-1">Total Cash In Received</div>
              <div className="text-lg font-bold text-emerald-800 font-mono">
                + Rs. {dailyClosing.cashIn.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl shadow-2xs">
              <div className="text-rose-700 font-medium mb-1">Total Cash Out Paid</div>
              <div className="text-lg font-bold text-rose-800 font-mono">
                - Rs. {dailyClosing.cashOut.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/90 rounded-xl shadow-2xs">
              <div className="text-[#1473E6] font-semibold mb-1">Expected In Drawer</div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                Rs. {dailyClosing.expectedCash.toLocaleString()}
              </div>
            </div>
          </div>

          {dailyClosing.actualCash !== undefined && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Physical Cash Counted: </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  Rs. {dailyClosing.actualCash.toLocaleString()}
                </span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-slate-500 font-medium">Variance / Difference: </span>
                <span className={`font-bold text-sm font-mono ${dailyClosing.difference === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rs. {dailyClosing.difference?.toLocaleString()}
                </span>
              </div>
              {dailyClosing.discrepancyReason && (
                <div className="text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md text-[11px] font-medium">
                  <strong>Reason:</strong> {dailyClosing.discrepancyReason}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Central Transaction Ledger Table */
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search description, client, receipt #..."
                  className="w-full h-8 pl-8 pr-3 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1473E6]"
              >
                <option value="ALL">All Types</option>
                <option value="IN">Cash In (Income)</option>
                <option value="OUT">Cash Out (Expense)</option>
                <option value="TRANSFER">Transfer</option>
              </select>

              <select
                value={accountFilter}
                onChange={e => setAccountFilter(e.target.value)}
                className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#1473E6]"
              >
                <option value="ALL">All Accounts</option>
                <option value="cash">Cash Office</option>
                <option value="bank">HBL Bank</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setAccountFilter('ALL');
                }}
                className="h-8 px-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-xs cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Client / Payee</th>
                  <th className="py-2.5 px-3">Service / Category</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-3">Staff</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">{tx.dateTime}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tx.type === 'IN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.type === 'OUT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {tx.clientOrPayee}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{tx.serviceOrCategory}</td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize whitespace-nowrap">{tx.account}</td>
                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap font-mono">
                      <span
                        className={
                          tx.type === 'IN'
                            ? 'text-emerald-600'
                            : tx.type === 'OUT'
                            ? 'text-rose-600'
                            : 'text-[#1473E6]'
                        }
                      >
                        {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : ''} Rs.{' '}
                        {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{tx.staff}</td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {tx.receiptNo ? (
                        <button
                          onClick={() => {
                            setSelectedReceiptId(tx.receiptNo || null);
                            setActiveSection('receipts');
                          }}
                          className="px-2 py-1 hover:bg-blue-50 text-[#1473E6] rounded-md font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px]">{tx.receiptNo.replace('REC-2025-', '#')}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
