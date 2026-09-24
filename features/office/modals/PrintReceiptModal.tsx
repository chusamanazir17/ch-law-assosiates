import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, Printer, Ban, CheckCircle2, Download, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface PrintReceiptModalProps {
  receiptId: string | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ receiptId, onClose }) => {
  const { receipts, cancelReceipt } = useOffice();
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  if (!receiptId) return null;

  const receipt = receipts.find(r => r.id === receiptId || r.receiptNo === receiptId);
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setCancelError('Audit compliance requires a reason to cancel an issued receipt');
      return;
    }

    cancelReceipt(receipt.id, cancelReason);
    setIsCancelMode(false);
    setCancelError('');
  };

  // Convert numbers to simple Pakistani Rupee words
  const numberToWords = (num: number) => {
    if (num === 8000) return 'Eight Thousand Rupees Only';
    if (num === 5000) return 'Five Thousand Rupees Only';
    if (num === 2000) return 'Two Thousand Rupees Only';
    if (num === 12000) return 'Twelve Thousand Rupees Only';
    if (num === 3500) return 'Three Thousand Five Hundred Rupees Only';
    if (num === 500) return 'Five Hundred Rupees Only';
    return `${num.toLocaleString()} Rupees Only`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-2xl overflow-hidden my-6">
        {/* Modal Top Actions */}
        <div className="px-5 py-3 bg-[#0B1B2C] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Receipt Preview: {receipt.receiptNo}</span>
            <StatusBadge status={receipt.status} />
          </div>
          <div className="flex items-center gap-2">
            {receipt.status !== 'CANCELLED' && (
              <>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-[#1473E6] hover:bg-[#0F70F5] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsCancelMode(!isCancelMode)}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel / Reverse</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cancellation Reason Drawer */}
        {isCancelMode && (
          <form onSubmit={handleCancelReceipt} className="p-4 bg-rose-50 border-b border-rose-200 text-xs">
            <div className="flex items-start gap-2 mb-2 text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice: Receipts are never silently deleted.</span>
                <p className="text-[11px] text-rose-700">
                  Cancelling this receipt will record an offsetting reversal in the ledger and log your user, time, and reason in the audit trail.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={cancelReason}
                onChange={e => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError('');
                }}
                placeholder="Enter cancellation reason (e.g. Wrong amount entered / Client cancelled service)..."
                className="flex-1 h-9 px-3 bg-white border border-rose-300 rounded-lg text-rose-900 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer shrink-0"
              >
                Confirm Cancellation
              </button>
            </div>
            {cancelError && (
              <p className="mt-1.5 text-[11px] text-rose-600 font-semibold">{cancelError}</p>
            )}
          </form>
        )}

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 text-[#0D2344] bg-white relative">
          {/* Watermark if Cancelled */}
          {receipt.status === 'CANCELLED' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15">
              <span className="text-7xl font-black text-rose-600 tracking-widest uppercase transform -rotate-45 border-8 border-rose-600 px-8 py-4 rounded-2xl">
                CANCELLED
              </span>
            </div>
          )}

          {/* Letterhead Header */}
          <div className="border-b-2 border-[#0B1B2C] pb-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#0B1B2C] border-2 border-amber-400 flex items-center justify-center p-1 shrink-0">
                  <span className="font-['Playfair_Display',serif] font-black text-2xl text-amber-400">
                    CH
                  </span>
                </div>
                <div>
                  <h1 className="text-[18px] font-black tracking-tight uppercase text-[#0B1B2C] font-['Playfair_Display',serif]">
                    CH Composing E-Stamp & Tax Advisor
                  </h1>
                  <div className="text-[11px] font-bold text-[#1473E6] uppercase tracking-wider">
                    Tax Consultants & Legal Composing Services
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Chamber No. 121, District Courts (Kachahri), Sahiwal
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600 leading-tight">
                <div className="font-bold text-[#0D2344]">Phone: +92 300 1234567</div>
                <div>Landline: +92 40 4567890</div>
                <div className="text-[10px] text-slate-400">NTN: 8945120-1</div>
              </div>
            </div>
          </div>

          {/* Receipt Info Bar */}
          <div className="bg-[#F8FAFC] border border-[#DCE6F1] rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Receipt No: </span>
              <span className="font-mono font-bold text-[#0D2344]">{receipt.receiptNo}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Date & Time: </span>
              <span className="font-semibold text-slate-800">{receipt.dateTime}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Payment Mode: </span>
              <span className="font-semibold text-slate-800">{receipt.paymentMethod}</span>
            </div>
            <div>
              <StatusBadge status={receipt.status} />
            </div>
          </div>

          {/* Client Details Box */}
          <div className="border border-slate-200 rounded-xl p-3.5 mb-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Received With Thanks From:</span>
                <div className="text-sm font-bold text-[#0D2344] mt-0.5">{receipt.clientName}</div>
                <div className="text-[11px] text-slate-600">Client ID: {receipt.clientId || 'WALK-IN'}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Service Description:</span>
                <div className="text-sm font-bold text-[#1473E6] mt-0.5">{receipt.service}</div>
                <div className="text-[11px] text-slate-600 italic">{receipt.remarks || 'Professional consultancy'}</div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0B1B2C] text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Particulars / Service Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-3 text-slate-400">1</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{receipt.service}</td>
                  <td className="py-3 px-3 text-center">1</td>
                  <td className="py-3 px-3 text-right">Rs. {receipt.amount.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#0D2344]">
                    Rs. {receipt.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Amount in Words */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 text-xs">
            <div className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 w-full">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Amount in Words:</div>
              <div className="text-xs font-bold text-[#0D2344] italic mt-1">
                {numberToWords(receipt.paidAmount)}
              </div>
              {receipt.cancellationReason && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-rose-700 text-[11px]">
                  <strong>Cancellation Reason:</strong> {receipt.cancellationReason}
                </div>
              )}
            </div>

            <div className="w-full sm:w-60 space-y-1.5 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-bold text-slate-800">Rs. {receipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid Amount:</span>
                <span className="font-bold text-emerald-600">Rs. {receipt.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className={`font-bold ${receipt.balance > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  Rs. {receipt.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <div className="text-[11px] text-slate-500">Customer Signature</div>
            </div>

            {/* Official Circular Stamp */}
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#1473E6] flex flex-col items-center justify-center p-1 text-center text-[8px] font-bold text-[#1473E6] uppercase tracking-tighter rotate-[-12deg] opacity-80">
              <span>CH Chamber</span>
              <span className="text-[7px]">Sahiwal Courts</span>
              <span className="text-[10px] text-amber-500 font-black">★ VERIFIED ★</span>
              <span>No. 121</span>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-slate-400 mb-1">
                <span className="font-['Playfair_Display',serif] italic font-bold text-blue-900 text-xs">
                  Usama Ali
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#0D2344]">Authorized Signatory</div>
              <div className="text-[9px] text-slate-400">CH Composing & Tax Advisor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
