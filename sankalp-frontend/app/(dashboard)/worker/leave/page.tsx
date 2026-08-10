"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Plus, Upload, Calendar } from "lucide-react";
import { leaveService, type LeaveRequest } from "@/services/leave.service";
import api from "@/services/api";
import { toast } from "sonner";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { useLang } from "@/context/LanguageContext";

const schema = z.object({
  leaveType: z.string().min(1, "Select leave type"),
  startDate: z.string().min(1, "Select start date"),
  endDate:   z.string().min(1, "Select end date"),
  reason:    z.string().min(10, "Minimum 10 characters"),
}).refine(d => !d.endDate || !d.startDate || d.endDate >= d.startDate, {
  message: "End date cannot be before start date", path: ["endDate"],
});
type FormData = z.infer<typeof schema>;
const LEAVE_TYPES = ["Sick Leave", "Personal Leave", "Emergency Leave", "Family Event", "Other"];

function StatusChip({ status }: { status: string }) {
  if (status === "approved") return <span className="badge badge-green">✓ Approved</span>;
  if (status === "rejected") return <span className="badge badge-red">✕ Rejected</span>;
  return <span className="badge badge-yellow">⏳ Pending</span>;
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

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t("apply_leave")}</h1>
          <p className="page-subtitle">Submit and track your leave requests</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          {showForm ? "Cancel" : "Apply Leave"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "#1A1A2E" }}>New Leave Application</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Leave Type</label>
              <select {...register("leaveType")} className="input-field text-sm">
                <option value="">Select leave type</option>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.leaveType && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.leaveType.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Start Date</label>
                <input {...register("startDate")} type="date" className="input-field text-sm" style={{ colorScheme: "light" }} />
                {errors.startDate && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>End Date</label>
                <input {...register("endDate")} type="date" className="input-field text-sm" style={{ colorScheme: "light" }} />
                {errors.endDate && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.endDate.message}</p>}
              </div>
            </div>

            {numDays > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                   style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <Calendar className="w-4 h-4" style={{ color: "#16A34A" }} />
                <p className="text-sm font-semibold" style={{ color: "#16A34A" }}>
                  {numDays} day{numDays !== 1 ? "s" : ""} of leave
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Reason</label>
              <textarea {...register("reason")} rows={3} placeholder="Describe reason for leave…"
                        className="input-field text-sm" style={{ resize: "none" }} />
              {errors.reason && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.reason.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                Supporting Document <span style={{ color: "#9CA3AF", textTransform: "none" }}>(Optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                        className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
                  <Upload className="w-3.5 h-3.5" /> Choose File
                </button>
                <span className="text-xs" style={{ color: docFile ? "#16A34A" : "#9CA3AF" }}>
                  {docFile ? docFile.name : "PDF, JPG, PNG accepted"}
                </span>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                       onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            <button type="submit" disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
              {submitting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</> : "Submit Leave Application"}
            </button>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl overflow-hidden"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-3.5"
             style={{ borderBottom: "1px solid #F3F4F6" }}>
          <h2 className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>My Leave Requests</h2>
          <span className="badge badge-gray">{leaves.length} total</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[0,1,2].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : leaves.length === 0 ? (
          <div className="py-14 text-center">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No leave requests yet</p>
          </div>
        ) : (
          <div>
            {leaves.map((l, i) => {
              const days = l.startDate && l.endDate
                ? differenceInCalendarDays(parseISO(l.endDate), parseISO(l.startDate)) + 1 : 0;
              return (
                <div key={l.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3"
                     style={{ borderBottom: i < leaves.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge badge-purple text-[11px]">{l.leaveType}</span>
                      <StatusChip status={l.status} />
                      {days > 0 && <span className="text-[11px] font-semibold" style={{ color: "#6B7280" }}>{days}d</span>}
                    </div>
                    <p className="text-xs" style={{ color: "#6B7280" }}>
                      {l.startDate && format(new Date(l.startDate), "dd MMM yyyy")} → {l.endDate && format(new Date(l.endDate), "dd MMM yyyy")}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#9CA3AF" }}>{l.reason}</p>
                    {l.status === "rejected" && l.rejectReason && (
                      <p className="text-xs mt-1 font-medium" style={{ color: "#DC2626" }}>Rejected: {l.rejectReason}</p>
                    )}
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>
                    {l.createdAt && format(new Date(l.createdAt), "dd MMM")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
