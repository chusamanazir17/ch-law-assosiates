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

export const ClientsView: React.FC = () => {
  const { clients, setIsNewClientModalOpen, setIsQuickCashInOpen } = useOffice();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');

  // Realistic mock data matching Image 4
  const clientList = [
    {
      id: 'c1',
      name: 'Muhammad Ali Khan',
      cnic: '35202-1234567-1',
      ntn: '1234567-8',
      mobile: '0300-1112233',
      businessName: 'Ali Traders',
      taxStatus: 'Active',
      lastService: '22-09-2025',
      outstanding: 25000,
      status: 'Active',
      email: 'ali.traders@gmail.com',
      address: 'Main Bazar, Sahiwal',
      businessType: 'General Trading',
      memberSince: '12 Jan 2024'
    },
    {
      id: 'c2',
      name: 'Zara Enterprises',
      cnic: '35202-7654321-0',
      ntn: '7654321-0',
      mobile: '0301-2223344',
      businessName: 'Zara Enterprises',
      taxStatus: 'Active',
      lastService: '21-09-2025',
      outstanding: 0,
      status: 'Active',
      email: 'info@zaraenterprises.pk',
      address: 'High Street, Sahiwal',
      businessType: 'Textile Wholesale',
      memberSince: '15 Mar 2023'
    },
    {
      id: 'c3',
      name: 'Asad Khan',
      cnic: '35202-1111111-1',
      ntn: '2345678-1',
      mobile: '0302-3334455',
      businessName: 'Khan & Co.',
      taxStatus: 'Active',
      lastService: '20-09-2025',
      outstanding: 12500,
      status: 'Active',
      email: 'asad.khan@gmail.com',
      address: 'Civil Lines, Sahiwal',
      businessType: 'Consultancy',
      memberSince: '04 Aug 2024'
    },
    {
      id: 'c4',
      name: 'Bilal Ahmed',
      cnic: '35202-2222222-2',
      ntn: '3456789-2',
      mobile: '0303-4445566',
      businessName: 'BA Industries',
      taxStatus: 'Active',
      lastService: '19-09-2025',
      outstanding: 48000,
      status: 'Outstanding',
      email: 'bilal@baindustries.com',
      address: 'Small Industrial Estate, Sahiwal',
      businessType: 'Manufacturing',
      memberSince: '10 Feb 2024'
    },
    {
      id: 'c5',
      name: 'Ahsan Traders',
      cnic: '35202-3333333-3',
      ntn: '4567890-3',
      mobile: '0304-5556677',
      businessName: 'Ahsan Traders',
      taxStatus: 'Active',
      lastService: '18-09-2025',
      outstanding: 0,
      status: 'Active',
      email: 'ahsan@traders.pk',
      address: 'Grain Market, Sahiwal',
      businessType: 'Agri Commodities',
      memberSince: '01 Nov 2023'
    },
    {
      id: 'c6',
      name: 'Saima Bibi',
      cnic: '35202-4444444-4',
      ntn: '5678901-4',
      mobile: '0305-6667788',
      businessName: 'Saima Cosmetics',
      taxStatus: 'Active',
      lastService: '17-09-2025',
      outstanding: 8200,
      status: 'Active',
      email: 'saima.cosmetics@gmail.com',
      address: 'Liaquat Road, Sahiwal',
      businessType: 'Retail Store',
      memberSince: '20 May 2024'
    },
    {
      id: 'c7',
      name: 'Raza Enterprises',
      cnic: '35202-5555555-5',
      ntn: '6789012-5',
      mobile: '0306-7778899',
      businessName: 'Raza Enterprises',
      taxStatus: 'Filer',
      lastService: '16-09-2025',
      outstanding: 35000,
      status: 'Outstanding',
      email: 'raza@enterprises.pk',
      address: 'College Road, Sahiwal',
      businessType: 'Import / Export',
      memberSince: '05 Jan 2023'
    },
    {
      id: 'c8',
      name: 'Nadeem & Sons',
      cnic: '35202-6666666-6',
      ntn: '7890123-6',
      mobile: '0307-8889900',
      businessName: 'Nadeem & Sons',
      taxStatus: 'Non-Filer',
      lastService: '15-09-2025',
      outstanding: 0,
      status: 'Active',
      email: 'nadeemandsons@gmail.com',
      address: 'Circular Road, Sahiwal',
      businessType: 'Hardware Store',
      memberSince: '18 Sep 2024'
    }
  ];

  const filtered = clientList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnic.includes(searchTerm) ||
    c.ntn.includes(searchTerm) ||
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = clientList[selectedClientIndex] || clientList[0];

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
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1473E6] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Clients</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">286</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 12% from last month</div>
        </div>

        {/* Active Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Active Clients</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">232</div>
          <div className="text-[10px] text-slate-400 mt-0.5">81% of total</div>
        </div>

        {/* Outstanding Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Outstanding Clients</span>
          </div>
          <div className="text-base font-bold text-rose-600 font-mono">54</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">↑ 6% from last month</div>
        </div>

        {/* Documents Pending */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Docs Pending</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">38</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Need attention</div>
        </div>

        {/* New Clients This Month */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">New Clients</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">18</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 28% from last month</div>
        </div>

        {/* Total Recoverables */}
        <div className="bg-white dark:bg-[#0D1829] rounded-xl border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Recoverables</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">Rs. 486,200</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 14% from last month</div>
        </div>
      </div>

      {/* 3. Main Directory Table + Selected Client Profile Card */}
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

              <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>

              <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">CNIC</th>
                  <th className="py-2.5 px-3">NTN</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Business Name</th>
                  <th className="py-2.5 px-3">Tax Status</th>
                  <th className="py-2.5 px-3">Last Service</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
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
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{c.cnic}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{c.ntn}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{c.mobile}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{c.businessName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.taxStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : c.taxStatus === 'Filer' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.taxStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{c.lastService}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {c.outstanding > 0 ? (
                        <span className="text-rose-600">Rs. {c.outstanding.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">Rs. 0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
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
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
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
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 py-2 text-xs overflow-x-auto">
              {['Overview', 'Services', 'Payments', 'Documents', 'Tasks', 'Notes'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-50 dark:bg-blue-950 text-[#1473E6] dark:text-[#38BDF8]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Business Information Box */}
            <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
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
              <button className="py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload Doc
              </button>
              <button className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> New Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom 3-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Outstanding Clients */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Top Outstanding Clients</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { name: 'Bilal Ahmed', biz: 'BA Industries', out: 48000 },
              { name: 'Raza Enterprises', biz: 'Raza Enterprises', out: 35000 },
              { name: 'Muhammad Ali Khan', biz: 'Ali Traders', out: 25000 },
              { name: 'Khan Associates', biz: 'Khan Associates', out: 18500 },
              { name: 'Asad Khan', biz: 'Khan & Co.', out: 12500 },
            ].map((o, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{o.name}</div>
                  <div className="text-[10px] text-slate-400">{o.biz}</div>
                </div>
                <span className="font-bold text-rose-600 font-mono">Rs. {o.out.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Activity */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Client Activity</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">Payment received from Zara Enterprises</div>
                <div className="text-[10px] text-slate-400">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">New client registered: Saad Marketing</div>
                <div className="text-[10px] text-slate-400">4 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">Document uploaded by Muhammad Ali Khan</div>
                <div className="text-[10px] text-slate-400">5 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">Service completed: NTN Registration</div>
                <div className="text-[10px] text-slate-400">1 day ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Distribution by Client Type */}
        <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Client Distribution</h3>
            <span className="text-[10px] text-[#1473E6] font-semibold">View All</span>
          </div>

          <div className="flex items-center justify-between gap-3 my-auto">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="5" strokeDasharray="38, 100" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="28, 100" strokeDashoffset="-38" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="18, 100" strokeDashoffset="-66" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">286</span>
                <span className="text-[8px] text-slate-400">Total Clients</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] flex-1">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Individual</span>
                <span className="font-bold">38% (108)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sole Prop.</span>
                <span className="font-bold">28% (80)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Partnership</span>
                <span className="font-bold">18% (52)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Pvt. Limited</span>
                <span className="font-bold">10% (29)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
