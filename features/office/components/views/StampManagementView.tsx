"use client";

import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { exportToCsv } from '../../lib/csv';
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
    stampMovements,
    stampAdjustments,
    setIsStampSaleModalOpen,
    recordStampSale,
    recordStampPurchase,
    recordStampAdjustment
  } = useOffice();

  // Live stock overview derived from Supabase-backed stamp stock
  const stockTable = stampStock.map(s => {
    const remaining = Number(s.remaining || 0);
    const minLevel = Number(s.minimumLevel || 0);
    return {
      den: `Rs. ${Number(s.denomination).toLocaleString()}`,
      opening: Number(s.openingStock || 0),
      purchased: Number(s.purchased || 0),
      sold: Number(s.sold || 0),
      remaining,
      pPrice: Number(s.purchasePrice || 0),
      sPrice: Number(s.salePrice || 0),
      val: Number(s.stockValue || remaining * Number(s.purchasePrice || 0)),
      status: s.status || (remaining <= minLevel / 2 ? 'Critical' : remaining <= minLevel ? 'Low' : 'OK'),
    };
  });

  // Recent sales / purchases / movements derived from the live movement log
  const fmtDen = (d: number | string) => `Rs. ${Number(d).toLocaleString()}`;
  const recentSales = stampMovements.filter(m => m.type === 'Sale').slice(0, 5).map(m => ({
    time: m.dateTime,
    den: fmtDen(m.denomination),
    qty: Math.abs(Number(m.qty || 0)),
    amt: Math.abs(Number(m.amount || 0)),
    client: m.clientOrSupplier || 'Counter Sale',
  }));

  const recentPurchases = stampMovements.filter(m => m.type === 'Purchase').slice(0, 5).map(m => ({
    time: m.dateTime,
    den: fmtDen(m.denomination),
    qty: Math.abs(Number(m.qty || 0)),
    amt: Math.abs(Number(m.amount || 0)),
    supplier: m.clientOrSupplier || 'Supplier',
  }));

  const stockMovementLog = stampMovements.slice(0, 5).map(m => ({
    time: m.dateTime,
    type: m.type,
    den: fmtDen(m.denomination),
    qty: `${m.type === 'Sale' ? '-' : m.type === 'Purchase' ? '+' : ''}${Math.abs(Number(m.qty || 0))}`,
    bal: Number(m.balance || 0),
  }));

  const stockAdjustments = stampAdjustments.map(a => ({
    time: a.dateTime,
    den: fmtDen(a.denomination),
    prev: Number(a.previousStock || 0),
    adj: Number(a.adjustedStock || 0),
    diff: Number(a.difference || 0),
    reason: a.reason,
    user: a.adjustedBy || 'Admin',
  }));

  // KPI metrics computed from live data
  const todayKey = new Date().toLocaleDateString('en-GB');
  const isToday = (t: string) => (t || '').startsWith(todayKey);
  const totalStockValue = stockTable.reduce((a, s) => a + s.val, 0);
  const todaySalesAmt = stampMovements.filter(m => m.type === 'Sale' && isToday(m.dateTime)).reduce((a, m) => a + Math.abs(Number(m.amount || 0)), 0);
  const todayPurchaseAmt = stampMovements.filter(m => m.type === 'Purchase' && isToday(m.dateTime)).reduce((a, m) => a + Math.abs(Number(m.amount || 0)), 0);
  const lowStockCount = stockTable.filter(s => s.status !== 'OK').length;
  const inventoryProfit = stockTable.reduce((a, s) => a + s.sold * Math.max(0, s.sPrice - s.pPrice), 0);
  const adjustmentCount = stampAdjustments.length;

  // Monthly sales for the last 6 months, derived from the movement log
  const monthlySales = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const key = d.toLocaleDateString('en-GB', { month: 'short' });
    const total = stampMovements
      .filter(m => m.type === 'Sale' && (m.dateTime || '').includes(key))
      .reduce((a, m) => a + Math.abs(Number(m.amount || 0)), 0);
    return { m: key, val: total };
  });
  const maxMonthlySale = Math.max(...monthlySales.map(x => x.val), 1);
  const totalStockItems = stockTable.reduce((a, s) => a + s.remaining, 0);
  const totalPurchasedValue = stockTable.reduce((a, s) => a + s.purchased * s.pPrice, 0);
  const totalSoldValue = stockTable.reduce((a, s) => a + s.sold * s.sPrice, 0);

  // Filters
  const [denominationFilter, setDenominationFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const filteredStockTable = stockTable.filter(
    s =>
      (denominationFilter === 'ALL' || s.den === denominationFilter) &&
      (stockStatusFilter === 'ALL' || s.status === stockStatusFilter)
  );

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
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {totalStockValue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stockTable.length} denominations in stock</div>
        </div>

        {/* Today's Stamp Sales */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Today's Sales</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {todaySalesAmt.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Today's stamp sales</div>
        </div>

        {/* Today's Stamp Purchases */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Today's Purchases</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {todayPurchaseAmt.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Today's purchases</div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Low Stock Items</span>
          </div>
          <div className="text-base font-bold text-rose-600 tabular-nums">{lowStockCount}</div>
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
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {inventoryProfit.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sold × margin</div>
        </div>

        {/* Stock Adjustments */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCw className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Stock Adjustments</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{adjustmentCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Stock adjustments recorded</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={denominationFilter}
            onChange={e => setDenominationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Denominations</option>
            {stockTable.map(s => (
              <option key={s.den} value={s.den}>{s.den}</option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={e => setStockStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OK">OK</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </select>

          <span className="text-slate-400 font-medium">
            {filteredStockTable.length} of {stockTable.length} denominations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDenominationFilter('ALL'); setStockStatusFilter('ALL'); }}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Reset
          </button>
          <button
            onClick={() =>
              exportToCsv(
                `stamp-stock-${new Date().toISOString().split('T')[0]}.csv`,
                ['Denomination', 'Opening', 'Purchased', 'Sold', 'Remaining', 'Purchase Price', 'Sale Price', 'Stock Value (PKR)', 'Status'],
                filteredStockTable.map(s => [s.den, s.opening, s.purchased, s.sold, s.remaining, s.pPrice, s.sPrice, s.val, s.status])
              )
            }
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
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
                {filteredStockTable.map(s => (
                  <tr key={s.den} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{s.den}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">{s.opening}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600">{s.purchased > 0 ? `+${s.purchased}` : s.purchased}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">{s.sold > 0 ? `-${s.sold}` : s.sold}</td>
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
            {monthlySales.every(x => x.val === 0) ? (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 font-medium">
                No stamp sales recorded yet — sales will chart here
              </div>
            ) : (
              monthlySales.map(item => (
                <div key={item.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-bold text-slate-500 tabular-nums">{item.val > 0 ? item.val.toLocaleString() : ''}</span>
                  <div style={{ height: `${Math.max(4, (item.val / maxMonthlySale) * 100)}%` }} className="w-5 bg-blue-500 rounded-t-sm transition-all duration-300"></div>
                  <span className="text-[9px] text-slate-400 font-medium">{item.m}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventory Summary Box */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3">Inventory Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Stock (Items)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalStockItems.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Stock Value</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {totalStockValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Purchased (YTD)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {totalPurchasedValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Total Sold (YTD)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {totalSoldValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Inventory Profit</span>
                <span className="font-bold text-emerald-600 tabular-nums">Rs. {inventoryProfit.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Low Stock Items</span>
                <span className="font-bold text-rose-600 tabular-nums">{lowStockCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Stock Adjustments</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{adjustmentCount}</span>
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
            {stockMovementLog.map((m, i) => (
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
