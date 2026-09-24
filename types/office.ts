// ==============================================================================
// types/office.ts
// Domain Types for CH Law Associates & Chamber 121 Sahiwal
// ==============================================================================

export type AppRole =
  | 'super_admin'
  | 'website_admin'
  | 'office_admin'
  | 'lawyer'
  | 'staff'
  | 'accountant'
  | 'receptionist';

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type ClientStatus = 'active' | 'inactive' | 'archived';
export type ClientType = 'individual' | 'sole_proprietor' | 'partnership' | 'company' | 'other';
export type CaseStatus = 'active' | 'pending' | 'decided' | 'disposed' | 'archived';
export type HearingStatus = 'scheduled' | 'adjourned' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvoiceStatus = 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'leave';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url?: string | null;
  role: AppRole;
  designation?: string | null;
  department?: string | null;
  bar_license_no?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_code: string;
  full_name: string;
  business_name?: string | null;
  client_type: ClientType;
  cnic?: string | null;
  ntn?: string | null;
  mobile: string;
  phone?: string | null;
  email?: string | null;
  city: string;
  address?: string | null;
  status: ClientStatus;
  total_billed?: number;
  total_paid?: number;
  outstanding_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  relation?: string | null;
  phone: string;
  email?: string | null;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  author_id?: string | null;
  author_name?: string | null;
  content: string;
  created_at: string;
}

export interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court_name: string;
  judge_name?: string | null;
  case_type: string;
  case_category?: string | null;
  stage: string;
  status: CaseStatus;
  filing_date: string;
  decision_date?: string | null;
  description?: string | null;
  created_by?: string | null;
  clients?: Client[];
  lawyers?: Profile[];
  created_at: string;
  updated_at: string;
}

export interface Hearing {
  id: string;
  case_id: string;
  case_number?: string;
  case_title?: string;
  hearing_date: string;
  court_room?: string | null;
  judge_name?: string | null;
  purpose: string;
  proceedings_summary?: string | null;
  next_hearing_date?: string | null;
  next_purpose?: string | null;
  status: HearingStatus;
  created_at: string;
  updated_at: string;
}

export interface CaseNote {
  id: string;
  case_id: string;
  author_id: string;
  author_name?: string;
  note_type: string;
  content: string;
  is_confidential: boolean;
  created_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  title: string;
  document_type: string;
  file_url: string;
  storage_path?: string | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id?: string | null;
  assigned_to?: string | null;
  assigned_lawyer_name?: string | null;
  client_name: string;
  client_phone: string;
  service_requested?: string | null;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  source: 'website' | 'office_counter' | 'phone';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficeTask {
  id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  case_id?: string | null;
  case_number?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name?: string;
  case_id?: string | null;
  case_number?: string | null;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  notes?: string | null;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id?: string | null;
  invoice_number?: string | null;
  client_id: string;
  client_name?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_account_id?: string | null;
  account_name?: string | null;
  receipt_number?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
}

export interface PaymentAccount {
  id: string;
  name: string;
  account_type: 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'other';
  account_number?: string | null;
  bank_name?: string | null;
  opening_balance: number;
  current_balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialLedgerEntry {
  id: string;
  transaction_number?: string | null;
  account_id: string;
  account_name?: string;
  entry_type: 'debit' | 'credit';
  amount: number;
  balance_after: number;
  category: string;
  reference_type?: string | null;
  reference_id?: string | null;
  description: string;
  client_id?: string | null;
  client_name?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  account_id?: string | null;
  account_name?: string | null;
  category: string;
  payee: string;
  amount: number;
  expense_date: string;
  description?: string | null;
  receipt_url?: string | null;
  approved_by?: string | null;
  created_at: string;
}

export interface StampProduct {
  id: string;
  name: string;
  denomination: number;
  purchase_price: number;
  sale_price: number;
  current_stock: number;
  minimum_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StampMovement {
  id: string;
  stamp_product_id: string;
  denomination?: number;
  movement_type: 'opening' | 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'reversal';
  quantity: number;
  unit_price?: number | null;
  reference_type?: string | null;
  reference_id?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface DailyClosing {
  id: string;
  closing_date: string;
  opening_cash: number;
  cash_in: number;
  cash_out: number;
  system_cash: number;
  actual_cash: number;
  difference: number;
  bank_wallets_balance: number;
  stamps_sold_count: number;
  stamps_sold_value: number;
  status: 'open' | 'closed' | 'reopened';
  notes?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  name_urdu?: string | null;
  role: string;
  role_urdu?: string | null;
  status: 'current' | 'late';
  badge?: string | null;
  image_url?: string | null;
  bio?: string | null;
  bio_urdu?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_title?: string | null;
  comment: string;
  rating: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}
