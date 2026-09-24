import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { AccountType } from '../../types';

export const TransferModal: React.FC = () => {
  const { isTransferModalOpen, setIsTransferModalOpen, recordTransfer, accountBalances } = useOffice();

  const [fromAccount, setFromAccount] = useState<AccountType | string>('cash');
  const [toAccount, setToAccount] = useState<AccountType | string>('bank');
  const [amount, setAmount] = useState<number | ''>(25000);
  const [notes, setNotes] = useState('');

  if (!isTransferModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      alert('Source and destination accounts must be different');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }

    recordTransfer({
      fromAccount,
      toAccount,
      amount: Number(amount),
      notes: notes || `Internal account transfer from ${fromAccount} to ${toAccount}`
    });

    setIsTransferModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-[#0B1B2C] to-[#122B42] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Transfer Between Accounts</h2>
              <p className="text-[11px] text-slate-300">
                Move cash between drawer, bank, and mobile wallets
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 mb-1">Current Account Balances:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Cash Office: <span className="font-bold text-slate-800">Rs. {accountBalances.cashOffice.toLocaleString()}</span></div>
              <div>HBL Bank: <span className="font-bold text-slate-800">Rs. {accountBalances.bankAccount.toLocaleString()}</span></div>
              <div>JazzCash: <span className="font-bold text-slate-800">Rs. {accountBalances.jazzCash.toLocaleString()}</span></div>
              <div>EasyPaisa: <span className="font-bold text-slate-800">Rs. {accountBalances.easyPaisa.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">From Account *</label>
              <select
                value={fromAccount}
                onChange={e => setFromAccount(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900 font-medium"
              >
                <option value="cash">Cash in Office</option>
                <option value="bank">Bank Account (HBL)</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">To Account *</label>
              <select
                value={toAccount}
                onChange={e => setToAccount(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900 font-medium"
              >
                <option value="bank">Bank Account (HBL)</option>
                <option value="cash">Cash in Office</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Transfer Amount (PKR) *</label>
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

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Deposit Slip / Reference / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Deposited excess cash into HBL Kachahri branch"
              className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
