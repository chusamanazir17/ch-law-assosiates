"use client";

import React from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  BarChart2,
  Monitor,
  FileText,
  Clock,
  Users,
  Plus,
  Minus,
  FileCheck2,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Calendar,
  ChevronRight,
  Landmark
} from 'lucide-react';
import Image from 'next/image';

export const DashboardView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    stampStock,
    setIsQuickCashInOpen,
    setIsQuickCashOutOpen,
    setIsTransferModalOpen,
    setIsCloseDayModalOpen,
    setIsStampSaleModalOpen,
    setActiveSection,
    setSelectedReceiptId
  } = useOffice();

  // Top recent transactions
  const displayTransactions = [
    { id: 1, dateTime: '22-09-2025 11:45 AM', client: 'Muhammad Ali', service: 'Income Tax Return', type: 'IN', amount: 5000 },
    { id: 2, dateTime: '22-09-2025 11:20 AM', client: 'Cash Sale', service: 'Stamp Paper', type: 'IN', amount: 2800 },
    { id: 3, dateTime: '22-09-2025 10:55 AM', client: 'Office', service: 'Tea & Refreshment', type: 'OUT', amount: 300 },
    { id: 4, dateTime: '22-09-2025 10:30 AM', client: 'Ahsan Traders', service: 'Composing', type: 'IN', amount: 1200 },
    { id: 5, dateTime: '22-09-2025 09:50 AM', client: 'Stamp Purchase', service: 'Stamp Purchase', type: 'OUT', amount: 5000 },
  ];

  // Outstanding clients
  const outstandingClients = [
    { client: 'Muhammad Aslam', service: 'Income Tax Return', total: 5000, paid: 3000, balance: 2000 },
    { client: 'Zara Enterprises', service: 'Sales Tax Return', total: 12000, paid: 6000, balance: 6000 },
    { client: 'Ahsan Traders', service: 'Composing', total: 2500, paid: 1000, balance: 1500 },
    { client: 'Bilal Ahmed', service: 'NTN Registration', total: 8000, paid: 0, balance: 8000 },
  ];

  // Stamp stock
  const stampStockDisplay = [
    { den: 'Rs. 50', stock: 12, status: 'Low', color: 'bg-amber-100 text-amber-800' },
    { den: 'Rs. 100', stock: 3, status: 'Critical', color: 'bg-rose-100 text-rose-800' },
    { den: 'Rs. 500', stock: 25, status: 'OK', color: 'bg-emerald-100 text-emerald-800' },
    { den: 'Rs. 1,000', stock: 18, status: 'Low', color: 'bg-amber-100 text-amber-800' },
    { den: 'Rs. 5,000', stock: 11, status: 'Low', color: 'bg-amber-100 text-amber-800' },
  ];

  // Upcoming deadlines
  const upcomingDeadlines = [
    { client: 'Asad Khan', task: 'Income Tax Return', due: '25-09-2025', color: 'text-rose-600 font-bold' },
    { client: 'Zara Enterprises', task: 'Sales Tax Return', due: '28-09-2025', color: 'text-amber-600 font-bold' },
    { client: 'Bilal Ahmed', task: 'NTN Registration', due: '30-09-2025', color: 'text-amber-600 font-bold' },
    { client: 'Hassan & Co.', task: 'Annual Return', due: '05-10-2025', color: 'text-blue-600 font-semibold' },
    { client: 'Ali Traders', task: 'Documents Required', due: '07-10-2025', color: 'text-blue-600 font-semibold' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <PageHeader
        icon={<Building2 className="w-6 h-6 text-white" />}
        title="Office Management Dashboard"
        subtitle="Manage your daily business, clients, accounts, stamps and tax work – all in one place."
        breadcrumb={['CH Admin Portal', 'Website CMS', 'Office Management']}
        quote="“Compliance Today, Growth Tomorrow”"
      />

      {/* 2. Top Row 1: 4 Large Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Cash In */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today's Cash In</div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono mt-0.5">
                Rs. 42,500
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span>↑ 12%</span>
                <span className="text-slate-400 font-normal">from yesterday</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:underline font-semibold self-end"
          >
            View Details &rarr;
          </button>
        </div>

        {/* Today's Cash Out */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ArrowDown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today's Cash Out</div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono mt-0.5">
                Rs. 8,200
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                <span>↓ 5%</span>
                <span className="text-slate-400 font-normal">from yesterday</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('expenses')}
            className="text-xs text-[#1473E6] hover:underline font-semibold self-end"
          >
            View Details &rarr;
          </button>
        </div>

        {/* Current Cash Balance */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#1473E6] dark:text-[#38BDF8] flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Cash Balance</div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono mt-0.5">
                Rs. 59,300
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                In hand (as per last closing)
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:underline font-semibold self-end"
          >
            View Details &rarr;
          </button>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Transactions</div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono mt-0.5">
                28
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                <span className="text-emerald-600 font-bold">22 In</span> | <span className="text-rose-600 font-bold">6 Out</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:underline font-semibold self-end"
          >
            View Details &rarr;
          </button>
        </div>
      </div>

      {/* 3. Top Row 2: 6 Compact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Stamps Sold */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Stamps Sold</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 15,600</div>
              <div className="text-[10px] text-slate-400">32 stamps</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('stamps')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>

        {/* Composing Income */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Composing Income</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 8,750</div>
              <div className="text-[10px] text-slate-400">18 jobs</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('composing')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>

        {/* Tax Consultancy Income */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Tax Consultancy</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 18,150</div>
              <div className="text-[10px] text-slate-400">7 clients</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('tax')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Outstanding</div>
              <div className="text-sm font-bold text-rose-600 font-mono">Rs. 12,400</div>
              <div className="text-[10px] text-slate-400">6 clients</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('clients')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>

        {/* Today's Profit */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Today's Profit</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 34,300</div>
              <div className="text-[10px] text-emerald-600 font-bold">↑ 14%</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('reports')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Monthly Profit</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 286,500</div>
              <div className="text-[10px] text-slate-400">Till 22 Sep 2025</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('reports')} className="text-[10px] text-[#1473E6] hover:underline font-semibold text-right mt-1.5">
            View Details &rarr;
          </button>
        </div>
      </div>

      {/* 4. Middle Section: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Income vs Expenses</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Income
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Expenses
              </span>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
            {[
              { day: '16 Sep', inc: 65, exp: 20 },
              { day: '17 Sep', inc: 75, exp: 25 },
              { day: '18 Sep', inc: 70, exp: 30 },
              { day: '19 Sep', inc: 85, exp: 35 },
              { day: '20 Sep', inc: 80, exp: 32 },
              { day: '21 Sep', inc: 90, exp: 38 },
              { day: '22 Sep', inc: 95, exp: 40 },
            ].map(b => (
              <div key={b.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div style={{ height: `${b.inc}%` }} className="w-2.5 bg-emerald-500 rounded-t-sm transition-all duration-300"></div>
                  <div style={{ height: `${b.exp}%` }} className="w-2.5 bg-rose-500 rounded-t-sm transition-all duration-300"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service-wise Income Donut */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Service-wise Income</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 font-medium">This Month</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut graphic */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="32, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray="28, 100" strokeDashoffset="-32" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="18, 100" strokeDashoffset="-60" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 font-mono leading-tight">Rs. 486,200</span>
                <span className="text-[8px] text-slate-400">Total Income</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1 text-[11px] flex-1">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stamp Sales</span>
                <span className="font-bold">32%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tax Consultancy</span>
                <span className="font-bold">28%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Composing</span>
                <span className="font-bold">18%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Printing</span>
                <span className="font-bold">10%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Affidavit/Agreements</span>
                <span className="font-bold">8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Donut */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Payment Methods</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 font-medium">This Month</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut graphic */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0D9488" strokeWidth="4.5" strokeDasharray="52, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray="24, 100" strokeDashoffset="-52" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="12, 100" strokeDashoffset="-76" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 font-mono leading-tight">Rs. 486,200</span>
                <span className="text-[8px] text-slate-400">Total Received</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1 text-[11px] flex-1">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600"></span> Cash</span>
                <span className="font-bold">52%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Bank Transfer</span>
                <span className="font-bold">24%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> JazzCash/Easypaisa</span>
                <span className="font-bold">12%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Cheque</span>
                <span className="font-bold">8%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Other</span>
                <span className="font-bold">4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (6 Colored Buttons) */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
            <p className="text-[11px] text-slate-400">Create new entries in 1-click</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setIsQuickCashInOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Cash In
            </button>
            <button
              onClick={() => setIsQuickCashOutOpen(true)}
              className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Minus className="w-4 h-4" /> Cash Out
            </button>
            <button
              onClick={() => setActiveSection('clients')}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Users className="w-4 h-4" /> New Client
            </button>
            <button
              onClick={() => setIsStampSaleModalOpen(true)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <FileCheck2 className="w-4 h-4" /> Stamp Sale
            </button>
            <button
              onClick={() => setActiveSection('tax')}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" /> New Tax Return
            </button>
            <button
              onClick={() => setActiveSection('receipts')}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4" /> Create Receipt
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom 4-Column Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Column 1: Recent Transactions & Outstanding Clients */}
        <div className="space-y-4">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Transactions</h3>
              <button onClick={() => setActiveSection('cash')} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {displayTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.client}</div>
                    <div className="text-[10px] text-slate-400">{tx.service}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.type}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">Rs. {tx.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outstanding Clients */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Outstanding Clients</h3>
              <button onClick={() => setActiveSection('clients')} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {outstandingClients.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{c.client}</div>
                    <div className="text-[10px] text-slate-400">{c.service}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Paid: Rs. {c.paid.toLocaleString()}</div>
                    <div className="font-bold text-rose-600 font-mono">Rs. {c.balance.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Low Stamp Stock & Today's Activity */}
        <div className="space-y-4">
          {/* Low Stamp Stock */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Low Stamp Stock</h3>
              <button onClick={() => setActiveSection('stamps')} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {stampStockDisplay.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{s.den}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">{s.stock} pcs</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.color}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Today's Activity</h3>
              <button onClick={() => setActiveSection('audit')} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">New receipt generated (REC-2025-000125)</div>
                  <div className="text-[10px] text-slate-400">11:45 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">Stamp stock updated (Rs. 100)</div>
                  <div className="text-[10px] text-slate-400">11:20 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">Expense added (Tea & Refreshment)</div>
                  <div className="text-[10px] text-slate-400">10:55 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">New client added (Ahsan Traders)</div>
                  <div className="text-[10px] text-slate-400">10:30 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight">Daily closing for 22-09-2025 completed</div>
                  <div className="text-[10px] text-slate-400">09:00 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Deadlines & Daily Closing */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h3>
              <button onClick={() => setActiveSection('tax')} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.client}</div>
                    <div className="text-[10px] text-slate-400">{d.task}</div>
                  </div>
                  <span className={`text-[11px] ${d.color} font-mono shrink-0`}>
                    {d.due}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Closing Summary */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Daily Closing (22 Sep 2025)</h3>
              <button onClick={() => setIsCloseDayModalOpen(true)} className="text-[11px] text-[#1473E6] hover:underline font-semibold">
                View Report
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Opening Balance</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 25,000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash In</span>
                <span className="font-bold text-emerald-600 font-mono">Rs. 42,500</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash Out</span>
                <span className="font-bold text-rose-600 font-mono">Rs. 8,200</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Closing Balance</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm font-mono">Rs. 59,300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Trusted Office & Compliance Partner Card */}
        <div className="bg-gradient-to-br from-[#0B1B2C] to-[#132A44] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between overflow-hidden relative border border-slate-800">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white tracking-tight leading-snug">
              Trusted Office & Compliance Partner
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              E-Stamp | Composing | Tax Advisory For Individuals & Businesses in Sahiwal
            </p>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-white text-[11px]">Accurate & Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-white text-[11px]">Professional Support</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-white text-[11px]">Your Growth Our Priority</span>
              </div>
            </div>
          </div>

          {/* Pakistan E-Stamp visual representation */}
          <div className="mt-5 rounded-xl bg-white/10 p-3 border border-white/15 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                ₨
              </div>
              <div>
                <div className="text-[11px] font-bold text-white tracking-wide uppercase">Pakistan E-Stamp</div>
                <div className="text-[10px] text-slate-300">Chamber No. 121 Sahiwal</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
