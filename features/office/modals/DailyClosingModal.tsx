import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, Lock, Unlock, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

export const DailyClosingModal: React.FC = () => {
  const { isCloseDayModalOpen, setIsCloseDayModalOpen, dailyClosing, closeDay, reopenDay } = useOffice();

  const [actualCash, setActualCash] = useState<number | ''>(dailyClosing.expectedCash);
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  if (!isCloseDayModalOpen) return null;

  const expected = dailyClosing.expectedCash;
  const currentActual = actualCash === '' ? 0 : Number(actualCash);
  const diff = currentActual - expected;

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualCash === '') {
      alert('Please enter actual cash counted in drawer');
      return;
    }
    if (diff !== 0 && !discrepancyReason.trim()) {
      alert('Please state a reason for the discrepancy before closing');
      return;
    }

    closeDay(currentActual, discrepancyReason);
    setIsCloseDayModalOpen(false);
  };

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please provide a reason to reopen today\'s closing');
      return;
    }
    reopenDay(reopenReason);
    setIsReopening(false);
    setIsCloseDayModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-[#0B1B2C] to-[#122B42] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F70F5] flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Daily Cash Register Closing</h2>
              <p className="text-[11px] text-slate-300">
                Verify physical drawer cash against system expected balance
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCloseDayModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dailyClosing.isClosed && !isReopening ? (
          <div className="p-5 space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Today is Closed & Locked</div>
                <p className="mt-1 text-emerald-700">
                  Closed by {dailyClosing.closedBy} at {dailyClosing.closedAt}.
                </p>
                <div className="mt-2 text-xs font-semibold text-emerald-900">
                  Actual Counted: Rs. {dailyClosing.actualCash?.toLocaleString()} | Diff: Rs. {dailyClosing.difference?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCloseDayModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setIsReopening(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Reopen Day (Authorize)</span>
              </button>
            </div>
          </div>
        ) : isReopening ? (
          <form onSubmit={handleReopen} className="p-5 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Reopen Authorization Required</div>
                <div className="text-[11px]">
                  All modifications to closed days are recorded in the central audit trail.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Reopening *</label>
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                placeholder="State the audit explanation (e.g. Late stamp sale recorded after 7 PM)"
                className="w-full p-2.5 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-hidden focus:border-[#1473E6]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReopening(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Confirm Reopen</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleClose} className="p-5 space-y-4 text-xs">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Date:</span>
                <span className="font-bold text-slate-800">{dailyClosing.date}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Opening Cash:</span>
                <span className="font-semibold text-slate-800">Rs. {(dailyClosing.openingBalance ?? dailyClosing.openingCash ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Today's Cash In:</span>
                <span className="font-semibold text-emerald-600">+ Rs. {dailyClosing.cashIn.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Today's Cash Out:</span>
                <span className="font-semibold text-rose-600">- Rs. {dailyClosing.cashOut.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-[#0D2344]">
                <span>System Expected Cash:</span>
                <span className="text-[#1473E6]">Rs. {expected.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Actual Physical Cash Counted in Drawer (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-semibold">Rs.</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={actualCash}
                  onChange={e => setActualCash(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 pl-9 pr-3 border border-[#DCE6F1] rounded-lg text-slate-900 font-bold text-base focus:outline-hidden focus:border-[#1473E6]"
                />
              </div>
            </div>

            {/* Difference preview */}
            <div className={`p-3 rounded-xl border flex items-center justify-between font-bold ${
              diff === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : diff > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <span>Difference / Variance:</span>
              <span className="text-sm">
                {diff === 0 ? 'Rs. 0 (Balanced)' : `${diff > 0 ? '+ Rs. ' : '- Rs. '}${Math.abs(diff).toLocaleString()}`}
              </span>
            </div>

            {diff !== 0 && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Discrepancy Explanation (Required for non-zero variance) *
                </label>
                <input
                  type="text"
                  required
                  value={discrepancyReason}
                  onChange={e => setDiscrepancyReason(e.target.value)}
                  placeholder="e.g. Client underpaid Rs. 100, pending clearance tomorrow"
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCloseDayModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F70F5] hover:bg-[#1473E6] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Lock Day</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
