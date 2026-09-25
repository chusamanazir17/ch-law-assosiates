"use client";

import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import {
  Users,
  UserCheck,
  AlertCircle,
  FileText,
  UserPlus,
  Coins,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Upload,
  Calendar,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

import { initialClients } from '../../data/seedData';
import { CopyableText } from '../common/CopyableText';
import { exportToCsv } from '../../lib/csv';

export const ClientsView: React.FC = () => {
  const { clients, serviceOrders, receipts, tasks, setIsNewClientModalOpen, setIsQuickCashInOpen, setActiveSection } = useOffice();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const allClients = clients && clients.length > 0 ? clients : initialClients;
  const clientList =
    statusFilter === 'ALL' ? allClients : allClients.filter(c => (c.status || 'Active') === statusFilter);

  const filtered = clientList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cnic && c.cnic.includes(searchTerm)) ||
    (c.ntn && c.ntn.includes(searchTerm)) ||
    (c.businessName && c.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selected = filtered[selectedClientIndex] || filtered[0] || clientList[0] || {
    id: 'c1',
    name: 'Client',
    cnic: 'N/A',
    ntn: 'N/A',
    mobile: 'N/A',
    email: 'N/A',
    businessName: 'Business',
    businessType: 'Individual',
    address: 'N/A',
    taxStatus: 'Active',
    memberSince: 'N/A',
    outstanding: 0,
    status: 'Active',
    totalBilling: 0,
    paidAmount: 0,
    lifetimeRevenue: 0,
    lastService: 'N/A',
    documents: []
  };

  const totalClients = clientList.length;
  const activeClients = clientList.filter(c => c.status === 'Active').length;
  const outstandingClientsCount = clientList.filter(c => (c.outstanding || 0) > 0).length;
  const totalDocs = clientList.reduce((acc, c) => acc + (c.documents?.length || 0), 0);
  const totalRecoverables = clientList.reduce((acc, c) => acc + (c.outstanding || 0), 0);

  // Client-scoped records for the detail tabs
  const clientServices = (serviceOrders || []).filter(
    o => (o.clientId && o.clientId === selected.id) || o.customer === selected.name
  );
  const clientReceipts = (receipts || []).filter(
    r => (r.clientId && r.clientId === selected.id) || r.clientName === selected.name
  );
  const clientTasks = (tasks || []).filter(t => t.client === selected.name);

  const topOutstanding = [...clientList]
    .filter(c => (c.outstanding || 0) > 0)
    .sort((a, b) => (b.outstanding || 0) - (a.outstanding || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <PageHeader
        icon={<Users className="w-6 h-6 text-white" />}
        title="Clients & CRM"
        subtitle="Manage client records, billing status, documents and service history."
        breadcrumb={['Office Management', 'Clients & CRM']}
        quote="“Clients Today, Growth Tomorrow”"
      />

      {/* 2. Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#B8832A] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Clients</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalClients}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Live Database</div>
        </div>

        {/* Active Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Active Clients</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{activeClients}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 100}% of total</div>
        </div>

        {/* Outstanding Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Outstanding Clients</span>
          </div>
          <div className="text-base font-bold text-rose-600 tabular-nums">{outstandingClientsCount}</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">Pending collection</div>
        </div>

        {/* Documents Pending */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Docs Attached</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalDocs}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Client files</div>
        </div>

        {/* Client Records */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Filtered</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{filtered.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Matching view</div>
        </div>

        {/* Total Recoverables */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Recoverables</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {totalRecoverables.toLocaleString()}</div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">Due balance</div>
        </div>
      </div>

      {/* 3. Main Directory Table + Selected Client Profile Card */}
      {clientList.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-10 text-center shadow-xs">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No clients yet</h3>
          <p className="text-xs text-slate-400 mt-1">Clients you add will appear here. Use "Add New Client" to create your first one.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Client Directory (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Client Directory</h3>
              <p className="text-xs text-slate-400">Search and manage all your clients</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, CNIC, NTN, business..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-56 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                title="Filter clients by status"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Outstanding">Outstanding</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={() =>
                  exportToCsv(
                    `clients-${new Date().toISOString().split('T')[0]}.csv`,
                    ['Name', 'Business', 'CNIC', 'NTN', 'Mobile', 'Email', 'Address', 'Status', 'Outstanding (PKR)', 'Member Since'],
                    clientList.map(c => [
                      c.name, c.businessName, c.cnic, c.ntn, c.mobile || c.phone || '', c.email,
                      c.address, c.status, c.outstanding || 0, c.memberSince
                    ])
                  )
                }
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>

              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Client
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="whitespace-nowrap py-2.5 px-3">#</th>
                  <th className="whitespace-nowrap py-2.5 px-3">Client Name</th>
                  <th className="whitespace-nowrap py-2.5 px-3">CNIC</th>
                  <th className="whitespace-nowrap py-2.5 px-3">NTN</th>
                  <th className="whitespace-nowrap py-2.5 px-3">Mobile</th>
                  <th className="whitespace-nowrap py-2.5 px-3">Business Name</th>
                  <th className="whitespace-nowrap py-2.5 px-3">Tax Status</th>
                  <th className="whitespace-nowrap py-2.5 px-3">Last Service</th>
                  <th className="whitespace-nowrap py-2.5 px-3 text-right">Outstanding</th>
                  <th className="whitespace-nowrap py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedClientIndex(i)}
                    className={`cursor-pointer transition-colors ${
                      selectedClientIndex === i ? 'bg-blue-50/80 dark:bg-blue-950/40' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-400 tabular-nums">{i + 1}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-500 tabular-nums text-[11px]">{c.cnic}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-500 tabular-nums text-[11px]">{c.ntn}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-600 dark:text-slate-300 tabular-nums text-[11px]">{c.mobile}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.businessName}</td>
                    <td className="whitespace-nowrap py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.taxStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : c.taxStatus === 'Filer' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.taxStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-slate-500 tabular-nums text-[11px]">{c.lastService}</td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-right tabular-nums font-bold">
                      {c.outstanding > 0 ? (
                        <span className="text-rose-600">Rs. {c.outstanding.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">Rs. 0</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Client Detail Card */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  {selected.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selected.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{selected.businessName}</div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-2 text-xs py-3 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <div><span className="font-semibold text-slate-400">CNIC:</span> {selected.cnic}</div>
              <div><span className="font-semibold text-slate-400">NTN:</span> {selected.ntn}</div>
              <div><span className="font-semibold text-slate-400">Phone:</span> {selected.mobile}</div>
              <div><span className="font-semibold text-slate-400">Email:</span> {selected.email}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-400">Address:</span> {selected.address}</div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 -mx-1 px-1 flex items-center gap-1.5 py-2.5 border-b border-slate-200 dark:border-slate-700 text-xs overflow-x-auto no-scrollbar sticky-subbar rounded-t-lg">
              {['Overview', 'Services', 'Payments', 'Documents', 'Tasks', 'Notes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer whitespace-nowrap transition-colors shrink-0 ${
                    activeTab === tab
                      ? 'bg-[#B8832A] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="pt-3">

            {/* Overview: Business Information Box */}
            {activeTab === 'Overview' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                  🏛 Business Information
                </h4>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Business Name</span>
                  <span className="font-medium">{selected.businessName}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Business Type</span>
                  <span className="font-medium">{selected.businessType}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Tax Status</span>
                  <span className="font-bold text-emerald-600">Active Taxpayer (Filer)</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Member Since</span>
                  <span className="font-medium">{selected.memberSince}</span>
                </div>
              </div>
            )}

            {/* Services for this client */}
            {activeTab === 'Services' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">🧾 Service Orders</h4>
                {clientServices.length === 0 ? (
                  <div className="py-3 text-center text-slate-400">No service orders on record for this client yet.</div>
                ) : (
                  <div className="space-y-2">
                    {clientServices.map(o => (
                      <div key={o.id} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{o.serviceName}</div>
                          <div className="text-[10px] text-slate-400">{o.orderNo} • {o.pages} pages{o.deliveryDate ? ` • due ${o.deliveryDate}` : ''}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {(o.amount || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">{o.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payments for this client */}
            {activeTab === 'Payments' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">💳 Billing Summary</h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-2.5 py-2 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Billed</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {(selected.totalBilling || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-2.5 py-2 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Paid</div>
                    <div className="font-bold text-emerald-600 tabular-nums">Rs. {(selected.paidAmount || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-2.5 py-2 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Outstanding</div>
                    <div className="font-bold text-rose-600 tabular-nums">Rs. {(selected.outstanding || 0).toLocaleString()}</div>
                  </div>
                </div>
                {clientReceipts.length === 0 ? (
                  <div className="py-2 text-center text-slate-400">No receipts recorded for this client yet.</div>
                ) : (
                  <div className="space-y-2">
                    {clientReceipts.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{r.service}</div>
                          <div className="text-[10px] text-slate-400">{r.receiptNo} • {r.dateTime}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">Rs. {(r.paidAmount || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">{r.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents for this client */}
            {activeTab === 'Documents' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">📁 Documents on Record</h4>
                {(selected.documents || []).length === 0 ? (
                  <div className="py-3 text-center text-slate-400">No documents uploaded for this client yet.</div>
                ) : (
                  <div className="space-y-2">
                    {selected.documents!.map(d => (
                      <div key={d.id} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.name}</div>
                            <div className="text-[10px] text-slate-400">{d.type}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tasks for this client */}
            {activeTab === 'Tasks' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">✅ Related Tasks</h4>
                {clientTasks.length === 0 ? (
                  <div className="py-3 text-center text-slate-400">No open tasks linked to this client.</div>
                ) : (
                  <div className="space-y-2">
                    {clientTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400">Due {t.dueDate} • {t.assignedStaff}</div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes for this client */}
            {activeTab === 'Notes' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">📝 Notes</h4>
                {selected.notes ? (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.notes}</p>
                ) : (
                  <div className="py-3 text-center text-slate-400">No notes recorded for this client.</div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions for this client */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Client
              </button>
              <button
                onClick={() => setIsQuickCashInOpen(true)}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Record Pay
              </button>
              <button
                onClick={() => setActiveSection('invoices')}
                className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> New Invoice
              </button>
              <button
                onClick={() => setActiveSection('tax')}
                className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" /> New Tax Case
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      )}

      {/* 4. Bottom 3-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Outstanding Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Top Outstanding Clients</h3>
            <span className="text-[10px] text-[#B8832A] font-semibold">View All</span>
          </div>
          <div className="space-y-2 text-xs">
            {topOutstanding.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">All client balances cleared</div>
            ) : (
              topOutstanding.map((o, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{o.name}</div>
                    <div className="text-[10px] text-slate-400">{o.businessName || o.taxStatus}</div>
                  </div>
                  <span className="font-bold text-rose-600 tabular-nums">Rs. {(o.outstanding || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Client Activity */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Client Activity</h3>
            <span className="text-[10px] text-[#B8832A] font-semibold">View All</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">Active client directory live synced</div>
                <div className="text-[10px] text-slate-400">Live Supabase</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{selected.name} profile loaded</div>
                <div className="text-[10px] text-slate-400">{selected.lastService || 'Active'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{totalDocs} total documents on record</div>
                <div className="text-[10px] text-slate-400">Secure Storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Distribution by Client Type */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Client Distribution</h3>
            <span className="text-[10px] text-[#B8832A] font-semibold">Live</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="5" strokeDasharray="40, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="30, 100" strokeDashoffset="-40" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="30, 100" strokeDashoffset="-70" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">{totalClients}</span>
                <span className="text-[8px] text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] flex-1">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Individual</span>
                <span className="font-bold">{clientList.filter(c => c.businessType === 'Individual').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sole Prop.</span>
                <span className="font-bold">{clientList.filter(c => c.businessType === 'Sole Proprietorship').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Partnership/AOP</span>
                <span className="font-bold">{clientList.filter(c => c.businessType === 'Partnership' || c.businessType === 'AOP').length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Pvt. Limited/Other</span>
                <span className="font-bold">{clientList.filter(c => c.businessType === 'Private Limited' || c.businessType === 'Other').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
