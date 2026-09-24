import React, { createContext, useContext, useState, useEffect } from 'react';
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
  
  // UI & Modals
  isDarkMode: boolean;
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
    paymentAccount: AccountType | string;
    notes?: string;
    staff?: string;
  }) => void;

  recordStampPurchase: (data: {
    denomination: number;
    quantity: number;
    supplier: string;
    purchasePricePerUnit: number;
    paymentAccount: AccountType | string;
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

const OfficeContext = createContext<OfficeContextType | undefined>(undefined);

export const OfficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [activeSubSection, setActiveSubSection] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>('c-1');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('so-1');
  const [selectedTaxCaseId, setSelectedTaxCaseId] = useState<string | null>('tc-1');

  // Ledger & Balances
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem('ch_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [accountBalances, setAccountBalances] = useState<AccountBalances>(() => {
    const saved = localStorage.getItem('ch_account_balances');
    return saved ? JSON.parse(saved) : {
      cashOffice: 72800,
      bankAccount: 286500,
      jazzCash: 28200,
      easyPaisa: 20000
    };
  });

  // Entities
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ch_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [stampStock, setStampStock] = useState<StampStockItem[]>(() => {
    const saved = localStorage.getItem('ch_stamp_stock');
    return saved ? JSON.parse(saved) : initialStampStock;
  });

  const [stampMovements, setStampMovements] = useState<StampMovement[]>(() => {
    const saved = localStorage.getItem('ch_stamp_movements');
    return saved ? JSON.parse(saved) : initialStampMovements;
  });

  const [stampAdjustments, setStampAdjustments] = useState<StampAdjustment[]>(() => {
    const saved = localStorage.getItem('ch_stamp_adjustments');
    return saved ? JSON.parse(saved) : initialStampAdjustments;
  });

  const [taxCases, setTaxCases] = useState<TaxCase[]>(() => {
    const saved = localStorage.getItem('ch_tax_cases');
    return saved ? JSON.parse(saved) : initialTaxCases;
  });

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('ch_service_orders');
    return saved ? JSON.parse(saved) : initialServiceOrders;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('ch_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('ch_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(initialUtilityBills);

  const [tasks, setTasks] = useState<OfficeTask[]>(() => {
    const saved = localStorage.getItem('ch_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [dailyClosing, setDailyClosing] = useState<DailyClosing>(() => {
    const saved = localStorage.getItem('ch_daily_closing');
    return saved ? JSON.parse(saved) : initialDailyClosing;
  });

  const [dailyClosingHistory, setDailyClosingHistory] = useState<DailyClosing[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('ch_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(initialBusinessSettings);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ch_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ch_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ch_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('ch_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ch_account_balances', JSON.stringify(accountBalances));
  }, [accountBalances]);

  useEffect(() => {
    localStorage.setItem('ch_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ch_stamp_stock', JSON.stringify(stampStock));
  }, [stampStock]);

  useEffect(() => {
    localStorage.setItem('ch_stamp_movements', JSON.stringify(stampMovements));
  }, [stampMovements]);

  useEffect(() => {
    localStorage.setItem('ch_tax_cases', JSON.stringify(taxCases));
  }, [taxCases]);

  useEffect(() => {
    localStorage.setItem('ch_service_orders', JSON.stringify(serviceOrders));
  }, [serviceOrders]);

  useEffect(() => {
    localStorage.setItem('ch_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('ch_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('ch_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ch_daily_closing', JSON.stringify(dailyClosing));
  }, [dailyClosing]);

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

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'dateTime'>) => {
    const newLog: AuditLog = {
      id: `al-${Date.now()}`,
      dateTime: formatDateTime(),
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
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
  };

  // Central Account Transfer (Does NOT count as Income/Expense)
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
  };

  // Stamp Sale: reduces stamp inventory, adds IN transaction, updates cash, generates receipt
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
  };

  // Stamp Purchase from Treasury / State Bank
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

    return receiptNo;
  };

  // Cancel Receipt (Never silently delete!)
  const cancelReceipt = (id: string, reason: string) => {
    const rec = receipts.find(r => r.id === id);
    if (!rec) return;

    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED', cancellationReason: reason } : r));

    // Also mark related transaction as cancelled/reversed
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

    // Adjust balance back if it was paid
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
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'Completed' ? 'In Progress' : 'Completed'
        };
      }
      return t;
    }));
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
        isDarkMode,
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
