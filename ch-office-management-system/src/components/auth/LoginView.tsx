import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../lib/supabase/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Building2,
  KeyRound,
  CheckCircle2,
  CloudCheck,
  Server
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signIn, signUp, error, clearError, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('admin@choffice.pk');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Chamber Administrator');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setLocalError(res.error || 'Invalid email or password.');
        }
      } else {
        if (!fullName.trim()) {
          setLocalError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, fullName, role);
        if (!res.success) {
          setLocalError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUser = (userEmail: string) => {
    const demo = DEMO_USERS[userEmail];
    if (demo) {
      setEmail(demo.user.email);
      setPassword(demo.password);
      setFullName(demo.user.fullName);
      setRole(demo.user.role);
      setLocalError(null);
      clearError();
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-[#070D18] via-[#0B1B2C] to-[#0A1424] text-slate-100 select-none">
      {/* Decorative ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header & Branding */}
        <div className="text-center mb-6">
          {/* CH Gold Shield Emblem */}
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EAB308] via-[#CA8A04] to-[#A16207] p-0.5 shadow-xl shadow-amber-900/20 mb-3.5">
            <div className="w-full h-full bg-[#0B1B2C] rounded-[14px] flex items-center justify-center">
              <span className="font-['Playfair_Display',serif] font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                CH
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-wide uppercase">
            CH Composing
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-400 tracking-wider uppercase mt-0.5">
            E-Stamp & Tax Advisor
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Chamber No. 121, District Courts Sahiwal</span>
          </div>

          {/* Connection Status Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#122538] border border-slate-700/80 text-slate-300 shadow-2xs">
            {isConfigured ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Supabase Auth Cloud Active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-300">Chamber Auth Ready (Demo & Supabase)</span>
              </>
            )}
          </div>
        </div>

        {/* Card Form Wrapper */}
        <div className="bg-[#0E2033]/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-7">
          {/* Sign In / Sign Up Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#0A1624] rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setLocalError(null);
                clearError();
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#1473E6] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chamber Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setLocalError(null);
                clearError();
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#1473E6] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New Staff
            </button>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-4.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{activeError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g., Ch. Usama Ali"
                    className="w-full h-10.5 px-3.5 bg-[#091522] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Chamber Role
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full h-10.5 px-3.5 bg-[#091522] border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] transition-all font-medium cursor-pointer"
                  >
                    <option value="Chamber Administrator">Chamber Administrator</option>
                    <option value="Tax Consultant">Tax Consultant</option>
                    <option value="Accountant">Cashier & Accountant</option>
                    <option value="Stamp Vendor">Licensed Stamp Vendor</option>
                    <option value="Staff">Composing Operator / Staff</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chamber Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@choffice.pk"
                  className="w-full h-10.5 pl-10 pr-3.5 bg-[#091522] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Secure Password
                </label>
                <span className="text-[11px] text-slate-400">
                  {mode === 'signin' ? 'Default: admin123' : 'Min. 6 characters'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10.5 pl-10 pr-10 bg-[#091522] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 h-11 bg-gradient-to-r from-[#1473E6] to-[#0A58CA] hover:from-[#1665D8] hover:to-[#084298] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Access Chamber System' : 'Create Staff Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Chamber Staff Presets</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectDemoUser('admin@choffice.pk')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  email === 'admin@choffice.pk'
                    ? 'bg-[#122A44] border-[#1473E6] text-white'
                    : 'bg-[#091522] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Advocate / Admin</span>
                  {email === 'admin@choffice.pk' && <CheckCircle2 className="w-3 h-3 text-[#38BDF8]" />}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate">admin@choffice.pk</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('tax@choffice.pk')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  email === 'tax@choffice.pk'
                    ? 'bg-[#122A44] border-[#1473E6] text-white'
                    : 'bg-[#091522] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Tax Consultant</span>
                  {email === 'tax@choffice.pk' && <CheckCircle2 className="w-3 h-3 text-[#38BDF8]" />}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate">tax@choffice.pk</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('cashier@choffice.pk')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  email === 'cashier@choffice.pk'
                    ? 'bg-[#122A44] border-[#1473E6] text-white'
                    : 'bg-[#091522] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Cashier / Ledger</span>
                  {email === 'cashier@choffice.pk' && <CheckCircle2 className="w-3 h-3 text-[#38BDF8]" />}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate">cashier@choffice.pk</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('stamp@choffice.pk')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  email === 'stamp@choffice.pk'
                    ? 'bg-[#122A44] border-[#1473E6] text-white'
                    : 'bg-[#091522] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Stamp Vendor</span>
                  {email === 'stamp@choffice.pk' && <CheckCircle2 className="w-3 h-3 text-[#38BDF8]" />}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate">stamp@choffice.pk</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Control (RBAC) & Double-Entry Ledger Security</span>
        </div>
      </div>
    </div>
  );
};
