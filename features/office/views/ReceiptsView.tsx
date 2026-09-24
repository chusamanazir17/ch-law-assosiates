import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Printer,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  const {
    receipts,
    setSelectedReceiptId,
    setIsQuickCashInOpen
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredReceipts = receipts.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      r.receiptNo.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.service.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalReceipts = receipts.length;
  const paidCount = receipts.filter(r => r.status === 'PAID').length;
  const cancelledCount = receipts.filter(r => r.status === 'CANCELLED').length;
  const totalValue = receipts
    .filter(r => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + r.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Receipt className="w-6 h-6 text-white" />}
        title="Official Payment Receipts"
        subtitle="Permanent digital register for official stamped receipts, client payment proofs, and audit cancellations."
        breadcrumb={['Office Management', 'Receipts']}
        quote="“Official Proof of Every Commercial Exchange”"
      >
        <button
          onClick={() => setIsQuickCashInOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Receipt</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL RECEIPTS ISSUED"
          value={totalReceipts}
          subValue="Sequential numbering REC-2025"
          change="+14 this week"
          changeType="positive"
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="TOTAL NET REVENUE ISSUED"
          value={`Rs. ${totalValue.toLocaleString()}`}
          subValue="Excludes cancelled vouchers"
          change="Valid active collections"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="PAID IN FULL RECEIPTS"
          value={paidCount}
          subValue="Zero pending balance"
          change="96% settlement rate"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />

        <KpiCard
          label="CANCELLED / REVERSED"
          value={cancelledCount}
          subValue="Audit preserved records"
          change="Zero silent deletes"
          changeType={cancelledCount > 0 ? 'neutral' : 'positive'}
          icon={<Ban className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search receipt #, client name, service..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Receipts</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partial Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
              <tr>
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Client / Payee</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Print / View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReceipts.map(r => (
                <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#1473E6] whitespace-nowrap">
                    {r.receiptNo}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.dateTime}</td>
                  <td className="py-3 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                    {r.clientName}
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{r.service}</td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.paymentMethod}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                    Rs. {r.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                    Rs. {r.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceiptId(r.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#1473E6] hover:text-white text-slate-700 rounded-md text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print / Audit</span>
                    </button>
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
