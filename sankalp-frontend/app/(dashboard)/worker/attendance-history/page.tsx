"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceService } from "@/services/attendance.service";
import { formatDate, formatTime } from "@/utils/formatters";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance.types";
import { History, Filter, TrendingUp, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useLang } from "@/context/LanguageContext";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    present:        { bg: "#DCFCE7", color: "#15803D", label: "Present" },
    late:           { bg: "#FEF3C7", color: "#92400E", label: "Late" },
    absent:         { bg: "#FEE2E2", color: "#B91C1C", label: "Absent" },
    pending_review: { bg: "#EDE9FE", color: "#6D28D9", label: "Review" },
  };
  const c = map[status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: c.bg, color: c.color }}>{c.label}</span>
  );
}

function VerifyChip({ status }: { status: string }) {
  if (status === "auto_approved" || status === "approved")
    return <span className="badge badge-green text-[11px]">✓ Verified</span>;
  if (status === "rejected")
    return <span className="badge badge-red text-[11px]">✕ Rejected</span>;
  return <span className="badge badge-yellow text-[11px]">⏳ Pending</span>;
}

export default function AttendanceHistoryPage() {
  const { workerId } = useAuth();
  const { t } = useLang();
  const [records,      setRecords]      = useState<AttendanceRecord[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "">("");
  const [filterMonth,  setFilterMonth]  = useState("");

  useEffect(() => {
    if (!workerId) { setIsLoading(false); return; }
    attendanceService.getWorkerAttendance(workerId, { status: filterStatus || undefined })
      .then(setRecords).catch(() => setRecords([])).finally(() => setIsLoading(false));
  }, [workerId, filterStatus]);

  const filtered = filterMonth ? records.filter(r => r.date?.startsWith(filterMonth)) : records;
  const present = filtered.filter(r => r.status === "present").length;
  const late    = filtered.filter(r => r.status === "late").length;
  const absent  = filtered.filter(r => r.status === "absent").length;
  const total   = present + late + absent;
  const pct     = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const chartData = (() => {
    const byMonth: Record<string, { month: string; Present: number; Late: number; Absent: number }> = {};
    for (const r of records) {
      if (!r.date) continue;
      const m = r.date.slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { month: new Date(m + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), Present: 0, Late: 0, Absent: 0 };
      if (r.status === "present") byMonth[m].Present++;
      else if (r.status === "late")   byMonth[m].Late++;
      else if (r.status === "absent") byMonth[m].Absent++;
    }
    return Object.values(byMonth).slice(-6);
  })();

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title">{t("my_attendance")}</h1>
        <p className="page-subtitle">Your complete verified attendance record</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("attendance_rate"), value: `${pct}%`,  borderColor: "#3B82F6", color: "#3B82F6", icon: TrendingUp },
          { label: t("present_days"),    value: present,     borderColor: "#22C55E", color: "#22C55E", icon: CheckCircle },
          { label: "Late Days",          value: late,        borderColor: "#F59E0B", color: "#F59E0B", icon: Clock },
          { label: t("absent_days"),     value: absent,      borderColor: "#EF4444", color: "#EF4444", icon: XCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4"
                 style={{ border: "1px solid #E8EAED", borderLeft: `3px solid ${s.borderColor}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: "#1A1A2E" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "#1A1A2E" }}>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="Present" fill="#22C55E" radius={[3,3,0,0]} maxBarSize={20} />
              <Bar dataKey="Late"    fill="#F59E0B" radius={[3,3,0,0]} maxBarSize={20} />
              <Bar dataKey="Absent"  fill="#EF4444" radius={[3,3,0,0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-3"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "#9CA3AF" }} />
          <span className="text-sm font-medium" style={{ color: "#6B7280" }}>Filter</span>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="input-field w-full sm:w-36 text-sm">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
               className="input-field w-full sm:w-44 text-sm" style={{ colorScheme: "light" }} />
        {filterMonth && (
          <button onClick={() => setFilterMonth("")} className="btn-secondary text-sm px-3 py-1.5">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[0,1,2,3].map(i => <div key={i} className="h-10 skeleton rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  {["Date", "Time", "Status", "Confidence", "Verification"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium">{formatDate(r.date)}</td>
                    <td><span className="font-mono text-xs">{formatTime(r.time)}</span></td>
                    <td><StatusChip status={r.status} /></td>
                    <td>
                      {r.confidence && r.confidence > 0
                        ? <span className="text-xs font-semibold font-mono" style={{ color: r.confidence >= 70 ? "#16A34A" : r.confidence >= 50 ? "#D97706" : "#DC2626" }}>{Number(r.confidence).toFixed(1)}%</span>
                        : <span style={{ color: "#D1D5DB" }}>—</span>}
                    </td>
                    <td><VerifyChip status={r.reviewStatus ?? "auto_approved"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
