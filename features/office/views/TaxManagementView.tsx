import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TaxCase } from '../../types';

export const TaxManagementView: React.FC = () => {
  const {
    taxCases,
    updateTaxCaseStatus,
    addTaxCase,
    clients,
    activeSubSection,
    setActiveSubSection
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  // New Case Form
  const [clientName, setClientName] = useState('');
  const [returnType, setReturnType] = useState('Income Tax Return');
  const [taxYear, setTaxYear] = useState('2024');
  const [dueDate, setDueDate] = useState('30-09-2025');
  const [fee, setFee] = useState<number | ''>(6000);
  const [assignedTo, setAssignedTo] = useState('Usama (Admin)');

  const currentTab = activeSubSection || 'returns';

  const filteredCases = taxCases.filter(tc => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      tc.clientName.toLowerCase().includes(q) ||
      tc.returnType.toLowerCase().includes(q) ||
      (tc.ntn && tc.ntn.includes(q));

    const matchStatus = statusFilter === 'ALL' ? true : tc.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalCases = taxCases.length;
  const readyCount = taxCases.filter(t => t.status === 'Ready to File').length;
  const submittedCount = taxCases.filter(t => t.status === 'Submitted' || t.status === 'Completed').length;
  const urgentCount = taxCases.filter(t => t.status === 'Documents Required' || t.status === 'Overdue').length;

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    addTaxCase({
      clientName,
      returnType: returnType as any,
      taxYear,
      dueDate,
      status: 'Documents Required',
      amountFee: Number(fee) || 0,
      amountPaid: 0,
      outstanding: Number(fee) || 0,
      fee: Number(fee) || 0,
      paymentStatus: 'Unpaid',
      assignedStaff: assignedTo,
      assignedTo,
      notes: `Tax Year ${taxYear} compliance file`
    });

    setIsNewCaseModalOpen(false);
    setClientName('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
        title="Tax Returns & Case Management"
        subtitle="Manage FBR IRIS tax return filings, CPR challans, withholding statements, and taxpayer dossiers."
        breadcrumb={['Office Management', 'Tax Management']}
        quote="“Accuracy in Law, Efficiency in Filing”"
      >
        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Tax Return Case</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL ACTIVE TAX CASES"
          value={totalCases}
          subValue="Active Tax Year 2024 / 2025"
          change="Assigned to consultants"
          changeType="positive"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="READY FOR FBR IRIS FILING"
          value={readyCount}
          subValue="Computation finalized"
          change="Pending submission"
          changeType="neutral"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        <KpiCard
          label="SUBMITTED & FILED"
          value={submittedCount}
          subValue="CPR / Acknowledgement issued"
          change="100% compliance rate"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          label="DOCS REQUIRED / DUE SOON"
          value={urgentCount}
          subValue="Client follow-up required"
          change="Upcoming deadline 30 Sep"
          changeType="negative"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Workflow Stage Visual Flow */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs">
        <div className="text-[11px] font-bold text-[#60728D] uppercase tracking-wider mb-2.5">
          FBR Tax Case Lifecycle Stages:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
            <div className="font-bold text-amber-800">1. Docs Required</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Collect bank certs & bills</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
            <div className="font-bold text-blue-800">2. In Progress</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Wealth calc & reconciliation</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200">
            <div className="font-bold text-indigo-800">3. Ready to File</div>
            <div className="text-[10px] text-indigo-700 mt-0.5">Final approval with client</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <div className="font-bold text-emerald-800">4. Submitted</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">FBR Iris acknowledgment</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
            <div className="font-bold text-slate-800">5. Completed</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Active Filer on ATL list</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#DCE6F1] pb-2">
        {[
          { key: 'returns', label: 'Tax Returns & Cases' },
          { key: 'tasks', label: 'Compliance Tasks & Notices' },
          { key: 'documents', label: 'Client Tax Document Vault' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubSection(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              currentTab === tab.key
                ? 'bg-[#1473E6] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Tax Returns Table */}
      {currentTab === 'returns' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search taxpayer, return type, NTN..."
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
                <option value="Documents Required">Documents Required</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready to File">Ready to File</option>
                <option value="Submitted">Submitted</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Client / Taxpayer</th>
                  <th className="py-2.5 px-3">Return Type & Year</th>
                  <th className="py-2.5 px-3">NTN / CNIC</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Fee (PKR)</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3 text-center">Status (Advance)</th>
                  <th className="py-2.5 px-3 text-center">CPR / Ack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCases.map(tc => (
                  <tr key={tc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0D2344]">{tc.clientName}</div>
                      <div className="text-[10px] text-slate-400">{tc.notes}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{tc.returnType}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">TY {tc.taxYear}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                      {tc.ntn || 'Pending NTN'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tc.dueDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-[#0D2344]">
                      Rs. {(tc.fee ?? tc.amountFee ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">{tc.assignedStaff || tc.assignedTo || 'Consultant'}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {/* Interactive status selector */}
                      <select
                        value={tc.status}
                        onChange={e => updateTaxCaseStatus(tc.id, e.target.value as TaxCase['status'])}
                        className={`text-[11px] font-bold py-1 px-2 rounded-md border cursor-pointer ${
                          tc.status === 'Completed' || tc.status === 'Submitted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : tc.status === 'Ready to File'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Documents Required">Documents Required</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready to File">Ready to File</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[10px]">
                      {tc.cprNumber ? (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {tc.cprNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Compliance Tasks & Notices */}
      {currentTab === 'tasks' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#0D2344]">FBR Notice Replies & Compliance Actions</h3>
            <span className="text-xs text-slate-500">Kachahri Chamber Legal Section</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Reply to FBR Section 111 (Unexplained Income) Notice</div>
                <div className="text-[11px] text-slate-500">Client: Tariq Mahmood • Due: 28-09-2025</div>
              </div>
              <StatusBadge status="In Progress" />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Monthly Sales Tax Return (Annexure C & F Submission)</div>
                <div className="text-[11px] text-slate-500">Client: Sahiwal Traders • Due: 15-10-2025</div>
              </div>
              <StatusBadge status="Ready to File" />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">New NTN Registration & Active Taxpayer List Updation</div>
                <div className="text-[11px] text-slate-500">Client: Rashid Minhas • Due: 24-09-2025</div>
              </div>
              <StatusBadge status="Completed" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Document Vault */}
      {currentTab === 'documents' && (
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0D2344]">Taxpayer Document Repository</h3>
            <button
              onClick={() => alert('Document scanner linked to local camera/scanner.')}
              className="px-3 py-1.5 bg-[#1473E6] text-white rounded-lg font-semibold flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Tax Docs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { name: 'Muhammad_Ali_Bank_Statement_2024.pdf', size: '2.4 MB', date: '20-09-2025' },
              { name: 'Tariq_Mahmood_Wealth_Assets.xlsx', size: '480 KB', date: '18-09-2025' },
              { name: 'Sahiwal_Traders_CPR_Challans.pdf', size: '1.2 MB', date: '15-09-2025' },
              { name: 'Asad_Khan_Withholding_Cert.pdf', size: '840 KB', date: '12-09-2025' },
              { name: 'Property_Tax_Challan_Chamber121.pdf', size: '320 KB', date: '10-09-2025' },
              { name: 'Zahid_Cotton_Sales_Invoice_AnnexC.pdf', size: '3.1 MB', date: '08-09-2025' }
            ].map(doc => (
              <div key={doc.name} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-[#1473E6] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{doc.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{doc.size} • {doc.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Tax Case */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">Open New Tax Return Case</h3>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Name *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Enter taxpayer name..."
                    className="flex-1 h-9 px-3 border border-[#DCE6F1] rounded-lg"
                  />
                  <select
                    onChange={e => setClientName(e.target.value)}
                    className="w-32 h-9 px-2 bg-slate-50 border border-[#DCE6F1] rounded-lg"
                  >
                    <option value="">Select</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Return Type</label>
                  <select
                    value={returnType}
                    onChange={e => setReturnType(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                  >
                    <option value="Income Tax Return">Income Tax Return</option>
                    <option value="Sales Tax Return">Sales Tax Return</option>
                    <option value="Wealth Statement">Wealth Statement</option>
                    <option value="Withholding Statement">Withholding Statement</option>
                    <option value="NTN Registration">NTN Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tax Year</label>
                  <select
                    value={taxYear}
                    onChange={e => setTaxYear(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg font-bold"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fee (PKR)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={e => setFee(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Consultant</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                >
                  <option value="Usama (Admin)">Usama (Admin)</option>
                  <option value="Chaudhry H.">Chaudhry H. (Lead)</option>
                  <option value="Staff Consultant">Staff Consultant</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
