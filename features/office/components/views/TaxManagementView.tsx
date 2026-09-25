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
  ChevronRight,
  Printer,
  ExternalLink,
  ArrowRight,
  CheckSquare,
  Square,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { TaxCase } from '../../types';

export const TaxManagementView: React.FC = () => {
  const {
    taxCases,
    updateTaxCaseStatus,
    addTaxCase,
    clients
  } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(taxCases[0]?.id || 'tc-1');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'kanban' | 'table'>('kanban');

  // New Case Form
  const [clientName, setClientName] = useState('');
  const [returnType, setReturnType] = useState('Income Tax Return');
  const [taxYear, setTaxYear] = useState('2024');
  const [dueDate, setDueDate] = useState('30-09-2025');
  const [fee, setFee] = useState<number | ''>(6000);
  const [assignedTo, setAssignedTo] = useState('Usama (Admin)');

  // Selected case state
  const selectedCase = taxCases.find(tc => tc.id === selectedCaseId) || taxCases[0];

  // Document checklist local toggle state
  const [docChecklist, setDocChecklist] = useState<Record<string, boolean>>({
    'Bank Statement (12 Months)': true,
    'Salary / Business Certificate': true,
    'Withholding Tax Deductions (CPR)': false,
    'Wealth Reconciliation': true,
    'Electricity / Utility Bills': true
  });

  const toggleDoc = (doc: string) => {
    setDocChecklist(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const filteredCases = taxCases.filter(tc => {
    const q = searchQuery.toLowerCase();
    return (
      tc.clientName.toLowerCase().includes(q) ||
      tc.returnType.toLowerCase().includes(q) ||
      (tc.ntn && tc.ntn.includes(q))
    );
  });

  // KPI Calculations
  const pendingCount = taxCases.filter(t => t.status === 'Documents Required' || t.status === 'In Progress').length;
  const submittedCount = taxCases.filter(t => t.status === 'Submitted' || t.status === 'Completed').length;
  const docsRequiredCount = taxCases.filter(t => t.status === 'Documents Required').length;
  const overdueCount = taxCases.filter(t => t.status === 'Overdue').length || 2;
  const upcomingDeadlinesCount = 14;
  const totalTaxRevenue = taxCases.reduce((sum, c) => sum + (c.fee || c.amountFee || 0), 0);

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

  const kanbanColumns: { status: TaxCase['status']; title: string; color: string; border: string; bg: string }[] = [
    { status: 'Documents Required', title: 'Docs Required', color: 'text-amber-800', border: 'border-amber-300', bg: 'bg-amber-50' },
    { status: 'In Progress', title: 'In Progress', color: 'text-blue-800', border: 'border-blue-300', bg: 'bg-blue-50' },
    { status: 'Ready to File', title: 'Ready to File', color: 'text-indigo-800', border: 'border-indigo-300', bg: 'bg-indigo-50' },
    { status: 'Submitted', title: 'Submitted', color: 'text-emerald-800', border: 'border-emerald-300', bg: 'bg-emerald-50' },
    { status: 'Completed', title: 'Completed', color: 'text-slate-800', border: 'border-slate-300', bg: 'bg-slate-100' }
  ];

  const advanceCaseStatus = (caseId: string, currentStatus: TaxCase['status']) => {
    const sequence: TaxCase['status'][] = ['Documents Required', 'In Progress', 'Ready to File', 'Submitted', 'Completed'];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex < sequence.length - 1) {
      updateTaxCaseStatus(caseId, sequence[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FileSpreadsheet className="w-6 h-6 text-white" />}
        title="Tax Management & FBR Filing"
        subtitle="Manage FBR IRIS tax return filings, CPR challans, withholding statements, and taxpayer dossiers."
        breadcrumb={['Office Management', 'Tax Management']}
        quote="“Accuracy in Law, Efficiency in Filing”"
      >
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0B1B2C]/5 p-0.5 rounded-lg border border-[#DCE6F1]">
            <button
              onClick={() => setActiveViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                activeViewMode === 'kanban' ? 'bg-[#1473E6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                activeViewMode === 'table' ? 'bg-[#1473E6] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cases Table
            </button>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Tax Case</span>
          </button>
        </div>
      </PageHeader>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="Pending Returns"
          value={pendingCount}
          subValue="Tax Year 2024"
          change="+2 this week"
          changeType="neutral"
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />
        <KpiCard
          label="Submitted Returns"
          value={submittedCount}
          subValue="Filed on FBR IRIS"
          change="+4 completed"
          changeType="positive"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Documents Required"
          value={docsRequiredCount}
          subValue="Bank & salary certs"
          change="Urgent follow-up"
          changeType="negative"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Overdue Cases"
          value={overdueCount}
          subValue="Action needed immediately"
          change="Critical alert"
          changeType="negative"
          icon={<ShieldAlert className="w-4 h-4" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="Upcoming Deadlines"
          value={upcomingDeadlinesCount}
          subValue="Within 15 days"
          change="Due soon"
          changeType="neutral"
          icon={<Calendar className="w-4 h-4" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
        <KpiCard
          label="Tax Revenue"
          value={`Rs. ${totalTaxRevenue.toLocaleString()}`}
          subValue="This season filings"
          change="+18.4%"
          changeType="positive"
          icon={<FileSpreadsheet className="w-4 h-4" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client name, return type, NTN or CNIC..."
            className="w-full h-9 pl-9 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6] bg-slate-50/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Viewing {filteredCases.length} tax files</span>
        </div>
      </div>

      {/* Main Section: Kanban + Case Overview Panel */}
      {activeViewMode === 'kanban' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* 5-Column Kanban Board (8 Columns on XL) */}
          <div className="xl:col-span-8 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0D2344]">FBR Tax Lifecycle Kanban Board</h3>
                <p className="text-[11px] text-slate-500">Track and advance cases across filing stages</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Click any card to inspect or advance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-2">
              {kanbanColumns.map(col => {
                const casesInCol = filteredCases.filter(tc => tc.status === col.status);
                return (
                  <div key={col.status} className="bg-slate-50/80 rounded-xl border border-[#DCE6F1] p-2.5 flex flex-col min-w-[160px]">
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          col.status === 'Documents Required' ? 'bg-amber-500' :
                          col.status === 'In Progress' ? 'bg-blue-500' :
                          col.status === 'Ready to File' ? 'bg-indigo-500' :
                          col.status === 'Submitted' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`} />
                        <span className="text-xs font-bold text-slate-800">{col.title}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${col.bg} ${col.color}`}>
                        {casesInCol.length}
                      </span>
                    </div>

                    {/* Cards in column */}
                    <div className="space-y-2 flex-1 min-h-[300px]">
                      {casesInCol.length === 0 ? (
                        <div className="h-28 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                          No cases
                        </div>
                      ) : (
                        casesInCol.map(tc => {
                          const isSelected = selectedCase?.id === tc.id;
                          return (
                            <div
                              key={tc.id}
                              onClick={() => setSelectedCaseId(tc.id)}
                              className={`p-2.5 rounded-lg border bg-white shadow-2xs cursor-pointer transition-all hover:shadow-xs hover:border-[#1473E6] ${
                                isSelected ? 'ring-2 ring-[#1473E6] border-transparent' : 'border-[#DCE6F1]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="font-bold text-xs text-[#0D2344] line-clamp-1">{tc.clientName}</span>
                                <span className="text-[10px] tabular-nums text-slate-500">{tc.taxYear}</span>
                              </div>

                              <div className="text-[10px] text-slate-500 mb-1.5 line-clamp-1 font-medium">
                                {tc.returnType}
                              </div>

                              <div className="text-[10px] tabular-nums text-slate-400 mb-2">
                                NTN: {tc.ntn || '381920-4'}
                              </div>

                              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                                <span className="font-bold text-[#0D2344]">
                                  Rs. {(tc.fee ?? tc.amountFee ?? 6000).toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    advanceCaseStatus(tc.id, tc.status);
                                  }}
                                  title="Advance to next stage"
                                  className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors flex items-center gap-0.5 text-[10px] font-semibold"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Case Overview (4 Columns on XL) */}
          <div className="xl:col-span-4 bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE6F1] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Case Dossier</span>
                <h3 className="text-sm font-bold text-[#0D2344]">
                  {selectedCase ? selectedCase.clientName : 'Select a Tax Case'}
                </h3>
              </div>
              {selectedCase && <StatusBadge status={selectedCase.status} />}
            </div>

            {selectedCase ? (
              <div className="space-y-4 text-xs">
                {/* Case Info Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-[#DCE6F1]">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Return Type</span>
                    <span className="font-bold text-slate-800">{selectedCase.returnType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Tax Year</span>
                    <span className="font-bold text-slate-800">TY {selectedCase.taxYear}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">NTN / CNIC</span>
                    <span className="tabular-nums font-bold text-slate-700">{selectedCase.ntn || '381920-4'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Filing Deadline</span>
                    <span className="font-semibold text-rose-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {selectedCase.dueDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Agreed Fee</span>
                    <span className="font-bold text-slate-800">Rs. {(selectedCase.fee ?? selectedCase.amountFee ?? 6000).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Assigned Consultant</span>
                    <span className="font-semibold text-slate-700">{selectedCase.assignedStaff || selectedCase.assignedTo || 'Usama (Admin)'}</span>
                  </div>
                </div>

                {/* CPR / Iris Acknowledgment */}
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">FBR Iris CPR Challan</div>
                  <div className="tabular-nums text-xs font-bold text-emerald-900 mt-0.5">
                    {selectedCase.cprNumber || 'CPR-2024-88491-KCH'}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Active Filer Status: ATL Verified</div>
                </div>

                {/* Required Documents Checklist */}
                <div>
                  <h4 className="font-bold text-[#0D2344] mb-2 flex items-center justify-between">
                    <span>Document Checklist</span>
                    <span className="text-[10px] font-normal text-slate-500">4 / 5 Complete</span>
                  </h4>
                  <div className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-[#DCE6F1]">
                    {Object.entries(docChecklist).map(([doc, isChecked]) => (
                      <div
                        key={doc}
                        onClick={() => toggleDoc(doc)}
                        className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-slate-100"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={`text-[11px] ${isChecked ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => updateTaxCaseStatus(selectedCase.id, 'Submitted')}
                    className="w-full py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Submitted on FBR Iris</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => alert(`Printing Tax Return CPR for ${selectedCase.clientName}`)}
                      className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#DCE6F1] text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print CPR</span>
                    </button>
                    <button
                      onClick={() => alert('Opening FBR Iris Portal (iris.fbr.gov.pk)')}
                      className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#DCE6F1] text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>FBR Iris</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select a tax case from the board to view full dossier
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tabular View */
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#60728D] font-semibold text-[11px] uppercase tracking-wider border-b border-[#DCE6F1]">
                <tr>
                  <th className="py-2.5 px-3">Client / Taxpayer</th>
                  <th className="py-2.5 px-3">Return Type & Year</th>
                  <th className="py-2.5 px-3">NTN / CNIC</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Fee (PKR)</th>
                  <th className="py-2.5 px-3">Assigned Staff</th>
                  <th className="py-2.5 px-3 text-center">Stage</th>
                  <th className="py-2.5 px-3 text-center">FBR CPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCases.map(tc => (
                  <tr key={tc.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => setSelectedCaseId(tc.id)}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0D2344]">{tc.clientName}</div>
                      <div className="text-[10px] text-slate-400">{tc.notes}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{tc.returnType}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">TY {tc.taxYear}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap tabular-nums text-slate-600">
                      {tc.ntn || 'Pending NTN'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tc.dueDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-[#0D2344]">
                      Rs. {(tc.fee ?? tc.amountFee ?? 6000).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">{tc.assignedStaff || tc.assignedTo || 'Usama (Admin)'}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={tc.status} />
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap tabular-nums text-[10px]">
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

      {/* Bottom Operational Grid (Image 5 Bottom Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Upcoming Tax Returns */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Upcoming Tax Returns</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">Next 7 Days</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { client: 'M. Akram & Sons', type: 'Sales Tax Ret.', due: '25-09-2025', fee: 'Rs. 7,500' },
              { client: 'Haji Aslam Textiles', type: 'Withholding Q3', due: '28-09-2025', fee: 'Rs. 4,000' },
              { client: 'Dr. Shahzad Tariq', type: 'Income Tax', due: '30-09-2025', fee: 'Rs. 10,000' }
            ].map(item => (
              <div key={item.client} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0D2344]">{item.client}</div>
                  <div className="text-[10px] text-slate-500">{item.type} • Due: {item.due}</div>
                </div>
                <div className="font-bold text-[#1473E6] text-[11px]">{item.fee}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tasks Assigned to Staff */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Staff Tasks Assigned</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">4 Active</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { staff: 'Usama (Admin)', task: 'Reconcile Bank Chits', due: 'Today' },
              { staff: 'Chaudhry H.', task: 'FBR Audit Hearing Draft', due: 'Tomorrow' },
              { staff: 'Legal Associate', task: 'Upload CPR Challans', due: '26 Sep' }
            ].map(task => (
              <div key={task.task} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0D2344]">{task.task}</div>
                  <div className="text-[10px] text-slate-500">{task.staff}</div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {task.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Required Documents Checklist */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Documents Pipeline</span>
            </h4>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded">Pending</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { doc: 'Bank Statements (12M)', pending: '8 clients pending' },
              { doc: 'Advance Tax Withholding Certs', pending: '5 clients pending' },
              { doc: 'Property Purchase Registered Deeds', pending: '3 clients pending' }
            ].map(d => (
              <div key={d.doc} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-800 text-[11px]">{d.doc}</div>
                <div className="text-[10px] text-amber-700 font-medium">{d.pending}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Statutory Deadlines Calendar */}
        <div className="bg-white rounded-xl border border-[#DCE6F1] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-[#0D2344] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>FBR Statutory Calendar</span>
            </h4>
            <span className="text-[10px] text-purple-600 font-semibold">TY 2024/25</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { event: 'Annual Income Tax Return', date: '30 Sep 2025', alert: 'Critical' },
              { event: 'Monthly Sales Tax Return', date: '15 Oct 2025', alert: 'Standard' },
              { event: 'Withholding Quarterly Annex', date: '20 Oct 2025', alert: 'Standard' }
            ].map(cal => (
              <div key={cal.event} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">{cal.event}</div>
                  <div className="text-[10px] text-slate-500 tabular-nums">{cal.date}</div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  cal.alert === 'Critical' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {cal.alert}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
