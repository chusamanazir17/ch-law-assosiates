// ==============================================================================
// src/services/notifications.service.ts
// Project: CH Office Management System
// Real-time Chamber Alerts: Stock, Deadlines, Daily Differences, Receivables
// ==============================================================================

import { supabase } from "../lib/supabase/client";

export const notificationsService = {
  // 1. Fetch user or broadcast notifications
  async getNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  },

  // 2. Mark notification as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw error;
  },
};
