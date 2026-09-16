import type { Database } from "./database.types";

export type TaxCategory = Database["public"]["Tables"]["tax_categories"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type TaxDeadline = Database["public"]["Tables"]["tax_deadlines"]["Row"];
export type ReminderDelivery = Database["public"]["Tables"]["reminder_deliveries"]["Row"];

export interface SubscriptionFormData {
  name: string;
  email: string;
  category_ids: string[];
  consent: boolean;
  hp_company?: string; // honeypot
}

export interface SubscriptionApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SubscriberWithCategories extends Subscriber {
  categories: TaxCategory[];
}

export interface DeadlineWithCategory extends TaxDeadline {
  category?: TaxCategory;
}

export interface DeliveryWithDetails extends ReminderDelivery {
  subscriber?: {
    name: string;
    email: string;
    status: string;
  };
  deadline?: {
    title: string;
    tax_year_or_period: string;
    filing_deadline: string;
    category?: {
      name: string;
    };
  };
}

export interface AdminOverviewStats {
  activeSubscribers: number;
  pendingSubscribers: number;
  upcomingVerifiedDeadlines: number;
  recentlySentReminders: number;
  failedDeliveries: number;
}
