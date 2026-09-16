export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tax_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          name: string;
          email: string;
          status: 'pending' | 'active' | 'unsubscribed' | 'suppressed';
          consent_at: string;
          consent_text_version: string;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          status?: 'pending' | 'active' | 'unsubscribed' | 'suppressed';
          consent_at?: string;
          consent_text_version?: string;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          status?: 'pending' | 'active' | 'unsubscribed' | 'suppressed';
          consent_at?: string;
          consent_text_version?: string;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriber_categories: {
        Row: {
          subscriber_id: string;
          category_id: string;
          created_at: string;
        };
        Insert: {
          subscriber_id: string;
          category_id: string;
          created_at?: string;
        };
        Update: {
          subscriber_id?: string;
          category_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriber_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "tax_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriber_categories_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          }
        ];
      };
      subscription_tokens: {
        Row: {
          id: string;
          subscriber_id: string;
          token_hash: string;
          purpose: 'confirmation' | 'unsubscribe' | 'category_update';
          metadata: Json;
          expires_at: string;
          used_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          token_hash: string;
          purpose: 'confirmation' | 'unsubscribe' | 'category_update';
          metadata?: Json;
          expires_at: string;
          used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscriber_id?: string;
          token_hash?: string;
          purpose?: 'confirmation' | 'unsubscribe' | 'category_update';
          metadata?: Json;
          expires_at?: string;
          used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_tokens_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          }
        ];
      };
      tax_deadlines: {
        Row: {
          id: string;
          category_id: string;
          tax_year_or_period: string;
          title: string;
          filing_deadline: string;
          official_source_url: string | null;
          verified_at: string | null;
          verified_by: string | null;
          is_active: boolean;
          revision: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          tax_year_or_period: string;
          title: string;
          filing_deadline: string;
          official_source_url?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          is_active?: boolean;
          revision?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          tax_year_or_period?: string;
          title?: string;
          filing_deadline?: string;
          official_source_url?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          is_active?: boolean;
          revision?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tax_deadlines_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "tax_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      reminder_deliveries: {
        Row: {
          id: string;
          subscriber_id: string;
          deadline_id: string;
          deadline_revision: number;
          reminder_interval: '30_days' | '7_days';
          scheduled_date: string;
          status: 'queued' | 'processing' | 'sent' | 'failed' | 'skipped' | 'cancelled';
          provider_message_id: string | null;
          idempotency_key: string | null;
          attempt_count: number;
          last_attempt_at: string | null;
          sent_at: string | null;
          error_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          deadline_id: string;
          deadline_revision: number;
          reminder_interval: '30_days' | '7_days';
          scheduled_date: string;
          status?: 'queued' | 'processing' | 'sent' | 'failed' | 'skipped' | 'cancelled';
          provider_message_id?: string | null;
          idempotency_key?: string | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          sent_at?: string | null;
          error_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscriber_id?: string;
          deadline_id?: string;
          deadline_revision?: number;
          reminder_interval?: '30_days' | '7_days';
          scheduled_date?: string;
          status?: 'queued' | 'processing' | 'sent' | 'failed' | 'skipped' | 'cancelled';
          provider_message_id?: string | null;
          idempotency_key?: string | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          sent_at?: string | null;
          error_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_deadline_id_fkey";
            columns: ["deadline_id"];
            isOneToOne: false;
            referencedRelation: "tax_deadlines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reminder_deliveries_subscriber_id_fkey";
            columns: ["subscriber_id"];
            isOneToOne: false;
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          cover_image_url: string | null;
          category: string;
          author_name: string;
          status: 'draft' | 'published';
          views_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          cover_image_url?: string | null;
          category?: string;
          author_name?: string;
          status?: 'draft' | 'published';
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          cover_image_url?: string | null;
          category?: string;
          author_name?: string;
          status?: 'draft' | 'published';
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          name: string;
          url: string;
          storage_path: string | null;
          size_bytes: number | null;
          mime_type: string | null;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_announcements: {
        Row: {
          id: string;
          title: string;
          message: string;
          tone: 'info' | 'warning' | 'danger' | 'dark';
          is_active: boolean;
          link_url: string | null;
          link_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          tone?: 'info' | 'warning' | 'danger' | 'dark';
          is_active?: boolean;
          link_url?: string | null;
          link_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          tone?: 'info' | 'warning' | 'danger' | 'dark';
          is_active?: boolean;
          link_url?: string | null;
          link_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consultation_inquiries: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          service_needed: string;
          message: string | null;
          status: 'new' | 'in_progress' | 'completed' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          service_needed: string;
          message?: string | null;
          status?: 'new' | 'in_progress' | 'completed' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          service_needed?: string;
          message?: string | null;
          status?: 'new' | 'in_progress' | 'completed' | 'archived';
          created_at?: string;
        };
        Relationships: [];
      };
      admin_memberships: {
        Row: {
          user_id: string;
          role: 'admin' | 'super_admin';
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          key: string;
          count: number;
          reset_at: string;
        };
        Insert: {
          key: string;
          count?: number;
          reset_at: string;
        };
        Update: {
          key?: string;
          count?: number;
          reset_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
      check_rate_limit: {
        Args: {
          p_key: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      claim_reminder_deliveries: {
        Args: {
          p_batch_size?: number;
        };
        Returns: {
          delivery_id: string;
          subscriber_id: string;
          subscriber_name: string;
          subscriber_email: string;
          deadline_id: string;
          deadline_title: string;
          deadline_period: string;
          deadline_date: string;
          category_name: string;
          reminder_interval: string;
          deadline_revision: number;
          idempotency_key: string;
          attempt_count: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
