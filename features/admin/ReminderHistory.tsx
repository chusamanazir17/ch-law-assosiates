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
import type { DeliveryWithDetails, DeadlineWithCategory } from "@/types/reminders";

const PAGE_SIZE = 15;

export default function ReminderHistory() {
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Test Email state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [verifiedDeadlines, setVerifiedDeadlines] = useState<DeadlineWithCategory[]>([]);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState("");
  const [selectedInterval, setSelectedInterval] = useState<"30_days" | "7_days">("7_days");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Retry state
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
        query = query.eq("status", statusFilter as any);
      }

      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped: DeliveryWithDetails[] = (data || []).map((d: any) => ({
        ...d,
        subscriber: d.subscribers,
        deadline: {
          ...d.tax_deadlines,
          category: d.tax_deadlines?.tax_categories,
        },
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
      const { data } = await supabase
        .from("tax_deadlines")
        .select("id, title, tax_year_or_period, filing_deadline, is_active, tax_categories(name)")
        .eq("is_active", true)
        .not("verified_at", "is", null);
      if (data && data.length > 0) {
        setVerifiedDeadlines(data as any);
        setSelectedDeadlineId(data[0].id);
      }
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

      setActionNotice("Delivery successfully reset to queued status for the next scheduled batch.");
      fetchDeliveries();
    } catch (err: any) {
      alert("Failed to retry delivery: " + err.message);
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
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while sending test email.",
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
          <span className="rounded-full border border-emerald-200 bg-[#eef7f2] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#075e38]">
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
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">
            Skipped
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-600">
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
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Reminders</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Delivery Logs</span>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">
            Reminder Delivery Logs
          </h1>
          <p className="text-[14.5px] text-slate-500 mt-1">
            Inspect automated email dispatches, retry transient failures, and test email layouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeliveries}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-[13.5px] font-medium text-white shadow-2xs transition"
          >
            <Mail className="h-4 w-4" /> Send Test Email
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="rounded-lg border border-emerald-200 bg-[#eef7f2] p-3 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          {actionNotice}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Filter className="h-3.5 w-3.5 text-[#075e38]" />
          <span>Status Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter deliveries by Status"
          className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11.5px] font-semibold text-slate-600">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Recipient</th>
                <th className="py-3.5 px-4 font-semibold">Deadline & Period</th>
                <th className="py-3.5 px-4 font-semibold">Interval</th>
                <th className="py-3.5 px-4 font-semibold">Scheduled Date</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Attempts / Error Details</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#075e38] mb-2" />
                    Loading delivery logs...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No reminder delivery records found for this filter.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {del.subscriber?.name || "Client"}
                      </div>
                      <div className="text-[11.5px] font-mono text-slate-500 mt-0.5">
                        {del.subscriber?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {del.deadline?.title || "Tax Filing"}
                      </div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5">
                        {del.deadline?.category?.name} • Due: {del.deadline?.filing_deadline} (rev #{del.deadline_revision})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {del.reminder_interval === "30_days" ? "30 Days Before" : "7 Days Before"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11.5px] text-slate-700">
                      {del.scheduled_date}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(del.status)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11.5px] text-slate-600">
                        Attempts: {del.attempt_count}
                        {del.sent_at && (
                          <span className="block text-emerald-700 font-medium">
                            Sent at {new Date(del.sent_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {del.error_details && (
                        <p className="text-[10.5px] text-rose-600 mt-1 line-clamp-2" title={del.error_details}>
                          {del.error_details}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {del.status === "failed" ? (
                        <button
                          onClick={() => handleRetryDelivery(del.id)}
                          disabled={retryingId === del.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11.5px] font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 shadow-2xs transition"
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
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 bg-slate-50">
          <div>
            Showing <strong className="text-slate-900">{deliveries.length}</strong> of{" "}
            <strong className="text-slate-900">{totalCount}</strong> logs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 shadow-2xs font-medium"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2 font-medium text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 shadow-2xs font-medium"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#075e38]" /> Dispatch Test Reminder
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Test emails are strictly dispatched to your authenticated administrator email address to preview template styling and deliverability.
            </p>

            {testResult && (
              <div
                className={`rounded-lg border p-3 text-xs flex items-center gap-2 shadow-2xs ${
                  testResult.success
                    ? "border-emerald-200 bg-[#eef7f2] text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                {testResult.message}
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#075e38] focus:outline-none focus:ring-1 focus:ring-[#075e38] shadow-2xs"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reminder Interval
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("30_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold transition ${
                      selectedInterval === "30_days"
                        ? "border-emerald-300 bg-[#eef7f2] text-[#075e38]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    30 Days Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("7_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold transition ${
                      selectedInterval === "7_days"
                        ? "border-emerald-300 bg-[#eef7f2] text-[#075e38]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    7 Days Before
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest || verifiedDeadlines.length === 0}
                  className="rounded-lg bg-[#075e38] hover:bg-[#064e2e] px-4 py-2 text-xs font-medium text-white shadow-2xs inline-flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching...
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
