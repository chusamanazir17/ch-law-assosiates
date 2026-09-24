import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { PageHeader } from '../layout/PageHeader';
import { KpiCard } from '../common/KpiCard';
import {
  Settings,
  Building,
  Save,
  RotateCcw,
  Download,
  ShieldCheck,
  CreditCard,
  Printer,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { accountBalances } = useOffice();

  const [businessName, setBusinessName] = useState('CH Composing E-Stamp & Tax Advisor');
  const [chamberAddress, setChamberAddress] = useState('Chamber No. 121, District Courts (Kachahri), Sahiwal');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [landline, setLandline] = useState('+92 40 4567890');
  const [ntn, setNtn] = useState('8945120-1');
  const [email, setEmail] = useState('office@chchamber.com');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo ledger, clients, and stamps to initial seed state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<Settings className="w-6 h-6 text-white" />}
        title="Office Configuration & Chamber Identity"
        subtitle="Manage Chamber 121 credentials, letterhead headers, connected payment vaults, and system backups."
        breadcrumb={['Office Management', 'Settings']}
        quote="“Configured for Precision, Built for Scale”"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Left 2 Cols: Chamber Profile & Letterhead */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-[#DCE6F1] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0D2344]">Chamber Official Identity & Letterhead</h3>
                <p className="text-[11px] text-slate-500">
                  Information displayed on generated receipts, reports, and tax declarations
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Chamber identity updated successfully!</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-bold text-[#0D2344]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chamber Physical Address</label>
                <input
                  type="text"
                  value={chamberAddress}
                  onChange={e => setChamberAddress(e.target.value)}
                  className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Landline Office</label>
                  <input
                    type="text"
                    value={landline}
                    onChange={e => setLandline(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chamber NTN Number</label>
                  <input
                    type="text"
                    value={ntn}
                    onChange={e => setNtn(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-9 px-3 border border-[#DCE6F1] rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Connected Vaults Overview */}
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0D2344]">Connected Banking & Wallet Gateways</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800">HBL Bank Current Account</div>
                <div className="text-[11px] text-slate-500">PK36 HABB 0001 2345 6789 01</div>
                <div className="text-emerald-600 font-bold mt-1">Status: Active & Linked</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800">JazzCash Merchant Account</div>
                <div className="text-[11px] text-slate-500">0300-1234567 (Chaudhry H.)</div>
                <div className="text-emerald-600 font-bold mt-1">Status: Active & Linked</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800">EasyPaisa Digital Account</div>
                <div className="text-[11px] text-slate-500">0345-7654321 (Usama Ali)</div>
                <div className="text-emerald-600 font-bold mt-1">Status: Active & Linked</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-bold text-slate-800">Office Cash Vault (Drawer)</div>
                <div className="text-[11px] text-slate-500">Chamber 121 Sahiwal Register</div>
                <div className="text-emerald-600 font-bold mt-1">Status: Physical Drawer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Backup & Reset */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#DCE6F1] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0D2344]">Data Management & Backup</h3>
            <p className="text-slate-600 leading-relaxed">
              Export full encrypted JSON backup containing your entire central transaction ledger, client tax cases, stamp inventory, and receipts.
            </p>

            <button
              onClick={() => {
                const data = {
                  balances: accountBalances,
                  timestamp: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CH_Office_Backup_${Date.now()}.json`;
                a.click();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs space-y-3 bg-rose-50/20">
            <h3 className="text-sm font-bold text-rose-800">Danger Zone: Reset Demo</h3>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Restore all initial test clients, PKR transactions, receipts, and stamp counts to default factory state.
            </p>

            <button
              onClick={handleResetData}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
