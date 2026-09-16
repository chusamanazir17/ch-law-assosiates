import type { Database } from "./database.types";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];
export type SiteAnnouncement = Database["public"]["Tables"]["site_announcements"]["Row"];
export type ConsultationInquiry = Database["public"]["Tables"]["consultation_inquiries"]["Row"];

export interface SubscriberAnalytics {
  totalEmails: number;
  activeCount: number;
  pendingCount: number;
  unsubscribedCount: number;
  suppressedCount: number;
  categoryBreakdown: {
    categoryName: string;
    count: number;
    percentage: number;
  }[];
  recentSignups: {
    id: string;
    name: string;
    email: string;
    status: string;
    created_at: string;
    categories: string[];
  }[];
}

export interface CMSDashboardStats {
  subscribers: SubscriberAnalytics;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalMedia: number;
  newInquiries: number;
  activeNotice: SiteAnnouncement | null;
}
