"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, CalendarClock, CalendarDays, User, Mail, ShieldAlert } from "lucide-react";
import { leaveService, type LeaveRequest } from "@/services/leave.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

function StatusChip({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" 
           style={{ background: "rgba(34,197,94,0.1)", color: "#16A34A", border: "1px solid rgba(34,197,94,0.2)" }}>
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" 
           style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}>
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider" 
         style={{ background: "rgba(245,158,11,0.1)", color: "#D97706", border: "1px solid rgba(245,158,11,0.2)" }}>
      <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
    </div>
  );
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
  
  // Dashboard Metrics
  const approved = leaves.filter(l => l.status === "approved").length;
  const rejected = leaves.filter(l => l.status === "rejected").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#111827" }}>Leave Approvals</h1>
          <p className="text-sm font-medium mt-1" style={{ color: "#6B7280" }}>Review, approve, and manage worker time-off requests.</p>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="w-16 h-16 text-white" /></div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Requests</p>
          <p className="text-4xl font-black text-white">{leaves.length}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-1">Pending Review</p>
          <p className="text-4xl font-black text-amber-600">{pending}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-1">Approved</p>
          <p className="text-4xl font-black text-emerald-600">{approved}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Rejected</p>
          <p className="text-4xl font-black text-red-600">{rejected}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 p-1.5 bg-slate-100 rounded-xl inline-flex w-full overflow-x-auto no-scrollbar">
        {(["all","pending","approved","rejected"] as const).map(f => {
          const isActive = filter === f;
          let count = f === "all" ? leaves.length : f === "pending" ? pending : f === "approved" ? approved : rejected;
          return (
            <button key={f} onClick={() => setFilter(f)}
                    className="relative px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-colors whitespace-nowrap z-10"
                    style={{ color: isActive ? "#0F172A" : "#64748B" }}>
              {isActive && (
                <motion.div layoutId="filterTab" className="absolute inset-0 bg-white rounded-lg shadow-sm" style={{ zIndex: -1 }} />
              )}
              {f} <span className="ml-1 opacity-60">({count})</span>
            </button>
          )
        })}
      </motion.div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [0,1,2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
            <CalendarClock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-bold text-slate-500 text-lg">No {filter === "all" ? "" : filter} requests found</p>
            <p className="text-sm font-medium text-slate-400 mt-1">Check back later for new leave applications.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filtered.map(l => {
              const days = l.startDate && l.endDate
                ? Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1
                : 0;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  key={l.id} 
                  className="bg-white rounded-2xl p-6 transition-shadow shadow-sm hover:shadow-md"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Worker Info */}
                    <div className="lg:w-1/4 flex gap-4 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">{l.workerName}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{l.workerId}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied {l.createdAt && format(new Date(l.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Leave Details */}
                    <div className="flex-1 lg:border-l lg:border-slate-100 lg:pl-6">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-800 text-white shadow-sm">{l.leaveType}</span>
                        <StatusChip status={l.status} />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                        <p className="font-bold text-slate-700 text-sm">
                          {l.startDate && format(new Date(l.startDate), "MMMM d, yyyy")} — {l.endDate && format(new Date(l.endDate), "MMMM d, yyyy")}
                          <span className="ml-2 text-xs font-bold text-slate-400">({days} day{days !== 1 ? "s" : ""})</span>
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{l.reason}"
                      </p>
                      {l.status === "rejected" && l.rejectReason && (
                        <div className="mt-3 text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                          Rejection Reason: {l.rejectReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:w-1/4 shrink-0 flex flex-col justify-center">
                      {l.status === "pending" ? (
                        rejectId === l.id ? (
                          <div className="flex flex-col gap-2">
                            <input autoFocus value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                   placeholder="Reason for rejection..."
                                   className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none" />
                            <div className="flex gap-2">
                              <button onClick={() => decide(l.id, "rejected")} disabled={!!processing || rejectReason.trim() === ""}
                                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-md disabled:opacity-50 hover:bg-red-700 transition-colors">
                                Confirm Reject
                              </button>
                              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button onClick={() => decide(l.id, "approved")} disabled={!!processing}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    style={{ background: "#10B981", color: "#FFFFFF" }}>
                              <CheckCircle2 className="w-4 h-4" /> Approve Leave
                            </button>
                            <button onClick={() => setRejectId(l.id)} disabled={!!processing}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex justify-center items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50">
                              <XCircle className="w-4 h-4" /> Reject Leave
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="text-center lg:text-right">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reviewed By</p>
                          <p className="font-bold text-slate-700">{l.decidedBy}</p>
                          {l.decidedAt && (
                            <p className="text-xs font-semibold text-slate-400 mt-1">{format(new Date(l.decidedAt), "MMM d, yyyy h:mm a")}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
