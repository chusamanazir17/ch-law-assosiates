import { createClient } from "@/lib/supabase/client";
import type { TaxCategory, SubscriptionFormData, SubscriptionApiResponse } from "@/types/reminders";

/**
 * Fetch list of active tax categories for subscription selection
 */
export async function getActiveTaxCategories(): Promise<TaxCategory[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("tax_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[Categories] Unable to load categories from database:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("[Categories] Database unreachable:", err);
    return [];
  }
}

/**
 * Submit tax reminder subscription request (calls Next.js API /api/reminders/subscribe)
 */
export async function submitSubscription(formData: SubscriptionFormData): Promise<SubscriptionApiResponse> {
  try {
    const res = await fetch("/api/reminders/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to submit subscription. Please check your email and try again.",
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error. Please try again.",
    };
  }
}

/**
 * Confirm subscription with double opt-in token
 */
export async function confirmSubscriptionToken(token: string): Promise<SubscriptionApiResponse> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.functions.invoke("confirm-subscription", {
      body: { token },
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Confirmation failed.",
      };
    }

    return data as SubscriptionApiResponse;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error during confirmation.",
    };
  }
}

/**
 * Unsubscribe using subscription token
 */
export async function processUnsubscribe(token: string): Promise<SubscriptionApiResponse> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.functions.invoke("unsubscribe", {
      body: { token },
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Unsubscribe request failed.",
      };
    }

    return data as SubscriptionApiResponse;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error during unsubscribe.",
    };
  }
}
