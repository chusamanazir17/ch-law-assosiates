import { createClient } from "@/lib/supabase/client";
import type {
  TaxCategory,
  SubscriptionFormData,
  SubscriptionApiResponse,
} from "@/types/reminders";

/** Fetch active tax categories for the subscription selector. */
export async function getActiveTaxCategories(): Promise<TaxCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tax_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[Reminder Categories] Load failed:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn("[Reminder Categories] Service unavailable:", error);
    return [];
  }
}

/** Submit through the Next.js proxy so validation and abuse controls stay server-side. */
export async function submitSubscription(
  formData: SubscriptionFormData
): Promise<SubscriptionApiResponse> {
  try {
    const response = await fetch("/api/reminders/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = (await response.json()) as SubscriptionApiResponse;
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to submit subscription. Please try again.",
      };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error. Please try again.",
    };
  }
}

export async function confirmSubscriptionToken(token: string): Promise<SubscriptionApiResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("confirm-subscription", {
      body: { token },
    });

    if (error) return { success: false, error: error.message || "Confirmation failed." };
    return data as SubscriptionApiResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error during confirmation.",
    };
  }
}

export async function processUnsubscribe(token: string): Promise<SubscriptionApiResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("unsubscribe", {
      body: { token },
    });

    if (error) return { success: false, error: error.message || "Unsubscribe request failed." };
    return data as SubscriptionApiResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error during unsubscribe.",
    };
  }
}
