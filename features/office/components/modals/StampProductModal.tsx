import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, Plus, Loader2 } from 'lucide-react';

export const StampProductModal: React.FC = () => {
  const { isStampProductModalOpen, setIsStampProductModalOpen, refreshData } = useOffice();

  const [denomination, setDenomination] = useState<number | ''>(100);
  const [quantity, setQuantity] = useState<number | ''>(100);
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(90);
  const [salePrice, setSalePrice] = useState<number | ''>(100);
  const [minimumLevel, setMinimumLevel] = useState<number | ''>(20);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isStampProductModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const den = Number(denomination);
    const qty = Number(quantity);
    const pp = Number(purchasePrice);
    const sp = Number(salePrice);

    if (!den || den <= 0) {
      setError('Please enter a valid stamp denomination.');
      return;
    }
    if (qty < 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    if (!pp || pp <= 0 || !sp || sp <= 0) {
      setError('Please enter valid purchase and sale prices.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/office/stamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_product',
          denomination: den,
          purchase_price: pp,
          sale_price: sp,
          current_stock: qty,
          minimum_stock: Number(minimumLevel) || 20
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to add stamp product.');
      }
      await refreshData();
      setIsStampProductModalOpen(false);
      setDenomination(100);
      setQuantity(100);
      setPurchasePrice(90);
      setSalePrice(100);
      setMinimumLevel(20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stamp product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#DCE6F1] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#05162B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B8832A] flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Add Stamp Product</h2>
              <p className="text-[11px] text-slate-300">
                New denomination with opening quantity and pricing
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStampProductModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Stamp Denomination (Rs.) *</label>
            <input
              type="number"
              required
              min="1"
              value={denomination}
              onChange={e => setDenomination(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 100"
              className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#B8832A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity (Opening Stock) *</label>
              <input
                type="number"
                required
                min="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-none focus:border-[#B8832A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Stock Level</label>
              <input
                type="number"
                min="0"
                value={minimumLevel}
                onChange={e => setMinimumLevel(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 20"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-none focus:border-[#B8832A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 90"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-none focus:border-[#B8832A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sale Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg text-slate-900 focus:outline-none focus:border-[#B8832A]"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsStampProductModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#B8832A] hover:bg-[#96691B] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Saving…' : 'Add Stamp Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
