import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  CreditCard,
  Plus,
  Minus,
  Search,
  Filter,
  TrendingDown,
  Coffee,
  Printer,
  Building,
  Zap,
  Wallet
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    setIsQuickCashOutOpen
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filter only OUT transactions
  const expenseTransactions = transactions.filter(t => t.type === 'OUT');

  const filteredExpenses = expenseTransactions.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      e.clientOrPayee.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.serviceOrCategory.toLowerCase().includes(q);

    const matchCat =
      categoryFilter === 'ALL'
        ? true
        : e.serviceOrCategory.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchQ && matchCat;
  });

  const totalExpense = expenseTransactions.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<CreditCard className="w-6 h-6 text-white" />}
        title="Office Overhead & Expenses"
        subtitle="Track daily operational costs, chamber rent, electricity bills, legal paper, tea, and client hospitality."
        breadcrumb={['Office Management', 'Expenses']}
        quote="“Lean Expenses, Maximized Profitability”"
      >
        <button
          onClick={() => setIsQuickCashOutOpen(true)}
          className="px-3.5 py-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>Record New Expense</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL EXPENSES LOGGED"
          value={`Rs. ${totalExpense.toLocaleString()}`}
          subValue="Central ledger reconciled"
          change="Recorded with receipts"
          changeType="neutral"
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <KpiCard
          label="PRINTING & PAPER"
          value="Rs. 14,800"
          subValue="A4 reams & legal green sheets"
          change="Sahiwal Paper Mart"
          changeType="neutral"
          icon={<Printer className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="TEA & REFRESHMENTS"
          value="Rs. 4,200"
          subValue="Chamber tea hotel account"
          change="Daily client hospitality"
          changeType="neutral"
          icon={<Coffee className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        <KpiCard
          label="CHAMBER UTILITIES & RENT"
          value="Rs. 24,000"
          subValue="Kachahri Chamber 121"
          change="Due on 1st of month"
          changeType="neutral"
          icon={<Building className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendor, description, category..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Paper">Printing & Stationery</option>
              <option value="Tea">Tea & Hospitality</option>
              <option value="Rent">Rent & Maintenance</option>
              <option value="Electricity">Electricity / Internet</option>
              <option value="Stamp">Stamp Purchase</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
              <tr>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Paid To / Payee</th>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3">Description / Voucher</th>
                <th className="py-2.5 px-3">Deducted Account</th>
                <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3">Authorized By</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{exp.dateTime}</td>
                  <td className="py-3 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                    {exp.clientOrPayee}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {exp.serviceOrCategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{exp.description}</td>
                  <td className="py-3 px-3 text-slate-600 capitalize whitespace-nowrap">{exp.account}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#F43F5E] whitespace-nowrap">
                    - Rs. {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{exp.staff}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <StatusBadge status={exp.status} />
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
