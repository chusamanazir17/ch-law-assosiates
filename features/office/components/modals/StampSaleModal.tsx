import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, FileCheck2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AccountType } from '../../types';

export const StampSaleModal: React.FC = () => {
  const { isStampSaleModalOpen, setIsStampSaleModalOpen, stampStock, recordStampSale, clients } = useOffice();

  const [denomination, setDenomination] = useState<number>(100);
  const [quantity, setQuantity] = useState<number | ''>(2);
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [account, setAccount] = useState<AccountType | string>('cash');
  const [notes, setNotes] = useState('');

  if (!isStampSaleModalOpen) return null;

  const currentItem = stampStock.find(s => s.denomination === denomination);
  const availableStock = currentItem ? currentItem.remaining : 0;
  const qty = quantity === '' ? 0 : Number(quantity);
  const totalAmount = denomination * qty;

  const handleClientSelect = (cName: string) => {
    setClientName(cName);
    const found = clients.find(c => c.name === cName);
    if (found) {
      setClientId(found.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (qty > availableStock) {
      alert(`Cannot sell ${qty} stamps. Only ${availableStock} in stock.`);
      return;
    }
    if (!clientName.trim()) {
      alert('Please provide the purchaser / client name');
      return;
    }

    recordStampSale({
      denomination,
      quantity: qty,
      clientName,
      clientId: clientId || undefined,
      paymentAccount: account,
      notes: notes || `Sale of ${qty}x Rs. ${denomination} stamps`,
      staff: 'Usama'
    });

    setIsStampSaleModalOpen(false);
    setClientName('');
    setQuantity(2);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-[#0B1B2C] to-[#122B42] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Issue & Sell Stamp Paper</h2>
              <p className="text-[11px] text-slate-300">
                Disburse e-stamp inventory, collect payment, and generate receipt
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStampSaleModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Denomination Picker */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Denomination *</label>
            <div className="grid grid-cols-6 gap-2">
              {[50, 100, 200, 500, 1000, 5000].map(den => {
                const stockItem = stampStock.find(s => s.denomination === den);
                const rem = stockItem ? stockItem.remaining : 0;
                const isSelected = denomination === den;

                return (
                  <button
                    key={den}
                    type="button"
                    onClick={() => setDenomination(den)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1473E6] bg-blue-50/70 text-[#1473E6] font-bold shadow-xs'
                        : 'border-[#DCE6F1] bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[12px] font-bold">Rs.{den}</div>
                    <div className={`text-[10px] ${rem <= 5 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {rem} left
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Stock Banner */}
          <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div>
              <div className="text-slate-500 text-[11px]">Selected Stamp:</div>
              <div className="text-sm font-bold text-[#0D2344]">Rs. {denomination} E-Stamp Paper</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-[11px]">Available in Vault:</div>
              <div className={`text-sm font-bold ${availableStock < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {availableStock} Units
              </div>
            </div>
          </div>

          {/* Quantity & Client */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantity to Issue *</label>
              <input
                type="number"
                min="1"
                max={availableStock}
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-[#1473E6]"
              />
              {qty > availableStock && (
                <div className="text-rose-600 text-[10px] font-semibold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Exceeds available stock ({availableStock})
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Bill (PKR)</label>
              <div className="h-9 px-3 bg-slate-50 border border-[#DCE6F1] rounded-lg text-slate-900 font-bold flex items-center text-sm text-[#1473E6]">
                Rs. {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Purchaser / Client Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={clientName}
                onChange={e => {
                  setClientName(e.target.value);
                  setClientId('');
                }}
                placeholder="Purchaser name or deed party..."
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

          {/* Payment Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Received Into *</label>
              <select
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#DCE6F1] rounded-lg text-slate-900 font-medium"
              >
                <option value="cash">Cash in Office (Drawer)</option>
                <option value="bank">Bank Account (HBL)</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Purpose / Deed Type</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Affidavit / Sale Agreement"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStampSaleModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={qty <= 0 || qty > availableStock}
              className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Stamp Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
