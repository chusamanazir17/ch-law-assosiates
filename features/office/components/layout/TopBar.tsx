import React, { useState, useRef, useEffect } from 'react';
import { useOffice } from '../../context/OfficeContext';
import {
  Menu,
  Wallet,
  Search,
  Calendar,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Sliders,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Globe
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarCollapsed = false }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    setIsSearchModalOpen,
    setActiveSection,
    setActiveSubSection,
    stampStock,
    taxCases,
    dailyClosing,
    auditLogs,
    unreadNotifications,
    markNotificationsRead
  } = useOffice();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  // Notifications computed
  const lowStockCount = stampStock.filter(s => s.status !== 'OK').length;
  const overdueTax = taxCases.filter(t => t.status === 'Overdue' || t.status === 'Documents Required').length;

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-white dark:bg-[#0B1526] border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-4 flex items-center justify-between shadow-2xs select-none transition-colors duration-150">
      {/* Left: Sidebar Toggle (Mobile Hamburger) & Search Bar (Desktop) */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        <button
          id="mobile-sidebar-hamburger-btn"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
          title="Open Navigation Menu"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input - Hidden on mobile view, shown on sm+ */}
        <div
          onClick={() => setIsSearchModalOpen(true)}
          className={`relative w-full hidden sm:flex items-center cursor-pointer group transition-all duration-200 ${
            isSidebarCollapsed 
              ? 'max-w-[220px] md:max-w-[260px] xl:max-w-[300px]' 
              : 'max-w-[180px] md:max-w-[210px] lg:max-w-[240px]'
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-hover:text-[#B8832A] transition-colors">
            <Search className="w-4 h-4 shrink-0" />
          </div>
          <input
            type="text"
            readOnly
            placeholder={isSidebarCollapsed ? "Search clients, receipts, transactions, CNIC..." : "Search clients, CNIC, receipts..."}
            className="w-full h-9 pl-9 pr-3 bg-slate-50/90 dark:bg-[#0A1424] border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 group-hover:border-[#B8832A] group-hover:bg-white dark:group-hover:bg-[#0E1A2E] transition-all cursor-pointer shadow-2xs font-medium truncate"
          />
        </div>
      </div>

      {/* Right Controls: Dark Theme Toggle, Notifications, and Profile Section on the right-hand side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
        {/* Chamber Status Pill - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 md:px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs shrink-0 whitespace-nowrap">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="truncate">Chamber 121 • Active</span>
        </div>

        {/* Website Admin CMS Direct Jump Link */}
        <a
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 text-xs font-bold transition shadow-2xs shrink-0"
          title="Open Website Admin Dashboard & CMS"
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Website CMS</span>
        </a>

        {/* Date Display Pill - Hidden on mobile */}
        <div className={`items-center gap-2 bg-slate-50 dark:bg-[#0A1424] border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs shrink-0 whitespace-nowrap ${
          isSidebarCollapsed ? 'hidden md:flex' : 'hidden xl:flex'
        }`}>
          <Calendar className="w-4 h-4 text-[#B8832A] shrink-0" />
          <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* PWA Offline & Install Button - Hidden on mobile header (available in sidebar) */}
        <div className="hidden sm:block">
          <PWAInstallButton variant="header" />
        </div>

        {/* 1. Dark Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleDarkMode}
          className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* 2. Notifications Icon with Badge */}
        <div ref={notifRef} className="relative shrink-0">
          <button
            id="notifications-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 min-w-4 h-4 px-0.5 bg-[#F43F5E] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1526] shadow-2xs">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-84 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#0E1A2E] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                <span
                  onClick={() => { markNotificationsRead(); setIsNotifOpen(false); }}
                  className="text-xs text-[#B8832A] dark:text-[#E3BA63] font-semibold cursor-pointer hover:underline"
                >
                  Mark all as read
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockCount > 0 && (
                  <div
                    onClick={() => { setActiveSection('stamps'); setIsNotifOpen(false); }}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 items-start transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Low Stamp Stock Alert</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {lowStockCount} denomination{lowStockCount > 1 ? 's are' : ' is'} below the minimum reorder level.
                      </div>
                    </div>
                  </div>
                )}

                {overdueTax > 0 && (
                  <div
                    onClick={() => { setActiveSection('tax'); setIsNotifOpen(false); }}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 items-start transition-colors"
                  >
                    <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">Tax Cases Needing Attention</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {overdueTax} tax case{overdueTax > 1 ? 's' : ''} overdue or missing documents.
                      </div>
                    </div>
                  </div>
                )}

                {auditLogs.slice(0, 7).map(log => {
                  const parsed = log.dateTime ? new Date(log.dateTime) : null;
                  const time = parsed && !isNaN(parsed.getTime())
                    ? parsed.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : typeof log.dateTime === 'string' ? log.dateTime : '';
                  const moduleIcon: Record<string, React.ReactNode> = {
                    Cash: <Wallet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
                    Stamps: <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
                    Tax: <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />,
                    Receipt: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
                    Receipts: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
                    Client: <User className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />,
                    Clients: <User className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />,
                    Settings: <Sliders className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  };
                  return (
                    <div
                      key={log.id}
                      onClick={() => { markNotificationsRead(); setIsNotifOpen(false); }}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 items-start transition-colors"
                    >
                      {moduleIcon[log.module] || <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{log.action} — {log.module}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed truncate">
                          {log.details || `${log.action} recorded`}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-medium">{time}</div>
                      </div>
                    </div>
                  );
                })}

                {lowStockCount === 0 && overdueTax === 0 && auditLogs.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">You're all caught up</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. User Profile Section */}
        <div ref={profileRef} className="relative shrink-0">
          <button
            id="user-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2 pr-1.5 sm:pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#B8832A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              UA
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Usama</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#0E1A2E] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Usama Ali</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">usama@ch.com</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Role: Administrator</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveSection('users');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#B8832A] dark:hover:text-[#E3BA63] cursor-pointer font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Staff & Roles</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('audit');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#B8832A] dark:hover:text-[#E3BA63] cursor-pointer font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Audit Logs</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#B8832A] dark:hover:text-[#E3BA63] cursor-pointer font-medium transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  <span>System Settings</span>
                </button>

                <a
                  href="/admin/dashboard"
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer font-semibold transition-colors"
                >
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>Website Admin CMS</span>
                </a>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
