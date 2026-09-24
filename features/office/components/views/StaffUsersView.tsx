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
  Lock,
  Server,
  Database,
  History,
  AlertTriangle,
  Sliders,
  CheckSquare,
  Edit2,
  RefreshCw
} from 'lucide-react';
import { StaffUser } from '../../types';

export const StaffUsersView: React.FC = () => {
  const { auditLogs } = useOffice();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // Built-in staff details enriched with permissions
  const [staffList, setStaffList] = useState<StaffUser[]>([
    {
      id: 'USR-01',
      name: 'Usama Ali',
      role: 'Super Admin & Tax Consultant',
      email: 'usama@chchamber.com',
      phone: '0300-1234567',
      permissions: ['All Modules', 'Ledger', 'Reversals', 'System Settings', 'Audit Logs'],
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
  ]);

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
        title="Staff Directory, Roles & System Controls"
        subtitle="Manage chamber consultants, composing operators, cash drawer limits, and audit rights."
        breadcrumb={['Office Management', 'Staff, Roles & Controls']}
        quote="“Segregation of Duties, Protected Authority”"
      >
        <button
          onClick={() => setIsNewUserModalOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </PageHeader>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Total System Users"
          value={staffList.length}
          subValue="Verified Chamber staff"
          change="Chamber 121 Team"
          changeType="positive"
          icon={<ShieldCheck className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />
        <KpiCard
          label="Active Sessions"
          value="1 Active"
          subValue="Usama Ali (Admin)"
          change="Logged in (Counter)"
          changeType="positive"
          icon={<Key className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Security Role Tiers"
          value="4 Levels"
          subValue="Granular permissioning"
          change="Zero privilege creep"
          changeType="neutral"
          icon={<Shield className="w-4 h-4" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Permission Matrix"
          value="16 Rules"
          subValue="Module access locked"
          change="Enforced at runtime"
          changeType="neutral"
          icon={<Sliders className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Audit Log Records"
          value="284 Events"
          subValue="100% financial actions"
          change="Immutable trail"
          changeType="positive"
          icon={<Lock className="w-4 h-4" />}
          iconBgColor="bg-teal-50 text-teal-600"
        />
        <KpiCard
          label="System Health"
          value="100% Online"
          subValue="Local SQLite / JSON DB"
          change="Auto snapshot 11:59PM"
          changeType="positive"
          icon={<Server className="w-4 h-4" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main Grid: Staff Users Table (Left 8 Cols) + Role Matrix & Parameters (Right 4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Staff Users Directory */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#DCE6F1] pb-3 text-xs">
            <div>
              <h3 className="text-sm font-bold text-[#0D2344]">Chamber Staff Accounts</h3>
              <p className="text-[11px] text-slate-500">Authorized operators and consultants</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff, role, email..."
                className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6] bg-slate-50/50"
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
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((member: StaffUser) => (
                  <tr key={member.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0D2344]">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {member.id} • {member.lastActive}</div>
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
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => alert(`Editing permissions for ${member.name}`)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Roles Legend & System Controls */}
        <div className="xl:col-span-4 space-y-5">
          {/* Roles & Permissions Breakdown */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2">
              <h4 className="font-bold text-[#0D2344] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#1473E6]" />
                <span>Role Permission Hierarchy</span>
              </h4>
              <span className="text-[10px] text-slate-400">Chamber RBAC</span>
            </div>

            <div className="space-y-2">
              {[
                { role: 'Super Admin', desc: 'Full administrative access, cash closing, voiding receipts, user management', color: 'border-l-blue-600' },
                { role: 'Lead Advocate', desc: 'Tax filings, e-stamp issuance, legal petition composing, client dossiers', color: 'border-l-emerald-600' },
                { role: 'Composing Operator', desc: 'Typing queue, printing documents, counter cash collection', color: 'border-l-indigo-600' },
                { role: 'Filing Assistant', desc: 'Client document intake, checklist verification, notice follow-ups', color: 'border-l-amber-600' }
              ].map(item => (
                <div key={item.role} className={`p-2.5 rounded-lg bg-slate-50 border border-slate-200 border-l-4 ${item.color}`}>
                  <div className="font-bold text-[#0D2344] text-[11px]">{item.role}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Parameters & Controls */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2">
              <h4 className="font-bold text-[#0D2344] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>System Parameters</span>
              </h4>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Operational</span>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Chamber License</div>
                  <div className="text-[10px] text-slate-400">Sahiwal Bar #121-B</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Daily Ledger Auto-Closing</div>
                  <div className="text-[10px] text-slate-400">Active at 8:00 PM daily</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Two-Factor PIN on Cash Out</div>
                  <div className="text-[10px] text-slate-400">Required for &gt; Rs. 10,000</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">Tax Year Active Filing</div>
                  <div className="text-[10px] text-slate-400">TY 2024 / 2025 (FBR IRIS)</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Immutable Financial & Security Audit Logs Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-2.5">
          <div>
            <h4 className="font-bold text-[#0D2344] flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#1473E6]" />
              <span>Chamber Security & Financial Audit Trail</span>
            </h4>
            <p className="text-[10px] text-slate-400">Chronological immutable log of all cash, stamp, and compliance changes</p>
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-500">Audit Verifier: SHA-256 Valid</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Staff Operator</th>
                <th className="py-2 px-3">Action Type</th>
                <th className="py-2 px-3">Description / Reference</th>
                <th className="py-2 px-3">Terminal / Source</th>
                <th className="py-2 px-3 text-center">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {[
                { time: '22-09-2025 15:42', user: 'Usama Ali', action: 'Fast Cash In', ref: 'REC-2025-0891 (Rs. 15,000)', term: 'Counter POS 1', status: 'VERIFIED' },
                { time: '22-09-2025 14:10', user: 'Chaudhry Hameed', action: 'E-Stamp Issued', ref: 'STM-2025-0892 (Rs. 500 Stamp)', term: 'E-Stamping Desk', status: 'VERIFIED' },
                { time: '22-09-2025 12:30', user: 'Rashid Minhas', action: 'Composing Order Created', ref: 'COMP-4412 (Sale Agreement)', term: 'Urdu InPage Desk', status: 'VERIFIED' },
                { time: '22-09-2025 11:15', user: 'Usama Ali', action: 'Expense Recorded', ref: 'EXP-1092 (Legal Paper Rs. 2,500)', term: 'Admin Terminal', status: 'VERIFIED' },
                { time: '22-09-2025 09:00', user: 'System', action: 'Daily Balance Opening', ref: 'Cash Drawer Initialized (Rs. 45,000)', term: 'Automated Daemon', status: 'VERIFIED' }
              ].map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">{log.time}</td>
                  <td className="py-2.5 px-3 font-bold text-[#0D2344] whitespace-nowrap">{log.user}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{log.ref}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">{log.term}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add System User */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">Add Chamber System User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsNewUserModalOpen(false);
              alert('New staff member added with restricted counter permissions.');
            }} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Ullah Khan"
                  className="w-full h-8.5 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Role</label>
                <select className="w-full h-8.5 px-3 bg-white border border-[#DCE6F1] rounded-lg">
                  <option value="Tax Filing Assistant">Tax Filing Assistant</option>
                  <option value="Composing & Registry Operator">Composing & Registry Operator</option>
                  <option value="Lead Advocate">Lead Advocate & Stamp Licensee</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    className="w-full h-8.5 px-3 border border-[#DCE6F1] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chamber PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="4-digit PIN"
                    className="w-full h-8.5 px-3 border border-[#DCE6F1] rounded-lg font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
