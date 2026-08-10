"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, CalendarClock } from "lucide-react";
import { leaveService, type LeaveRequest } from "@/services/leave.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/context/LanguageContext";

function StatusChip({ status }: { status: string }) {
  if (status === "approved") return <span className="badge badge-green">✓ Approved</span>;
  if (status === "rejected") return <span className="badge badge-red">✕ Rejected</span>;
  return <span className="badge badge-yellow">⏳ Pending</span>;
}

export default function LeaveRequestsPage() {
  const [leaves,       setLeaves]       = useState<LeaveRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [processing,   setProcessing]   = useState<string | null>(null);
  const [filter,       setFilter]       = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [rejectId,     setRejectId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { t } = useLang();

  const load = () => {
    leaveService.getAllLeaves().then(setLeaves).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setProcessing(id);
    try {
      await leaveService.decideLeave(id, decision, decision === "rejected" ? rejectReason : undefined);
      toast.success(`Leave ${decision}`);
      setRejectId(null); setRejectReason("");
      load();
    } catch { toast.error("Failed. Please try again."); }
    finally { setProcessing(null); }
  };

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);
  const pending  = leaves.filter(l => l.status === "pending").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">{t("leave_applications")}</h1>
          <p className="page-subtitle">Review and approve worker leave requests</p>
        </div>
        {pending > 0 && (
          <span className="badge badge-yellow text-sm px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" /> {pending} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all","pending","approved","rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors"
                  style={filter === f
                    ? { background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0" }
                    : { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E8EAED" }}>
            {f} {f === "all" ? `(${leaves.length})` : f === "pending" ? `(${pending})` : ""}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[0,1,2].map(i => <div key={i} className="h-12 skeleton rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarClock className="w-10 h-10 mx-auto mb-3" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No {filter === "all" ? "" : filter} leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  {["Worker","Leave Type","Dates","Days","Reason","Applied","Status","Actions"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const days = l.startDate && l.endDate
                    ? Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1
                    : 0;
                  return (
                    <tr key={l.id}>
                      <td>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "#1A1A2E" }}>{l.workerName}</p>
                          <p className="text-xs font-mono" style={{ color: "#9CA3AF" }}>{l.workerId}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-purple text-[11px]">{l.leaveType}</span>
                      </td>
                      <td className="text-xs">
                        {l.startDate && format(new Date(l.startDate), "dd MMM")} → {l.endDate && format(new Date(l.endDate), "dd MMM yyyy")}
                      </td>
                      <td>
                        <span className="text-xs font-semibold" style={{ color: "#374151" }}>{days}d</span>
                      </td>
                      <td>
                        <p className="text-xs max-w-[160px] truncate" style={{ color: "#6B7280" }}>{l.reason}</p>
                      </td>
                      <td className="text-xs" style={{ color: "#9CA3AF" }}>
                        {l.createdAt && format(new Date(l.createdAt), "dd MMM")}
                      </td>
                      <td><StatusChip status={l.status} /></td>
                      <td>
                        {l.status === "pending" && (
                          rejectId === l.id ? (
                            <div className="flex flex-col gap-1.5 min-w-[160px]">
                              <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                     placeholder="Rejection reason…"
                                     className="input-field text-xs py-1.5" />
                              <div className="flex gap-1.5">
                                <button onClick={() => decide(l.id, "rejected")} disabled={!!processing}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                                        style={{ background: "#FEE2E2", color: "#B91C1C" }}>
                                  Confirm
                                </button>
                                <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                                        style={{ background: "#F3F4F6", color: "#6B7280" }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <button onClick={() => decide(l.id, "approved")} disabled={!!processing}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                                      style={{ background: "#DCFCE7", color: "#15803D" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#BBF7D0"; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#DCFCE7"; }}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button onClick={() => setRejectId(l.id)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                      style={{ background: "#FEE2E2", color: "#B91C1C" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FECACA"; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; }}>
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          )
                        )}
                        {l.status !== "pending" && l.decidedBy && (
                          <span className="text-xs" style={{ color: "#9CA3AF" }}>by {l.decidedBy}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
