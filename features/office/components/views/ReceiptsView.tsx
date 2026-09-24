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
  Download,
  Share2,
  Calendar,
  CreditCard,
  Building,
  Check,
  Phone
} from 'lucide-react';
import { Receipt as ReceiptType } from '../../types';

export const ReceiptsView: React.FC = () => {
  const {
    receipts,
    setSelectedReceiptId,
    setIsQuickCashInOpen
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeReceiptId, setActiveReceiptId] = useState<string>(receipts[0]?.id || 'rec-1');

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

  const selectedReceipt = receipts.find(r => r.id === activeReceiptId) || receipts[0];

  // 6 KPIs
  const totalReceipts = receipts.length;
  const totalValue = receipts
    .filter(r => r.status !== 'CANCELLED')
    .reduce((acc, r) => acc + r.paidAmount, 0);
  const paidCount = receipts.filter(r => r.status === 'PAID').length;
  const partialCount = receipts.filter(r => r.status === 'PARTIAL').length || 1;
  const cancelledCount = receipts.filter(r => r.status === 'CANCELLED').length;
  const avgValue = Math.round(totalValue / (totalReceipts || 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Receipt className="w-6 h-6 text-white" />}
        title="Official Payment Receipts & Vouchers"
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

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Total Receipts"
          value={totalReceipts}
          subValue="Sequential numbering"
          change="+14 this week"
          changeType="positive"
          icon={<Receipt className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />
        <KpiCard
          label="Total Collected"
          value={`Rs. ${totalValue.toLocaleString()}`}
          subValue="Net valid collections"
          change="Valid revenue"
          changeType="positive"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Paid in Full"
          value={paidCount}
          subValue="Zero pending balance"
          change="92% settled"
          changeType="positive"
          icon={<Check className="w-4 h-4" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />
        <KpiCard
          label="Partial Receipts"
          value={partialCount}
          subValue="Pending follow-up"
          change="Recovery pending"
          changeType="neutral"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Cancelled Vouchers"
          value={cancelledCount}
          subValue="Audit preserved"
          change="Zero silent deletes"
          changeType={cancelledCount > 0 ? 'neutral' : 'positive'}
          icon={<Ban className="w-4 h-4" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="Avg Receipt Value"
          value={`Rs. ${avgValue.toLocaleString()}`}
          subValue="Per payment voucher"
          change="Stable ticket size"
          changeType="neutral"
          icon={<CreditCard className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search receipt #, client name, service, or payment method..."
            className="w-full h-9 pl-9 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PARTIAL">Partial Only</option>
            <option value="CANCELLED">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Receipts Table (7 Cols) + Live Receipt Preview (5 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Receipts Register Table */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0D2344]">Chamber Official Receipts Register</h3>
              <p className="text-[11px] text-slate-500">Click any row to display live printable receipt</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{filteredReceipts.length} vouchers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Client / Payee</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReceipts.map(r => {
                  const isSelected = selectedReceipt?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setActiveReceiptId(r.id)}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#1473E6] whitespace-nowrap">
                        {r.receiptNo}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">{r.dateTime}</td>
                      <td className="py-3 px-3 font-bold text-[#0D2344] whitespace-nowrap">
                        {r.clientName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap max-w-[140px] truncate">{r.service}</td>
                      <td className="py-3 px-3 text-right text-slate-800 whitespace-nowrap">
                        Rs. {r.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        Rs. {r.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Printable Chamber Receipt Card */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-[#DCE6F1] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
              <h3 className="text-sm font-bold text-[#0D2344]">Chamber Official Cash Receipt</h3>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {selectedReceipt ? (
            <div className="relative border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-3 font-sans text-xs">
              {/* PAID Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                <span className={`text-6xl font-black uppercase rotate-[-25deg] tracking-widest border-8 px-6 py-2 rounded-2xl ${
                  selectedReceipt.status === 'PAID' ? 'text-emerald-700 border-emerald-700' :
                  selectedReceipt.status === 'CANCELLED' ? 'text-rose-700 border-rose-700' :
                  'text-amber-700 border-amber-700'
                }`}>
                  {selectedReceipt.status}
                </span>
              </div>

              {/* Chamber Header */}
              <div className="text-center border-b border-slate-300 pb-2.5">
                <div className="font-extrabold text-[#0D2344] text-sm tracking-wide uppercase">
                  CHAMBER 121 - LEGAL & TAX CONSULTANTS
                </div>
                <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                  District Courts Compound, Sahiwal, Punjab • Tel: 0300-1234567 / 040-555121
                </div>
                <div className="inline-block mt-1 bg-[#0D2344] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                  OFFICIAL RECEIPT VOUCHER
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Receipt No:</span>
                  <span className="font-mono font-bold text-[#1473E6]">{selectedReceipt.receiptNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                  <span className="font-mono text-slate-700">{selectedReceipt.dateTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Received From:</span>
                  <span className="font-bold text-[#0D2344]">{selectedReceipt.clientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Payment Method:</span>
                  <span className="font-semibold text-slate-700">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Service & Breakdown Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mt-2 bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2.5">Particulars / Service Description</th>
                      <th className="py-1.5 px-2.5 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-slate-800">{selectedReceipt.service}</div>
                        <div className="text-[10px] text-slate-400">Professional legal & filing fee</div>
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                        Rs. {selectedReceipt.amount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="py-1.5 px-2.5 text-right">Amount Received:</td>
                      <td className="py-1.5 px-2.5 text-right text-emerald-600">
                        Rs. {selectedReceipt.paidAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-semibold text-slate-600 border-t border-slate-200">
                      <td className="py-1 px-2.5 text-right text-[10px]">Balance Remaining:</td>
                      <td className="py-1 px-2.5 text-right text-[10px] text-rose-600 font-bold">
                        Rs. {(selectedReceipt.balance || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stamp & Authorized Signature */}
              <div className="pt-3 flex items-end justify-between text-[10px] text-slate-500">
                <div className="w-24 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[9px] uppercase text-center p-1">
                  Chamber Seal / Stamp
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="font-semibold text-slate-700">Authorized Signature</span>
                  <div className="text-[9px] text-slate-400">Chamber 121 Accounts</div>
                </div>
              </div>

              {/* Share & Actions Toolbar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => alert(`Sending Receipt ${selectedReceipt.receiptNo} to ${selectedReceipt.clientName} via WhatsApp`)}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => alert(`Downloading PDF for ${selectedReceipt.receiptNo}`)}
                  className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptId(selectedReceipt.id)}
                  className="py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1473E6] rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                >
                  <Eye className="w-3 h-3" />
                  <span>Audit View</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Select a receipt to preview voucher
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Status Distribution & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receipt Status Breakdown */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344]">Receipt Settlement Distribution</h4>
            <span className="text-[11px] text-slate-400">Total {totalReceipts} vouchers</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Paid in Full ({paidCount})</span>
                <span className="text-emerald-600 font-bold">92%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Partial Balance Pending ({partialCount})</span>
                <span className="text-amber-600 font-bold">6%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700">Cancelled / Voided ({cancelledCount})</span>
                <span className="text-rose-600 font-bold">2%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '2%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344]">Payment Method Breakdown</h4>
            <span className="text-[11px] text-slate-400">Collections share</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Cash at Desk</span>
              <div className="text-base font-extrabold text-[#0D2344] mt-1">68%</div>
              <span className="text-[10px] text-slate-500">Chamber counter</span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Bank Transfer</span>
              <div className="text-base font-extrabold text-[#0D2344] mt-1">24%</div>
              <span className="text-[10px] text-slate-500">HBL / Meezan</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-700 uppercase">JazzCash / Raast</span>
              <div className="text-base font-extrabold text-[#0D2344] mt-1">8%</div>
              <span className="text-[10px] text-slate-500">Instant digital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
