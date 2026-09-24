import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AccountType } from '../../types';

export const CashOutModal: React.FC = () => {
  const { isQuickCashOutOpen, setIsQuickCashOutOpen, recordCashOut } = useOffice();

  const [category, setCategory] = useState('Printing & Stationery');
  const [payeeDescription, setPayeeDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>(1200);
  const [account, setAccount] = useState<AccountType | string>('cash');
  const [notes, setNotes] = useState('');
  const [staff, setStaff] = useState('Usama');

  if (!isQuickCashOutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeDescription || !amount || Number(amount) <= 0) {
      alert('Please fill out vendor/payee and valid amount');
      return;
    }

    recordCashOut({
      category,
      payeeDescription,
      amount: Number(amount),
      account,
      notes,
      staff
    });

    setIsQuickCashOutOpen(false);
    setPayeeDescription('');
    setAmount(1200);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0B1B2C] to-[#122B42] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F43F5E] flex items-center justify-center text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Record Cash Out (Expense)</h2>
              <p className="text-[11px] text-slate-300">
                Log an office expense and disburse funds from accounts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickCashOutOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900"
              >
                <option value="Printing & Stationery">Printing & Stationery</option>
                <option value="Tea & Refreshments">Tea & Refreshments</option>
                <option value="Office Rent">Office Rent</option>
                <option value="Electricity">Electricity Bill</option>
                <option value="Internet & Telephone">Internet & Telephone</option>
                <option value="Staff Salaries">Staff Salaries / Advance</option>
                <option value="Stamp Paper Purchase">Stamp Paper Purchase</option>
                <option value="Office Maintenance">Office Maintenance</option>
                <option value="Courier & Postage">Courier & Postage</option>
                <option value="Govt / Challan Fees">Govt / Challan Fees</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Disburse From Account *</label>
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
          </div>

          {/* Payee / Vendor & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Payee Description *</label>
              <input
                type="text"
                required
                value={payeeDescription}
                onChange={e => setPayeeDescription(e.target.value)}
                placeholder="e.g. Al-Madina Stationers, Tea boy, MEPCO"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-hidden focus:border-[#1473E6]"
              />
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

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Purpose / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. A4 paper reams (2 boxes) + stamp ink"
              className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900"
            />
          </div>

          {/* Authorized Staff */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Authorized By</label>
            <select
              value={staff}
              onChange={e => setStaff(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900"
            >
              <option value="Usama">Usama (Admin)</option>
              <option value="Chaudhry H.">Chaudhry H. (Lead)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuickCashOutOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Cash Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
