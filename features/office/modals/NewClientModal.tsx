import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { Client } from '../../types';

export const NewClientModal: React.FC = () => {
  const { isNewClientModalOpen, setIsNewClientModalOpen, addClient } = useOffice();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('03');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [ntn, setNtn] = useState('');
  const [type, setType] = useState<string>('Individual');
  const [address, setAddress] = useState('Sahiwal');
  const [status, setStatus] = useState<Client['status']>('Active');
  const [initialOutstanding, setInitialOutstanding] = useState<number | ''>(0);

  if (!isNewClientModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill out client name and mobile number');
      return;
    }

    addClient({
      name,
      businessName: businessName || '',
      mobile: phone,
      phone,
      email: email || '',
      cnic: cnic || '36502-XXXXXXX-X',
      ntn: ntn || '',
      businessType: (type as Client['businessType']) || 'Individual',
      type,
      status,
      taxStatus: 'Active',
      address,
      outstanding: initialOutstanding === '' ? 0 : Number(initialOutstanding)
    });

    setIsNewClientModalOpen(false);
    setName('');
    setBusinessName('');
    setPhone('03');
    setEmail('');
    setCnic('');
    setNtn('');
    setInitialOutstanding(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B1B2C] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1473E6] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Client Account</h2>
              <p className="text-xs text-slate-300">Create client record for Tax, E-Stamp, and Composing</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewClientModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. M. Tariq Chaudhry"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business / Trade Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Tariq Goods Transport Co."
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CNIC Number (13 Digits)
              </label>
              <input
                type="text"
                value={cnic}
                onChange={e => setCnic(e.target.value)}
                placeholder="36502-1234567-1"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NTN Number (7 Digits - Check Digit)
              </label>
              <input
                type="text"
                value={ntn}
                onChange={e => setNtn(e.target.value)}
                placeholder="1234567-8"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Entity Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:border-[#1473E6]"
              >
                <option value="Individual">Individual (Salaried / Person)</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership / AOP</option>
                <option value="Private Limited">Private Limited Company</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Client['status'])}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:border-[#1473E6]"
              >
                <option value="Active">Active</option>
                <option value="Outstanding">Has Outstanding Balance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Grain Market, Sahiwal"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opening Outstanding Balance (PKR)
            </label>
            <input
              type="number"
              min="0"
              value={initialOutstanding}
              onChange={e => setInitialOutstanding(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold text-rose-600 focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If client carries previous unpaid dues, enter here to maintain accurate statement.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewClientModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1473E6] hover:bg-[#0F70F5] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Client Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
