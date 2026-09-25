"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import {
  Client,
  StampStockItem,
  StampMovement,
  StampAdjustment,
  TaxCase,
  ServiceOrder,
  Receipt,
  Expense,
  RecurringExpense,
  UtilityBill,
  DailyClosing,
  SystemUser,
  AuditLog,
  OfficeTask,
  LedgerTransaction,
  BusinessSettings,
  AccountType
} from '../types';
import {
  initialClients,
  initialStampStock,
  initialStampMovements,
  initialStampAdjustments,
  initialTransactions,
  initialTaxCases,
  initialServiceOrders,
  initialReceipts,
  initialExpenses,
  initialRecurringExpenses,
  initialUtilityBills,
  initialSystemUsers,
  initialAuditLogs,
  initialTasks,
  initialDailyClosing,
  initialBusinessSettings
} from '../data/seedData';

interface AccountBalances {
  cashOffice: number;
  bankAccount: number;
  jazzCash: number;
  easyPaisa: number;
}

interface OfficeContextType {
  // Navigation
  activeSection: string;
  setActiveSection: (sec: string) => void;
  activeSubSection: string;
  setActiveSubSection: (sub: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedReceiptId: string | null;
  setSelectedReceiptId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedTaxCaseId: string | null;
  setSelectedTaxCaseId: (id: string | null) => void;
  
  // Ledger & Balances
  transactions: LedgerTransaction[];
  accountBalances: AccountBalances;
  
  // Entities
  clients: Client[];
  stampStock: StampStockItem[];
  stampMovements: StampMovement[];
  stampAdjustments: StampAdjustment[];
  taxCases: TaxCase[];
  serviceOrders: ServiceOrder[];
  receipts: Receipt[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  utilityBills: UtilityBill[];
  tasks: OfficeTask[];
  dailyClosing: DailyClosing;
  dailyClosingHistory: DailyClosing[];
  systemUsers: SystemUser[];
  auditLogs: AuditLog[];
  businessSettings: BusinessSettings;

  // Supabase State
  isLoading: boolean;
  refreshData: () => Promise<void>;
  
  // UI & Modals
  isDarkMode: boolean;
  unreadNotifications: number;
  markNotificationsRead: () => void;
  toggleDarkMode: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isQuickCashInOpen: boolean;
  setIsQuickCashInOpen: (open: boolean) => void;
  isQuickCashOutOpen: boolean;
  setIsQuickCashOutOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isCloseDayModalOpen: boolean;
  setIsCloseDayModalOpen: (open: boolean) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  isStampSaleModalOpen: boolean;
  setIsStampSaleModalOpen: (open: boolean) => void;
  isNewServiceOrderModalOpen: boolean;
  setIsNewServiceOrderModalOpen: (open: boolean) => void;
  isNewTaxReturnModalOpen: boolean;
  setIsNewTaxReturnModalOpen: (open: boolean) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  
  // Central Ledger Actions (Safe, Audited, Non-destructive)
  recordCashIn: (data: {
    clientName: string;
    clientId?: string;
    serviceName: string;
    amount: number;
    account: AccountType | string;
    referenceNo?: string;
    notes?: string;
    staff?: string;
    createReceipt?: boolean;
  }) => string; // returns receiptNo if created
  
  recordCashOut: (data: {
    category: string;
    payeeDescription: string;
    amount: number;
    account: AccountType | string;
    referenceNo?: string;
    notes?: string;
    staff?: string;
  }) => void;

  recordTransfer: (data: {
    fromAccount: AccountType | string;
    toAccount: AccountType | string;
    amount: number;
    notes?: string;
    staff?: string;
  }) => void;

  recordStampSale: (data: {
    denomination: number;
    quantity: number;
    clientName: string;
    clientId?: string;
    paymentAccount?: AccountType | string;
    notes?: string;
    staff?: string;
  }) => void;

  recordStampPurchase: (data: {
    denomination: number;
    quantity: number;
    supplier: string;
    purchasePricePerUnit: number;
    paymentAccount?: AccountType | string;
    notes?: string;
    staff?: string;
  }) => void;

  recordStampAdjustment: (data: {
    denomination: number;
    adjustedStock: number;
    reason: string;
    staff?: string;
  }) => void;

  addClient: (clientData: Omit<Client, 'id' | 'memberSince' | 'totalBilling' | 'paidAmount' | 'lifetimeRevenue' | 'lastService' | 'documents'>) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  
  createReceipt: (receiptData: Omit<Receipt, 'id' | 'receiptNo' | 'dateTime' | 'status' | 'authorizedBy'>) => string;
  cancelReceipt: (id: string, reason: string) => void;

  addExpense: (expenseData: Omit<Expense, 'id' | 'staff' | 'status'>) => void;

  updateTaxCaseStatus: (id: string, newStatus: TaxCase['status']) => void;
  addTaxCase: (taxCaseData: Omit<TaxCase, 'id'>) => void;

  addServiceOrder: (orderData: Omit<ServiceOrder, 'id' | 'orderNo' | 'dateTime' | 'status'>) => void;
  updateServiceOrderStatus: (id: string, newStatus: ServiceOrder['status']) => void;

  closeDay: (actualCash: number, discrepancyReason?: string) => void;
  reopenDay: (reason: string) => void;

  addTask: (taskData: Omit<OfficeTask, 'id'>) => void;
  toggleTaskStatus: (id: string) => void;
  
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'dateTime'>) => void;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;
}

const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const OfficeContext = createContext<OfficeContextType | undefined>(undefined);

export const OfficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [activeSubSection, setActiveSubSection] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>('c-1');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('so-1');
  const [selectedTaxCaseId, setSelectedTaxCaseId] = useState<string | null>('tc-1');

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ledger & Balances
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = safeGetItem('ch_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [accountBalances, setAccountBalances] = useState<AccountBalances>(() => {
    const saved = safeGetItem('ch_account_balances');
    return saved ? JSON.parse(saved) : {
      cashOffice: 72800,
      bankAccount: 286500,
      jazzCash: 28200,
      easyPaisa: 20000
    };
  });

  // Entities
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = safeGetItem('ch_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [stampStock, setStampStock] = useState<StampStockItem[]>(() => {
    const saved = safeGetItem('ch_stamp_stock');
    return saved ? JSON.parse(saved) : initialStampStock;
  });

  const [stampMovements, setStampMovements] = useState<StampMovement[]>(() => {
    const saved = safeGetItem('ch_stamp_movements');
    return saved ? JSON.parse(saved) : initialStampMovements;
  });

  const [stampAdjustments, setStampAdjustments] = useState<StampAdjustment[]>(() => {
    const saved = safeGetItem('ch_stamp_adjustments');
    return saved ? JSON.parse(saved) : initialStampAdjustments;
  });

  const [taxCases, setTaxCases] = useState<TaxCase[]>(() => {
    const saved = safeGetItem('ch_tax_cases');
    return saved ? JSON.parse(saved) : initialTaxCases;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = safeGetItem('ch_service_orders');
    return saved ? JSON.parse(saved) : initialServiceOrders;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = safeGetItem('ch_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = safeGetItem('ch_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(initialUtilityBills);

  const [tasks, setTasks] = useState<OfficeTask[]>(() => {
    const saved = safeGetItem('ch_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [dailyClosing, setDailyClosing] = useState<DailyClosing>(() => {
    const saved = safeGetItem('ch_daily_closing');
    return saved ? JSON.parse(saved) : initialDailyClosing;
  });

  const [dailyClosingHistory, setDailyClosingHistory] = useState<DailyClosing[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = safeGetItem('ch_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Live notification state: unread = audit entries not yet seen in the bell
  const [notificationReadCount, setNotificationReadCount] = useState<number>(0);
  const unreadNotifications = Math.max(0, auditLogs.length - notificationReadCount);
  const markNotificationsRead = useCallback(() => {
    setNotificationReadCount(auditLogs.length);
  }, [auditLogs.length]);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(initialBusinessSettings);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeGetItem('ch_theme');
    if (saved) return saved === 'dark';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      safeSetItem('ch_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeSetItem('ch_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Helper date formatter: DD-MM-YYYY HH:MM AM/PM
  const formatDateTime = (d = new Date()) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${pad(hours)}:${minutes} ${ampm}`;
  };

  // Turn structured audit details ({ after, before }) into a readable sentence
  // so activity feeds never render raw JSON.
  const humanizeAuditDetails = (details: unknown): string | undefined => {
    if (!details) return undefined;
    if (typeof details === 'string') {
      const trimmed = details.trim();
      if (!trimmed || trimmed === '{}' || trimmed === 'null') return undefined;
      try {
        const parsed = JSON.parse(trimmed);
        return humanizeAuditDetails(parsed);
      } catch {
        return trimmed;
      }
    }
    if (typeof details === 'object') {
      const obj = details as Record<string, unknown>;
      const after = typeof obj.after === 'string' ? obj.after : undefined;
      const before = typeof obj.before === 'string' ? obj.before : undefined;
      if (after && before && before !== '-') return `${after} (was: ${before})`;
      if (after) return after;
      if (before && before !== '-') return before;
      return undefined;
    }
    return String(details);
  };

  // Full Refresh from Supabase Database
  const refreshData = useCallback(async () => {    try {
      setIsLoading(true);

      const [
        clientsRes,
        financeRes,
        stampsRes,
        taxRes,
        servicesRes,
        receiptsRes,
        tasksRes,
        dailyRes,
        auditRes,
        settingsRes,
        employeesRes
      ] = await Promise.allSettled([
        fetch('/api/office/clients').then(r => r.json()),
        fetch('/api/office/finance').then(r => r.json()),
        fetch('/api/office/stamps').then(r => r.json()),
        fetch('/api/office/tax').then(r => r.json()),
        fetch('/api/office/services').then(r => r.json()),
        fetch('/api/office/receipts').then(r => r.json()),
        fetch('/api/office/tasks').then(r => r.json()),
        fetch('/api/office/daily-closing').then(r => r.json()),
        fetch('/api/office/audit').then(r => r.json()),
        fetch('/api/office/settings').then(r => r.json()),
        fetch('/api/office/employees').then(r => r.json())
      ]);

      // 1. Sync Clients
      if (clientsRes.status === 'fulfilled' && clientsRes.value?.success && Array.isArray(clientsRes.value.clients)) {
        if (clientsRes.value.clients.length > 0) {
          const mappedClients: Client[] = clientsRes.value.clients.map((dbClient: any) => ({
            id: dbClient.id,
            name: dbClient.full_name || dbClient.name || 'Unnamed Client',
            businessName: dbClient.business_name || dbClient.businessName || '',
            cnic: dbClient.cnic || '',
            ntn: dbClient.ntn || '',
            mobile: dbClient.mobile || dbClient.phone || '',
            phone: dbClient.phone || '',
            email: dbClient.email || '',
            address: dbClient.address || '',
            businessType: dbClient.client_type === 'individual' ? 'Individual' : 'Sole Proprietorship',
            type: dbClient.client_type || 'Tax & Corporate',
            taxStatus: 'Filer',
            status: dbClient.status === 'inactive' ? 'Inactive' : 'Active',
            memberSince: dbClient.created_at ? dbClient.created_at.split('T')[0] : '2026-01-01',
            totalBilling: 0,
            paidAmount: 0,
            lifetimeRevenue: 0,
            outstanding: 0,
            lastService: 'Active',
            documents: []
          }));
          setClients(mappedClients);
        }
      }

      // 2. Sync Finance (Accounts, Transactions, Expenses)
      if (financeRes.status === 'fulfilled' && financeRes.value?.success) {
        const { accounts, transactions: txs, expenses: exps } = financeRes.value;
        if (Array.isArray(accounts) && accounts.length > 0) {
          const balances: AccountBalances = {
            cashOffice: 0,
            bankAccount: 0,
            jazzCash: 0,
            easyPaisa: 0
          };
          for (const acc of accounts) {
            const name = (acc.name || '').toLowerCase();
            const bal = Number(acc.current_balance || 0);
            if (name.includes('cash') && !name.includes('jazz')) balances.cashOffice += bal;
            else if (name.includes('bank') || name.includes('hbl') || name.includes('meezan')) balances.bankAccount += bal;
            else if (name.includes('jazz')) balances.jazzCash += bal;
            else if (name.includes('easy')) balances.easyPaisa += bal;
            else balances.cashOffice += bal;
          }
          setAccountBalances(balances);
        }

        if (Array.isArray(txs) && txs.length > 0) {
          setTransactions(txs.map((t: any) => ({
            id: t.id,
            dateTime: t.created_at ? formatDateTime(new Date(t.created_at)) : formatDateTime(),
            type: t.entry_type === 'credit' ? 'IN' : 'OUT',
            description: t.description || 'Transaction',
            clientOrPayee: t.client_name || 'Walk-in',
            serviceOrCategory: t.category || 'General',
            account: t.account_name || 'Cash in Hand',
            amount: Number(t.amount || 0),
            staff: 'Usama (Admin)',
            status: 'Completed',
            referenceNo: t.transaction_number
          })));
        }

        if (Array.isArray(exps) && exps.length > 0) {
          setExpenses(exps.map((e: any) => ({
            id: e.id,
            date: e.expense_date || new Date().toISOString().split('T')[0],
            category: e.category,
            description: e.description || e.category,
            vendorPayee: e.payee,
            account: e.account_name || 'Cash Office',
            amount: Number(e.amount || 0),
            staff: 'Usama',
            status: 'Paid',
            receiptUrl: e.receipt_url
          })));
        }
      }

      // 3. Sync Stamps
      if (stampsRes.status === 'fulfilled' && stampsRes.value?.success) {
        const { products, movements } = stampsRes.value;
        if (Array.isArray(products) && products.length > 0) {
          setStampStock(products.map((p: any) => ({
            id: p.id,
            denomination: Number(p.denomination),
            openingStock: Number(p.current_stock || 0),
            purchased: 0,
            sold: 0,
            remaining: Number(p.current_stock || 0),
            purchasePrice: Number(p.purchase_price || 0),
            salePrice: Number(p.sale_price || 0),
            stockValue: Number(p.current_stock || 0) * Number(p.purchase_price || 0),
            minimumLevel: Number(p.minimum_stock || 20),
            status: Number(p.current_stock) <= Number(p.minimum_stock) / 2 ? 'Critical' : Number(p.current_stock) <= Number(p.minimum_stock) ? 'Low' : 'OK'
          })));
        }

        if (Array.isArray(movements) && movements.length > 0) {
          setStampMovements(movements.map((m: any) => ({
            id: m.id,
            dateTime: m.created_at ? formatDateTime(new Date(m.created_at)) : formatDateTime(),
            type: m.movement_type === 'sale' ? 'Sale' : m.movement_type === 'purchase' ? 'Purchase' : 'Adjustment',
            denomination: Number(m.denomination || 0),
            qty: Number(m.quantity || 0),
            balance: 0,
            clientOrSupplier: m.client_name || 'Counter Sale',
            amount: Math.abs(Number(m.quantity || 0) * Number(m.denomination || 0)),
            user: m.user || 'Usama',
            notes: m.notes
          })));
        }
      }

      // 4. Sync Tax Cases
      if (taxRes.status === 'fulfilled' && taxRes.value?.success && Array.isArray(taxRes.value.cases)) {
        if (taxRes.value.cases.length > 0) {
          setTaxCases(taxRes.value.cases.map((tc: any) => ({
            id: tc.id,
            clientName: tc.client_name || 'Walk-in Client',
            clientId: tc.client_id,
            taxYear: tc.tax_year || '2024',
            returnType: tc.return_type || 'Income Tax Return',
            assignedStaff: tc.assigned_staff_name || 'Usama (Admin)',
            fee: Number(tc.fee || 0),
            amountFee: Number(tc.fee || 0),
            amountPaid: Number(tc.fee || 0),
            outstanding: 0,
            dueDate: tc.due_date || '30-09-2025',
            filedDate: tc.filing_date,
            status: tc.status || 'In Progress',
            notes: tc.notes || '',
            cprNumber: tc.cpr_number
          })));
        }
      }

      // 5. Sync Service Orders
      if (servicesRes.status === 'fulfilled' && servicesRes.value?.success && Array.isArray(servicesRes.value.orders)) {
        if (servicesRes.value.orders.length > 0) {
          setServiceOrders(servicesRes.value.orders.map((so: any) => ({
            id: so.id,
            orderNo: so.order_number,
            dateTime: so.created_at ? formatDateTime(new Date(so.created_at)) : formatDateTime(),
            serviceName: so.service_name,
            customer: so.customer_name,
            clientId: so.client_id,
            fileReference: so.file_reference || so.order_number,
            pages: Number(so.pages || 1),
            amount: Number(so.amount || 0),
            payment: so.payment_status || 'Unpaid',
            status: so.status || 'In Progress',
            deliveryDate: so.delivery_date,
            specialInstructions: so.notes
          })));
        }
      }

      // 6. Sync Receipts
      if (receiptsRes.status === 'fulfilled' && receiptsRes.value?.success && Array.isArray(receiptsRes.value.receipts)) {
        if (receiptsRes.value.receipts.length > 0) {
          setReceipts(receiptsRes.value.receipts.map((r: any) => ({
            id: r.id,
            receiptNo: r.receipt_number,
            dateTime: r.created_at ? formatDateTime(new Date(r.created_at)) : formatDateTime(),
            clientName: r.client_name,
            clientId: r.client_id,
            service: r.service_type,
            amount: Number(r.amount_paid || 0) + Number(r.balance_due || 0),
            paidAmount: Number(r.amount_paid || 0),
            balance: Number(r.balance_due || 0),
            paymentMethod: r.payment_method,
            remarks: r.notes || '',
            status: r.status === 'paid' ? 'PAID' : r.status === 'cancelled' ? 'CANCELLED' : r.status === 'unpaid' ? 'UNPAID' : 'PARTIAL',
            authorizedBy: 'CH Law Associates'
          })));
        }
      }

      // 7. Sync Tasks
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.success && Array.isArray(tasksRes.value.tasks)) {
        if (tasksRes.value.tasks.length > 0) {
          setTasks(tasksRes.value.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            client: t.client_name,
            relatedService: t.case_number ? `Case ${t.case_number}` : undefined,
            assignedStaff: t.assigned_to_name || 'Staff',
            dueDate: t.due_date,
            priority: t.priority === 'urgent' ? 'Urgent' : t.priority === 'high' ? 'High' : 'Medium',
            status: t.status === 'completed' ? 'Completed' : t.status === 'in_progress' ? 'In Progress' : 'Pending',
            description: t.description
          })));
        }
      }

      // 8. Sync Daily Closing
      if (dailyRes.status === 'fulfilled' && dailyRes.value?.success && dailyRes.value.closing) {
        const dc = dailyRes.value.closing;
        setDailyClosing({
          date: dc.closing_date,
          openingBalance: Number(dc.opening_cash || 0),
          openingCash: Number(dc.opening_cash || 0),
          cashIn: Number(dc.cash_in || 0),
          cashOut: Number(dc.cash_out || 0),
          expectedCash: Number(dc.system_cash || 0),
          actualCash: Number(dc.actual_cash || 0),
          difference: Number(dc.difference || 0),
          isClosed: dc.status === 'closed',
          closedAt: dc.closed_at,
          discrepancyReason: dc.notes
        });
      }

      // 9. Sync Audit Logs
      if (auditRes.status === 'fulfilled' && auditRes.value?.success && Array.isArray(auditRes.value.logs)) {
        if (auditRes.value.logs.length > 0) {
          setAuditLogs(auditRes.value.logs.map((al: any) => ({
            id: al.id,
            dateTime: al.created_at || '',
            user: al.user_name || 'Admin',
            action: al.action,
            module: al.entity_type,
            record: al.entity_id || '',
            details: humanizeAuditDetails(al.details),
            ipAddress: al.ip_address || '127.0.0.1',
            sessionStatus: 'Success'
          })));
        }
      }

      // 10. Sync Settings
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value.value) {
        setBusinessSettings(prev => ({ ...prev, ...settingsRes.value.value }));
      }

      // 11. Sync Staff Users (from Supabase profiles)
      if (employeesRes.status === 'fulfilled' && employeesRes.value?.success && Array.isArray(employeesRes.value.employees)) {
        if (employeesRes.value.employees.length > 0) {
          const roleLabels: Record<string, SystemUser['role']> = {
            super_admin: 'Admin',
            office_admin: 'Admin',
            lawyer: 'Tax Consultant',
            accountant: 'Accountant',
            receptionist: 'Staff',
            staff: 'Staff'
          };
          setSystemUsers(employeesRes.value.employees.map((emp: any) => {
            const displayName = emp.full_name || emp.email || 'Staff';
            const roleLabel = roleLabels[emp.role] || 'Staff';
            return {
              id: emp.id,
              name: displayName,
              email: emp.email || '',
              role: roleLabel,
              status: 'Offline' as const,
              lastLogin: emp.updated_at ? formatDateTime(new Date(emp.updated_at)) : '—',
              avatarInitials: displayName
                .split(' ')
                .map((part: string) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase(),
              phone: emp.phone || undefined
            };
          }));
        }
      }
    } catch (err) {
      console.warn('[OfficeContext] Data sync encountered an error; fallback cache retained:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Re-sync canonical data from the database when the user navigates between
  // office sections or returns to the tab — keeps locally-optimistic rows
  // (client-generated IDs/numbers) reconciled with Supabase.
  useEffect(() => {
    if (activeSection !== 'dashboard' || typeof window === 'undefined') {
      refreshData();
      return;
    }
    // Dashboard is the landing section; mount already refreshed it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  // Modals state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isQuickCashInOpen, setIsQuickCashInOpen] = useState(false);
  const [isQuickCashOutOpen, setIsQuickCashOutOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isStampSaleModalOpen, setIsStampSaleModalOpen] = useState(false);
  const [isNewServiceOrderModalOpen, setIsNewServiceOrderModalOpen] = useState(false);
  const [isNewTaxReturnModalOpen, setIsNewTaxReturnModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Persistence local cache side-effects
  useEffect(() => {
    safeSetItem('ch_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    safeSetItem('ch_account_balances', JSON.stringify(accountBalances));
  }, [accountBalances]);

  useEffect(() => {
    safeSetItem('ch_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    safeSetItem('ch_stamp_stock', JSON.stringify(stampStock));
  }, [stampStock]);

  useEffect(() => {
    safeSetItem('ch_stamp_movements', JSON.stringify(stampMovements));
  }, [stampMovements]);

  useEffect(() => {
    safeSetItem('ch_tax_cases', JSON.stringify(taxCases));
  }, [taxCases]);

  useEffect(() => {
    safeSetItem('ch_service_orders', JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    safeSetItem('ch_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    safeSetItem('ch_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    safeSetItem('ch_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeSetItem('ch_daily_closing', JSON.stringify(dailyClosing));
  }, [dailyClosing]);

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'dateTime'>) => {
    const newLog: AuditLog = {
      id: `al-${Date.now()}`,
      dateTime: formatDateTime(),
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async persist to Supabase
    fetch('/api/office/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: entry.action,
        module: entry.module,
        recordId: entry.record,
        details: entry.afterNew ? { after: entry.afterNew, before: entry.beforePrevious } : undefined
      })
    }).catch(e => console.warn('[OfficeContext] Could not record audit log to DB:', e));
  };

  // Internal helper to adjust account balance
  const adjustBalance = (account: string, amountDelta: number) => {
    setAccountBalances(prev => {
      const acc = account.toLowerCase();
      if (acc.includes('cash') && !acc.includes('jazz')) {
        return { ...prev, cashOffice: prev.cashOffice + amountDelta };
      } else if (acc.includes('bank') || acc.includes('hbl') || acc.includes('meezan')) {
        return { ...prev, bankAccount: prev.bankAccount + amountDelta };
      } else if (acc.includes('jazz')) {
        return { ...prev, jazzCash: prev.jazzCash + amountDelta };
      } else if (acc.includes('easy') || acc.includes('paisa')) {
        return { ...prev, easyPaisa: prev.easyPaisa + amountDelta };
      }
      return { ...prev, cashOffice: prev.cashOffice + amountDelta };
    });
  };

  // Central Cash In
  const recordCashIn = ({
    clientName,
    clientId,
    serviceName,
    amount,
    account,
    referenceNo,
    notes,
    staff = 'Usama',
    createReceipt: shouldCreateReceipt = true
  }: {
    clientName: string;
    clientId?: string;
    serviceName: string;
    amount: number;
    account: AccountType | string;
    referenceNo?: string;
    notes?: string;
    staff?: string;
    createReceipt?: boolean;
  }) => {
    const nowStr = formatDateTime();
    let receiptNo = referenceNo || '';

    if (shouldCreateReceipt && !receiptNo) {
      const nextNum = receipts.length + 126;
      receiptNo = `REC-2025-${nextNum.toString().padStart(6, '0')}`;
      
      const newRec: Receipt = {
        id: `rec-${Date.now()}`,
        receiptNo,
        dateTime: nowStr,
        clientName,
        clientId,
        service: serviceName,
        amount,
        paidAmount: amount,
        balance: 0,
        paymentMethod: typeof account === 'string' && account.toLowerCase().includes('bank') ? 'Bank Transfer' : 'Cash',
        remarks: notes || `Payment for ${serviceName}`,
        status: 'PAID',
        authorizedBy: 'CH Composing & Tax Advisor'
      };
      setReceipts(prev => [newRec, ...prev]);

      // Persist receipt to Supabase
      fetch('/api/office/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNo,
          clientName,
          clientId,
          service: serviceName,
          amount_paid: amount,
          balance_due: 0,
          paymentMethod: newRec.paymentMethod,
          notes: newRec.remarks
        })
      }).catch(err => console.warn('[OfficeContext] Receipt DB persist error:', err));
    }

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      dateTime: nowStr,
      type: 'IN',
      description: `${serviceName} Payment`,
      clientOrPayee: clientName,
      serviceOrCategory: serviceName,
      account,
      amount,
      staff,
      status: 'Completed',
      referenceNo: receiptNo,
      receiptNo,
      notes
    };

    setTransactions(prev => [newTx, ...prev]);
    adjustBalance(account, amount);

    // Update client balance if client matched
    if (clientId || clientName) {
      setClients(prev => prev.map(c => {
        if ((clientId && c.id === clientId) || c.name.toLowerCase() === clientName.toLowerCase()) {
          const newOutstanding = Math.max(0, c.outstanding - amount);
          return {
            ...c,
            paidAmount: c.paidAmount + amount,
            lifetimeRevenue: c.lifetimeRevenue + amount,
            outstanding: newOutstanding,
            status: newOutstanding > 0 ? 'Outstanding' : 'Active',
            lastService: nowStr.split(' ')[0]
          };
        }
        return c;
      }));
    }

    // Update Daily Closing cashIn if account is cash
    if (account.toLowerCase().includes('cash') && !account.toLowerCase().includes('jazz')) {
      setDailyClosing(prev => ({
        ...prev,
        cashIn: prev.cashIn + amount,
        expectedCash: prev.expectedCash + amount
      }));
    }

    addAuditLog({
      user: staff,
      action: 'Create',
      module: 'Cash',
      record: `Cash In: Rs. ${amount.toLocaleString()}`,
      beforePrevious: '-',
      afterNew: `Received Rs. ${amount.toLocaleString()} from ${clientName} for ${serviceName}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    // Persist ledger transaction to Supabase
    fetch('/api/office/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_transaction',
        entry_type: 'credit',
        account_id: account,
        amount,
        category: serviceName,
        description: `Received Rs. ${amount} from ${clientName} for ${serviceName}`,
        client_id: clientId,
        reference_no: receiptNo
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[OfficeContext] Cash In failed to persist in DB:', errData.error || res.statusText);
        }
      })
      .catch(err => console.error('[OfficeContext] Cash In DB network persist error:', err));

    return receiptNo;
  };

  // Central Cash Out
  const recordCashOut = ({
    category,
    payeeDescription,
    amount,
    account,
    referenceNo,
    notes,
    staff = 'Usama'
  }: {
    category: string;
    payeeDescription: string;
    amount: number;
    account: AccountType | string;
    referenceNo?: string;
    notes?: string;
    staff?: string;
  }) => {
    const nowStr = formatDateTime();

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      dateTime: nowStr,
      type: 'OUT',
      description: payeeDescription,
      clientOrPayee: payeeDescription,
      serviceOrCategory: category,
      account,
      amount,
      staff,
      status: 'Completed',
      referenceNo,
      notes
    };

    setTransactions(prev => [newTx, ...prev]);
    adjustBalance(account, -amount);

    // Also record in expenses list
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: nowStr.split(' ')[0],
      category,
      description: payeeDescription,
      vendorPayee: payeeDescription,
      account,
      amount,
      staff,
      status: 'Paid'
    };
    setExpenses(prev => [newExp, ...prev]);

    // Update daily closing if cash
    if (account.toLowerCase().includes('cash') && !account.toLowerCase().includes('jazz')) {
      setDailyClosing(prev => ({
        ...prev,
        cashOut: prev.cashOut + amount,
        expectedCash: prev.expectedCash - amount
      }));
    }

    addAuditLog({
      user: staff,
      action: 'Create',
      module: 'Expense',
      record: `Cash Out: Rs. ${amount.toLocaleString()}`,
      beforePrevious: '-',
      afterNew: `Paid Rs. ${amount.toLocaleString()} to ${payeeDescription} (${category})`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    // Persist expense to Supabase
    fetch('/api/office/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_expense',
        account_id: account,
        category,
        payee: payeeDescription,
        amount,
        description: notes || payeeDescription
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[OfficeContext] Cash Out failed to persist in DB:', errData.error || res.statusText);
        }
      })
      .catch(err => console.error('[OfficeContext] Cash Out DB persist error:', err));
  };

  // Central Account Transfer
  const recordTransfer = ({
    fromAccount,
    toAccount,
    amount,
    notes,
    staff = 'Usama'
  }: {
    fromAccount: AccountType | string;
    toAccount: AccountType | string;
    amount: number;
    notes?: string;
    staff?: string;
  }) => {
    const nowStr = formatDateTime();
    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      dateTime: nowStr,
      type: 'TRANSFER',
      description: `Transfer: ${fromAccount} -> ${toAccount}`,
      clientOrPayee: `Transfer to ${toAccount}`,
      serviceOrCategory: 'Account Transfer',
      account: fromAccount,
      amount,
      staff,
      status: 'Completed',
      notes
    };

    setTransactions(prev => [newTx, ...prev]);
    adjustBalance(fromAccount, -amount);
    adjustBalance(toAccount, amount);

    addAuditLog({
      user: staff,
      action: 'Update',
      module: 'Cash',
      record: `Transfer: Rs. ${amount.toLocaleString()}`,
      beforePrevious: `From: ${fromAccount}`,
      afterNew: `To: ${toAccount}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    // Persist transfer to Supabase
    fetch('/api/office/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_transfer',
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amount,
        description: notes || `Transfer from ${fromAccount} to ${toAccount}`
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[OfficeContext] Transfer failed to persist in DB:', errData.error || res.statusText);
        }
      })
      .catch(err => console.error('[OfficeContext] Transfer DB persist error:', err));
  };


  // Stamp Sale
  const recordStampSale = ({
    denomination,
    quantity,
    clientName,
    clientId,
    paymentAccount = 'cash',
    notes,
    staff = 'Usama'
  }: {
    denomination: number;
    quantity: number;
    clientName: string;
    clientId?: string;
    paymentAccount?: AccountType | string;
    notes?: string;
    staff?: string;
  }) => {
    const totalAmount = denomination * quantity;
    const nowStr = formatDateTime();

    // 1. Update Stock
    let newBal = 0;
    setStampStock(prev => prev.map(item => {
      if (item.denomination === denomination) {
        const remaining = Math.max(0, item.remaining - quantity);
        newBal = remaining;
        const sold = item.sold + quantity;
        const stockValue = remaining * item.purchasePrice;
        const status = remaining <= (item.minimumLevel / 2) ? 'Critical' : remaining <= item.minimumLevel ? 'Low' : 'OK';
        return { ...item, remaining, sold, stockValue, status };
      }
      return item;
    }));

    // 2. Add Stamp Movement
    const movement: StampMovement = {
      id: `sm-${Date.now()}`,
      dateTime: nowStr,
      type: 'Sale',
      denomination,
      qty: -quantity,
      balance: newBal,
      clientOrSupplier: clientName,
      amount: totalAmount,
      user: staff,
      notes
    };
    setStampMovements(prev => [movement, ...prev]);

    // 3. Central Ledger + Receipt
    recordCashIn({
      clientName,
      clientId,
      serviceName: `E-Stamp (${denomination} x ${quantity})`,
      amount: totalAmount,
      account: paymentAccount,
      notes: notes || `Stamp paper sale denomination Rs. ${denomination}`,
      staff,
      createReceipt: true
    });

    addAuditLog({
      user: staff,
      action: 'Create',
      module: 'Stamp',
      record: `Stamp Sale: Rs. ${totalAmount.toLocaleString()}`,
      beforePrevious: '-',
      afterNew: `${quantity}x Rs. ${denomination} stamps sold to ${clientName}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    // 4. Persist stamp sale movement to Supabase
    const stampItem = stampStock.find(s => s.denomination === denomination);
    if (stampItem?.id) {
      fetch('/api/office/stamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_movement',
          movement_type: 'sale',
          stamp_product_id: stampItem.id,
          quantity,
          client_name: clientName,
          notes
        })
      }).catch(err => console.warn('[OfficeContext] Stamp sale DB error:', err));
    }
  };

  // Stamp Purchase
  const recordStampPurchase = ({
    denomination,
    quantity,
    supplier,
    purchasePricePerUnit,
    paymentAccount = 'cash',
    notes,
    staff = 'Usama'
  }: {
    denomination: number;
    quantity: number;
    supplier: string;
    purchasePricePerUnit: number;
    paymentAccount?: AccountType | string;
    notes?: string;
    staff?: string;
  }) => {
    const totalCost = purchasePricePerUnit * quantity;
    const nowStr = formatDateTime();
    let newBal = 0;

    setStampStock(prev => prev.map(item => {
      if (item.denomination === denomination) {
        const purchased = item.purchased + quantity;
        const remaining = item.remaining + quantity;
        newBal = remaining;
        const stockValue = remaining * item.purchasePrice;
        const status = remaining <= item.minimumLevel ? 'Low' : 'OK';
        return { ...item, purchased, remaining, stockValue, status };
      }
      return item;
    }));

    const movement: StampMovement = {
      id: `sm-${Date.now()}`,
      dateTime: nowStr,
      type: 'Purchase',
      denomination,
      qty: quantity,
      balance: newBal,
      clientOrSupplier: supplier,
      amount: totalCost,
      user: staff,
      notes
    };
    setStampMovements(prev => [movement, ...prev]);

    recordCashOut({
      category: 'Stamp Purchase',
      payeeDescription: `Stamp Purchase (${quantity}x Rs. ${denomination}) from ${supplier}`,
      amount: totalCost,
      account: paymentAccount,
      notes,
      staff
    });

    const stampItem = stampStock.find(s => s.denomination === denomination);
    if (stampItem?.id) {
      fetch('/api/office/stamps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_movement',
          movement_type: 'purchase',
          stamp_product_id: stampItem.id,
          quantity,
          unit_price: purchasePricePerUnit,
          notes: `Purchased from ${supplier}`
        })
      }).catch(err => console.warn('[OfficeContext] Stamp purchase DB error:', err));
    }
  };

  // Stamp Adjustment
  const recordStampAdjustment = ({
    denomination,
    adjustedStock,
    reason,
    staff = 'Usama'
  }: {
    denomination: number;
    adjustedStock: number;
    reason: string;
    staff?: string;
  }) => {
    const nowStr = formatDateTime();
    let prevStock = 0;
    let diff = 0;

    setStampStock(prev => prev.map(item => {
      if (item.denomination === denomination) {
        prevStock = item.remaining;
        diff = adjustedStock - prevStock;
        const stockValue = adjustedStock * item.purchasePrice;
        const status = adjustedStock <= item.minimumLevel ? 'Low' : 'OK';
        return { ...item, remaining: adjustedStock, stockValue, status };
      }
      return item;
    }));

    const adj: StampAdjustment = {
      id: `sa-${Date.now()}`,
      dateTime: nowStr,
      denomination,
      previousStock: prevStock,
      adjustedStock,
      difference: diff,
      reason,
      adjustedBy: staff
    };
    setStampAdjustments(prev => [adj, ...prev]);

    const movement: StampMovement = {
      id: `sm-${Date.now()}`,
      dateTime: nowStr,
      type: 'Adjustment',
      denomination,
      qty: diff,
      balance: adjustedStock,
      clientOrSupplier: 'Physical Verification',
      amount: Math.abs(diff * denomination),
      user: staff,
      notes: reason
    };
    setStampMovements(prev => [movement, ...prev]);

    addAuditLog({
      user: staff,
      action: 'Adjustment',
      module: 'Stamp',
      record: `Adjustment Rs. ${denomination}`,
      beforePrevious: `Stock: ${prevStock}`,
      afterNew: `Adjusted to ${adjustedStock} (${diff > 0 ? '+' : ''}${diff}): ${reason}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });
  };

  // Clients
  const addClient = (clientData: Omit<Client, 'id' | 'memberSince' | 'totalBilling' | 'paidAmount' | 'lifetimeRevenue' | 'lastService' | 'documents'>) => {
    const newClient: Client = {
      id: `c-${Date.now()}`,
      ...clientData,
      memberSince: formatDateTime().split(' ')[0],
      totalBilling: clientData.outstanding || 0,
      paidAmount: 0,
      lifetimeRevenue: 0,
      lastService: formatDateTime().split(' ')[0],
      documents: []
    };
    setClients(prev => [newClient, ...prev]);

    addAuditLog({
      user: 'Usama',
      action: 'Create',
      module: 'Client',
      record: newClient.name,
      beforePrevious: '-',
      afterNew: `Created client ${newClient.name} (${newClient.businessName || 'Individual'})`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    // Persist to database API
    fetch('/api/office/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: newClient.name,
        business_name: newClient.businessName,
        cnic: newClient.cnic,
        ntn: newClient.ntn,
        mobile: newClient.mobile || newClient.phone,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        client_type: newClient.type || 'individual',
        status: newClient.status?.toLowerCase() || 'active'
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.client?.id) {
          // Reconcile client id with Supabase UUID
          setClients(prev => prev.map(c => c.id === newClient.id ? { ...c, id: resData.client.id } : c));
        }
      })
      .catch(err => console.warn('[OfficeContext] Could not sync new client to DB:', err));
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientData } : c));
    addAuditLog({
      user: 'Usama',
      action: 'Update',
      module: 'Client',
      record: `Client ${id}`,
      beforePrevious: 'Previous data',
      afterNew: 'Updated client information',
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        full_name: clientData.name,
        business_name: clientData.businessName,
        mobile: clientData.mobile || clientData.phone,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        cnic: clientData.cnic,
        ntn: clientData.ntn
      })
    }).catch(err => console.warn('[OfficeContext] Update client DB error:', err));
  };

  // Receipts
  const createReceipt = (receiptData: Omit<Receipt, 'id' | 'receiptNo' | 'dateTime' | 'status' | 'authorizedBy'>) => {
    const nextNum = receipts.length + 126;
    const receiptNo = `REC-2025-${nextNum.toString().padStart(6, '0')}`;
    const newRec: Receipt = {
      id: `rec-${Date.now()}`,
      receiptNo,
      dateTime: formatDateTime(),
      status: receiptData.balance === 0 ? 'PAID' : receiptData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      authorizedBy: 'CH Composing & Tax Advisor',
      ...receiptData
    };
    setReceipts(prev => [newRec, ...prev]);

    addAuditLog({
      user: 'Usama',
      action: 'Create',
      module: 'Receipt',
      record: receiptNo,
      beforePrevious: '-',
      afterNew: `Receipt generated for ${receiptData.clientName} (Rs. ${receiptData.paidAmount.toLocaleString()})`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptNo,
        clientName: receiptData.clientName,
        clientId: receiptData.clientId,
        service: receiptData.service,
        amount_paid: receiptData.paidAmount,
        balance_due: receiptData.balance,
        paymentMethod: receiptData.paymentMethod,
        notes: receiptData.remarks
      })
    }).catch(err => console.warn('[OfficeContext] Create receipt DB error:', err));

    return receiptNo;
  };

  // Cancel Receipt
  const cancelReceipt = (id: string, reason: string) => {
    const rec = receipts.find(r => r.id === id);
    if (!rec) return;

    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED', cancellationReason: reason } : r));

    setTransactions(prev => prev.map(t => {
      if (t.receiptNo === rec.receiptNo) {
        return {
          ...t,
          status: 'Cancelled',
          cancelledReason: reason,
          cancelledAt: formatDateTime(),
          cancelledBy: 'Usama'
        };
      }
      return t;
    }));

    if (rec.paidAmount > 0) {
      adjustBalance(rec.paymentMethod || 'cash', -rec.paidAmount);
    }

    addAuditLog({
      user: 'Usama',
      action: 'Cancel',
      module: 'Receipt',
      record: rec.receiptNo,
      beforePrevious: `Status: ${rec.status}`,
      afterNew: `Cancelled: ${reason}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/receipts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: 'cancelled',
        notes: reason
      })
    }).catch(err => console.warn('[OfficeContext] Cancel receipt DB error:', err));
  };

  // Expenses
  const addExpense = (expenseData: Omit<Expense, 'id' | 'staff' | 'status'>) => {
    recordCashOut({
      category: expenseData.category,
      payeeDescription: expenseData.description,
      amount: expenseData.amount,
      account: expenseData.account,
      staff: 'Usama'
    });
  };

  // Tax Management
  const updateTaxCaseStatus = (id: string, newStatus: TaxCase['status']) => {
    setTaxCases(prev => prev.map(tc => {
      if (tc.id === id) {
        const filedDate = (newStatus === 'Submitted' || newStatus === 'Completed') ? formatDateTime().split(' ')[0] : tc.filedDate;
        return { ...tc, status: newStatus, filedDate };
      }
      return tc;
    }));

    addAuditLog({
      user: 'Usama',
      action: 'Update',
      module: 'Tax',
      record: `Case ${id}`,
      beforePrevious: 'Status change',
      afterNew: `Status set to ${newStatus}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/tax', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: newStatus
      })
    }).catch(err => console.warn('[OfficeContext] Update tax case DB error:', err));
  };

  const addTaxCase = (caseData: Omit<TaxCase, 'id'>) => {
    const newCase: TaxCase = {
      id: `tc-${Date.now()}`,
      ...caseData
    };
    setTaxCases(prev => [newCase, ...prev]);

    addAuditLog({
      user: 'Usama',
      action: 'Create',
      module: 'Tax',
      record: newCase.clientName,
      beforePrevious: '-',
      afterNew: `Created ${newCase.returnType} for ${newCase.clientName}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/tax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: caseData.clientId,
        taxYear: caseData.taxYear,
        returnType: caseData.returnType,
        fee: caseData.fee || caseData.amountFee || 0,
        dueDate: caseData.dueDate,
        cprNumber: caseData.cprNumber,
        status: caseData.status || 'In Progress',
        notes: caseData.notes
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.case?.id) {
          setTaxCases(prev => prev.map(tc => tc.id === newCase.id ? { ...tc, id: data.case.id } : tc));
        }
      })
      .catch(err => console.warn('[OfficeContext] Add tax case DB error:', err));
  };

  // Service Orders
  const addServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'orderNo' | 'dateTime' | 'status'>) => {
    const orderNo = (serviceOrders.length + 1).toString().padStart(3, '0');
    const newOrder: ServiceOrder = {
      id: `so-${Date.now()}`,
      orderNo,
      dateTime: formatDateTime(),
      status: 'In Progress',
      ...orderData
    };
    setServiceOrders(prev => [newOrder, ...prev]);

    if (orderData.payment === 'Paid') {
      recordCashIn({
        clientName: orderData.customer,
        clientId: orderData.clientId,
        serviceName: orderData.serviceName,
        amount: orderData.amount,
        account: 'cash',
        notes: `Order #${orderNo} - ${orderData.fileReference}`
      });
    }

    addAuditLog({
      user: 'Usama',
      action: 'Create',
      module: 'Service',
      record: `Order #${orderNo}`,
      beforePrevious: '-',
      afterNew: `Created ${orderData.serviceName} for ${orderData.customer}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: orderData.customer,
        serviceName: orderData.serviceName,
        clientId: orderData.clientId,
        fileReference: orderData.fileReference,
        pages: orderData.pages,
        amount: orderData.amount,
        payment: orderData.payment,
        deliveryDate: orderData.deliveryDate,
        specialInstructions: orderData.specialInstructions
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.order?.id) {
          setServiceOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, id: data.order.id } : o));
        }
      })
      .catch(err => console.warn('[OfficeContext] Add service order DB error:', err));
  };

  const updateServiceOrderStatus = (id: string, newStatus: ServiceOrder['status']) => {
    setServiceOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    addAuditLog({
      user: 'Usama',
      action: 'Update',
      module: 'Service',
      record: `Order ${id}`,
      beforePrevious: 'Status updated',
      afterNew: `Status set to ${newStatus}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: newStatus
      })
    }).catch(err => console.warn('[OfficeContext] Update service order DB error:', err));
  };

  // Daily Closing
  const closeDay = (actualCash: number, discrepancyReason?: string) => {
    const expected = dailyClosing.expectedCash;
    const diff = actualCash - expected;
    const closedClosing: DailyClosing = {
      ...dailyClosing,
      actualCash,
      difference: diff,
      discrepancyReason: diff !== 0 ? discrepancyReason : undefined,
      isClosed: true,
      closedAt: formatDateTime(),
      closedBy: 'Usama (Admin)'
    };
    setDailyClosing(closedClosing);
    setDailyClosingHistory(prev => [closedClosing, ...prev]);

    addAuditLog({
      user: 'Usama (Admin)',
      action: 'Close Day',
      module: 'Cash',
      record: `Closing Date: ${closedClosing.date}`,
      beforePrevious: `Expected: Rs. ${expected.toLocaleString()}`,
      afterNew: `Actual: Rs. ${actualCash.toLocaleString()} (Diff: Rs. ${diff.toLocaleString()})`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/daily-closing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: closedClosing.date,
        openingCash: closedClosing.openingCash || closedClosing.openingBalance,
        cashIn: closedClosing.cashIn,
        cashOut: closedClosing.cashOut,
        expectedCash: closedClosing.expectedCash,
        actualCash,
        difference: diff,
        status: 'closed',
        notes: discrepancyReason
      })
    }).catch(err => console.warn('[OfficeContext] Close day DB error:', err));
  };

  const reopenDay = (reason: string) => {
    setDailyClosing(prev => ({
      ...prev,
      isClosed: false,
      reopenedAt: formatDateTime(),
      reopenedBy: 'Usama (Admin)',
      reopenReason: reason
    }));

    addAuditLog({
      user: 'Usama (Admin)',
      action: 'Update',
      module: 'Cash',
      record: `Reopen Day`,
      beforePrevious: 'Closed',
      afterNew: `Reopened: ${reason}`,
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });
  };

  // Tasks
  const addTask = (taskData: Omit<OfficeTask, 'id'>) => {
    const newTask: OfficeTask = {
      id: `t-${Date.now()}`,
      ...taskData
    };
    setTasks(prev => [newTask, ...prev]);

    fetch('/api/office/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.task?.id) {
          setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: data.task.id } : t));
        }
      })
      .catch(err => console.warn('[OfficeContext] Add task DB error:', err));
  };

  const toggleTaskStatus = (id: string) => {
    let nextStatus = 'Completed';
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        nextStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
        return {
          ...t,
          status: nextStatus as any
        };
      }
      return t;
    }));

    fetch('/api/office/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: nextStatus
      })
    }).catch(err => console.warn('[OfficeContext] Toggle task DB error:', err));
  };

  // Business settings
  const updateBusinessSettings = (settings: Partial<BusinessSettings>) => {
    setBusinessSettings(prev => ({ ...prev, ...settings }));
    addAuditLog({
      user: 'Usama',
      action: 'Update',
      module: 'Settings',
      record: 'Business Settings',
      beforePrevious: 'Previous configuration',
      afterNew: 'Settings updated successfully',
      ipAddress: '192.168.1.10',
      sessionStatus: 'Success'
    });

    fetch('/api/office/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'office_business_profile',
        value: settings
      })
    }).catch(err => console.warn('[OfficeContext] Update settings DB error:', err));
  };

  return (
    <OfficeContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeSubSection,
        setActiveSubSection,
        selectedClientId,
        setSelectedClientId,
        selectedReceiptId,
        setSelectedReceiptId,
        selectedOrderId,
        setSelectedOrderId,
        selectedTaxCaseId,
        setSelectedTaxCaseId,
        transactions,
        accountBalances,
        clients,
        stampStock,
        stampMovements,
        stampAdjustments,
        taxCases,
        serviceOrders,
        receipts,
        expenses,
        recurringExpenses,
        utilityBills,
        tasks,
        dailyClosing,
        dailyClosingHistory,
        systemUsers,
        auditLogs,
        businessSettings,
        isLoading,
        refreshData,
        isDarkMode,
        unreadNotifications,
        markNotificationsRead,
        toggleDarkMode,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isQuickCashInOpen,
        setIsQuickCashInOpen,
        isQuickCashOutOpen,
        setIsQuickCashOutOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isCloseDayModalOpen,
        setIsCloseDayModalOpen,
        isNewClientModalOpen,
        setIsNewClientModalOpen,
        isStampSaleModalOpen,
        setIsStampSaleModalOpen,
        isNewServiceOrderModalOpen,
        setIsNewServiceOrderModalOpen,
        isNewTaxReturnModalOpen,
        setIsNewTaxReturnModalOpen,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        recordCashIn,
        recordCashOut,
        recordTransfer,
        recordStampSale,
        recordStampPurchase,
        recordStampAdjustment,
        addClient,
        updateClient,
        createReceipt,
        cancelReceipt,
        addExpense,
        updateTaxCaseStatus,
        addTaxCase,
        addServiceOrder,
        updateServiceOrderStatus,
        closeDay,
        reopenDay,
        addTask,
        toggleTaskStatus,
        addAuditLog,
        updateBusinessSettings
      }}
    >
      {children}
    </OfficeContext.Provider>
  );
};

export const useOffice = () => {
  const context = useContext(OfficeContext);
  if (!context) {
    throw new Error('useOffice must be used within an OfficeProvider');
  }
  return context;
};
