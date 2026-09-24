import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { DonutChart } from '../charts/DonutChart';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Download,
  Building,
  ExternalLink
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    setIsNewClientModalOpen,
    setIsQuickCashInOpen
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Selected client for detail view
  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      c.name.toLowerCase().includes(q) ||
      (c.phone || c.mobile || '').includes(q) ||
      c.cnic.toLowerCase().includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q)) ||
      (c.ntn && c.ntn.includes(q));

    const matchStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
    const matchType = typeFilter === 'ALL' ? true : (c.type || c.businessType) === typeFilter;

    return matchQ && matchStatus && matchType;
  });

  const totalClients = clients.length;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const totalOutstanding = clients.reduce((acc, c) => acc + c.outstanding, 0);
  const totalRevenue = clients.reduce((acc, c) => acc + c.lifetimeRevenue, 0);

  const clientTypeSegments = [
    { label: 'Individual (Salaried)', value: 38, color: '#1473E6' },
    { label: 'Sole Proprietor', value: 28, color: '#38BDF8' },
    { label: 'AOP / Partnership', value: 18, color: '#10B981' },
    { label: 'Private Limited', value: 10, color: '#F59E0B' },
    { label: 'Others / Legal', value: 6, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Users className="w-6 h-6 text-white" />}
        title="Clients & CRM Directory"
        subtitle="Manage client identities, CNIC, NTN, tax case histories, outstanding balances, and official files."
        breadcrumb={['Office Management', 'Clients & CRM']}
        quote="“Trusted Advisory for Sahiwal's Business Leaders”"
      >
        <button
          onClick={() => setIsNewClientModalOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </PageHeader>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="REGISTERED CLIENTS"
          value={totalClients}
          subValue="Active tax & composing files"
          change="+8 this month"
          changeType="positive"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="ACTIVE FILERS & TRADERS"
          value={activeCount}
          subValue="Zero pending overdue"
          change="92% active compliance"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="TOTAL OUTSTANDING DUE"
          value={`Rs. ${totalOutstanding.toLocaleString()}`}
          subValue="Uncollected balances"
          change="Across 8 clients"
          changeType={totalOutstanding > 0 ? 'negative' : 'positive'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <KpiCard
          label="LIFETIME REVENUE COLLECTED"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          subValue="Paid professional fees"
          change="Strong retention"
          changeType="positive"
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Main Content Area: 2 Columns (Table left, Client Profile right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Client Table with Filters */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, CNIC (36502-...), NTN..."
                className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Outstanding">Outstanding Due</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Entity Types</option>
                <option value="Individual">Individual</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="AOP/Partnership">AOP / Partnership</option>
                <option value="Private Limited">Private Limited</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">CNIC / NTN</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredClients.map(c => {
                  const isSelected = activeClient?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0D2344]">{c.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {c.businessName ? `${c.businessName} • ${c.type || c.businessType}` : (c.type || c.businessType)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div>{c.phone || c.mobile}</div>
                        {c.email && <div className="text-[10px] text-slate-400">{c.email}</div>}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-700 text-[11px]">{c.cnic}</div>
                        {c.ntn ? (
                          <div className="text-[10px] text-emerald-600 font-semibold">NTN: {c.ntn}</div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Non-Filer</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                        <span className={c.outstanding > 0 ? 'text-[#F43F5E]' : 'text-slate-700'}>
                          Rs. {c.outstanding.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-[#1473E6]' : 'bg-slate-300'
                          }`}
                        ></span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Selected Client Profile Card */}
        {activeClient && (
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1B2C] to-[#1473E6] text-white flex items-center justify-center font-bold text-sm">
                  {activeClient.name.slice(0, 2).toUpperCase()}
                </div>
                <StatusBadge status={activeClient.status} />
              </div>
              <h3 className="text-base font-bold text-[#0D2344] mt-2 leading-tight">
                {activeClient.name}
              </h3>
              <p className="text-xs text-slate-500">{activeClient.businessName || 'Individual Taxpayer'}</p>
            </div>

            {/* Quick Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>CNIC:</span>
                <span className="font-mono font-semibold text-slate-900">{activeClient.cnic}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>NTN Number:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {activeClient.ntn || 'Not Registered'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phone / WhatsApp:</span>
                <span className="font-semibold text-slate-900">{activeClient.phone || activeClient.mobile}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Entity Type:</span>
                <span className="font-semibold text-slate-900">{activeClient.type || activeClient.businessType}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Registered Address:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[160px]">
                  {activeClient.address}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Member Since:</span>
                <span className="text-slate-700">{activeClient.memberSince}</span>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Billed:</span>
                <span className="font-bold text-slate-900">
                  Rs. {activeClient.totalBilling.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Paid to Date:</span>
                <span className="font-bold text-emerald-600">
                  Rs. {activeClient.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-700">Outstanding:</span>
                <span className={activeClient.outstanding > 0 ? 'text-rose-600' : 'text-slate-900'}>
                  Rs. {activeClient.outstanding.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions for this client */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsQuickCashInOpen(true)}
                className="w-full py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Receive Payment / Clear Balance</span>
              </button>
              <a
                href={`https://wa.me/92${(activeClient.phone || activeClient.mobile).replace(/[^0-9]/g, '').slice(-10)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Client</span>
              </a>
            </div>

            {/* Client Documents */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Stored Client Documents:
              </div>
              <div className="space-y-1.5 text-xs">
                {activeClient.documents && activeClient.documents.length > 0 ? (
                  activeClient.documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate font-medium">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{doc.date || doc.uploadDate}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate font-medium">CNIC_Front_Back.pdf</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
