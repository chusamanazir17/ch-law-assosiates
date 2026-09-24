export type AccountType = 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'cheque' | 'other';

export type UserRole = 'Admin' | 'Tax Consultant' | 'Stamp Vendor' | 'Accountant' | 'Staff';

export interface LedgerTransaction {
  id: string;
  dateTime: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  description: string;
  clientOrPayee: string;
  serviceOrCategory: string;
  account: AccountType | string;
  amount: number;
  staff: string;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Reversed';
  referenceNo?: string;
  notes?: string;
  receiptNo?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  date?: string;
  size: string;
  category: 'CNIC' | 'NTN' | 'Bank Statement' | 'Tax Return' | 'Challan' | 'Other';
}

export interface Client {
  id: string;
  name: string;
  cnic: string;
  ntn: string;
  mobile: string;
  phone?: string;
  email: string;
  businessName: string;
  businessType: 'Individual' | 'Sole Proprietorship' | 'Partnership' | 'Private Limited' | 'AOP' | 'Other';
  type?: string;
  address: string;
  taxStatus: 'Active' | 'Non-Filer' | 'Filer' | 'Exempt';
  memberSince: string;
  outstanding: number;
  status: 'Active' | 'Outstanding' | 'Inactive';
  totalBilling: number;
  paidAmount: number;
  lifetimeRevenue: number;
  lastService: string;
  documents: ClientDocument[];
  notes?: string;
}

export interface StampStockItem {
  id?: string;
  denomination: number;
  openingStock: number;
  purchased: number;
  sold: number;
  remaining: number;
  purchasePrice: number;
  salePrice: number;
  stockValue: number;
  minimumLevel: number;
  status: 'OK' | 'Low' | 'Critical';
}

export interface StampMovement {
  id: string;
  dateTime: string;
  type: 'Sale' | 'Purchase' | 'Adjustment';
  denomination: number;
  qty: number;
  balance: number;
  clientOrSupplier: string;
  amount: number;
  user: string;
  notes?: string;
}

export interface StampAdjustment {
  id: string;
  dateTime: string;
  denomination: number;
  previousStock: number;
  adjustedStock: number;
  difference: number;
  reason: string;
  adjustedBy: string;
}

export interface TaxCase {
  id: string;
  clientName: string;
  clientId?: string;
  clientType?: string;
  taxYear: string;
  returnType: 'Income Tax Return' | 'Sales Tax Return' | 'NTN Registration' | 'Withholding Statement' | 'Annual Return' | string;
  assignedStaff?: string;
  assignedTo?: string;
  amountFee?: number;
  fee?: number;
  amountPaid?: number;
  outstanding?: number;
  dueDate: string;
  filedDate?: string;
  status: 'Documents Required' | 'In Progress' | 'Ready to File' | 'Submitted' | 'Completed' | 'Overdue';
  notes: string;
  ntn?: string;
  cprNumber?: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partial';
  requiredDocuments?: { name: string; checked: boolean; description?: string }[];
}

export interface ServiceOrder {
  id: string;
  orderNo: string;
  dateTime: string;
  serviceName: string;
  customer: string;
  clientId?: string;
  fileReference: string;
  pages: number;
  turnaroundTime?: string;
  deliveryDate?: string;
  amount: number;
  payment: 'Paid' | 'Unpaid' | 'Partial' | 'Pending';
  staff?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delivered' | 'Cancelled' | 'Ready';
  contact?: string;
  specialInstructions?: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  dateTime: string;
  clientName: string;
  clientId?: string;
  service: string;
  amount: number;
  paidAmount: number;
  balance: number;
  paymentMethod: string;
  remarks: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';
  authorizedBy: string;
  cancellationReason?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  vendorPayee: string;
  account: AccountType | string;
  amount: number;
  receiptUrl?: string;
  staff: string;
  status: 'Paid' | 'Pending';
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  frequency: string;
  nextDue: string;
  status: 'Active' | 'Paused';
}

export interface UtilityBill {
  id: string;
  vendor: string;
  billType: string;
  amount: number;
  dueDate: string;
  daysLeft: number;
  status: 'Pending' | 'Paid';
}

export interface DailyClosing {
  date: string;
  openingBalance: number;
  openingCash?: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  discrepancyReason?: string;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Online' | 'Offline' | 'Inactive';
  lastLogin: string;
  avatarInitials: string;
  phone?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  permissions: string[];
  status: string;
  lastActive: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  user: string;
  action: string;
  module: string;
  record?: string;
  recordId?: string;
  details?: string;
  beforePrevious?: string;
  afterNew?: string;
  ipAddress?: string;
  sessionStatus?: 'Success' | 'Failed';
}

export interface OfficeTask {
  id: string;
  title: string;
  client?: string;
  relatedService?: string;
  assignedStaff?: string;
  assignedTo?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Waiting Client' | 'Completed' | 'Overdue';
  description?: string;
}

export interface BusinessSettings {
  businessName: string;
  legalName: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  ntnNumber: string;
  chamberNumber: string;
  receiptFooter: string;
}
