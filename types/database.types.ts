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
      // ------------------------------------------------------------------------
      // CMS & Public Website Tables
      // ------------------------------------------------------------------------
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
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          name_urdu: string | null;
          role: string;
          role_urdu: string | null;
          status: 'current' | 'late';
          badge: string | null;
          image_url: string | null;
          bio: string | null;
          bio_urdu: string | null;
          phone: string | null;
          whatsapp: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_urdu?: string | null;
          role: string;
          role_urdu?: string | null;
          status?: 'current' | 'late';
          badge?: string | null;
          image_url?: string | null;
          bio?: string | null;
          bio_urdu?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_urdu?: string | null;
          role?: string;
          role_urdu?: string | null;
          status?: 'current' | 'late';
          badge?: string | null;
          image_url?: string | null;
          bio?: string | null;
          bio_urdu?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          client_name: string;
          client_title: string | null;
          comment: string;
          rating: number;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          client_title?: string | null;
          comment: string;
          rating?: number;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          client_title?: string | null;
          comment?: string;
          rating?: number;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // ------------------------------------------------------------------------
      // Office Management System Tables
      // ------------------------------------------------------------------------
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          module: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          module: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          module?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          designation: string | null;
          department: string | null;
          bar_license_no: string | null;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          designation?: string | null;
          department?: string | null;
          bar_license_no?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          designation?: string | null;
          department?: string | null;
          bar_license_no?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          assigned_at: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
          assigned_at?: string;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          client_code: string;
          full_name: string;
          business_name: string | null;
          client_type: 'individual' | 'sole_proprietor' | 'partnership' | 'company' | 'other';
          cnic: string | null;
          ntn: string | null;
          mobile: string;
          phone: string | null;
          email: string | null;
          city: string;
          address: string | null;
          status: 'active' | 'inactive' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_code?: string;
          full_name: string;
          business_name?: string | null;
          client_type?: 'individual' | 'sole_proprietor' | 'partnership' | 'company' | 'other';
          cnic?: string | null;
          ntn?: string | null;
          mobile: string;
          phone?: string | null;
          email?: string | null;
          city?: string;
          address?: string | null;
          status?: 'active' | 'inactive' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_code?: string;
          full_name?: string;
          business_name?: string | null;
          client_type?: 'individual' | 'sole_proprietor' | 'partnership' | 'company' | 'other';
          cnic?: string | null;
          ntn?: string | null;
          mobile?: string;
          phone?: string | null;
          email?: string | null;
          city?: string;
          address?: string | null;
          status?: 'active' | 'inactive' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_contacts: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          relation: string | null;
          phone: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          relation?: string | null;
          phone: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          relation?: string | null;
          phone?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      client_notes: {
        Row: {
          id: string;
          client_id: string;
          author_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          author_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          author_id?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_notes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      cases: {
        Row: {
          id: string;
          case_number: string;
          title: string;
          court_name: string;
          judge_name: string | null;
          case_type: string;
          case_category: string | null;
          stage: string;
          status: 'active' | 'pending' | 'decided' | 'disposed' | 'archived';
          filing_date: string;
          decision_date: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_number: string;
          title: string;
          court_name?: string;
          judge_name?: string | null;
          case_type?: string;
          case_category?: string | null;
          stage?: string;
          status?: 'active' | 'pending' | 'decided' | 'disposed' | 'archived';
          filing_date?: string;
          decision_date?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_number?: string;
          title?: string;
          court_name?: string;
          judge_name?: string | null;
          case_type?: string;
          case_category?: string | null;
          stage?: string;
          status?: 'active' | 'pending' | 'decided' | 'disposed' | 'archived';
          filing_date?: string;
          decision_date?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      case_clients: {
        Row: {
          case_id: string;
          client_id: string;
          client_role: string;
          assigned_at: string;
        };
        Insert: {
          case_id: string;
          client_id: string;
          client_role?: string;
          assigned_at?: string;
        };
        Update: {
          case_id?: string;
          client_id?: string;
          client_role?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_clients_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_clients_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      case_lawyers: {
        Row: {
          case_id: string;
          lawyer_id: string;
          role: string;
          assigned_at: string;
        };
        Insert: {
          case_id: string;
          lawyer_id: string;
          role?: string;
          assigned_at?: string;
        };
        Update: {
          case_id?: string;
          lawyer_id?: string;
          role?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_lawyers_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_lawyers_lawyer_id_fkey";
            columns: ["lawyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      hearings: {
        Row: {
          id: string;
          case_id: string;
          hearing_date: string;
          court_room: string | null;
          judge_name: string | null;
          purpose: string;
          proceedings_summary: string | null;
          next_hearing_date: string | null;
          next_purpose: string | null;
          status: 'scheduled' | 'adjourned' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          hearing_date: string;
          court_room?: string | null;
          judge_name?: string | null;
          purpose: string;
          proceedings_summary?: string | null;
          next_hearing_date?: string | null;
          next_purpose?: string | null;
          status?: 'scheduled' | 'adjourned' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          hearing_date?: string;
          court_room?: string | null;
          judge_name?: string | null;
          purpose?: string;
          proceedings_summary?: string | null;
          next_hearing_date?: string | null;
          next_purpose?: string | null;
          status?: 'scheduled' | 'adjourned' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hearings_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          }
        ];
      };
      case_notes: {
        Row: {
          id: string;
          case_id: string;
          author_id: string;
          note_type: string;
          content: string;
          is_confidential: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          author_id: string;
          note_type?: string;
          content: string;
          is_confidential?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          author_id?: string;
          note_type?: string;
          content?: string;
          is_confidential?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_notes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_notes_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          }
        ];
      };
      case_documents: {
        Row: {
          id: string;
          case_id: string;
          title: string;
          document_type: string;
          file_url: string;
          storage_path: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          title: string;
          document_type?: string;
          file_url: string;
          storage_path?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          title?: string;
          document_type?: string;
          file_url?: string;
          storage_path?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      appointments: {
        Row: {
          id: string;
          client_id: string | null;
          assigned_to: string | null;
          client_name: string;
          client_phone: string;
          service_requested: string | null;
          appointment_date: string;
          appointment_time: string;
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          source: 'website' | 'office_counter' | 'phone';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          assigned_to?: string | null;
          client_name: string;
          client_phone: string;
          service_requested?: string | null;
          appointment_date: string;
          appointment_time: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          source?: 'website' | 'office_counter' | 'phone';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          assigned_to?: string | null;
          client_name?: string;
          client_phone?: string;
          service_requested?: string | null;
          appointment_date?: string;
          appointment_time?: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          source?: 'website' | 'office_counter' | 'phone';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assigned_to: string | null;
          case_id: string | null;
          client_id: string | null;
          due_date: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          assigned_to?: string | null;
          case_id?: string | null;
          client_id?: string | null;
          due_date: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string | null;
          case_id?: string | null;
          client_id?: string | null;
          due_date?: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          check_in_time: string | null;
          check_out_time: string | null;
          status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date?: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          status?: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          status?: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_id: string;
          case_id: string | null;
          issue_date: string;
          due_date: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          paid_amount: number;
          status: 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          client_id: string;
          case_id?: string | null;
          issue_date?: string;
          due_date: string;
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          paid_amount?: number;
          status?: 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          client_id?: string;
          case_id?: string | null;
          issue_date?: string;
          due_date?: string;
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          paid_amount?: number;
          status?: 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_case_id_fkey";
            columns: ["case_id"];
            isOneToOne: false;
            referencedRelation: "cases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_accounts: {
        Row: {
          id: string;
          name: string;
          account_type: 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'other';
          account_number: string | null;
          bank_name: string | null;
          opening_balance: number;
          current_balance: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          account_type: 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'other';
          account_number?: string | null;
          bank_name?: string | null;
          opening_balance?: number;
          current_balance?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          account_type?: 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'other';
          account_number?: string | null;
          bank_name?: string | null;
          opening_balance?: number;
          current_balance?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          code: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          active?: boolean;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string | null;
          client_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          payment_account_id: string | null;
          receipt_number: string | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id?: string | null;
          client_id: string;
          amount: number;
          payment_date?: string;
          payment_method?: string;
          payment_account_id?: string | null;
          receipt_number?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string | null;
          client_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: string;
          payment_account_id?: string | null;
          receipt_number?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_payment_account_id_fkey";
            columns: ["payment_account_id"];
            isOneToOne: false;
            referencedRelation: "payment_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      financial_ledger: {
        Row: {
          id: string;
          transaction_number: string | null;
          account_id: string;
          entry_type: 'debit' | 'credit';
          amount: number;
          balance_after: number;
          category: string;
          reference_type: string | null;
          reference_id: string | null;
          description: string;
          client_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_number?: string | null;
          account_id: string;
          entry_type: 'debit' | 'credit';
          amount: number;
          balance_after?: number;
          category: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description: string;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_number?: string | null;
          account_id?: string;
          entry_type?: 'debit' | 'credit';
          amount?: number;
          balance_after?: number;
          category?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string;
          client_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_ledger_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "payment_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_ledger_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_ledger_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          account_id: string | null;
          category: string;
          payee: string;
          amount: number;
          expense_date: string;
          description: string | null;
          receipt_url: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          category: string;
          payee: string;
          amount: number;
          expense_date?: string;
          description?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          category?: string;
          payee?: string;
          amount?: number;
          expense_date?: string;
          description?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "payment_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      stamp_products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          denomination: number;
          purchase_price: number;
          sale_price: number;
          current_stock?: number;
          minimum_stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          denomination?: number;
          purchase_price?: number;
          sale_price?: number;
          current_stock?: number;
          minimum_stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stamp_stock_movements: {
        Row: {
          id: string;
          stamp_product_id: string;
          movement_type: 'opening' | 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'reversal';
          quantity: number;
          unit_price: number | null;
          reference_type: string | null;
          reference_id: string | null;
          client_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stamp_product_id: string;
          movement_type: 'opening' | 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'reversal';
          quantity: number;
          unit_price?: number | null;
          reference_type?: string | null;
          reference_id?: string | null;
          client_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stamp_product_id?: string;
          movement_type?: 'opening' | 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'reversal';
          quantity?: number;
          unit_price?: number | null;
          reference_type?: string | null;
          reference_id?: string | null;
          client_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stamp_stock_movements_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stamp_stock_movements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stamp_stock_movements_stamp_product_id_fkey";
            columns: ["stamp_product_id"];
            isOneToOne: false;
            referencedRelation: "stamp_products";
            referencedColumns: ["id"];
          }
        ];
      };
      receipts: {
        Row: {
          id: string;
          receipt_number: string;
          client_id: string | null;
          client_name: string;
          service_type: string;
          amount_paid: number;
          balance_due: number;
          payment_method: string;
          status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
          notes: string | null;
          issued_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_number: string;
          client_id?: string | null;
          client_name: string;
          service_type?: string;
          amount_paid?: number;
          balance_due?: number;
          payment_method?: string;
          status?: 'paid' | 'partial' | 'unpaid' | 'cancelled';
          notes?: string | null;
          issued_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          receipt_number?: string;
          client_id?: string | null;
          client_name?: string;
          service_type?: string;
          amount_paid?: number;
          balance_due?: number;
          payment_method?: string;
          status?: 'paid' | 'partial' | 'unpaid' | 'cancelled';
          notes?: string | null;
          issued_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipts_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_closings: {
        Row: {
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
          notes: string | null;
          closed_by: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          closing_date?: string;
          opening_cash?: number;
          cash_in?: number;
          cash_out?: number;
          system_cash?: number;
          actual_cash?: number;
          difference?: number;
          bank_wallets_balance?: number;
          stamps_sold_count?: number;
          stamps_sold_value?: number;
          status?: 'open' | 'closed' | 'reopened';
          notes?: string | null;
          closed_by?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          closing_date?: string;
          opening_cash?: number;
          cash_in?: number;
          cash_out?: number;
          system_cash?: number;
          actual_cash?: number;
          difference?: number;
          bank_wallets_balance?: number;
          stamps_sold_count?: number;
          stamps_sold_value?: number;
          status?: 'open' | 'closed' | 'reopened';
          notes?: string | null;
          closed_by?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_closings_closed_by_fkey";
            columns: ["closed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string | null;
          user_role: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_role?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_role?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          link_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          link_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          link_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tax_cases: {
        Row: {
          id: string;
          case_number: string;
          client_id: string;
          tax_year: string;
          return_type: string;
          fee: number;
          assigned_to: string | null;
          due_date: string | null;
          filing_date: string | null;
          cpr_number: string | null;
          status: string;
          documents: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_number: string;
          client_id: string;
          tax_year: string;
          return_type?: string;
          fee?: number;
          assigned_to?: string | null;
          due_date?: string | null;
          filing_date?: string | null;
          cpr_number?: string | null;
          status?: string;
          documents?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_number?: string;
          client_id?: string;
          tax_year?: string;
          return_type?: string;
          fee?: number;
          assigned_to?: string | null;
          due_date?: string | null;
          filing_date?: string | null;
          cpr_number?: string | null;
          status?: string;
          documents?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tax_cases_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tax_cases_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      service_orders: {
        Row: {
          id: string;
          order_number: string;
          client_id: string | null;
          customer_name: string;
          service_name: string;
          category: string;
          pages: number;
          amount: number;
          payment_status: string;
          delivery_date: string | null;
          file_reference: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          client_id?: string | null;
          customer_name: string;
          service_name: string;
          category?: string;
          pages?: number;
          amount?: number;
          payment_status?: string;
          delivery_date?: string | null;
          file_reference?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          client_id?: string | null;
          customer_name?: string;
          service_name?: string;
          category?: string;
          pages?: number;
          amount?: number;
          payment_status?: string;
          delivery_date?: string | null;
          file_reference?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
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
      is_super_admin: {
        Args: {
          p_user_id?: string;
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          p_user_id: string;
          p_roles: string[];
        };
        Returns: boolean;
      };
      can_access_website_admin: {
        Args: {
          p_user_id?: string;
        };
        Returns: boolean;
      };
      can_access_office: {
        Args: {
          p_user_id?: string;
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
      submit_consultation_inquiry: {
        Args: {
          p_name: string;
          p_phone: string;
          p_service_needed: string;
          p_message: string;
          p_rate_key: string;
        };
        Returns: string;
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
      app_user_status: 'active' | 'inactive' | 'suspended';
      app_client_status: 'active' | 'inactive' | 'archived';
      app_client_type: 'individual' | 'sole_proprietor' | 'partnership' | 'company' | 'other';
      app_case_status: 'active' | 'pending' | 'decided' | 'disposed' | 'archived';
      app_hearing_status: 'scheduled' | 'adjourned' | 'completed' | 'cancelled';
      app_task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      app_task_priority: 'low' | 'medium' | 'high' | 'urgent';
      app_invoice_status: 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';
      app_attendance_status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
