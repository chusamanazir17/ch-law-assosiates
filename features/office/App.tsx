"use client";

import React, { useEffect } from 'react';
import { OfficeProvider, useOffice } from './context/OfficeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { CasesView } from './components/views/CasesView';
import { HearingsView } from './components/views/HearingsView';
import { CashManagementView } from './components/views/CashManagementView';
import { StampManagementView } from './components/views/StampManagementView';
import { ClientsView } from './components/views/ClientsView';
import { TaxManagementView } from './components/views/TaxManagementView';
import { ComposingServicesView } from './components/views/ComposingServicesView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { ExpensesView } from './components/views/ExpensesView';
import { TasksDeadlinesView } from './components/views/TasksDeadlinesView';
import { ReportsView } from './components/views/ReportsView';
import { StaffUsersView } from './components/views/StaffUsersView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { SettingsView } from './components/views/SettingsView';
import { InvoicesView } from './components/views/InvoicesView';
import { AttendanceView } from './components/views/AttendanceView';

// Modals
import { CashInModal } from './components/modals/CashInModal';
import { CashOutModal } from './components/modals/CashOutModal';
import { TransferModal } from './components/modals/TransferModal';
import { DailyClosingModal } from './components/modals/DailyClosingModal';
import { StampSaleModal } from './components/modals/StampSaleModal';
import { StampProductModal } from './components/modals/StampProductModal';
import { NewClientModal } from './components/modals/NewClientModal';
import { PrintReceiptModal } from './components/modals/PrintReceiptModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const MainLayout: React.FC = () => {
  const { activeSection, setActiveSection, selectedReceiptId, setSelectedReceiptId } = useOffice();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);

  // Synchronize route URL with activeSection
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== 'undefined') {
        // 1. Check query parameters like ?tab=cash or ?section=cases
        const params = new URLSearchParams(window.location.search);
        const queryTab = params.get('tab') || params.get('section');
        if (queryTab) {
          const tabNorm = queryTab.toLowerCase();
          const aliasMap: Record<string, string> = {
            finance: 'cash',
            inout: 'cash',
            'in-out': 'cash',
            money: 'cash',
            estamp: 'stamps',
            estamppaper: 'stamps',
            'e-stamp': 'stamps',
            users: 'staff',
            services: 'composing',
            register: 'cash',
            'daily-register': 'cash',
          };
          const resolved = aliasMap[tabNorm] || tabNorm;
          setActiveSection(resolved);
          return;
        }

        // 2. Check path slug
        const match = window.location.pathname.match(/\/office\/?([a-zA-Z0-9_-]*)/);
        if (match && match[1]) {
          const section = match[1].toLowerCase();
          if (section && section !== 'dashboard') {
            const aliasMap: Record<string, string> = {
              finance: 'cash',
              estamp: 'stamps',
              services: 'composing',
              court: 'cases',
            };
            setActiveSection(aliasMap[section] || section);
            return;
          }
        }
        if (window.location.pathname === '/office' || window.location.pathname === '/office/dashboard') {
          setActiveSection('dashboard');
        }
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [setActiveSection]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsDesktopCollapsed(prev => !prev);
    }
  };

  // Handle URL hash changes or keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K opens search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchBtn = document.querySelector('button[title*="Search"]') as HTMLButtonElement | null;
        if (searchBtn) searchBtn.click();
      }
      // Ctrl+B or Cmd+B toggles sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktopCollapsed, isMobileSidebarOpen]);

  const renderActiveView = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'cases':
        return <CasesView />;
      case 'hearings':
        return <HearingsView />;
      case 'invoices':
        return <InvoicesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'cash':
        return <CashManagementView />;
      case 'stamps':
        return <StampManagementView />;
      case 'clients':
        return <ClientsView />;
      case 'tax':
        return <TaxManagementView />;
      case 'composing':
      case 'services':
        return <ComposingServicesView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'tasks':
        return <TasksDeadlinesView />;
      case 'reports':
        return <ReportsView />;
      case 'staff':
      case 'users':
        return <StaffUsersView />;
      case 'audit':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };


  return (
    <div className="office-shell flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F1F5F9] font-admin antialiased transition-colors duration-150">
      {/* Dark Navy Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isDesktopCollapsed}
        onToggleCollapse={() => setIsDesktopCollapsed(prev => !prev)}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18]">
        {/* Global Top Bar */}
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isDesktopCollapsed}
        />

        {/* Scrollable Workspace with expanded layout */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="max-w-[1720px] w-full mx-auto pb-12">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CashInModal />
      <CashOutModal />
      <TransferModal />
      <DailyClosingModal />
      <StampSaleModal />
      <StampProductModal />
      <NewClientModal />
      <GlobalSearchModal />
      <PrintReceiptModal
        receiptId={selectedReceiptId}
        onClose={() => setSelectedReceiptId(null)}
      />
      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <OfficeProvider>
      <MainLayout />
    </OfficeProvider>
  );
}

export default App;
