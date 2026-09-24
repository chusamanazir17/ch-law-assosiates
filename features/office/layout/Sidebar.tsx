import React, { useState } from 'react';
import { useOffice } from '../../context/OfficeContext';
import {
  Briefcase,
  LayoutGrid,
  Wallet,
  FileCheck2,
  Users,
  FileSpreadsheet,
  FileText,
  Receipt,
  CreditCard,
  CalendarClock,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  MessageCircle,
  X
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { activeSection, setActiveSection, activeSubSection, setActiveSubSection } = useOffice();

  // Collapsible accordion states
  const [isOfficeExpanded, setIsOfficeExpanded] = useState(true);
  const [isCashExpanded, setIsCashExpanded] = useState(false);
  const [isStampExpanded, setIsStampExpanded] = useState(false);
  const [isTaxExpanded, setIsTaxExpanded] = useState(false);

  const handleNav = (section: string, subSection = '') => {
    setActiveSection(section);
    setActiveSubSection(subSection);
    // On mobile close drawer on select
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:relative top-0 bottom-0 left-0 z-50 h-full bg-[#0B1B2C] text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#15293E] shrink-0 select-none max-lg:overflow-x-hidden lg:overflow-visible ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } w-[285px] max-w-[85vw] ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[265px]'}`}
      >
        {/* Modern Edge Toggle Icon Button (Linear / Notion Style) - Desktop Only */}
        <button
          type="button"
          onClick={onToggleCollapse ? onToggleCollapse : onClose}
          title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-[#0E2238] border border-[#234160] text-slate-300 hover:text-white hover:bg-[#163354] hover:border-[#38BDF8] shadow-md items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group focus:outline-hidden"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* Top: Branding Header */}
        <div>
          <div className={`p-3.5 sm:p-4 border-b border-[#142639] flex items-center justify-between gap-2.5 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className={`flex items-center min-w-0 ${isCollapsed ? 'lg:justify-center' : 'gap-2.5 sm:gap-3'}`}>
              {/* CH Gold Shield Emblem */}
              <div
                title="CH Composing E-Stamp & Tax Advisor"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EAB308] via-[#CA8A04] to-[#A16207] p-0.5 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                onClick={() => handleNav('dashboard')}
              >
                <div className="w-full h-full bg-[#0B1B2C] rounded-[10px] flex items-center justify-center">
                  <span className="font-['Playfair_Display',serif] font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                    CH
                  </span>
                </div>
              </div>

              {/* Title & Chamber details: always visible on mobile, hidden only when desktop collapsed */}
              <div className={`leading-tight min-w-0 overflow-hidden ${isCollapsed ? 'hidden lg:hidden' : 'block'}`}>
                <div className="text-sm font-bold font-heading text-white tracking-wide uppercase truncate">
                  CH Composing
                </div>
                <div className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase truncate">
                  E-Stamp & Tax Advisor
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Chamber No. 121, Kachahri Sahiwal
                </div>
              </div>
            </div>

            {/* Mobile Close (X) Button: Strictly positioned inside the top of the opened menu */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#163354] active:scale-95 transition-all cursor-pointer shrink-0 border border-slate-700/60"
              title="Close Menu"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className={`p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] custom-scrollbar-dark text-sm font-medium ${isCollapsed ? 'px-2' : ''}`}>
            {/* Top Level: Office Management (Collapsible Group) */}
            <div>
              {!isCollapsed ? (
                <button
                  onClick={() => setIsOfficeExpanded(!isOfficeExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#122B42] text-white font-semibold cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-sm tracking-wide font-heading">Office Management</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                      isOfficeExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <div className="w-6 h-0.5 bg-slate-700 rounded-full my-1"></div>
                </div>
              )}

              {/* Submenu for Office Management */}
              {(isOfficeExpanded || isCollapsed) && (
                <div className={`mt-1 space-y-0.5 ${!isCollapsed ? 'pl-1' : ''}`}>
                  {/* Dashboard */}
                  <button
                    onClick={() => handleNav('dashboard')}
                    title="Dashboard"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'dashboard'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                  </button>

                  {/* Cash Management */}
                  <div>
                    <button
                      onClick={() => {
                        handleNav('cash');
                        if (!isCollapsed) setIsCashExpanded(!isCashExpanded);
                      }}
                      title="Cash Management"
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                      } rounded-lg transition-colors cursor-pointer ${
                        activeSection === 'cash'
                          ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Cash Management</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isCashExpanded || activeSection === 'cash' ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      )}
                    </button>

                    {!isCollapsed && (isCashExpanded || activeSection === 'cash') && (
                      <div className="pl-7 pr-2 py-1 space-y-1 text-xs text-slate-400">
                        {['Cash In', 'Cash Out', 'Transactions', 'Daily Closing'].map(item => {
                          const subKey = item.toLowerCase().replace(' ', '-');
                          const isSubActive = activeSubSection === subKey;
                          return (
                            <button
                              key={item}
                              onClick={() => handleNav('cash', subKey)}
                              className={`w-full text-left py-1 px-2 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                                isSubActive ? 'text-white font-semibold bg-slate-800' : ''
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Stamp Management */}
                  <div>
                    <button
                      onClick={() => {
                        handleNav('stamps');
                        if (!isCollapsed) setIsStampExpanded(!isStampExpanded);
                      }}
                      title="Stamp Management"
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                      } rounded-lg transition-colors cursor-pointer ${
                        activeSection === 'stamps'
                          ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Stamp Management</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isStampExpanded || activeSection === 'stamps' ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      )}
                    </button>

                    {!isCollapsed && (isStampExpanded || activeSection === 'stamps') && (
                      <div className="pl-7 pr-2 py-1 space-y-1 text-xs text-slate-400">
                        {['Stock', 'Purchases', 'Sales', 'Adjustments'].map(item => {
                          const subKey = item.toLowerCase();
                          const isSubActive = activeSubSection === subKey;
                          return (
                            <button
                              key={item}
                              onClick={() => handleNav('stamps', subKey)}
                              className={`w-full text-left py-1 px-2 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                                isSubActive ? 'text-white font-semibold bg-slate-800' : ''
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Clients & CRM */}
                  <button
                    onClick={() => handleNav('clients')}
                    title="Clients & CRM"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'clients'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Clients & CRM</span>}
                  </button>

                  {/* Tax Management */}
                  <div>
                    <button
                      onClick={() => {
                        handleNav('tax');
                        if (!isCollapsed) setIsTaxExpanded(!isTaxExpanded);
                      }}
                      title="Tax Management"
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                      } rounded-lg transition-colors cursor-pointer ${
                        activeSection === 'tax'
                          ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Tax Management</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isTaxExpanded || activeSection === 'tax' ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      )}
                    </button>

                    {!isCollapsed && (isTaxExpanded || activeSection === 'tax') && (
                      <div className="pl-7 pr-2 py-1 space-y-1 text-xs text-slate-400">
                        {['Returns', 'Tasks', 'Documents'].map(item => {
                          const subKey = item.toLowerCase();
                          const isSubActive = activeSubSection === subKey;
                          return (
                            <button
                              key={item}
                              onClick={() => handleNav('tax', subKey)}
                              className={`w-full text-left py-1 px-2 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer ${
                                isSubActive ? 'text-white font-semibold bg-slate-800' : ''
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Composing & Services */}
                  <button
                    onClick={() => handleNav('services')}
                    title="Composing & Services"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'services' || activeSection === 'composing'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Composing & Services</span>}
                  </button>

                  {/* Receipts */}
                  <button
                    onClick={() => handleNav('receipts')}
                    title="Receipts"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'receipts'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <Receipt className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Receipts</span>}
                  </button>

                  {/* Expenses */}
                  <button
                    onClick={() => handleNav('expenses')}
                    title="Expenses"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'expenses'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Expenses</span>}
                  </button>

                  {/* Tasks & Deadlines */}
                  <button
                    onClick={() => handleNav('tasks')}
                    title="Tasks & Deadlines"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'tasks'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <CalendarClock className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Tasks & Deadlines</span>}
                  </button>

                  {/* Reports */}
                  <button
                    onClick={() => handleNav('reports')}
                    title="Reports & Analytics"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'reports'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Reports</span>}
                  </button>

                  {/* Staff & Users */}
                  <button
                    onClick={() => handleNav('users')}
                    title="Staff & Users"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'users' || activeSection === 'staff'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Staff & Users</span>}
                  </button>

                  {/* Audit Logs */}
                  <button
                    onClick={() => handleNav('audit')}
                    title="Audit Logs"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'audit'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Audit Logs</span>}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => handleNav('settings')}
                    title="System Settings"
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-3 py-2'
                    } rounded-lg text-left transition-colors cursor-pointer ${
                      activeSection === 'settings'
                        ? 'bg-[#1473E6] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#122B42] hover:text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Settings</span>}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Support Widget */}
        <div className="p-3 border-t border-[#142639] space-y-2">
          {!isCollapsed ? (
            <>
              <PWAInstallButton variant="sidebar" />
              <div className="bg-[#122538] rounded-xl p-3 border border-slate-700/60 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs text-slate-300 mb-2">
                  <Headphones className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs text-slate-400 font-medium">Need Help?</div>
                    <div className="font-bold text-white text-sm font-mono truncate">+92 300 1234567</div>
                  </div>
                </div>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">WhatsApp Support</span>
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                title="WhatsApp Support: +92 300 1234567"
                className="w-10 h-10 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
