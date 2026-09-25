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
  Wallet,
  Calendar,
  Users,
  CheckCircle2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    recordCashOut,
    setIsQuickCashOutOpen
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Quick Add Expense Form State
  const [payee, setPayee] = useState('');
  const [category, setCategory] = useState('Printing & Stationery');
  const [amount, setAmount] = useState<number | ''>('');
  const [account, setAccount] = useState<'cash' | 'hbl' | 'meezan' | 'petty'>('cash');
  const [description, setDescription] = useState('');

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

  // Per-category totals from the live ledger
  const sumCategory = (keywords: string[]) =>
    expenseTransactions
      .filter(e => keywords.some(k => e.serviceOrCategory.toLowerCase().includes(k)))
      .reduce((acc, e) => acc + e.amount, 0);
  const rentTotal = sumCategory(['rent', 'rates']);
  const utilitiesTotal = sumCategory(['utilit', 'bills', 'lesco', 'ptcl', 'electric']);
  const printingTotal = sumCategory(['printing', 'stationery', 'paper']);
  const salariesTotal = sumCategory(['salary', 'stipend']);
  const teaTotal = sumCategory(['tea', 'hospitality', 'refreshment']);

  // Live category breakdown (top 5 by spend)
  const byCategory = new Map<string, number>();
  expenseTransactions.forEach(e => {
    const key = e.serviceOrCategory || 'General';
    byCategory.set(key, (byCategory.get(key) || 0) + e.amount);
  });
  const categoryBreakdown = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount], idx) => ({
      name,
      amount,
      pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      color: ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'][idx % 5],
    }));

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee.trim() || !amount) return;

    recordCashOut({
      category,
      payeeDescription: payee,
      amount: Number(amount),
      account,
      staff: 'Usama (Admin)',
      notes: description || `${category} paid to ${payee}`
    });

    setPayee('');
    setAmount('');
    setDescription('');
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<CreditCard className="w-6 h-6 text-white" />}
        title="Overhead & Expenses Management"
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

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Total Expenses"
          value={`Rs. ${totalExpense.toLocaleString()}`}
          subValue="Ledger outflow to date"
          change="Within budget"
          changeType="neutral"
          icon={<CreditCard className="w-4 h-4" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="Chamber Rent"
          value={`Rs. ${rentTotal.toLocaleString()}`}
          subValue="Chamber 121 Sahiwal"
          change={rentTotal > 0 ? "Recorded" : "No expense yet"}
          changeType={rentTotal > 0 ? "positive" : "neutral"}
          icon={<Building className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />
        <KpiCard
          label="Utilities (LESCO/PTCL)"
          value={`Rs. ${utilitiesTotal.toLocaleString()}`}
          subValue="Power & legal internet"
          change={utilitiesTotal > 0 ? "Recorded" : "No expense yet"}
          changeType={utilitiesTotal > 0 ? "positive" : "neutral"}
          icon={<Zap className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Printing & Paper"
          value={`Rs. ${printingTotal.toLocaleString()}`}
          subValue="Legal sheets & toner"
          change={printingTotal > 0 ? "Recorded" : "No expense yet"}
          changeType="neutral"
          icon={<Printer className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Staff & Associates"
          value={`Rs. ${salariesTotal.toLocaleString()}`}
          subValue="Salaries & honoraria"
          change={salariesTotal > 0 ? "Recorded" : "No expense yet"}
          changeType="neutral"
          icon={<Users className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Tea & Refreshments"
          value={`Rs. ${teaTotal.toLocaleString()}`}
          subValue="Client hospitality"
          change={teaTotal > 0 ? "Recorded" : "No expense yet"}
          changeType="neutral"
          icon={<Coffee className="w-4 h-4" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main Grid: Quick Add & Recurring (Left 5 Cols) + Breakdown & Table (Right 7 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Quick Add Expense & Recurring Bills */}
        <div className="xl:col-span-5 space-y-5">
          {/* Quick Add Form Card */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
              <h3 className="font-bold text-[#0D2344] text-sm flex items-center gap-1.5">
                <Minus className="w-4 h-4 text-[#F43F5E]" />
                <span>Fast Expense Entry</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Immediate central ledger sync</span>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payee / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={payee}
                  onChange={e => setPayee(e.target.value)}
                  placeholder="e.g. Sahiwal Stationery Mart / LESCO..."
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-9 px-2 bg-white border border-[#DCE6F1] rounded-lg font-medium"
                  >
                    <option value="Printing & Stationery">Printing & Stationery</option>
                    <option value="Chamber Rent & Rates">Chamber Rent & Rates</option>
                    <option value="Utilities & Bills">Utilities & Bills (LESCO/PTCL)</option>
                    <option value="Tea & Hospitality">Tea & Hospitality</option>
                    <option value="Staff Salaries">Staff Salaries & Stipends</option>
                    <option value="Court Fee & Stamp Paper">Court Fee & Stamp Paper</option>
                    <option value="Office Maintenance">Office Repairs & Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2500"
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deduct From Account</label>
                  <select
                    value={account}
                    onChange={e => setAccount(e.target.value as any)}
                    className="w-full h-9 px-2 bg-white border border-[#DCE6F1] rounded-lg font-medium"
                  >
                    <option value="cash">Chamber Cash Drawer</option>
                    <option value="hbl">HBL Business Account</option>
                    <option value="meezan">Meezan Islamic Account</option>
                    <option value="petty">Petty Cash Safe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Authorized By</label>
                  <input
                    type="text"
                    disabled
                    value="Usama (Admin)"
                    className="w-full h-9 px-3 bg-slate-100 border border-[#DCE6F1] rounded-lg text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Voucher Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 5 Reams Legal Green Sheets for Court Plaints"
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Minus className="w-4 h-4" />
                <span>Record Expense in Central Ledger</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Category Breakdown & Expenses Register Table */}
        <div className="xl:col-span-7 space-y-5">
          {/* Category Breakdown Progress Bars */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2">
              <h4 className="font-bold text-[#0D2344]">Expense Category Allocation</h4>
              <span className="text-[11px] text-slate-500">Budget reconciliation</span>
            </div>

            <div className="space-y-2.5">
              {categoryBreakdown.length === 0 ? (
                <div className="py-3 text-center text-slate-400">No expenses recorded yet</div>
              ) : categoryBreakdown.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="text-slate-800 tabular-nums font-bold">{cat.amount} ({cat.pct})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Register Table */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search vendor, description, category..."
                  className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6] bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Printing">Printing & Stationery</option>
                  <option value="Tea">Tea & Hospitality</option>
                  <option value="Rent">Chamber Rent</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Salaries">Staff Salaries</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                  <tr>
                    <th className="py-2 px-3">Date / Time</th>
                    <th className="py-2 px-3">Paid To / Payee</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Account</th>
                    <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    <th className="py-2 px-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">{exp.dateTime}</td>
                      <td className="py-2.5 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                        {exp.clientOrPayee}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {exp.serviceOrCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate">{exp.description}</td>
                      <td className="py-2.5 px-3 text-slate-600 capitalize whitespace-nowrap tabular-nums text-[10px]">{exp.account}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#F43F5E] whitespace-nowrap">
                        - Rs. {exp.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[10px]">{exp.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
