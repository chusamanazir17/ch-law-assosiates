// ==============================================================================
// src/lib/supabase/database.types.ts
// Project: CH Office Management System
// TypeScript definitions for Supabase Database Schema
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment' | 'reversal';
export type EntryType = 'debit' | 'credit';
export type PaymentAccountType = 'cash' | 'bank' | 'jazzcash' | 'easypaisa';
export type ReceiptStatus = 'paid' | 'cancelled';
export type ServiceOrderStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type StampMovementType = 'opening' | 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'reversal';
export type TaxCaseStatus = 'documents_required' | 'in_progress' | 'ready_to_file' | 'filed' | 'completed' | 'notice_received' | 'appealed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DailyClosingStatus = 'open' | 'closed' | 'reopened';
export type NotificationType = 'outstanding_payment' | 'low_stock' | 'tax_deadline' | 'task_overdue' | 'closing_difference' | 'security_alert' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar?: string | null;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          client_code: string;
          full_name: string;
          business_name: string | null;
          mobile: string;
          phone: string | null;
          cnic: string | null;
          ntn: string | null;
          email: string | null;
          city: string;
          address: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_code?: string;
          full_name: string;
          business_name?: string | null;
          mobile: string;
          phone?: string | null;
          cnic?: string | null;
          ntn?: string | null;
          email?: string | null;
          city?: string;
          address?: string | null;
          status?: string;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      payment_accounts: {
        Row: {
          id: string;
          name: string;
          account_type: PaymentAccountType;
          account_number: string | null;
          bank_name: string | null;
          opening_balance: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          account_type: PaymentAccountType;
          account_number?: string | null;
          bank_name?: string | null;
          opening_balance?: number;
          active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['payment_accounts']['Insert']>;
      };
      financial_transactions: {
        Row: {
          id: string;
          transaction_number: string;
          transaction_type: TransactionType;
          business_date: string;
          client_id: string | null;
          service_order_id: string | null;
          expense_id: string | null;
          stamp_purchase_id: string | null;
          stamp_sale_id: string | null;
          reference_number: string | null;
          description: string;
          status: string;
          created_by: string | null;
          cancelled_by: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_number?: string;
          transaction_type: TransactionType;
          business_date: string;
          client_id?: string | null;
          service_order_id?: string | null;
          expense_id?: string | null;
          stamp_purchase_id?: string | null;
          stamp_sale_id?: string | null;
          reference_number?: string | null;
          description: string;
          status?: string;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['financial_transactions']['Insert']>;
      };
      transaction_entries: {
        Row: {
          id: string;
          transaction_id: string;
          account_id: string;
          entry_type: EntryType;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          account_id: string;
          entry_type: EntryType;
          amount: number;
        };
        Update: Partial<Database['public']['Tables']['transaction_entries']['Insert']>;
      };
      receipts: {
        Row: {
          id: string;
          receipt_number: string;
          client_id: string | null;
          transaction_id: string;
          service_order_id: string | null;
          status: ReceiptStatus;
          remarks: string | null;
          issued_by: string;
          issued_at: string;
          cancelled_by: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_number?: string;
          client_id?: string | null;
          transaction_id: string;
          service_order_id?: string | null;
          status?: ReceiptStatus;
          remarks?: string | null;
          issued_by: string;
          issued_at?: string;
        };
        Update: Partial<Database['public']['Tables']['receipts']['Insert']>;
      };
      stamp_products: {
        Row: {
          id: string;
          name: string;
          denomination: number;
          purchase_price: number;
          sale_price: number;
          minimum_stock: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          denomination: number;
          purchase_price: number;
          sale_price: number;
          minimum_stock?: number;
          active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['stamp_products']['Insert']>;
      };
      stamp_stock_movements: {
        Row: {
          id: string;
          stamp_product_id: string;
          movement_type: StampMovementType;
          quantity: number;
          reference_type: string;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stamp_product_id: string;
          movement_type: StampMovementType;
          quantity: number;
          reference_type: string;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['stamp_stock_movements']['Insert']>;
      };
      tax_cases: {
        Row: {
          id: string;
          case_number: string;
          client_id: string;
          tax_year: string;
          case_type: string;
          fee: number;
          assigned_to: string | null;
          start_date: string;
          due_date: string | null;
          submission_date: string | null;
          submission_reference: string | null;
          status: TaxCaseStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_number: string;
          client_id: string;
          tax_year: string;
          case_type: string;
          fee?: number;
          assigned_to?: string | null;
          start_date?: string;
          due_date?: string | null;
          submission_date?: string | null;
          submission_reference?: string | null;
          status?: TaxCaseStatus;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['tax_cases']['Insert']>;
      };
      service_orders: {
        Row: {
          id: string;
          order_number: string;
          client_id: string;
          service_id: string | null;
          assigned_to: string | null;
          total_amount: number;
          discount: number;
          net_amount: number;
          status: ServiceOrderStatus;
          order_date: string;
          due_date: string | null;
          completion_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          client_id: string;
          service_id?: string | null;
          assigned_to?: string | null;
          total_amount: number;
          discount?: number;
          net_amount?: number;
          status?: ServiceOrderStatus;
          order_date?: string;
          due_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['service_orders']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          expense_number: string;
          category_id: string;
          account_id: string;
          vendor_id: string | null;
          amount: number;
          tax_amount: number;
          expense_date: string;
          description: string;
          paid_to: string;
          receipt_url: string | null;
          transaction_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expense_number: string;
          category_id: string;
          account_id: string;
          vendor_id?: string | null;
          amount: number;
          tax_amount?: number;
          expense_date?: string;
          description: string;
          paid_to: string;
          receipt_url?: string | null;
          transaction_id?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      daily_closings: {
        Row: {
          id: string;
          business_date: string;
          account_id: string;
          opening_balance: number;
          cash_in: number;
          cash_out: number;
          expected_balance: number;
          actual_balance: number;
          difference: number;
          difference_reason: string | null;
          status: DailyClosingStatus;
          closed_by: string | null;
          closed_at: string;
          reopened_by: string | null;
          reopened_at: string | null;
          reopen_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_date: string;
          account_id: string;
          opening_balance?: number;
          cash_in?: number;
          cash_out?: number;
          actual_balance: number;
          difference_reason?: string | null;
          status?: DailyClosingStatus;
          closed_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['daily_closings']['Insert']>;
      };
      business_settings: {
        Row: {
          id: string;
          business_name: string;
          legal_name: string;
          chamber_address: string;
          phone: string;
          whatsapp: string;
          email: string;
          ntn_number: string | null;
          logo_url: string | null;
          receipt_header: string;
          receipt_footer: string;
          currency: string;
          timezone: string;
          financial_year: string;
          receipt_prefix: string;
          transaction_prefix: string;
          service_order_prefix: string;
          created_at: string;
          updated_at: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          module: string;
          table_name: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          reason: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: NotificationType;
          reference_type: string | null;
          reference_id: string | null;
          read_at: string | null;
          created_at: string;
        };
      };
    };
    Views: {
      v_account_balances: {
        Row: {
          account_id: string;
          account_name: string;
          account_type: PaymentAccountType;
          opening_balance: number;
          total_debits: number;
          total_credits: number;
          current_balance: number;
          active: boolean;
        };
      };
      v_client_balances: {
        Row: {
          client_id: string;
          client_code: string;
          full_name: string;
          mobile: string;
          business_name: string | null;
          client_status: string;
          total_billed: number;
          total_paid: number;
          outstanding_balance: number;
        };
      };
      v_daily_cash_summary: {
        Row: {
          business_date: string;
          total_income: number;
          total_expense: number;
          net_cash_flow: number;
          transaction_count: number;
        };
      };
      v_monthly_profit: {
        Row: {
          year: string;
          month: string;
          month_name: string;
          total_income: number;
          total_expense: number;
          net_profit: number;
        };
      };
      v_stamp_current_stock: {
        Row: {
          stamp_product_id: string;
          name: string;
          denomination: number;
          purchase_price: number;
          sale_price: number;
          minimum_stock: number;
          current_stock: number;
          stock_value: number;
          stock_status: string;
          active: boolean;
        };
      };
      v_outstanding_clients: {
        Row: {
          client_id: string;
          client_code: string;
          full_name: string;
          mobile: string;
          business_name: string | null;
          client_status: string;
          total_billed: number;
          total_paid: number;
          outstanding_balance: number;
        };
      };
      v_dashboard_summary: {
        Row: {
          total_treasury_cash: number;
          physical_cash_in_drawer: number;
          bank_reserve: number;
          today_cash_in: number;
          today_cash_out: number;
          total_client_receivables: number;
          total_stamp_stock_value: number;
          low_stock_alerts_count: number;
          pending_tax_cases_count: number;
          overdue_tasks_count: number;
        };
      };
    };
    Functions: {
      calculate_account_balance: {
        Args: { p_account_id: string };
        Returns: number;
      };
      calculate_client_outstanding: {
        Args: { p_client_id: string };
        Returns: number;
      };
      calculate_stamp_stock: {
        Args: { p_product_id: string };
        Returns: number;
      };
      create_financial_transaction: {
        Args: {
          p_type: TransactionType;
          p_business_date: string;
          p_description: string;
          p_amount: number;
          p_account_id: string;
          p_dest_account_id?: string | null;
          p_client_id?: string | null;
          p_service_order_id?: string | null;
          p_reference_number?: string | null;
          p_created_by?: string | null;
        };
        Returns: string;
      };
      reverse_financial_transaction: {
        Args: {
          p_transaction_id: string;
          p_reason: string;
          p_reversed_by: string;
        };
        Returns: string;
      };
      close_business_day: {
        Args: {
          p_account_id: string;
          p_business_date: string;
          p_actual_balance: number;
          p_difference_reason: string;
          p_closed_by: string;
        };
        Returns: string;
      };
      reopen_business_day: {
        Args: {
          p_closing_id: string;
          p_reason: string;
          p_reopened_by: string;
        };
        Returns: void;
      };
    };
  };
}
