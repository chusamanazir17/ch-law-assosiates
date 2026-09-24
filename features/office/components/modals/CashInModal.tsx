import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, ArrowDownLeft, CheckCircle2, User, FileText, Wallet } from 'lucide-react';
import { AccountType } from '../../types';

export const CashInModal: React.FC = () => {
  const { isQuickCashInOpen, setIsQuickCashInOpen, recordCashIn, clients } = useOffice();

  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [serviceName, setServiceName] = useState('Income Tax Return');
  const [amount, setAmount] = useState<number | ''>(5000);
  const [account, setAccount] = useState<AccountType | string>('cash');
  const [notes, setNotes] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [staff, setStaff] = useState('Usama');

  if (!isQuickCashInOpen) return null;

  const handleClientSelect = (cName: string) => {
    setClientName(cName);
    const found = clients.find(c => c.name === cName);
    if (found) {
      setClientId(found.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount || Number(amount) <= 0) {
      alert('Please enter a valid client name and amount');
      return;
    }

    recordCashIn({
      clientName,
      clientId: clientId || undefined,
      serviceName,
      amount: Number(amount),
      account,
      notes,
      staff,
      createReceipt: generateReceipt
    });

    setIsQuickCashInOpen(false);
    // Reset form
    setClientName('');
    setAmount(5000);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0B1B2C] to-[#122B42] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Record Cash In (Income)</h2>
              <p className="text-[11px] text-slate-300">
                Receive client payment into office accounts and generate receipt
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickCashInOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Client Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Client Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={clientName}
                onChange={e => {
                  setClientName(e.target.value);
                  setClientId('');
                }}
                placeholder="Type client name or select..."
                className="flex-1 h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-hidden focus:border-[#1473E6]"
              />
              <select
                onChange={e => handleClientSelect(e.target.value)}
                className="w-36 h-9 px-2 bg-slate-50 border border-[#DCE6F1] rounded-lg text-slate-700"
              >
                <option value="">Quick Select</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Service / Reason *</label>
              <select
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900"
              >
                <option value="Income Tax Return">Income Tax Return</option>
                <option value="Sales Tax Return">Sales Tax Return</option>
                <option value="E-Stamp Paper">E-Stamp Paper</option>
                <option value="Affidavit / Declaration">Affidavit / Declaration</option>
                <option value="NTN Registration">NTN Registration</option>
                <option value="Sales Tax Registration">Sales Tax Registration</option>
                <option value="Agreement Drafting">Agreement Drafting</option>
                <option value="Partnership Deed">Partnership Deed</option>
                <option value="FBR Notice Reply">FBR Notice Reply</option>
                <option value="Other Composing Service">Other Composing Service</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (PKR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-semibold">Rs.</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 pl-9 pr-3 border border-[#DCE6F1] rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-[#1473E6]"
                />
              </div>
            </div>
          </div>

          {/* Payment Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Deposit To Account *</label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900 font-medium"
              >
                <option value="cash">Cash in Office (Drawer)</option>
                <option value="bank">Bank Account (HBL Main)</option>
                <option value="jazzcash">JazzCash (0300-1234567)</option>
                <option value="easypaisa">EasyPaisa (0345-7654321)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Received By Staff</label>
              <select
                value={staff}
                onChange={e => setStaff(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900"
              >
                <option value="Usama">Usama (Admin)</option>
                <option value="Chaudhry H.">Chaudhry H. (Lead)</option>
                <option value="Staff Member">Staff Member</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Description</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Tax Year 2024 filing fee full payment"
              className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900"
            />
          </div>

          {/* Checkbox: Auto Receipt */}
          <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
            <input
              type="checkbox"
              id="autoReceipt"
              checked={generateReceipt}
              onChange={e => setGenerateReceipt(e.target.checked)}
              className="w-4 h-4 text-[#1473E6] rounded border-slate-300"
            />
            <label htmlFor="autoReceipt" className="text-slate-800 font-medium cursor-pointer">
              Auto-generate official office receipt (REC-2025-XXXXXX)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuickCashInOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Cash In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
