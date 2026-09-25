"use client";

import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import {
  FileCheck2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Plus,
  Calendar,
  Download,
  CheckCircle2,
  Package,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export const StampManagementView: React.FC = () => {
  const {
    stampStock,
    setIsStampSaleModalOpen,
    recordStampSale,
    recordStampPurchase,
    recordStampAdjustment
  } = useOffice();

  // Stock overview data
  const stockTable = [
    { den: 'Rs. 50', opening: 200, purchased: 500, sold: 620, remaining: 80, pPrice: 42, sPrice: 50, val: 4000, status: 'Low' },
    { den: 'Rs. 100', opening: 150, purchased: 400, sold: 320, remaining: 230, pPrice: 85, sPrice: 100, val: 23000, status: 'OK' },
    { den: 'Rs. 500', opening: 80, purchased: 200, sold: 150, remaining: 130, pPrice: 420, sPrice: 500, val: 65000, status: 'OK' },
    { den: 'Rs. 1,000', opening: 50, purchased: 120, sold: 90, remaining: 80, pPrice: 850, sPrice: 1000, val: 80000, status: 'OK' },
    { den: 'Rs. 5,000', opening: 20, purchased: 60, sold: 45, remaining: 35, pPrice: 4200, sPrice: 5000, val: 175000, status: 'Low' },
  ];

  // Recent sales
  const recentSales = [
    { time: '22-09-2025 11:45 AM', den: 'Rs. 100', qty: 10, amt: 1000, client: 'Asad Khan' },
    { time: '22-09-2025 10:30 AM', den: 'Rs. 500', qty: 5, amt: 2500, client: 'Zara Enterprises' },
    { time: '22-09-2025 10:15 AM', den: 'Rs. 50', qty: 20, amt: 1000, client: 'Bilal Ahmed' },
    { time: '22-09-2025 09:50 AM', den: 'Rs. 1,000', qty: 3, amt: 3000, client: 'Hasan & Co.' },
    { time: '22-09-2025 09:10 AM', den: 'Rs. 5,000', qty: 1, amt: 5000, client: 'Ali Traders' },
  ];

  // Recent purchases
  const recentPurchases = [
    { time: '21-09-2025 04:30 PM', den: 'Rs. 5,000', qty: 20, amt: 84000, supplier: 'State Bank' },
    { time: '20-09-2025 11:20 AM', den: 'Rs. 1,000', qty: 50, amt: 42500, supplier: 'State Bank' },
    { time: '18-09-2025 02:15 PM', den: 'Rs. 500', qty: 100, amt: 42000, supplier: 'State Bank' },
    { time: '16-09-2025 10:40 AM', den: 'Rs. 100', qty: 200, amt: 17000, supplier: 'State Bank' },
    { time: '15-09-2025 09:30 AM', den: 'Rs. 50', qty: 300, amt: 12600, supplier: 'State Bank' },
  ];

  // Stock movement history
  const stockMovements = [
    { time: '22-09-2025 11:45', type: 'Sale', den: 'Rs. 100', qty: '-10', bal: 230 },
    { time: '22-09-2025 10:20', type: 'Purchase', den: 'Rs. 500', qty: '+50', bal: 130 },
    { time: '21-09-2025 03:10', type: 'Adjustment', den: 'Rs. 50', qty: '-20', bal: 80 },
    { time: '22-09-2025 12:45', type: 'Sale', den: 'Rs. 1,000', qty: '-5', bal: 80 },
    { time: '19-09-2025 09:15', type: 'Purchase', den: 'Rs. 100', qty: '+100', bal: 240 },
  ];

  // Stock adjustments
  const stockAdjustments = [
    { time: '21-09-2025 03:10 PM', den: 'Rs. 50', prev: 100, adj: 80, diff: -20, reason: 'Damaged stamps (torn edges)', user: 'Usama' },
    { time: '17-09-2025 11:25 AM', den: 'Rs. 1,000', prev: 85, adj: 80, diff: -5, reason: 'Physical count adjustment', user: 'Admin' },
    { time: '12-09-2025 09:40 AM', den: 'Rs. 500', prev: 120, adj: 130, diff: +10, reason: 'Excess found in physical count', user: 'Usama' },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <PageHeader
        icon={<FileCheck2 className="w-6 h-6 text-white" />}
        title="Stamp Management"
        subtitle="Manage stamp stock, purchases, sales, adjustments and inventory value."
        breadcrumb={['Office Management', 'Stamp Management']}
        quote="“Compliance Today, Growth Tomorrow”"
      />

      {/* 2. Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Stock Value */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Stock Value</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 486,200</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 12% from last month</div>
        </div>

        {/* Today's Stamp Sales */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Today's Sales</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 34,300</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 18% from yesterday</div>
        </div>

        {/* Today's Stamp Purchases */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Today's Purchases</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 18,500</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 5% from yesterday</div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Low Stock Items</span>
          </div>
          <div className="text-base font-bold text-rose-600 tabular-nums">3</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Denominations below limit</div>
        </div>

        {/* Inventory Profit */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Inventory Profit</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 96,800</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 14% this month</div>
        </div>

        {/* Pending Reconciliation */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCw className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Pending Reconcile</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">2</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Transactions to verify</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <select className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium">
            <option>All Denominations</option>
            <option>Rs. 50</option>
            <option>Rs. 100</option>
            <option>Rs. 500</option>
            <option>Rs. 1,000</option>
            <option>Rs. 5,000</option>
          </select>

          <select className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium">
            <option>All Status</option>
            <option>OK</option>
            <option>Low</option>
            <option>Critical</option>
          </select>

          <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium">
            {`${new Date(Date.now() - 21 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg">
            Apply Filters
          </button>
          <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg">
            Reset
          </button>
          <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* 4. Stamp Stock Overview + Monthly Stamp Sales + Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stamp Stock Overview Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <Layers className="w-4 h-4 text-[#1473E6]" />
              <span>Stamp Stock Overview</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Denom.</th>
                  <th className="py-2.5 px-3 text-right">Opening</th>
                  <th className="py-2.5 px-3 text-right">Purchased</th>
                  <th className="py-2.5 px-3 text-right">Sold</th>
                  <th className="py-2.5 px-3 text-right">Remaining</th>
                  <th className="py-2.5 px-3 text-right">Purchase Price</th>
                  <th className="py-2.5 px-3 text-right">Sale Price</th>
                  <th className="py-2.5 px-3 text-right">Stock Value</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {stockTable.map(s => (
                  <tr key={s.den} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{s.den}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">{s.opening}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">+{s.purchased}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">-{s.sold}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">{s.remaining}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">Rs. {s.pPrice}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">Rs. {s.sPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">Rs. {s.val.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100">Total</td>
                  <td className="py-2.5 px-3 text-right">500</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600">+1,280</td>
                  <td className="py-2.5 px-3 text-right text-rose-600">-1,225</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100">555</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">Rs. 347,000</td>
                  <td className="py-2.5 px-3 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Stamp Sales Chart */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Monthly Stamp Sales</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View Report</span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 border-b border-slate-100 dark:border-slate-800">
            {[
              { m: 'Apr', val: 28 },
              { m: 'May', val: 32 },
              { m: 'Jun', val: 45 },
              { m: 'Jul', val: 38 },
              { m: 'Aug', val: 52 },
              { m: 'Sep', val: 34 },
            ].map(item => (
              <div key={item.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div style={{ height: `${(item.val / 60) * 100}%` }} className="w-5 bg-blue-500 rounded-t-sm transition-all duration-300"></div>
                <span className="text-[9px] text-slate-400 font-medium">{item.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Summary Box */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3">Inventory Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Stock (Items)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">555</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Stock Value</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 486,200</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Purchased (YTD)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 1,125,000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Sold (YTD)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. 1,028,200</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Inventory Profit</span>
                <span className="font-bold text-emerald-600 tabular-nums">Rs. 96,800</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Low Stock Items</span>
                <span className="font-bold text-rose-600 tabular-nums">3</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Pending Reconciliation</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">2</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsStampSaleModalOpen(true)}
            className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" /> Record Stamp Sale
          </button>
        </div>
      </div>

      {/* 5. 4 Column Grids: Low Stock Alerts + Recent Sales + Recent Purchases + Stock Movements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Alerts
              </h3>
              <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 tabular-nums">
                <span className="font-bold">Rs. 50</span>
                <span className="text-slate-500">Cur: 80 / Min: 100</span>
                <span className="text-rose-600 font-bold">Low</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 tabular-nums">
                <span className="font-bold">Rs. 1,000</span>
                <span className="text-slate-500">Cur: 80 / Min: 100</span>
                <span className="text-rose-600 font-bold">Low</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 tabular-nums">
                <span className="font-bold">Rs. 5,000</span>
                <span className="text-slate-500">Cur: 35 / Min: 50</span>
                <span className="text-rose-600 font-bold">Low</span>
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-[10px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
            ⚠️ 3 denominations are below minimum stock level. Please purchase to avoid stockout.
          </div>
        </div>

        {/* Recent Stamp Sales */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Stamp Sales</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>
          <div className="space-y-2 text-xs">
            {recentSales.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{s.client}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">{s.den} × {s.qty}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-bold text-emerald-600">Rs. {s.amt.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">{s.time.split(' ')[1]} {s.time.split(' ')[2]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Purchases</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>
          <div className="space-y-2 text-xs">
            {recentPurchases.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{p.supplier}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">{p.den} × {p.qty}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Rs. {p.amt.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">{p.time.split(' ')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Stock Movement</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>
          <div className="space-y-2 text-xs">
            {stockMovements.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{m.type} ({m.den})</div>
                  <div className="text-[9px] text-slate-400 tabular-nums">{m.time}</div>
                </div>
                <div className="text-right tabular-nums">
                  <span className={`font-bold ${m.qty.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{m.qty}</span>
                  <div className="text-[9px] text-slate-400">Bal: {m.bal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Stock Adjustments Table */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Stock Adjustments</h3>
          <span className="text-xs text-slate-400">Audit logs of manual inventory corrections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Denomination</th>
                <th className="py-2.5 px-3 text-right">Previous Stock</th>
                <th className="py-2.5 px-3 text-right">Adjusted Stock</th>
                <th className="py-2.5 px-3 text-right">Difference</th>
                <th className="py-2.5 px-3">Reason / Notes</th>
                <th className="py-2.5 px-3 text-center">Adjusted By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
              {stockAdjustments.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{a.time}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{a.den}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{a.prev}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">{a.adj}</td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className={a.diff < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {a.diff > 0 ? `+${a.diff}` : a.diff}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">{a.reason}</td>
                  <td className="py-2.5 px-3 text-center font-sans font-semibold text-slate-700 dark:text-slate-300">{a.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
