"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Plus, Upload, Calendar, CalendarDays, Activity } from "lucide-react";
import { leaveService, type LeaveRequest } from "@/services/leave.service";
import api from "@/services/api";
import { toast } from "sonner";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { useLang } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const schema = z.object({
  leaveType: z.string().min(1, "Select leave type"),
  startDate: z.string().min(1, "Select start date"),
  endDate:   z.string().min(1, "Select end date"),
  reason:    z.string().min(10, "Minimum 10 characters required"),
}).refine(d => !d.endDate || !d.startDate || d.endDate >= d.startDate, {
  message: "End date cannot be before start date", path: ["endDate"],
});
type FormData = z.infer<typeof schema>;
const LEAVE_TYPES = ["Sick Leave", "Personal Leave", "Emergency Leave", "Family Event", "Other"];

function StatusChip({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" 
           style={{ background: "rgba(34,197,94,0.1)", color: "#16A34A", border: "1px solid rgba(34,197,94,0.2)" }}>
        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" 
           style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}>
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" 
         style={{ background: "rgba(245,158,11,0.1)", color: "#D97706", border: "1px solid rgba(245,158,11,0.2)" }}>
      <Clock className="w-3.5 h-3.5" /> Pending
    </div>
  );
}

export default function WorkerLeavePage() {
  const [leaves,     setLeaves]     = useState<LeaveRequest[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [docFile,    setDocFile]    = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { leaveType: "", startDate: "", endDate: "", reason: "" },
  });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate   = useWatch({ control, name: "endDate" });
  const numDays   = startDate && endDate && endDate >= startDate
    ? differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1 : 0;

  const loadLeaves = () => {
    leaveService.getMyLeaves().then(setLeaves).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadLeaves, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const leave = await leaveService.submitLeave({ ...data, days: numDays } as any);
      if (docFile && (leave as any).id) {
        const fd = new FormData();
        fd.append("file", docFile);
        fd.append("documentName", `Leave — ${data.leaveType}`);
        fd.append("documentType", "Leave Supporting Document");
        await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => {});
      }
      toast.success("Leave application submitted successfully!");
      reset(); setDocFile(null); setShowForm(false); loadLeaves();
    } catch { toast.error("Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  const totalLeavesAllowed = 21;
  const leavesTaken = leaves.filter(l => l.status === "approved").reduce((acc, l) => {
    const days = l.startDate && l.endDate ? differenceInCalendarDays(parseISO(l.endDate), parseISO(l.startDate)) + 1 : 0;
    return acc + days;
  }, 0);
  const pendingLeavesCount = leaves.filter(l => l.status === "pending").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#111827" }}>Leave Management</h1>
          <p className="text-sm font-medium mt-1" style={{ color: "#6B7280" }}>Manage your time off, track requests, and check balances.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(v => !v)} 
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
          style={{ background: showForm ? "#F1F5F9" : "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: showForm ? "#475569" : "#FFFFFF" }}
        >
          <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? "rotate-45" : ""}`} />
          {showForm ? "Cancel Application" : "Apply for Leave"}
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-white" /></div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Available Balance</p>
          <p className="text-4xl font-black text-white">{totalLeavesAllowed - leavesTaken} <span className="text-base font-medium text-slate-400">days</span></p>
        </div>
        <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Leaves Taken</p>
          <p className="text-4xl font-black text-slate-800">{leavesTaken} <span className="text-base font-medium text-slate-400">days</span></p>
        </div>
        <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-1">Pending Approval</p>
          <p className="text-4xl font-black text-amber-600">{pendingLeavesCount} <span className="text-base font-medium text-amber-400/80">requests</span></p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 mt-2" style={{ border: "1px solid #E2E8F0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">New Leave Application</h2>
                  <p className="text-xs font-medium text-slate-500">Fill out the details below to submit your request.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-600">Leave Type</label>
                  <select {...register("leaveType")} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                    <option value="">Select a reason category</option>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.leaveType && <p className="text-xs font-semibold mt-1.5 text-red-500">{errors.leaveType.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-600">Start Date</label>
                    <input {...register("startDate")} type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    {errors.startDate && <p className="text-xs font-semibold mt-1.5 text-red-500">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-600">End Date</label>
                    <input {...register("endDate")} type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    {errors.endDate && <p className="text-xs font-semibold mt-1.5 text-red-500">{errors.endDate.message}</p>}
                  </div>
                </div>

                <AnimatePresence>
                  {numDays > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                         className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm font-bold text-emerald-700">
                        Applying for {numDays} day{numDays !== 1 ? "s" : ""} of leave
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-600">Detailed Reason</label>
                  <textarea {...register("reason")} rows={4} placeholder="Please provide specific details for your request..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none" />
                  {errors.reason && <p className="text-xs font-semibold mt-1.5 text-red-500">{errors.reason.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide text-slate-600">
                    Supporting Document <span className="text-slate-400 font-medium normal-case">(Optional, e.g. medical certificate)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button type="button" onClick={() => fileRef.current?.click()}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                      <Upload className="w-4 h-4" /> {docFile ? "Change File" : "Upload File"}
                    </button>
                    <span className="text-sm font-medium" style={{ color: docFile ? "#059669" : "#94A3B8" }}>
                      {docFile ? docFile.name : "No file selected"}
                    </span>
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                           onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button type="submit" disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#FFFFFF" }}>
                    {submitting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing Request…</> : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Applications</h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">{leaves.length} Total</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">{[0,1,2].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />)}</div>
        ) : leaves.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4"><ClipboardCheck className="w-8 h-8 text-slate-300" /></div>
            <p className="font-bold text-slate-500">No leave history found</p>
            <p className="text-sm font-medium text-slate-400 mt-1">Your past leave requests will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.map((l) => {
              const days = l.startDate && l.endDate ? differenceInCalendarDays(parseISO(l.endDate), parseISO(l.startDate)) + 1 : 0;
              return (
                <div key={l.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-800 text-white">{l.leaveType}</span>
                      <StatusChip status={l.status} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      {l.startDate && format(new Date(l.startDate), "MMMM d, yyyy")} — {l.endDate && format(new Date(l.endDate), "MMMM d, yyyy")}
                      <span className="ml-2 text-xs font-semibold text-slate-500">({days} day{days !== 1 ? "s" : ""})</span>
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-2 leading-relaxed">{l.reason}</p>
                    {l.status === "rejected" && l.rejectReason && (
                      <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 mt-3 inline-block">
                        Reason: {l.rejectReason}
                      </div>
                    )}
                  </div>
                  <div className="md:text-right flex flex-col gap-1 shrink-0 mt-4 md:mt-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applied On</p>
                    <p className="text-sm font-semibold text-slate-700">{l.createdAt ? format(new Date(l.createdAt), "MMM d, yyyy") : "N/A"}</p>
                    {l.decidedBy && (
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-3">Reviewed By</p>
                    )}
                    {l.decidedBy && (
                      <p className="text-sm font-semibold text-slate-700">{l.decidedBy}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
