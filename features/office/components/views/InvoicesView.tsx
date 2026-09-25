import React, { useState, useEffect } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CreditCard,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Trash2,
  ArrowRight
} from 'lucide-react';
import type { Invoice } from '@/types/office';

export const InvoicesView: React.FC = () => {
  const { clients } = useOffice();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice form state
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { description: 'Legal Drafting & Court Appearance Fee', quantity: 1, unit_price: 25000 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/office/invoices');
        const resJson = await res.json();
        if (resJson.success && resJson.invoices) {
          setInvoices(resJson.invoices);
        } else {
          throw new Error('Fallback needed');
        }
      } catch (err) {

        console.warn('[InvoicesView] Could not load live invoices:', err);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 5000 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/office/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          due_date: dueDate,
          notes: notes.trim() || null,
          items,
        }),
      });

      const resJson = await res.json();
      if (!resJson.success) throw new Error(resJson.error || 'Failed to create invoice');

      setInvoices(prev => [resJson.invoice, ...prev]);
      setIsNewInvoiceModalOpen(false);
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(Math.max(0, inv.total_amount - inv.paid_amount));
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/office/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoice_id: selectedInvoice.id,
          client_id: selectedInvoice.client_id,
          amount: Number(paymentAmount),
          payment_method: paymentMethod,
        }),
      });

      const resJson = await res.json();
      if (!resJson.success) throw new Error(resJson.error || 'Failed to record payment');

      // Update state locally
      setInvoices(prev => prev.map(inv => {
        if (inv.id === selectedInvoice.id) {
          const newPaid = inv.paid_amount + Number(paymentAmount);
          const newStatus = newPaid >= inv.total_amount ? 'paid' : 'partial';
          return { ...inv, paid_amount: newPaid, status: newStatus };
        }
        return inv;
      }));

      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);

    } catch (err: any) {
      alert(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.client_name && inv.client_name.toLowerCase().includes(q)) ||
      (inv.case_number && inv.case_number.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' ? true : inv.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paid_amount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Receipt className="w-6 h-6 text-white" />}
        title="Fee Invoices & Client Billing"
        subtitle="Issue professional chamber fee bills, track partial payments, reconcile outstanding receivables, and print formal tax receipts."
        breadcrumb={['Office Management', 'Billing & Invoices']}
        quote="“Transparent Accounting Builds Everlasting Trust”"
      >
        <button
          onClick={() => setIsNewInvoiceModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Fee Invoice</span>
        </button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <KpiCard
          label="Total Billed Fees"
          value={`Rs. ${totalBilled.toLocaleString()}`}
          change={`${invoices.length} Invoices`}
          changeType="positive"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Total Collected"
          value={`Rs. ${totalCollected.toLocaleString()}`}
          change="Realized Chamber Revenue"
          changeType="positive"
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Outstanding Dues"
          value={`Rs. ${totalOutstanding.toLocaleString()}`}
          change="Pending Recovery"
          changeType="neutral"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Fully Paid Ratio"
          value={`${invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%`}
          change="Collection Efficiency"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, client, case..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2 w-auto"
          >
            <option value="ALL">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Invoice No & Issue Date</th>
                <th>Client / Case</th>
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading fee invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const balance = Math.max(0, inv.total_amount - inv.paid_amount);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td>
                        <div className="font-bold text-[#0D2344] dark:text-slate-100 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-[#C8973D]" />
                          <span>{inv.invoice_number}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Issued: {inv.issue_date} (Due: {inv.due_date})
                        </div>
                      </td>

                      <td>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {inv.client_name || 'Client'}
                        </div>
                        {inv.case_number && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 tabular-nums">
                            Case: {inv.case_number}
                          </div>
                        )}
                      </td>

                      <td className="font-semibold text-slate-900 dark:text-slate-100">
                        Rs. {inv.total_amount.toLocaleString()}
                      </td>

                      <td className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Rs. {inv.paid_amount.toLocaleString()}
                      </td>

                      <td>
                        {balance > 0 ? (
                          <span className="font-bold text-red-600 dark:text-red-400">
                            Rs. {balance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">Cleared</span>
                        )}
                      </td>

                      <td>
                        <StatusBadge status={inv.status === 'paid' ? 'Paid' : inv.status === 'partial' ? 'Pending' : 'Overdue'} />
                      </td>

                      <td className="text-right">
                        {balance > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-md font-semibold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Paid In Full</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-xl p-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C8973D]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Generate Chamber Fee Invoice</h3>
              </div>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Client *
                  </label>
                  <select
                    required
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile || c.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Fee Items & Services
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        placeholder="Description of legal service..."
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                        required
                        className="input-field flex-1"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="input-field w-16 text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={item.unit_price}
                        onChange={e => handleItemChange(index, 'unit_price', Number(e.target.value))}
                        className="input-field w-28 text-right font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Notes / Payment Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deposit in Meezan Bank Chamber account or pay at Chamber 121 counter..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Generating Invoice...' : 'Generate & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Collect Fee Payment</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Invoice:</span>
                <strong className="text-slate-900 dark:text-slate-100">{selectedInvoice.invoice_number}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Client:</span>
                <span>{selectedInvoice.client_name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Amount:</span>
                <span>Rs. {selectedInvoice.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Outstanding:</span>
                <span>Rs. {(selectedInvoice.total_amount - selectedInvoice.paid_amount).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (Rs.) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.total_amount - selectedInvoice.paid_amount}
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="input-field text-base font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Channel
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="cash">Chamber Cash Counter (Chamber 121)</option>
                  <option value="bank_meezan">Meezan Bank Sahiwal</option>
                  <option value="jazzcash">JazzCash Business (0300-6925121)</option>
                  <option value="easypaisa">EasyPaisa Merchant (0300-6925121)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Receipt & Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
