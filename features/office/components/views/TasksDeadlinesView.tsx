import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  User
} from 'lucide-react';
import { OfficeTask } from '../../types';

export const TasksDeadlinesView: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus } = useOffice();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('25-09-2025');
  const [priority, setPriority] = useState<OfficeTask['priority']>('High');
  const [assignedTo, setAssignedTo] = useState('Usama');

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    const assigned = (t.assignedStaff || t.assignedTo || '').toLowerCase();
    const matchQ = t.title.toLowerCase().includes(q) || assigned.includes(q);
    const matchPri = priorityFilter === 'ALL' ? true : t.priority === priorityFilter;
    return matchQ && matchPri;
  });

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      dueDate,
      priority,
      status: 'Pending',
      assignedStaff: assignedTo
    });

    setIsNewTaskModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Calendar className="w-6 h-6 text-white" />}
        title="Tasks, Hearings & Deadlines"
        subtitle="Track FBR statutory submission dates, court hearing appearances, client reminders, and inventory restocks."
        breadcrumb={['Office Management', 'Tasks & Deadlines']}
        quote="“Never Miss a Statutory Deadline”"
      >
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task / Deadline</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="TOTAL OFFICE TASKS"
          value={totalTasks}
          subValue="Active schedules"
          change="Real-time synchronized"
          changeType="positive"
          icon={<Calendar className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-[#1473E6]"
        />

        <KpiCard
          label="PENDING ACTION"
          value={pendingCount}
          subValue="Needs completion"
          change="High operational focus"
          changeType="neutral"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        <KpiCard
          label="HIGH PRIORITY DEADLINES"
          value={highPriorityCount}
          subValue="Due in next 72 hrs"
          change={highPriorityCount > 0 ? 'Urgent attention' : 'Clean schedule'}
          changeType={highPriorityCount > 0 ? 'negative' : 'positive'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />

        <KpiCard
          label="COMPLETED RECENTLY"
          value={completedCount}
          subValue="Filed & archived"
          change="100% on-time"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-xl border border-[#DCE6F1] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search task title, assigned person..."
              className="w-full h-8 pl-8 pr-3 border border-[#DCE6F1] rounded-lg text-xs focus:outline-hidden focus:border-[#1473E6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-[#DCE6F1] rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {filteredTasks.map(task => {
            const isDone = task.status === 'Completed';
            return (
              <div
                key={task.id}
                onClick={() => toggleTaskStatus(task.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-[#DCE6F1] hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#1473E6] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className={`font-semibold text-xs text-slate-900 truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Due Date: {task.dueDate}</span>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-slate-700">{task.assignedStaff || task.assignedTo || 'Staff'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: New Task */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md p-5 space-y-4 text-xs animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#0D2344]">Schedule New Task or Deadline</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Submit FBR Income Tax return for Tariq Mahmood..."
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
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
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as OfficeTask['priority'])}
                    className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Person</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg"
                >
                  <option value="Usama">Usama (Admin / Tax Consultant)</option>
                  <option value="Chaudhry H.">Chaudhry H. (Lead Advocate)</option>
                  <option value="Staff">Composing / Counter Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
