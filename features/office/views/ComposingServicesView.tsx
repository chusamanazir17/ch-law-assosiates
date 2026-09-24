import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { ServiceOrder } from '../../types';

export const ComposingServicesView: React.FC = () => {
  const {
    serviceOrders,
    addServiceOrder,
    updateServiceOrderStatus,
    clients
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form
  const [customer, setCustomer] = useState('');
  const [serviceName, setServiceName] = useState('Sale Agreement Composing');
  const [pages, setPages] = useState<number | ''>(4);
  const [amount, setAmount] = useState<number | ''>(2500);
  const [payment, setPayment] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [deliveryDate, setDeliveryDate] = useState('22-09-2025');

  const filteredOrders = serviceOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      o.customer.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      o.fileReference.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' ? true : o.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalOrders = serviceOrders.length;
  const inProgressCount = serviceOrders.filter(o => o.status === 'In Progress').length;
  const readyCount = serviceOrders.filter(o => o.status === 'Completed' || o.status === 'Ready').length;
  const totalComposingRevenue = serviceOrders.reduce((acc, o) => acc + o.amount, 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    addServiceOrder({
      customer,
      serviceName,
      pages: Number(pages) || 1,
      amount: Number(amount) || 0,
      payment,
      deliveryDate,
      fileReference: `COMP-${Date.now().toString().slice(-4)}`
    });

    setIsNewOrderModalOpen(false);
    setCustomer('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="Legal Composing & Document Drafting"
        subtitle="Manage court petitions, sale agreements, affidavits, partnership deeds, and InPage Urdu drafting."
        breadcrumb={['Office Management', 'Composing & Services']}
        quote="“Flawless Drafting for the Courts of Law”"
      >
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Composing Job</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="ACTIVE COMPOSING JOBS"
          value={totalOrders}
          subValue="Court & registry orders"
          change="Queue operating smoothly"
          changeType="positive"
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="IN PROGRESS / DRAFTING"
          value={inProgressCount}
          subValue="Urdu / English drafting"
          change="Average turnaround 45 mins"
          changeType="neutral"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        <KpiCard
          label="READY FOR DELIVERY"
          value={readyCount}
          subValue="Printed & reviewed"
          change="Awaiting client collection"
          changeType="positive"
          icon={<Printer className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <KpiCard
          label="COMPOSING BILLING"
          value={`Rs. ${totalComposingRevenue.toLocaleString()}`}
          subValue="Legal drafting revenue"
          change="+15% this month"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer, document type, order #..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Client / Customer</th>
                <th className="py-2.5 px-3">Service / Document</th>
                <th className="py-2.5 px-3 text-center">Pages</th>
                <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">#{order.orderNo}</td>
                  <td className="py-3 px-3 font-bold text-[#0D2344]">{order.customer}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{order.serviceName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{order.fileReference}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">{order.pages}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#0D2344]">
                    Rs. {order.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={order.payment} />
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{order.deliveryDate || order.turnaroundTime}</td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={e => updateServiceOrderStatus(order.id, e.target.value as ServiceOrder['status'])}
                      className="text-[10px] font-semibold py-1 px-1.5 border border-slate-200 rounded bg-white cursor-pointer"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Composing Order */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">New Legal Composing Job</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  placeholder="e.g. Mian Rashid / Advocate..."
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document / Service</label>
                <select
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                >
                  <option value="Sale Agreement Drafting">Sale Agreement Drafting (Iqraarnama)</option>
                  <option value="Court Affidavit (Bayan Halafi)">Court Affidavit (Bayan Halafi)</option>
                  <option value="Partnership Deed (Sharakat Nama)">Partnership Deed (Sharakat Nama)</option>
                  <option value="Power of Attorney (Mukhtar Nama)">Power of Attorney (Mukhtar Nama)</option>
                  <option value="Rent Agreement Composing">Rent Agreement Composing</option>
                  <option value="Civil Court Plaint (Dawa)">Civil Court Plaint (Dawa)</option>
                  <option value="Other InPage / English Composing">Other InPage / English Composing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Number of Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={pages}
                    onChange={e => setPages(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bill Amount (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Status</label>
                  <select
                    value={payment}
                    onChange={e => setPayment(e.target.value as 'Paid' | 'Unpaid' | 'Partial')}
                    className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                  >
                    <option value="Paid">Paid (Cash Received)</option>
                    <option value="Unpaid">Unpaid (Credit)</option>
                    <option value="Partial">Partial Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Delivery Target</label>
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
