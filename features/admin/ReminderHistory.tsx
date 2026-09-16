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
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Sent
          </span>
        );
      case "processing":
        return (
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            Processing
          </span>
        );
      case "queued":
        return (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Queued
          </span>
        );
      case "failed":
        return (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
            Failed
          </span>
        );
      case "skipped":
        return (
          <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Skipped
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight sm:text-3xl">
            Reminder Delivery Logs
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Inspect automated email dispatches, retry transient failures, and test email layouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeliveries}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="btn-gold px-4 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <Mail className="h-4 w-4" /> Send Test Email
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          {actionNotice}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Filter className="h-3.5 w-3.5 text-gold-400" />
          <span>Status Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter deliveries by Status"
          className="rounded-lg border border-white/15 bg-navy-950 py-1.5 px-3 text-xs text-white focus:border-gold-400 focus:outline-none"
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
      <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-900/60 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-white/60">
              <tr>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Deadline & Period</th>
                <th className="py-3.5 px-4">Interval</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Attempts / Error Details</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/50">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-gold-400 mb-2" />
                    Loading delivery logs...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/50">
                    No reminder delivery records found for this filter.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {del.subscriber?.name || "Client"}
                      </div>
                      <div className="text-[11px] font-mono text-white/60 mt-0.5">
                        {del.subscriber?.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {del.deadline?.title || "Tax Filing"}
                      </div>
                      <div className="text-[11px] text-white/50 mt-0.5">
                        {del.deadline?.category?.name} • Due: {del.deadline?.filing_deadline} (rev #{del.deadline_revision})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-white/80 font-medium">
                      {del.reminder_interval === "30_days" ? "30 Days Before" : "7 Days Before"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-white/80">
                      {del.scheduled_date}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(del.status)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] text-white/70">
                        Attempts: {del.attempt_count}
                        {del.sent_at && (
                          <span className="block text-emerald-400/80">
                            Sent at {new Date(del.sent_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {del.error_details && (
                        <p className="text-[10px] text-red-400 mt-1 line-clamp-2" title={del.error_details}>
                          {del.error_details}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {del.status === "failed" ? (
                        <button
                          onClick={() => handleRetryDelivery(del.id)}
                          disabled={retryingId === del.id}
                          className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                          title="Retry delivery in next scheduled run"
                        >
                          <RotateCcw className={`h-3 w-3 ${retryingId === del.id ? "animate-spin" : ""}`} />
                          Retry
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-xs text-white/60">
          <div>
            Showing <strong className="text-white">{deliveries.length}</strong> of{" "}
            <strong className="text-white">{totalCount}</strong> logs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-1 rounded border border-white/15 px-2.5 py-1 text-white hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-1 rounded border border-white/15 px-2.5 py-1 text-white hover:bg-white/10 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-navy-950 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400" /> Dispatch Test Reminder
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Test emails are strictly dispatched to your authenticated administrator email address to preview template styling and deliverability.
            </p>

            {testResult && (
              <div
                className={`rounded-lg border p-3 text-xs flex items-center gap-2 ${
                  testResult.success
                    ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                    : "border-red-500/40 bg-red-950/40 text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                {testResult.message}
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Select Verified Deadline
                </label>
                {verifiedDeadlines.length === 0 ? (
                  <p className="text-xs text-amber-300">
                    No verified deadlines found. Please verify at least one deadline in the Deadlines tab first.
                  </p>
                ) : (
                  <select
                    value={selectedDeadlineId}
                    onChange={(e) => setSelectedDeadlineId(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-navy-900 py-2 px-3 text-xs text-white focus:border-gold-400 focus:outline-none"
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
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Reminder Interval
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("30_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold ${
                      selectedInterval === "30_days"
                        ? "border-gold-400 bg-gold-400/20 text-gold-400"
                        : "border-white/15 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    30 Days Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterval("7_days")}
                    className={`rounded-lg border p-2 text-xs font-semibold ${
                      selectedInterval === "7_days"
                        ? "border-gold-400 bg-gold-400/20 text-gold-400"
                        : "border-white/15 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    7 Days Before
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest || verifiedDeadlines.length === 0}
                  className="btn-gold px-4 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
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
