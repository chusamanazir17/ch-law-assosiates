"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Send,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  Loader2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryWithDetails, ReminderDelivery } from "@/types/reminders";

const PAGE_SIZE = 15;
type DeliveryStatus = ReminderDelivery["status"];
type VerifiedDeadlineOption = { id: string; title: string; tax_year_or_period: string; filing_deadline: string };

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ReminderHistory() {
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Test Email state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [verifiedDeadlines, setVerifiedDeadlines] = useState<VerifiedDeadlineOption[]>([]);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState("");
  const [selectedInterval, setSelectedInterval] = useState<"30_days" | "7_days">("7_days");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Retry state
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      let query = supabase
        .from("reminder_deliveries")
        .select(
          `
          id,
          subscriber_id,
          deadline_id,
          deadline_revision,
          reminder_interval,
          scheduled_date,
          status,
          provider_message_id,
          idempotency_key,
          attempt_count,
          last_attempt_at,
          sent_at,
          error_details,
          created_at,
          updated_at,
          subscribers ( name, email, status ),
          tax_deadlines (
            title,
            tax_year_or_period,
            filing_deadline,
            tax_categories ( name )
          )
        `,
          { count: "exact" }
        );

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped: DeliveryWithDetails[] = (data || []).map((delivery: any) => ({
        ...delivery,
        subscriber: delivery.subscribers ?? undefined,
        deadline: delivery.tax_deadlines
          ? {
              ...delivery.tax_deadlines,
              category: delivery.tax_deadlines.tax_categories ?? undefined,
            }
          : undefined,
      }));

      setDeliveries(mapped);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("[Delivery History Error]", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Load verified deadlines for test email modal
  useEffect(() => {
    async function loadVerifiedDeadlines() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tax_deadlines")
        .select("id, title, tax_year_or_period, filing_deadline, is_active, tax_categories(name)")
        .eq("is_active", true)
        .not("verified_at", "is", null);
      if (error) {
        console.error("[Verified Deadlines Load Error]", error);
        setActionNotice({ type: "error", message: "Verified deadlines could not be loaded for test email selection." });
        return;
      }
      setVerifiedDeadlines(data || []);
      setSelectedDeadlineId(data?.[0]?.id || "");
    }
    loadVerifiedDeadlines();
  }, []);

  // Safe Retry Failed Delivery
  const handleRetryDelivery = async (deliveryId: string) => {
    setRetryingId(deliveryId);
    setActionNotice(null);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("reminder_deliveries")
        .update({
          status: "queued",
          attempt_count: 0,
          error_details: "Queued for retry by administrator.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliveryId);

      if (error) throw error;

      setActionNotice({ type: "success", message: "Delivery successfully reset to queued status for the next scheduled batch." });
      fetchDeliveries();
    } catch (error) {
      setActionNotice({ type: "error", message: getErrorMessage(error, "Failed to retry delivery.") });
    } finally {
      setRetryingId(null);
    }
  };

  // Send Test Email via send-test-reminder Edge function
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeadlineId) return;

    setIsSendingTest(true);
    setTestResult(null);

    const supabase = createClient();
    try {
      const { data, error } = await supabase.functions.invoke("send-test-reminder", {
        body: {
          deadline_id: selectedDeadlineId,
          reminder_interval: selectedInterval,
        },
      });

      if (error) {
        setTestResult({
          success: false,
          message: error.message || "Failed to trigger test email.",
        });
      } else if (data?.success) {
        setTestResult({
          success: true,
          message: data.message || "Test email sent to your administrator address.",
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || "Unable to dispatch test email.",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: getErrorMessage(error, "Network error while sending test email."),
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="rounded-full border border-[#C8973D]/40 bg-[#FDF8EE] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#96641E]">
            Sent
          </span>
        );
      case "processing":
        return (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-sky-700">
            Processing
          </span>
        );
      case "queued":
        return (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-800">
            Queued
          </span>
        );
      case "failed":
        return (
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-rose-700">
            Failed
          </span>
        );
      case "skipped":
        return (
          <span className="rounded-full border border-[#E2E8F0] bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#64748B]">
            Skipped
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full border border-[#E2E8F0] bg-zinc-100 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#64748B]">
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#52627A] mb-1">
            <span>Reminders</span>
            <span className="text-[#94A3B8]">/</span>
            <span className="text-[#0B1F36] font-semibold">Delivery Logs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1F36]">
            Reminder Delivery Logs
          </h1>
          <p className="mt-0.5 text-xs text-[#52627A] leading-relaxed">
            Inspect automated email dispatches, retry transient failures, and test email layouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeliveries}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] shadow-xs hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#C8973D] ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition"
          >
            <Mail className="h-3.5 w-3.5 text-[#C8973D]" /> Send Test Email
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div
          role="status"
          className={`rounded-xl border p-3 text-xs flex items-center gap-2 shadow-xs ${
            actionNotice.type === "success"
              ? "border-[#C8973D]/40 bg-[#FDF8EE] text-[#96641E]"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {actionNotice.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-[#C8973D] shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {actionNotice.message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#0B1F36] font-semibold">
          <Filter className="h-3.5 w-3.5 text-[#C8973D]" />
          <span>Status Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "all" | DeliveryStatus);
            setCurrentPage(1);
          }}
          aria-label="Filter deliveries by Status"
          className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 px-3 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
        >
          <option value="all">All Deliveries</option>
          <option value="sent">Sent</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="skipped">Skipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Delivery Log Table */}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#334155]">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              <tr>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 font-semibold">Deadline & Period</th>
                <th className="py-3 px-4 font-semibold">Interval</th>
                <th className="py-3 px-4 font-semibold">Scheduled Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Attempts / Error Details</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52627A]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#C8973D] mb-2" />
                    Loading delivery logs...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#52627A]">
                    No reminder delivery records found for this filter.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-[#0B1F36]">
                        {del.subscriber?.name || "Client"}
                      </div>
                      <div className="text-[11px] font-mono text-[#52627A] mt-0.5">
                        {del.subscriber?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-xs text-[#0B1F36]">
                        {del.deadline?.title || "Tax Filing"}
                      </div>
                      <div className="text-[11px] text-[#52627A] mt-0.5">
                        {del.deadline?.category?.name} • Due: {del.deadline?.filing_deadline} (rev #{del.deadline_revision})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#334155] font-medium text-xs">
                      {del.reminder_interval === "30_days" ? "30 Days Before" : "7 Days Before"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#52627A]">
                      {del.scheduled_date}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(del.status)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] text-[#52627A]">
                        Attempts: {del.attempt_count}
                        {del.sent_at && (
                          <span className="block text-[#96641E] font-medium">
                            Sent at {new Date(del.sent_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {del.error_details && (
                        <p className="text-[11px] text-rose-600 mt-1 line-clamp-2" title={del.error_details}>
                          {del.error_details}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {del.status === "failed" ? (
                        <button
                          onClick={() => handleRetryDelivery(del.id)}
                          disabled={retryingId === del.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 shadow-xs transition"
                          title="Retry delivery in next scheduled run"
                        >
                          <RotateCcw className={`h-3 w-3 ${retryingId === del.id ? "animate-spin" : ""}`} />
                          Retry
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3 text-xs text-[#52627A] bg-[#F8FAFC]">
          <div>
            Showing <strong className="text-[#0B1F36]">{deliveries.length}</strong> of{" "}
            <strong className="text-[#0B1F36]">{totalCount}</strong> logs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] disabled:opacity-40 shadow-xs transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2 font-medium text-[#52627A]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] disabled:opacity-40 shadow-xs transition"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 text-[#0B1F36] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0B1F36] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#C8973D]" /> Dispatch Test Reminder
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0B1F36] p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#52627A] leading-relaxed">
              Test emails are strictly dispatched to your authenticated administrator email address to preview template styling and deliverability.
            </p>

            {testResult && (
              <div
                className={`rounded-xl border p-3 text-xs flex items-center gap-2 shadow-xs ${
                  testResult.success
                    ? "border-[#C8973D]/40 bg-[#FDF8EE] text-[#96641E]"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-[#C8973D] shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                {testResult.message}
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Select Verified Deadline
                </label>
                {verifiedDeadlines.length === 0 ? (
                  <p className="text-xs text-amber-700 font-medium">
                    No verified deadlines found. Please verify at least one deadline in the Deadlines tab first.
                  </p>
                ) : (
                  <select
                    value={selectedDeadlineId}
                    onChange={(e) => setSelectedDeadlineId(e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 px-3 text-xs text-[#0B1F36] focus:border-[#C8973D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8973D]/20 shadow-xs transition"
                    required
                  >
                    {verifiedDeadlines.map((dl) => (
                      <option key={dl.id} value={dl.id}>
                        {dl.title} ({dl.filing_deadline})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F36] mb-1">
                  Reminder Interval
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("30_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold transition ${
                      selectedInterval === "30_days"
                        ? "border-[#C8973D] bg-[#FDF8EE] text-[#96641E]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#52627A] hover:bg-slate-100"
                    }`}
                  >
                    30 Days Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("7_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold transition ${
                      selectedInterval === "7_days"
                        ? "border-[#C8973D] bg-[#FDF8EE] text-[#96641E]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#52627A] hover:bg-slate-100"
                    }`}
                  >
                    7 Days Before
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#52627A] hover:bg-[#F8FAFC] hover:text-[#0B1F36] transition shadow-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest || verifiedDeadlines.length === 0}
                  className="rounded-lg bg-[#0B1F36] hover:bg-[#102943] px-3.5 py-2 text-xs font-semibold text-white shadow-xs inline-flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8973D]" /> Dispatching...
                    </>
                  ) : (
                    "Send Test Email"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
