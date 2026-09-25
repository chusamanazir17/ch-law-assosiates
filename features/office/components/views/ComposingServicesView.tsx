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
  AlertCircle,
  FileSignature,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { ServiceOrder } from '../../types';

export const ComposingServicesView: React.FC = () => {
  const {
    serviceOrders,
    addServiceOrder,
    updateServiceOrderStatus
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(serviceOrders[0]?.id || 'so-1');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form
  const [customer, setCustomer] = useState('');
  const [serviceName, setServiceName] = useState('Sale Agreement Composing');
  const [category, setCategory] = useState('Legal Drafting');
  const [pages, setPages] = useState<number | ''>(4);
  const [amount, setAmount] = useState<number | ''>(2500);
  const [payment, setPayment] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [deliveryDate, setDeliveryDate] = useState('Today, 4:00 PM');

  const categories = [
    'ALL',
    'Legal Drafting',
    'Affidavits & Deeds',
    'Court Petitions',
    'Typing & InPage',
    'Tax Forms'
  ];

  const filteredOrders = serviceOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      o.customer.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      o.fileReference.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' ? true : o.status === statusFilter;
    const matchCategory = selectedCategory === 'ALL' ? true : (o.serviceName.includes(selectedCategory) || selectedCategory === 'Legal Drafting');
    return matchQ && matchStatus && matchCategory;
  });

  const selectedOrder = serviceOrders.find(o => o.id === selectedOrderId) || serviceOrders[0];

  // 6 KPIs
  const totalOrders = serviceOrders.length;
  const inProgressCount = serviceOrders.filter(o => o.status === 'In Progress').length;
  const readyCount = serviceOrders.filter(o => o.status === 'Ready' || o.status === 'Completed').length;
  const deliveredTodayCount = 12;
  const urgentCount = 3;
  const totalComposingRevenue = serviceOrders.reduce((acc, o) => acc + o.amount, 0) + 24500;

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

  const standardRates = [
    { name: 'Sale Agreement (Iqraarnama Bai)', pages: '3 - 5 pgs', rate: 'Rs. 2,500', time: '45 mins' },
    { name: 'Court Affidavit (Bayan Halafi)', pages: '1 - 2 pgs', rate: 'Rs. 600', time: '20 mins' },
    { name: 'Partnership Deed (Sharakat Nama)', pages: '4 - 8 pgs', rate: 'Rs. 4,500', time: '2 hours' },
    { name: 'General Power of Attorney (Mukhtar Nama)', pages: '2 - 4 pgs', rate: 'Rs. 2,000', time: '40 mins' },
    { name: 'Civil Court Plaint (Dawa / Vakalatanama)', pages: '4 - 6 pgs', rate: 'Rs. 3,500', time: 'Same day' },
    { name: 'Rent Agreement (Kirayanama)', pages: '2 - 3 pgs', rate: 'Rs. 1,500', time: '30 mins' },
    { name: 'InPage Urdu / Legal Typing', pages: 'Per page', rate: 'Rs. 200', time: '15 mins' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<FileText className="w-6 h-6 text-white" />}
        title="Composing & Legal Drafting Services"
        subtitle="Manage court petitions, sale agreements, affidavits, partnership deeds, and InPage Urdu drafting."
        breadcrumb={['Office Management', 'Composing & Services']}
        quote="“Flawless Drafting for the Courts of Law”"
      >
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-3.5 py-2 bg-[#B8832A] hover:bg-[#96691B] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Composing Order</span>
        </button>
      </PageHeader>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Active Jobs"
          value={totalOrders}
          subValue="Court & registry queue"
          change="+4 added today"
          changeType="neutral"
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#B8832A]"
        />
        <KpiCard
          label="In Progress"
          value={inProgressCount}
          subValue="Typing & drafting"
          change="Turnaround 45m"
          changeType="neutral"
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Ready to Collect"
          value={readyCount}
          subValue="Printed & sealed"
          change="Client notification sent"
          changeType="positive"
          icon={<Printer className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Delivered Today"
          value={deliveredTodayCount}
          subValue="Completed jobs"
          change="100% on-time"
          changeType="positive"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Urgent Priority"
          value={urgentCount}
          subValue="Court filing deadline"
          change="Immediate action"
          changeType="negative"
          icon={<AlertCircle className="w-4 h-4" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="Composing Billing"
          value={`Rs. ${totalComposingRevenue.toLocaleString()}`}
          subValue="This month revenue"
          change="+18.2%"
          changeType="positive"
          icon={<DollarSign className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Category Pills & Search Bar */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#DCE6F1] pb-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#B8832A] text-white shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer, document type, order #..."
              className="w-full h-9 pl-9 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#B8832A] bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Table (Left 8-cols) + Selected Order Details (Right 4-cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Orders Table */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0D2344]">Legal Drafting Orders Queue</h3>
              <p className="text-[11px] text-slate-500">Live chamber composing orders</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{filteredOrders.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Client / Customer</th>
                  <th className="py-2.5 px-3">Document / Service</th>
                  <th className="py-2.5 px-3 text-center">Pages</th>
                  <th className="py-2.5 px-3 text-right">Fee (PKR)</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                  <th className="py-2.5 px-3">Target Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(order => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 tabular-nums font-bold text-slate-700">#{order.orderNo}</td>
                      <td className="py-3 px-3 font-bold text-[#0D2344]">{order.customer}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{order.serviceName}</div>
                        <div className="text-[10px] text-slate-400 tabular-nums">{order.fileReference}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{order.pages}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#0D2344]">
                        Rs. {order.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={order.payment} />
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                        {order.deliveryDate || order.turnaroundTime || 'Today 4 PM'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={e => updateServiceOrderStatus(order.id, e.target.value as ServiceOrder['status'])}
                          className="text-[10px] font-semibold py-1 px-1.5 border border-slate-200 rounded bg-white cursor-pointer shadow-2xs"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Ready">Ready</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Details Panel */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Inspector</span>
              <h3 className="text-sm font-bold text-[#0D2344]">
                {selectedOrder ? `Order #${selectedOrder.orderNo}` : 'Select Order'}
              </h3>
            </div>
            {selectedOrder && <StatusBadge status={selectedOrder.status} />}
          </div>

          {selectedOrder ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-[#DCE6F1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Client / Advocate:</span>
                  <span className="font-bold text-[#0D2344]">{selectedOrder.customer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.serviceName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Number of Pages:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.pages} pages</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Delivery:</span>
                  <span className="font-bold text-blue-600">{selectedOrder.deliveryDate || 'Today, 4:00 PM'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-700">Total Billed:</span>
                  <span className="font-bold text-base text-[#0D2344]">Rs. {selectedOrder.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 mb-2">Composing Workflow Stages:</h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Order Received & Requirements Noted', done: true },
                    { label: 'Legal Drafting & Urdu InPage Typing', done: selectedOrder.status !== 'In Progress' },
                    { label: 'Advocate Proofreading & Revision', done: selectedOrder.status === 'Ready' || selectedOrder.status === 'Delivered' },
                    { label: 'Laser Printing on Legal Stamp Paper', done: selectedOrder.status === 'Ready' || selectedOrder.status === 'Delivered' },
                    { label: 'Delivered to Client / Fee Collected', done: selectedOrder.status === 'Delivered' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span className={step.done ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => updateServiceOrderStatus(selectedOrder.id, 'Ready')}
                  className="w-full py-2 bg-[#B8832A] hover:bg-[#96691B] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mark as Ready for Pickup</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert(`Printing drafting job chit for Order #${selectedOrder.orderNo}`)}
                    className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#DCE6F1] text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Chit</span>
                  </button>
                  <button
                    onClick={() => updateServiceOrderStatus(selectedOrder.id, 'Delivered')}
                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Delivered</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an order to view full job details
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Service Pricing Schedule & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Service Pricing Schedule (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-[#B8832A]" />
              <span>Chamber 121 Legal Drafting - Standard Tariff Schedule</span>
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">Fixed Bar Council Rates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2 px-3">Service / Document Name</th>
                  <th className="py-2 px-3">Typical Size</th>
                  <th className="py-2 px-3 text-right">Standard Fee</th>
                  <th className="py-2 px-3 text-center">Avg Turnaround</th>
                  <th className="py-2 px-3 text-center">Quick Draft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {standardRates.map(item => (
                  <tr key={item.name} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-[#0D2344]">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.pages}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#B8832A]">{item.rate}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 tabular-nums text-[11px]">{item.time}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setServiceName(item.name);
                          setIsNewOrderModalOpen(true);
                        }}
                        className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        Book Job
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Composing Activity Feed (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Composing Live Queue</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { title: 'Sale Deed 5-Marla Printed', time: '10 mins ago', user: 'Composing Desk 1' },
              { title: 'Affidavit for Court Verified', time: '25 mins ago', user: 'Usama (Admin)' },
              { title: 'Partnership Agreement Drafted', time: '1 hour ago', user: 'Legal Drafter' },
              { title: 'Rent Agreement Delivered to Mian Aslam', time: '2 hours ago', user: 'Front Office' }
            ].map((feed, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-[#0D2344] text-[11px]">{feed.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{feed.user}</span>
                  <span>{feed.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: New Composing Order */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">New Legal Composing Job</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer / Advocate Name *</label>
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
                  className="px-5 py-2 bg-[#B8832A] hover:bg-[#96691B] text-white font-semibold rounded-lg"
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
