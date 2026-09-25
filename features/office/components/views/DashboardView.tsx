"use client";

import React, { useMemo } from 'react';
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
  Landmark,
  RefreshCw
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    stampStock,
    stampMovements,
    clients,
    taxCases,
    serviceOrders,
    receipts,
    dailyClosing,
    auditLogs,
    tasks,
    isLoading,
    refreshData,
    setIsQuickCashInOpen,
    setIsQuickCashOutOpen,
    setIsTransferModalOpen,
    setIsCloseDayModalOpen,
    setIsStampSaleModalOpen,
    setActiveSection,
    setSelectedReceiptId
  } = useOffice();

  // 1. Live Dynamic Calculations for Large Cards
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { todayCashIn, todayCashOut, totalCashInCount, totalCashOutCount } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    let inCount = 0;
    let outCount = 0;

    transactions.forEach(tx => {
      const isToday = tx.dateTime?.startsWith(todayStr) || tx.dateTime?.includes(todayStr);
      if (tx.type === 'IN') {
        inCount++;
        if (isToday) inSum += Number(tx.amount || 0);
      } else if (tx.type === 'OUT') {
        outCount++;
        if (isToday) outSum += Number(tx.amount || 0);
      }
    });

    const finalIn = inSum > 0 ? inSum : Number(dailyClosing?.cashIn || 0);
    const finalOut = outSum > 0 ? outSum : Number(dailyClosing?.cashOut || 0);

    return {
      todayCashIn: finalIn,
      todayCashOut: finalOut,
      totalCashInCount: inCount,
      totalCashOutCount: outCount
    };
  }, [transactions, todayStr, dailyClosing]);

  // 2. Compact Metrics Calculations
  const metrics = useMemo(() => {
    const stampsSoldQty = stampStock.reduce((acc, s) => acc + (s.sold || 0), 0);
    const stampsSoldAmount =
      stampMovements
        .filter(m => m.type === 'Sale')
        .reduce((acc, m) => acc + (m.amount || 0), 0) ||
      stampStock.reduce((acc, s) => acc + (s.sold || 0) * s.denomination, 0);

    const composingJobs = serviceOrders.filter(
      o => o.serviceName?.toLowerCase().includes('composing') || o.serviceName?.toLowerCase().includes('print')
    );
    const composingTotal = composingJobs.reduce((acc, o) => acc + (o.amount || 0), 0);

    const taxTotal = taxCases.reduce((acc, t) => acc + (t.amountPaid || t.amountFee || 0), 0);

    const outstandingClientsList = clients.filter(c => (c.outstanding || 0) > 0);
    const totalOutstanding = outstandingClientsList.reduce((acc, c) => acc + (c.outstanding || 0), 0);

    const todayNet = todayCashIn - todayCashOut;
    const combinedLiquidity =
      (accountBalances.cashOffice || 0) +
      (accountBalances.bankAccount || 0) +
      (accountBalances.jazzCash || 0) +
      (accountBalances.easyPaisa || 0);

    return {
      stampsSoldQty,
      stampsSoldAmount,
      composingCount: composingJobs.length,
      composingTotal,
      taxCount: taxCases.length,
      taxTotal,
      outstandingCount: outstandingClientsList.length,
      totalOutstanding,
      todayNet,
      combinedLiquidity
    };
  }, [stampStock, stampMovements, serviceOrders, taxCases, clients, todayCashIn, todayCashOut, accountBalances]);

  // 3. Top Recent Transactions
  const displayTransactions = useMemo(() => {
    return transactions.slice(0, 5).map(tx => ({
      id: tx.id,
      dateTime: tx.dateTime,
      client: tx.clientOrPayee || 'Customer',
      service: tx.serviceOrCategory || tx.description || 'Service',
      type: tx.type,
      amount: tx.amount
    }));
  }, [transactions]);

  // 4. Outstanding Clients
  const outstandingClients = useMemo(() => {
    const list = clients.filter(c => (c.outstanding || 0) > 0);
    const displayList = list.length > 0 ? list : clients;
    return displayList.slice(0, 4).map(c => ({
      client: c.name,
      service: c.businessName || c.taxStatus || 'Client',
      total: c.totalBilling || 0,
      paid: c.paidAmount || 0,
      balance: c.outstanding || 0
    }));
  }, [clients]);

  // 5. Stamp Stock Display (sorted by lowest remaining stock)
  const stampStockDisplay = useMemo(() => {
    return [...stampStock]
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 5)
      .map(s => {
        const isCritical = s.remaining <= Math.max(3, Math.floor(s.minimumLevel / 2));
        const isLow = s.remaining <= s.minimumLevel;
        return {
          den: `Rs. ${s.denomination.toLocaleString()}`,
          stock: s.remaining,
          status: isCritical ? 'Critical' : isLow ? 'Low' : 'OK',
          color: isCritical
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
            : isLow
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
        };
      });
  }, [stampStock]);

  // 6. Upcoming Deadlines
  const upcomingDeadlines = useMemo(() => {
    const activeCases = taxCases.filter(t => t.status !== 'Completed' && t.dueDate);
    if (activeCases.length > 0) {
      return activeCases.slice(0, 5).map(c => ({
        client: c.clientName,
        task: c.returnType || 'Tax Return Filing',
        due: c.dueDate,
        color: c.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'
      }));
    }
    return tasks.slice(0, 5).map(t => ({
      client: t.client || 'General',
      task: t.title,
      due: t.dueDate,
      color: t.priority === 'Urgent' ? 'text-rose-600 font-bold' : 'text-blue-600 font-semibold'
    }));
  }, [taxCases, tasks]);

  // 7. Recent Audit Activities
  const recentActivities = useMemo(() => {
    return auditLogs.slice(0, 5).map(log => {
      const parsed = log.dateTime ? new Date(log.dateTime) : null;
      const time =
        parsed && !isNaN(parsed.getTime())
          ? parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : typeof log.dateTime === 'string' && log.dateTime.includes(' ')
            ? log.dateTime.split(' ').slice(1).join(' ')
            : 'Just now';
      return {
        id: log.id,
        text: log.details || `${log.action} in ${log.module}`,
        time
      };
    });
  }, [auditLogs]);

  // Total collected revenue across all income transactions
  const totalRevenue = useMemo(() => {
    const txIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + (t.amount || 0), 0);
    return txIn > 0 ? txIn : metrics.stampsSoldAmount + metrics.taxTotal + metrics.composingTotal;
  }, [transactions, metrics]);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <PageHeader
        icon={<Building2 className="w-6 h-6 text-white" />}
        title="Office Management Dashboard"
        subtitle="Manage your daily business, clients, accounts, stamps and tax work – all in one place."
        breadcrumb={['CH Admin Portal', 'Website CMS', 'Office Management']}
        quote="“Compliance Today, Growth Tomorrow”"
      >
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs disabled:opacity-50"
          title="Refresh data from Supabase"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1473E6]' : ''}`} />
          {isLoading ? 'Syncing...' : 'Live Synced'}
        </button>
      </PageHeader>

      {/* 2. Top Row 1: 4 Large Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Cash In */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-admin">Today's Cash In</div>
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-slate-50 tracking-tight font-admin tabular-nums mt-0.5 flex items-baseline">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 mr-1">Rs.</span>
                {todayCashIn.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 font-admin">
                <span>↑ Live</span>
                <span className="text-slate-400 font-normal">registered today</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:text-[#0f5bb5] font-semibold self-center whitespace-nowrap shrink-0 transition-colors"
          >
            Details &rarr;
          </button>
        </div>

        {/* Today's Cash Out */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <ArrowDown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-admin">Today's Cash Out</div>
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-slate-50 tracking-tight font-admin tabular-nums mt-0.5 flex items-baseline">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 mr-1">Rs.</span>
                {todayCashOut.toLocaleString()}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-0.5 font-admin">
                <span>Expenses</span>
                <span className="text-slate-400 font-normal">and outgoings</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('expenses')}
            className="text-xs text-[#1473E6] hover:text-[#0f5bb5] font-semibold self-center whitespace-nowrap shrink-0 transition-colors"
          >
            Details &rarr;
          </button>
        </div>

        {/* Current Cash Balance */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1473E6] dark:text-[#38BDF8] flex items-center justify-center shadow-2xs">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-admin">Current Cash Balance</div>
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-slate-50 tracking-tight font-admin tabular-nums mt-0.5 flex items-baseline">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 mr-1">Rs.</span>
                {(accountBalances.cashOffice || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 font-admin">
                In office hand ledger
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:text-[#0f5bb5] font-semibold self-center whitespace-nowrap shrink-0 transition-colors"
          >
            Details &rarr;
          </button>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-admin">Total Transactions</div>
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-slate-50 tracking-tight font-admin tabular-nums mt-0.5">
                {transactions.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 font-admin">
                <span className="text-emerald-600 font-semibold">{totalCashInCount} In</span> | <span className="text-rose-600 font-semibold">{totalCashOutCount} Out</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('cash')}
            className="text-xs text-[#1473E6] hover:text-[#0f5bb5] font-semibold self-center whitespace-nowrap shrink-0 transition-colors"
          >
            Details &rarr;
          </button>
        </div>
      </div>

      {/* 3. Top Row 2: 6 Compact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Stamps Sold */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Stamps Sold</div>
              <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums tracking-tight">
                Rs. {metrics.stampsSoldAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-admin">{metrics.stampsSoldQty} stamps</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('stamps')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>

        {/* Composing Income */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Composing</div>
              <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums tracking-tight">
                Rs. {metrics.composingTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-admin">{metrics.composingCount} jobs</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('composing')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>

        {/* Tax Consultancy Income */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Tax Advisory</div>
              <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums tracking-tight">
                Rs. {metrics.taxTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-admin">{metrics.taxCount} cases</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('tax')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Outstanding</div>
              <div className="text-sm sm:text-[15px] font-bold text-rose-600 font-admin tabular-nums tracking-tight">
                Rs. {metrics.totalOutstanding.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-admin">{metrics.outstandingCount} clients</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('clients')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>

        {/* Today's Profit */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Today's Net</div>
              <div className={`text-sm sm:text-[15px] font-bold font-admin tabular-nums tracking-tight ${metrics.todayNet >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600'}`}>
                Rs. {metrics.todayNet.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold font-admin">
                {metrics.todayNet >= 0 ? 'Positive Flow' : 'Deficit'}
              </div>
            </div>
          </div>
          <button onClick={() => setActiveSection('reports')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>

        {/* Total Liquidity / Combined Accounts */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate tracking-tight uppercase font-admin">Total Liquidity</div>
              <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums tracking-tight">
                Rs. {metrics.combinedLiquidity.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-admin">All Accounts</div>
            </div>
          </div>
          <button onClick={() => setActiveSection('reports')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold text-right mt-1.5 transition-colors">
            Details &rarr;
          </button>
        </div>
      </div>

      {/* 4. Middle Section: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-admin tracking-tight">Income vs Expenses</h3>
            <div className="flex items-center gap-3 text-xs font-admin">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Income
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Expenses
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100 dark:border-slate-800">
            {[
              { day: 'Cash In', inc: Math.min(100, Math.max(15, (todayCashIn / (totalRevenue || 1)) * 100)), exp: 0 },
              { day: 'Cash Out', inc: 0, exp: Math.min(100, Math.max(15, (todayCashOut / (todayCashIn || 1)) * 60)) },
              { day: 'Stamps', inc: Math.min(100, Math.max(25, (metrics.stampsSoldAmount / (totalRevenue || 1)) * 100)), exp: 10 },
              { day: 'Tax', inc: Math.min(100, Math.max(20, (metrics.taxTotal / (totalRevenue || 1)) * 100)), exp: 5 },
              { day: 'Orders', inc: Math.min(100, Math.max(20, (metrics.composingTotal / (totalRevenue || 1)) * 100)), exp: 15 },
            ].map(b => (
              <div key={b.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div style={{ height: `${b.inc}%` }} className="w-3 bg-emerald-500 rounded-t-sm transition-all duration-300"></div>
                  <div style={{ height: `${b.exp}%` }} className="w-3 bg-rose-500 rounded-t-sm transition-all duration-300"></div>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-full font-admin">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service-wise Income Donut */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-admin tracking-tight">Service-wise Income</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium font-admin">All Time</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut graphic */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="40, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray="30, 100" strokeDashoffset="-40" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="30, 100" strokeDashoffset="-70" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center px-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums leading-tight max-w-[88px]">
                  {totalRevenue.toLocaleString()}
                </span>
                <span className="text-[8px] font-semibold text-slate-400 font-admin uppercase tracking-wide">Rs. Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs font-admin flex-1 min-w-0">
              <div onClick={() => setActiveSection("stamps")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stamps</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {metrics.stampsSoldAmount.toLocaleString()}</span>
              </div>
              <div onClick={() => setActiveSection("tax")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Tax</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {metrics.taxTotal.toLocaleString()}</span>
              </div>
              <div onClick={() => setActiveSection("composing")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Composing</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {metrics.composingTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Donut */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-admin tracking-tight">Payment Accounts</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium font-admin">Balances</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            {/* Donut graphic */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0D9488" strokeWidth="4.5" strokeDasharray="50, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray="30, 100" strokeDashoffset="-50" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="20, 100" strokeDashoffset="-80" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center px-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 font-admin tabular-nums leading-tight max-w-[88px]">
                  {metrics.combinedLiquidity.toLocaleString()}
                </span>
                <span className="text-[8px] font-semibold text-slate-400 font-admin uppercase tracking-wide">Rs. Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs font-admin flex-1 min-w-0">
              <div onClick={() => setActiveSection("cash")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600"></span> Cash</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {(accountBalances.cashOffice || 0).toLocaleString()}</span>
              </div>
              <div onClick={() => setActiveSection("cash")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Bank</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {(accountBalances.bankAccount || 0).toLocaleString()}</span>
              </div>
              <div onClick={() => setActiveSection("cash")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> JazzCash</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {(accountBalances.jazzCash || 0).toLocaleString()}</span>
              </div>
              <div onClick={() => setActiveSection("cash")} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-1 -mx-1 transition-colors flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> EasyPaisa</span>
                <span className="font-semibold tabular-nums whitespace-nowrap text-slate-900 dark:text-slate-100">Rs. {(accountBalances.easyPaisa || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (6 Colored Buttons) */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-admin tracking-tight">Quick Actions</h3>
            <p className="text-[11px] text-slate-400 font-admin">Create new entries in 1-click</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 font-admin">
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
              <FileText className="w-4 h-4" /> New Tax Case
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

      {/* 5. Bottom 3-Column Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Recent Transactions & Outstanding Clients */}
        <div className="space-y-4">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">Recent Transactions</h3>
              <button onClick={() => setActiveSection('cash')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {displayTransactions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-admin">No transactions recorded yet</div>
              ) : (
                displayTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 font-admin">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.client}</div>
                      <div className="text-[10px] text-slate-400 truncate">{tx.service}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'}`}>
                        {tx.type}
                      </span>
                      <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">Rs. {Number(tx.amount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outstanding Clients */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">Outstanding Clients</h3>
              <button onClick={() => setActiveSection('clients')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {outstandingClients.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-admin">All client balances are clear</div>
              ) : (
                outstandingClients.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 font-admin">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{c.client}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.service}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-rose-600 tabular-nums leading-tight">Rs. {Number(c.balance || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 tabular-nums">paid Rs. {Number(c.paid || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Low Stamp Stock & Recent Activities */}
        <div className="space-y-4">
          {/* Low Stamp Stock */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">Low Stamp Stock</h3>
              <button onClick={() => setActiveSection('stamps')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {stampStockDisplay.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-admin">No stamp denominations found</div>
              ) : (
                stampStockDisplay.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 font-admin">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{s.den}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600 dark:text-slate-400 tabular-nums">{s.stock} pcs</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.color}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">Live Activity Feed</h3>
              <button onClick={() => setActiveSection('audit')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                View All
              </button>
            </div>
            <div className="space-y-2.5 text-xs font-admin">
              {recentActivities.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-admin">All systems operational and active</div>
              ) : (
                recentActivities.map(act => (
                  <div key={act.id} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700 dark:text-slate-200 text-[11px] font-medium leading-tight truncate">
                        {act.text}
                      </div>
                      <div className="text-[10px] text-slate-400">{act.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Deadlines & Daily Closing */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">Upcoming Deadlines</h3>
              <button onClick={() => setActiveSection('tax')} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-admin">No pending deadlines</div>
              ) : (
                upcomingDeadlines.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 font-admin">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.client}</div>
                      <div className="text-[10px] text-slate-400 truncate">{d.task}</div>
                    </div>
                    <span className={`text-[11px] ${d.color} tabular-nums shrink-0 font-semibold`}>
                      {d.due}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Closing Summary */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-admin">
                Daily Closing ({dailyClosing?.date || new Date().toLocaleDateString('en-GB')})
              </h3>
              <button onClick={() => setIsCloseDayModalOpen(true)} className="text-[11px] text-[#1473E6] hover:text-[#0f5bb5] font-semibold transition-colors font-admin">
                {dailyClosing?.isClosed ? 'Closed' : 'Close Day'}
              </button>
            </div>
            <div className="space-y-2 text-xs font-admin">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Opening Balance</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Rs. {Number(dailyClosing?.openingBalance || dailyClosing?.openingCash || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash In</span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  Rs. {todayCashIn.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Cash Out</span>
                <span className="font-bold text-rose-600 tabular-nums">
                  Rs. {todayCashOut.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs font-admin">Closing / Hand Cash</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm tabular-nums">
                  Rs. {Number(accountBalances.cashOffice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
  );
};
