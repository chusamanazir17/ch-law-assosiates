import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield
} from 'lucide-react';
import type { Profile, AttendanceRecord } from '@/types/office';

export const AttendanceView: React.FC = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [formStatus, setFormStatus] = useState<AttendanceRecord['status']>('present');
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Employees and Attendance
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        fetch('/api/office/employees').then(r => r.json()),
        fetch(`/api/office/attendance?date=${selectedDate}`).then(r => r.json())
      ]);

      if (empRes.success && empRes.employees) {
        setEmployees(empRes.employees);
      } else {
        // Fallback team seed
        setEmployees([]);
      }
    } catch (err) {
      console.warn('Attendance load fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Handle Mark Attendance
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/office/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmpId,
          date: selectedDate,
          status: formStatus,
          check_in_time: checkInTime || null,
          check_out_time: checkOutTime || null,
          notes: notes.trim() || null
        })
      });

      const data = await res.json();
      if (data.success) {
        await loadData();
        setIsModalOpen(false);
        setNotes('');
      } else {
        alert(data.error || 'Failed to record attendance');
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error recording attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change date helpers
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Merge employees with their attendance for this date
  const employeeRows = employees.map(emp => {
    const record = attendance.find(a => a.employee_id === emp.id);
    return {
      employee: emp,
      attendance: record || null
    };
  });

  const filteredRows = employeeRows.filter(({ employee, attendance: att }) => {
    const matchesSearch =
      (employee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      ((employee.email || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Boolean(att?.notes && att.notes.toLowerCase().includes(searchQuery.toLowerCase())));

    const status = att ? att.status : 'unmarked';
    const matchesStatus =
      statusFilter === 'ALL' ||
      status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const leaveCount = attendance.filter(a => a.status === 'leave').length;
  const totalStaff = employees.length || 4;

  const getStatusBadgeVariant = (status: AttendanceRecord['status'] | 'unmarked') => {
    switch (status) {
      case 'present':
        return 'active';
      case 'late':
        return 'warning';
      case 'absent':
        return 'cancelled';
      case 'leave':
        return 'refunded';
      default:
        return 'draft';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<UserCheck className="w-6 h-6 text-white" />}
        title="Chamber Staff Attendance & Biometrics Log"
        subtitle="Track daily chamber roster, presence verification, punch-in/out records, and leave requests."
        breadcrumb={['Office Management', 'Staff Attendance']}
        quote="“Discipline, Punctuality & Professional Integrity”"
      />

      {/* Date Navigation & Actions Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0E2034] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
            <Calendar className="w-4 h-4 text-[#B8832A]" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 dark:text-white outline-hidden cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#B8832A] dark:text-blue-400 hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => {
            if (employees.length > 0) setSelectedEmpId(employees[0].id);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#B8832A] hover:bg-[#1162C4] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Attendance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="PRESENT TODAY"
          value={presentCount}
          subValue={`${Math.round((presentCount / (totalStaff || 1)) * 100)}% Chamber Presence`}
          change="Chamber 121 Staff"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40"
        />

        <KpiCard
          label="LATE ARRIVALS"
          value={lateCount}
          subValue="After 09:30 AM"
          change={lateCount > 0 ? "Flagged for review" : "All on time"}
          changeType={lateCount > 0 ? "negative" : "positive"}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-[#F59E0B] dark:bg-amber-950/40"
        />

        <KpiCard
          label="ON LEAVE / ABSENT"
          value={leaveCount}
          subValue="Approved / Sanctioned"
          change="Chamber roster"
          changeType="neutral"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-[#8B5CF6] dark:bg-purple-950/40"
        />

        <KpiCard
          label="TOTAL ROSTER"
          value={totalStaff}
          subValue="Advocates & Staff"
          change="District Court Sahiwal"
          changeType="neutral"
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#B8832A] dark:bg-blue-950/40"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0E2034] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#B8832A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-[#B8832A] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-[#0E2034] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-in</th>
                <th className="py-3.5 px-4">Check-out</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes / Duty Desk</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading attendance records for {selectedDate}...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No staff records found for this date.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ employee, attendance: att }) => {
                  const status = att ? att.status : 'unmarked';
                  return (
                    <tr
                      key={employee.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#B8832A] flex items-center justify-center font-bold text-xs shrink-0">
                            {employee.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {employee.full_name || 'Staff Member'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {employee.email || employee.phone || 'Chamber Staff'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-xs text-slate-500 dark:text-slate-400">
                        {selectedDate}
                      </td>
                      <td className="py-3.5 px-4">
                        {att?.check_in_time ? (
                          <span className="tabular-nums text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {att.check_in_time}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">--:--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {att?.check_out_time ? (
                          <span className="tabular-nums text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {att.check_out_time}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">--:--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={status.toUpperCase()}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {att?.notes || 'General Chamber Duties'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedEmpId(employee.id);
                            if (att) {
                              setFormStatus(att.status);
                              setCheckInTime(att.check_in_time || '09:00');
                              setCheckOutTime(att.check_out_time || '17:00');
                              setNotes(att.notes || '');
                            } else {
                              setFormStatus('present');
                              setCheckInTime('09:00');
                              setCheckOutTime('17:00');
                              setNotes('');
                            }
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#B8832A] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E2034] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#B8832A]" />
                <h3 className="font-bold text-slate-900 dark:text-white">Record Attendance</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Member
                </label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.email || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                >
                  <option value="present">Present</option>
                  <option value="late">Late Arrival</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Approved Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={e => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={e => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duty Desk / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. LHC Cause List, E-Stamp Counter, FBR Tax Filing"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#B8832A] hover:bg-[#1162C4] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
