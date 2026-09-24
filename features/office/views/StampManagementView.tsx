import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import {
  FileCheck2,
  Plus,
  ShoppingCart,
  Sliders,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  History
} from 'lucide-react';

export const StampManagementView: React.FC = () => {
  const {
    stampStock,
    stampMovements,
    stampAdjustments,
    activeSubSection,
    setActiveSubSection,
    setIsStampSaleModalOpen,
    recordStampPurchase,
    recordStampAdjustment
  } = useOffice();

  // Modals for Purchase and Adjustment
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Purchase Form
  const [purchaseDenom, setPurchaseDenom] = useState(100);
  const [purchaseQty, setPurchaseQty] = useState<number | ''>(50);
  const [purchaseSupplier, setPurchaseSupplier] = useState('District Treasury Sahiwal');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(97);
  const [purchaseAccount, setPurchaseAccount] = useState('bank');

  // Adjustment Form
  const [adjustDenom, setAdjustDenom] = useState(50);
  const [adjustStock, setAdjustStock] = useState<number | ''>(10);
  const [adjustReason, setAdjustReason] = useState('Physical audit count verification');

  const currentTab = activeSubSection || 'stock';

  // Stats
  const totalStockUnits = stampStock.reduce((acc, s) => acc + s.remaining, 0);
  const totalStockValue = stampStock.reduce((acc, s) => acc + s.stockValue, 0);
  const totalSoldUnits = stampStock.reduce((acc, s) => acc + s.sold, 0);
  const lowCount = stampStock.filter(s => s.status !== 'OK').length;

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseQty || Number(purchaseQty) <= 0) return;

    recordStampPurchase({
      denomination: purchaseDenom,
      quantity: Number(purchaseQty),
      supplier: purchaseSupplier,
      purchasePricePerUnit: Number(purchasePrice) || purchaseDenom,
      paymentAccount: purchaseAccount
    });

    setIsPurchaseModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustStock === '') return;

    recordStampAdjustment({
      denomination: adjustDenom,
      adjustedStock: Number(adjustStock),
      reason: adjustReason
    });

    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<FileCheck2 className="w-6 h-6 text-white" />}
        title="Stamp Paper & E-Stamp Vault"
        subtitle="Manage official government stamp paper inventory, purchases from treasury, sales, and audit reconciliation."
        breadcrumb={['Office Management', 'Stamp Management']}
        quote="“Official Documents, Certified Integrity”"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsStampSaleModalOpen(true)}
            className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Issue / Sell Stamp</span>
          </button>

          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Stock</span>
          </button>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Reconcile Stock</span>
          </button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL STAMP UNITS IN VAULT"
          value={`${totalStockUnits} Units`}
          subValue="Across 6 denominations"
          change="Available for sale"
          changeType="positive"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="INVENTORY PURCHASE VALUE"
          value={`Rs. ${totalStockValue.toLocaleString()}`}
          subValue="Cost basis valuation"
          change="Physical asset"
          changeType="neutral"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="TOTAL STAMPS SOLD"
          value={`${totalSoldUnits} Units`}
          subValue="Total historical sales"
          change="+45 sold this week"
          changeType="positive"
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <KpiCard
          label="LOW STOCK WARNINGS"
          value={`${lowCount} Alerts`}
          subValue="Reorder required"
          change={lowCount > 0 ? 'Urgent replenishment' : 'Adequate'}
          changeType={lowCount > 0 ? 'negative' : 'positive'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Monthly Sales Trend & Denomination Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Monthly Stamp Sales Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Revenue generated from e-stamp counter issuance (PKR)</p>
            </div>
            <span className="text-xs font-bold text-blue-600">Apr - Sep 2025</span>
          </div>
          <MonthlyBarChart height={180} barColor="#3B82F6" />
        </div>

        {/* Quick Inventory Health Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">Vault Health Checklist</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600">Authorized Vendor:</span>
                <span className="font-bold text-slate-900">Ch. Hameed (Lic. 142)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600">State Bank Treasury:</span>
                <span className="font-bold text-emerald-700">Cleared & Linked</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600">E-Stamp Web Portal:</span>
                <span className="font-bold text-blue-700">Online & Verified</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsStampSaleModalOpen(true)}
            className="w-full mt-4 py-2.5 bg-[#1473E6] hover:bg-[#0F70F5] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open Quick Issue Window</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
        {[
          { key: 'stock', label: 'Denomination Stock Table' },
          { key: 'movements', label: 'Stamp Movement Ledger' },
          { key: 'adjustments', label: 'Stock Adjustments & Audits' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubSection(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              currentTab === tab.key
                ? 'bg-[#1473E6] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Denomination Stock Table */}
      {currentTab === 'stock' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Denomination</th>
                  <th className="py-2.5 px-3">Purchase Cost</th>
                  <th className="py-2.5 px-3 text-center">Purchased</th>
                  <th className="py-2.5 px-3 text-center">Sold</th>
                  <th className="py-2.5 px-3 text-center">Remaining In Vault</th>
                  <th className="py-2.5 px-3 text-right">Stock Valuation</th>
                  <th className="py-2.5 px-3 text-center">Min Level</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stampStock.map(item => (
                  <tr key={item.denomination} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                      Rs. {item.denomination} E-Stamp
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      Rs. {item.purchasePrice}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 whitespace-nowrap">
                      {item.purchased}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {item.sold}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-sm ${
                        item.remaining <= item.minimumLevel ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.remaining}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0D2344] whitespace-nowrap">
                      Rs. {item.stockValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 whitespace-nowrap">
                      {item.minimumLevel} units
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setIsStampSaleModalOpen(true)}
                          className="px-2 py-1 bg-[#1473E6] hover:bg-[#0F70F5] text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() => {
                            setAdjustDenom(item.denomination);
                            setAdjustStock(item.remaining);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Reconcile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stamp Movements */}
      {currentTab === 'movements' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Denomination</th>
                  <th className="py-2.5 px-3 text-center">Qty Change</th>
                  <th className="py-2.5 px-3 text-center">Remaining Balance</th>
                  <th className="py-2.5 px-3">Client / Supplier</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                  <th className="py-2.5 px-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stampMovements.map(m => (
                  <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{m.dateTime}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={m.type} />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                      Rs. {m.denomination}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold whitespace-nowrap">
                      <span className={m.qty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {m.balance}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">{m.clientOrSupplier}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0D2344] whitespace-nowrap">
                      Rs. {m.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Adjustments */}
      {currentTab === 'adjustments' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Denomination</th>
                  <th className="py-2.5 px-3 text-center">Previous Stock</th>
                  <th className="py-2.5 px-3 text-center">Adjusted Stock</th>
                  <th className="py-2.5 px-3 text-center">Difference</th>
                  <th className="py-2.5 px-3">Audit Reason</th>
                  <th className="py-2.5 px-3">Adjusted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stampAdjustments.map(adj => (
                  <tr key={adj.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{adj.dateTime}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                      Rs. {adj.denomination}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap">
                      {adj.previousStock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 whitespace-nowrap">
                      {adj.adjustedStock}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold whitespace-nowrap">
                      <span className={adj.difference < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{adj.reason}</td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{adj.adjustedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Purchase Stock */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">Purchase Stamp Stock from Treasury</h3>
            <form onSubmit={handlePurchaseSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Denomination *</label>
                <select
                  value={purchaseDenom}
                  onChange={e => setPurchaseDenom(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg font-bold"
                >
                  {[50, 100, 200, 500, 1000, 5000].map(d => (
                    <option key={d} value={d}>Rs. {d} Stamp</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantity (Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={purchaseQty}
                  onChange={e => setPurchaseQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Supplier / Treasury *</label>
                <input
                  type="text"
                  required
                  value={purchaseSupplier}
                  onChange={e => setPurchaseSupplier(e.target.value)}
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Paid From Account *</label>
                <select
                  value={purchaseAccount}
                  onChange={e => setPurchaseAccount(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg font-medium"
                >
                  <option value="bank">HBL Bank Current Account</option>
                  <option value="cash">Cash in Office (Drawer)</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">Reconcile / Adjust Stamp Stock</h3>
            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Denomination *</label>
                <select
                  value={adjustDenom}
                  onChange={e => setAdjustDenom(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg font-bold"
                >
                  {[50, 100, 200, 500, 1000, 5000].map(d => (
                    <option key={d} value={d}>Rs. {d} Stamp</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Actual Physical Count (Units) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustStock}
                  onChange={e => setAdjustStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical count reconciliation / Damaged paper voided"
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
