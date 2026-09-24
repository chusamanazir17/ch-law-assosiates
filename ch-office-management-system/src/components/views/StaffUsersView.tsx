import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Key,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { StaffUser } from '../../types';

export const StaffUsersView: React.FC = () => {
  const { systemUsers } = useOffice();
  const [searchQuery, setSearchQuery] = useState('');

  // Built-in staff details enriched with permissions
  const staffList: StaffUser[] = [
    {
      id: 'USR-01',
      name: 'Usama Ali',
      role: 'Super Admin & Tax Consultant',
      email: 'usama@chchamber.com',
      phone: '0300-1234567',
      permissions: ['All Modules', 'Ledger', 'Reversals', 'Settings', 'Audit Logs'],
      status: 'Active',
      lastActive: 'Online Now'
    },
    {
      id: 'USR-02',
      name: 'Chaudhry Hameed',
      role: 'Lead Advocate & Stamp Licensee',
      email: 'ch.hameed@chchamber.com',
      phone: '0300-7654321',
      permissions: ['E-Stamp Issuance', 'Treasury Purchase', 'Tax Returns', 'Legal Petitions'],
      status: 'Active',
      lastActive: '10 mins ago'
    },
    {
      id: 'USR-03',
      name: 'Rashid Minhas',
      role: 'Composing & Registry Operator',
      email: 'rashid@chchamber.com',
      phone: '0302-8889991',
      permissions: ['Composing Queue', 'Print Receipts', 'Cash In (Counter)'],
      status: 'Active',
      lastActive: '1 hour ago'
    },
    {
      id: 'USR-04',
      name: 'M. Kashif',
      role: 'Tax Filing Assistant',
      email: 'kashif@chchamber.com',
      phone: '0345-1122334',
      permissions: ['Tax Return Docs', 'Client CRM', 'Tasks & Deadlines'],
      status: 'Active',
      lastActive: 'Yesterday'
    }
  ];

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<ShieldCheck className="w-6 h-6 text-white" />}
        title="Staff Directory & Role-Based Access Control"
        subtitle="Manage chamber consultants, composing operators, cash drawer limits, and audit rights."
        breadcrumb={['Office Management', 'Staff & Users']}
        quote="“Segregation of Duties, Protected Authority”"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="ACTIVE STAFF MEMBERS"
          value={staffList.length}
          subValue="All identities verified"
          change="Chamber 121 Team"
          changeType="positive"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="ACTIVE SESSION"
          value="Usama Ali"
          subValue="Super Admin"
          change="Logged in (Chamber 121)"
          changeType="positive"
          icon={<Key className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="SECURITY ROLE TIERS"
          value="4 Levels"
          subValue="Super Admin, Lead, Consultant, Operator"
          change="Strict permissions"
          changeType="neutral"
          icon={<Shield className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        <KpiCard
          label="AUDIT MONITORING"
          value="100% Tracked"
          subValue="Every financial edit logged"
          change="Zero silent deletes"
          changeType="positive"
          icon={<Lock className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search staff name, role, email..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
              <tr>
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Role / Designation</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Module Permissions</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.map((member: StaffUser) => (
                <tr key={member.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#0D2344]">{member.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {member.id}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1473E6] font-bold text-[10px]">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    <div>{member.phone}</div>
                    <div className="text-[10px] text-slate-400">{member.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((perm: string) => (
                        <span key={perm} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
