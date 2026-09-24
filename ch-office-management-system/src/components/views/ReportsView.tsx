import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { IncomeExpenseBarChart } from '../charts/IncomeExpenseBarChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    accountBalances,
    transactions,
    receipts,
    stampStock,
    taxCases
  } = useOffice();

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'cashflow' | 'stamp' | 'tax'>('pnl');

  // Compute Financials
  const totalRevenue = transactions
    .filter(t => t.type === 'IN' && t.status !== 'Cancelled')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'OUT' && t.status !== 'Cancelled')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalRevenue - totalExpense;

  const totalStockValue = stampStock.reduce((acc, s) => acc + s.stockValue, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<BarChart3 className="w-6 h-6 text-white" />}
        title="Financial & Operational Reports"
        subtitle="Audited P&L statements, multi-account cash balances, stamp inventory turnover, and tax compliance metrics."
        breadcrumb={['Office Management', 'Reports']}
        quote="“Clarity in Numbers, Confidence in Strategy”"
      >
        <button
          onClick={handlePrint}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Statement</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="GROSS REVENUE (COLLECTED)"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          subValue="Central ledger reconciled"
          change="+18% YoY"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="TOTAL OPERATING EXPENSES"
          value={`Rs. ${totalExpense.toLocaleString()}`}
          subValue="Chamber overheads & paper"
          change="Within budget"
          changeType="neutral"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <KpiCard
          label="NET OPERATING PROFIT"
          value={`Rs. ${netProfit.toLocaleString()}`}
          subValue="P&L Margin: 78%"
          change="Strong positive margin"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="STAMP STOCK ASSET VALUE"
          value={`Rs. ${totalStockValue.toLocaleString()}`}
          subValue="Cost valuation in vault"
          change="Liquid inventory"
          changeType="neutral"
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 border-b border-[#DCE6F1] pb-2">
        {[
          { key: 'pnl', label: 'Profit & Loss Statement' },
          { key: 'cashflow', label: 'Treasury & Cash Flow' },
          { key: 'stamp', label: 'Stamp Inventory Turnover' },
          { key: 'tax', label: 'Tax Case Compliance Report' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReportTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeReportTab === tab.key
                ? 'bg-[#1473E6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: P&L Statement */}
      {activeReportTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D2344]">Statement of Profit and Loss</h3>
              <p className="text-xs text-slate-500">For the period ended September 2025 • Currency: PKR</p>
            </div>
            <div className="text-right text-xs font-semibold text-slate-600">
              Chamber No. 121, Kachahri Sahiwal
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue Section */}
            <div>
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 mb-2">
                1. Operating Revenue
              </div>
              <div className="space-y-1.5 pl-2 font-medium">
                <div className="flex justify-between text-slate-700">
                  <span>Income Tax Return Consultancy Fees</span>
                  <span className="font-semibold">Rs. 320,000</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Sales Tax Returns & E-Filing Services</span>
                  <span className="font-semibold">Rs. 180,000</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>E-Stamp Counter Sales & Commission</span>
                  <span className="font-semibold">Rs. 120,400</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Legal Composing & Agreement Drafting</span>
                  <span className="font-semibold">Rs. 45,600</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>NTN & Business Registration Consultancy</span>
                  <span className="font-semibold">Rs. 35,000</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Gross Revenue</span>
                  <span className="text-blue-700">Rs. {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 mb-2">
                2. Operating Expenses
              </div>
              <div className="space-y-1.5 pl-2 font-medium">
                <div className="flex justify-between text-slate-700">
                  <span>Chamber Rent (Chamber 121 Sahiwal)</span>
                  <span className="font-semibold">Rs. 18,000</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Legal Green Paper, Stationery & Cartridges</span>
                  <span className="font-semibold">Rs. 14,800</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Chamber Electricity & High-Speed Internet</span>
                  <span className="font-semibold">Rs. 6,000</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tea Hotel & Client Hospitality Account</span>
                  <span className="font-semibold">Rs. 4,200</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Staff Stipend & Court Runner Expenses</span>
                  <span className="font-semibold">Rs. 5,200</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                  <span>Total Operating Expenses</span>
                  <span className="text-rose-700">- Rs. {totalExpense.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-sm">
              <span className="font-bold text-emerald-900">Net Operating Surplus (Profit):</span>
              <span className="font-black text-emerald-800 text-base">
                Rs. {netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Treasury & Cash Flow */}
      {activeReportTab === 'cashflow' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0D2344]">Multi-Account Liquid Reserves</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-500">Cash in Office</div>
              <div className="text-lg font-bold text-[#0D2344] mt-1">
                Rs. {accountBalances.cashOffice.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="text-blue-700">HBL Bank Current</div>
              <div className="text-lg font-bold text-blue-900 mt-1">
                Rs. {accountBalances.bankAccount.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="text-amber-800">JazzCash Wallet</div>
              <div className="text-lg font-bold text-amber-900 mt-1">
                Rs. {accountBalances.jazzCash.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
              <div className="text-teal-800">EasyPaisa Wallet</div>
              <div className="text-lg font-bold text-teal-900 mt-1">
                Rs. {accountBalances.easyPaisa.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stamp Inventory */}
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

      {/* Tab 4: Tax Case Compliance */}
      {activeReportTab === 'tax' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#0D2344]">Tax Return Compliance Status</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-emerald-800 font-semibold">Total Filed Returns</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">14 Cases</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-blue-800 font-semibold">Ready for Submission</div>
              <div className="text-xl font-bold text-blue-900 mt-1">8 Cases</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-amber-800 font-semibold">Awaiting Client Docs</div>
              <div className="text-xl font-bold text-amber-900 mt-1">2 Cases</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
