"use client";

import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { exportToCsv } from '../../lib/csv';
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  Landmark,
  Smartphone,
  Users,
  Plus,
  Minus,
  ArrowRightLeft,
  Calendar,
  Search,
  Download,
  CheckCircle2,
  MoreVertical,
  ChevronDown
} from 'lucide-react';

export const CashManagementView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    recordCashIn,
    recordCashOut,
    setIsTransferModalOpen,
    setIsCloseDayModalOpen,
    clients
  } = useOffice();

  // Fast Cash In state
  const [cashInClient, setCashInClient] = useState('');
  const [cashInService, setCashInService] = useState('Income Tax Return');
  const [cashInAmount, setCashInAmount] = useState('');
  const [cashInAccount, setCashInAccount] = useState('cashOffice');
  const [cashInRef, setCashInRef] = useState('');
  const [cashInNotes, setCashInNotes] = useState('');
  const [cashInSuccess, setCashInSuccess] = useState(false);

  // Fast Cash Out state
  const [cashOutCategory, setCashOutCategory] = useState('Office Expense');
  const [cashOutPayee, setCashOutPayee] = useState('');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [cashOutAccount, setCashOutAccount] = useState('cashOffice');
  const [cashOutRef, setCashOutRef] = useState('');
  const [cashOutNotes, setCashOutNotes] = useState('');
  const [cashOutSuccess, setCashOutSuccess] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');

  // Handle Fast Cash In submission
  const handleFastCashIn = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashInAmount);
    if (!amt || amt <= 0 || !cashInClient) return;

    recordCashIn({
      clientName: cashInClient,
      serviceName: cashInService,
      amount: amt,
      account: cashInAccount as any,
      referenceNo: cashInRef,
      notes: cashInNotes,
      staff: 'Usama (Admin)',
      createReceipt: true
    });

    setCashInAmount('');
    setCashInClient('');
    setCashInRef('');
    setCashInNotes('');
    setCashInSuccess(true);
    setTimeout(() => setCashInSuccess(false), 3000);
  };

  // Handle Fast Cash Out submission
  const handleFastCashOut = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashOutAmount);
    if (!amt || amt <= 0 || !cashOutPayee) return;

    recordCashOut({
      category: cashOutCategory,
      payeeDescription: cashOutPayee,
      amount: amt,
      account: cashOutAccount as any,
      referenceNo: cashOutRef,
      notes: cashOutNotes,
      staff: 'Usama (Admin)'
    });

    setCashOutAmount('');
    setCashOutPayee('');
    setCashOutRef('');
    setCashOutNotes('');
    setCashOutSuccess(true);
    setTimeout(() => setCashOutSuccess(false), 3000);
  };

  // Filtered transactions list
  const filteredList = transactions.filter(tx => {
    const matchesSearch =
      tx.clientOrPayee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.serviceOrCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesAccount = accountFilter === 'ALL' || tx.account.toLowerCase().includes(accountFilter.toLowerCase());
    return matchesSearch && matchesType && matchesAccount;
  });

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <PageHeader
        icon={<Wallet className="w-6 h-6 text-white" />}
        title="Cash Management"
        subtitle="Track daily cash flow, payment accounts and business transactions."
        breadcrumb={['Office Management', 'Cash Management']}
        quote="“Compliance Today, Growth Tomorrow”"
      />

      {/* 2. Top 7 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Opening Balance */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Opening Balance</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 38,500</div>
          <div className="text-[10px] text-slate-400 mt-0.5">As of {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>

        {/* Cash In Today */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Cash In Today</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 42,500</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">12 transactions ↑ 12%</div>
        </div>

        {/* Cash Out Today */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowDown className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Cash Out Today</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 8,200</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">8 transactions ↓ 5%</div>
        </div>

        {/* Closing Balance */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Closing Balance</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 72,800</div>
          <div className="text-[10px] text-slate-400 mt-0.5">As of {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>

        {/* Bank Balance */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Bank Balance</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 286,500</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">HBL - Main Account</div>
        </div>

        {/* JazzCash / Easypaisa */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Wallets</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 48,200</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">JC: 28.2k | EP: 20k</div>
        </div>

        {/* Outstanding Collections */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">Outstanding</span>
          </div>
          <div className="text-base font-bold text-rose-600 tabular-nums">Rs. 22,100</div>
          <div className="text-[10px] text-slate-400 mt-0.5">5 clients</div>
        </div>
      </div>

      {/* 3. Quick Cash Entry Action Bar */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <ArrowUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Cash Entry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Create new transactions quickly</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              const el = document.getElementById('fast-cash-in-input');
              el?.focus();
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Cash In</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('fast-cash-out-input');
              el?.focus();
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4" />
            <span>New Cash Out</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => setIsCloseDayModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Close Day</span>
          </button>
        </div>
      </div>

      {/* 4. Transaction Filters Toolbar */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-[#1473E6]" />
          <span>Transaction Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-medium">
            {`${new Date(Date.now() - 6 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="IN">Cash In (Receipts)</option>
            <option value="OUT">Cash Out (Expenses)</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <select
            value={accountFilter}
            onChange={e => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Payment Accounts</option>
            <option value="cash">Cash (Office)</option>
            <option value="bank">HBL Bank</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">EasyPaisa</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs w-36 sm:w-48"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>

          <button
            onClick={() =>
              exportToCsv(
                `cash-transactions-${new Date().toISOString().split('T')[0]}.csv`,
                ['Date', 'Type', 'Description', 'Client/Payee', 'Category', 'Account', 'Amount (PKR)', 'Reference'],
                filteredList.map(tx => [
                  tx.dateTime,
                  tx.type,
                  tx.description,
                  tx.clientOrPayee,
                  tx.serviceOrCategory,
                  tx.account,
                  tx.amount,
                  tx.referenceNo || ''
                ])
              )
            }
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* 5. Dual Fast Action Entry Forms + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: 2 Forms (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fast Cash In (Receive Payment) */}
            <form onSubmit={handleFastCashIn} className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fast Cash In (Receive Payment)</h3>
                    <p className="text-[11px] text-slate-400">Record cash received from clients</p>
                  </div>
                </div>

                {cashInSuccess && (
                  <div className="mb-3 p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Payment recorded & receipt generated successfully!
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Client *</label>
                    <input
                      id="fast-cash-in-input"
                      type="text"
                      required
                      placeholder="Search client by name or CNIC..."
                      value={cashInClient}
                      onChange={e => setCashInClient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Service *</label>
                      <select
                        value={cashInService}
                        onChange={e => setCashInService(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Income Tax Return">Income Tax Return</option>
                        <option value="Sales Tax Return">Sales Tax Return</option>
                        <option value="Stamp Paper">Stamp Paper</option>
                        <option value="Legal Composing">Legal Composing</option>
                        <option value="NTN Registration">NTN Registration</option>
                        <option value="Affidavit / Agreement">Affidavit / Agreement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (Rs.) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={cashInAmount}
                        onChange={e => setCashInAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 tabular-nums font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Account *</label>
                      <select
                        value={cashInAccount}
                        onChange={e => setCashInAccount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="cashOffice">Cash (Office)</option>
                        <option value="bankAccount">HBL Bank</option>
                        <option value="jazzCash">JazzCash</option>
                        <option value="easyPaisa">EasyPaisa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reference No.</label>
                      <input
                        type="text"
                        placeholder="e.g. Receipt No."
                        value={cashInRef}
                        onChange={e => setCashInRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Client payment, advance etc."
                      value={cashInNotes}
                      onChange={e => setCashInNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" /> Receive Cash (Cash In)
              </button>
            </form>

            {/* Fast Cash Out (Make Payment) */}
            <form onSubmit={handleFastCashOut} className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fast Cash Out (Make Payment)</h3>
                    <p className="text-[11px] text-slate-400">Record office expenses and payments</p>
                  </div>
                </div>

                {cashOutSuccess && (
                  <div className="mb-3 p-2 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Expense recorded successfully!
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Category *</label>
                    <select
                      value={cashOutCategory}
                      onChange={e => setCashOutCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Office Expense">Office Expense</option>
                      <option value="Stamp Purchase">Stamp Purchase</option>
                      <option value="Office Rent">Office Rent</option>
                      <option value="Utilities & Electricity">Utilities & Electricity</option>
                      <option value="Stationery & Printing Paper">Stationery & Printing Paper</option>
                      <option value="Staff Salaries">Staff Salaries</option>
                      <option value="Tea & Refreshment">Tea & Refreshment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payee / Description *</label>
                    <input
                      id="fast-cash-out-input"
                      type="text"
                      required
                      placeholder="e.g. Office rent, Internet bill..."
                      value={cashOutPayee}
                      onChange={e => setCashOutPayee(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (Rs.) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={cashOutAmount}
                        onChange={e => setCashOutAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 tabular-nums font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Account *</label>
                      <select
                        value={cashOutAccount}
                        onChange={e => setCashOutAccount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="cashOffice">Cash (Office)</option>
                        <option value="bankAccount">HBL Bank</option>
                        <option value="jazzCash">JazzCash</option>
                        <option value="easyPaisa">EasyPaisa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reference No.</label>
                      <input
                        type="text"
                        placeholder="e.g. Bill No."
                        value={cashOutRef}
                        onChange={e => setCashOutRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Monthly payment..."
                        value={cashOutNotes}
                        onChange={e => setCashOutNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" /> Make Payment (Cash Out)
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Account Balances, Daily Closing, 7-Day Trend */}
        <div className="space-y-4">
          {/* Account Balances */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Account Balances</h3>
              <button onClick={() => setIsTransferModalOpen(true)} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                Transfer &rarr;
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Cash (Office)
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Rs. {accountBalances.cashOffice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Bank Account (HBL)
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Rs. {accountBalances.bankAccount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> JazzCash
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Rs. {accountBalances.jazzCash.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Easypaisa
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Rs. {accountBalances.easyPaisa.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Closing Summary */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Daily Closing ({new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})</h3>
              <button onClick={() => setIsCloseDayModalOpen(true)} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View Details
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Opening Balance</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 38,500</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash In</span>
                <span className="font-bold text-emerald-600 tabular-nums">Rs. 42,500</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash Out</span>
                <span className="font-bold text-rose-600 tabular-nums">Rs. 8,200</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 mt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Closing Balance</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm tabular-nums">Rs. 72,800</span>
              </div>
            </div>
          </div>

          {/* Cash Flow Trend (Last 7 Days) */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Cash Flow Trend</h3>
              <span className="text-[10px] text-slate-400">Last 7 Days</span>
            </div>
            <div className="h-28 flex items-end justify-between gap-1.5 pt-3">
              {[
                { day: '16', inH: 60, outH: 25 },
                { day: '17', inH: 70, outH: 30 },
                { day: '18', inH: 80, outH: 28 },
                { day: '19', inH: 75, outH: 35 },
                { day: '20', inH: 90, outH: 40 },
                { day: '21', inH: 85, outH: 30 },
                { day: '22', inH: 95, outH: 25 },
              ].map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-0.5 h-20">
                    <div style={{ height: `${d.inH}%` }} className="w-2 bg-emerald-500 rounded-t-xs"></div>
                    <div style={{ height: `${d.outH}%` }} className="w-2 bg-rose-500 rounded-t-xs"></div>
                  </div>
                  <span className="text-[9px] text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Transactions Table */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Transactions</h3>
          <span className="text-xs text-slate-400">Showing {filteredList.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Client / Payee</th>
                <th className="py-3 px-3">Service / Category</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3 text-right">Amount (Rs.)</th>
                <th className="py-3 px-3">Staff</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 tabular-nums">{idx + 1}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">{tx.dateTime}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{tx.description}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{tx.clientOrPayee}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{tx.serviceOrCategory}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 capitalize">{tx.account}</td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    <span className={tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{tx.staff || 'Usama'}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      Completed
                    </span>
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
