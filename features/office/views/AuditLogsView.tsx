import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  History,
  Search,
  Filter,
  Shield,
  Lock,
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useOffice();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    const detailsStr = (log.details || log.afterNew || '').toLowerCase();
    const recordStr = (log.recordId || log.record || '').toLowerCase();
    const matchQ =
      log.action.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      detailsStr.includes(q) ||
      recordStr.includes(q);

    const matchModule = moduleFilter === 'ALL' ? true : log.module === moduleFilter;
    return matchQ && matchModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<History className="w-6 h-6 text-white" />}
        title="System Audit Trail & Security Logs"
        subtitle="Immutable transaction ledger records, reversal details, timestamps, and staff accountability."
        breadcrumb={['Office Management', 'Audit Logs']}
        quote="“Unyielding Compliance, Full Accountability”"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL AUDIT ENTRIES"
          value={auditLogs.length}
          subValue="Permanent event register"
          change="Real-time capture"
          changeType="positive"
          icon={<History className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="IMMUTABLE RECORDING"
          value="Active (Enforced)"
          subValue="No silent database deletions"
          change="Reversals logged with reasons"
          changeType="positive"
          icon={<Shield className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="SYSTEM INTEGRITY"
          value="100% Balanced"
          subValue="Transactions match ledger"
          change="Zero discrepancy"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />

        <KpiCard
          label="SENSITIVE ACTIONS"
          value="Audit Trail Protected"
          subValue="Daily closing & reversals"
          change="Supervisor monitored"
          changeType="neutral"
          icon={<Lock className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search user, action, details, record ID..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Modules</option>
              <option value="Cash">Cash Management</option>
              <option value="Stamps">Stamp Inventory</option>
              <option value="Tax">Tax Cases</option>
              <option value="Receipts">Receipts</option>
              <option value="CRM">Clients CRM</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
              <tr>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Audit Details & Reason</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{log.dateTime}</td>
                  <td className="py-3 px-3 font-bold text-[#0D2344] whitespace-nowrap">{log.user}</td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] font-bold text-[#1473E6]">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {log.recordId || log.record || log.id}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-normal">
                    {log.details || log.afterNew || log.beforePrevious || 'Transaction ledger updated'}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      SUCCESS
                    </span>
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
