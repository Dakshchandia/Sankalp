"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceService } from "@/services/attendance.service";
import { workerService } from "@/services/worker.service";
import { leaveService } from "@/services/leave.service";
import api from "@/services/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Worker } from "@/types/worker.types";
import type { AttendanceRecord } from "@/types/attendance.types";
import Link from "next/link";
import {
  Camera, Calendar, FileText, IndianRupee, User,
  ClipboardCheck, TrendingUp, CheckCircle, XCircle,
  Clock, AlertCircle, ChevronRight,
} from "lucide-react";
import {
  Check, X, Activity, Award
} from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "good_morning";
  if (h < 17) return "good_afternoon";
  return "good_evening";
}

export default function WorkerDashboard() {
  const { user, workerId } = useAuth();
  const { t } = useLang();
  const [worker,      setWorker]      = useState<Worker | null>(null);
  const [summary,     setSummary]     = useState<any>(null);
  const [history,     setHistory]     = useState<AttendanceRecord[]>([]);
  const [graphRange,  setGraphRange]  = useState<"7d" | "30d">("30d");
  const [pendingLeave,setPendingLeave]= useState(0);
  const [docStatus,   setDocStatus]   = useState<string>("none");
  const [loading,     setLoading]     = useState(true);
  const [noLink,      setNoLink]      = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!workerId) { setLoading(false); setNoLink(true); return; }
    Promise.all([
      workerService.getWorker(workerId),
      attendanceService.getMyAttendanceSummary(),
      attendanceService.getMyHistory(graphRange),
      leaveService.getMyLeaves(),
      api.get("/documents/me").then(r => r.data).catch(() => []),
    ]).then(([w, s, h, leaves, docs]) => {
      setWorker(w as Worker);
      setSummary(s);
      setHistory(h as AttendanceRecord[]);
      setPendingLeave((leaves as any[]).filter(l => l.status === "pending").length);
      const da = docs as any[];
      if (!da.length) setDocStatus("none");
      else if (da.some(d => d.status === "rejected")) setDocStatus("rejected");
      else if (da.some(d => d.status === "pending"))  setDocStatus("pending");
      else setDocStatus("verified");
    }).catch(() => setNoLink(true)).finally(() => setLoading(false));
  }, [user, workerId, graphRange]);

  const chartData = (() => {
    const days = graphRange === "7d" ? 7 : 30;
    const now = new Date();
    const data = [];
    
    const historyMap: Record<string, AttendanceRecord> = {};
    for (const r of history) {
      if (r.date) historyMap[r.date] = r;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      
      const record = historyMap[key];
      const dayOfWeek = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayOfMonth = d.toLocaleDateString("en-IN", { day: "numeric" });
      const month = d.toLocaleDateString("en-IN", { month: "short" });
      
      let status = "none";
      let wage = 0;
      let time = null;
      
      if (record) {
        status = record.status;
        time = record.time;
        wage = (status === "present" || status === "late") ? (worker?.dailyWage ?? 0) : 0;
      }
      
      data.push({ 
        fullDate: key, 
        dayOfWeek, dayOfMonth, month,
        status, wage, time 
      });
    }
    return data;
  })();

  const periodPresent = chartData.filter(h => h.status === "present").length;
  const periodLate = chartData.filter(h => h.status === "late").length;
  const periodAbsent = chartData.filter(h => h.status === "absent").length;
  const periodTotal = periodPresent + periodLate + periodAbsent;
  const periodOnTime = periodTotal > 0 ? Math.round((periodPresent / periodTotal) * 100) : 0;

  const insights = (() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let currentStart: Date | string | null = null;
    let maxStart: Date | string | null = null;
    let maxEnd: Date | string | null = null;

    chartData.forEach(d => {
      if (d.status === "present" || d.status === "late") {
        if (currentStreak === 0) currentStart = `${d.month} ${d.dayOfMonth}`;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStart = currentStart;
          maxEnd = `${d.month} ${d.dayOfMonth}`;
        }
      } else if (d.status === "absent") {
        currentStreak = 0;
      }
    });

    const expectedWorkDays = chartData.filter(d => {
      const day = new Date(d.fullDate).getDay();
      return day !== 0; // Exclude Sundays
    }).length;

    const goalAchieved = periodPresent + periodLate >= expectedWorkDays;
    
    let consistency = "Needs Work";
    let consistencyEmoji = "⚠️";
    if (periodOnTime >= 95) { consistency = "Excellent"; consistencyEmoji = "🚀"; }
    else if (periodOnTime >= 80) { consistency = "Good"; consistencyEmoji = "👍"; }

    return { maxStreak, maxStart, maxEnd, expectedWorkDays, goalAchieved, consistency, consistencyEmoji };
  })();

  if (loading) return (
    <div className="space-y-5 animate-pulse max-w-4xl">
      <div className="h-28 rounded-xl skeleton" />
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-24 rounded-xl skeleton" />)}
      </div>
      <div className="h-56 rounded-xl skeleton" />
    </div>
  );

  const present = summary?.totalPresent ?? 0;
  const absent  = summary?.totalAbsent  ?? 0;
  const pct     = summary?.attendancePercentage ?? 0;
  const wage    = summary?.expectedWage ?? 0;

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">

      {/* ── Profile banner ── */}
      <div className="bg-white rounded-xl p-5 flex items-center gap-4"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xl text-white"
             style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
          {worker?.profileImage
            ? <img src={`${API_BASE_URL}/uploads/${worker.profileImage}`} alt="" className="w-full h-full object-cover" />
            : (worker?.fullName ?? user?.name ?? "W")?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-lg" style={{ color: "#1A1A2E" }}>
              {t(greeting())}, {worker?.fullName ?? user?.name} 👋
            </h1>
            {workerId && (
              <span className="badge badge-green text-[11px] font-mono">{workerId}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: "#6B7280" }}>
            {worker?.department && <span>🏢 {worker.department}</span>}
            {worker?.village    && <span>📍 {worker.village}</span>}
            {worker?.age        && <span>👤 Age {worker.age}</span>}
            {worker?.dailyWage  && <span>💰 {formatCurrency(worker.dailyWage)}/day</span>}
          </div>
          {/* Status pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {worker?.faceEnrolled
              ? <span className="badge badge-green text-[11px]">✓ Face Enrolled</span>
              : <span className="badge badge-yellow text-[11px]">⚠ Face Not Enrolled</span>}
            {docStatus === "verified"  && <span className="badge badge-green text-[11px]">✓ Documents Verified</span>}
            {docStatus === "pending"   && <span className="badge badge-yellow text-[11px]">⏳ Documents Pending</span>}
            {docStatus === "rejected"  && <span className="badge badge-red text-[11px]">✕ Document Rejected</span>}
            {pendingLeave > 0 && <span className="badge badge-yellow text-[11px]">🕐 {pendingLeave} Leave Pending</span>}
          </div>
          {noLink && (
            <p className="text-xs flex items-center gap-1.5 mt-2" style={{ color: "#F59E0B" }}>
              <AlertCircle className="w-3.5 h-3.5" /> Profile not linked — contact your supervisor
            </p>
          )}
        </div>

        {/* Mark attendance CTA */}
        {!noLink && (
          <Link href="/worker/face-attendance"
                className="btn-primary flex-shrink-0 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">{t("mark_attendance")}</span>
          </Link>
        )}
      </div>

      {/* ── KPI Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t("present_days"),    value: present,               borderColor: "#22C55E", color: "#22C55E", icon: CheckCircle },
            { label: t("absent_days"),     value: absent,                borderColor: "#EF4444", color: "#EF4444", icon: XCircle },
            { label: t("attendance_rate"), value: `${pct}%`,             borderColor: "#3B82F6", color: "#3B82F6", icon: TrendingUp },
            { label: t("expected_wage"),   value: formatCurrency(wage),  borderColor: "#F59E0B", color: "#F59E0B", icon: IndianRupee },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl p-4"
                   style={{
                     border: "1px solid #E8EAED",
                     borderLeft: `3px solid ${s.borderColor}`,
                     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                   }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{s.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ background: `${s.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-xl font-bold" style={{ color: "#1A1A2E" }}>{s.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Attendance Chart (Timeline Redesign) ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8"
           style={{ border: "1px solid #F1F5F9", boxShadow: "0 8px 30px rgba(0,0,0,0.03)" }}>
        
        {/* Header & Segments */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-5">
          <div>
            <h2 className="font-black text-xl tracking-tight" style={{ color: "#0F172A" }}>My Attendance</h2>
            <p className="text-sm font-medium mt-1" style={{ color: "#64748B" }}>Your attendance overview for the last {graphRange === "7d" ? "7" : "30"} days</p>
            
            <div className="flex items-center gap-3 mt-4 flex-wrap">
               <span className="text-xs font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase flex items-center gap-2" style={{ background: "#F8FAFC", color: "#334155", border: "1px solid #F1F5F9" }}>
                 <span style={{ color: "#16A34A" }}>{periodPresent} Present</span> <span className="opacity-30">|</span> 
                 <span style={{ color: "#D97706" }}>{periodLate} Late</span> <span className="opacity-30">|</span> 
                 <span style={{ color: "#DC2626" }}>{periodAbsent} Absent</span>
               </span>
               {periodTotal > 0 && (
                 <span className="text-xs font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                   {periodOnTime}% On-time
                 </span>
               )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3.5 flex-shrink-0">
             {/* Segmented Control */}
             <div className="flex p-1 rounded-[14px]" style={{ background: "#F1F5F9" }}>
               {(["7d", "30d"] as const).map(r => (
                 <button key={r} onClick={() => setGraphRange(r)}
                         className="px-5 py-2 rounded-[10px] text-xs font-bold transition-all duration-300 ease-out relative"
                         style={graphRange === r
                           ? { background: "#FFFFFF", color: "#16A34A", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                           : { color: "#64748B", background: "transparent" }}>
                   {r === "7d" ? "7 Days" : "30 Days"}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Timeline Heatmap */}
        <div className="w-full overflow-x-auto pb-6 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-end gap-2 min-w-max">
            {chartData.map((d, idx) => {
              const isPresent = d.status === "present";
              const isLate = d.status === "late";
              const isAbsent = d.status === "absent";
              const isNone = d.status === "none";
              
              let bg = "#F1F5F9";
              let text = "#94A3B8";
              let Icon = null;
              
              if (isPresent) { bg = "#22C55E"; text = "#FFFFFF"; Icon = Check; }
              else if (isLate) { bg = "#F59E0B"; text = "#FFFFFF"; Icon = Clock; }
              else if (isAbsent) { bg = "#EF4444"; text = "#FFFFFF"; Icon = X; }
              
              return (
                <div key={idx} className="group relative flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
                  
                  {/* Date labels */}
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{d.dayOfWeek}</span>
                    <span className="text-sm font-black mt-0.5" style={{ color: "#334155" }}>{d.dayOfMonth}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{d.month}</span>
                  </div>
                  
                  {/* Box */}
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors shadow-sm"
                       style={{ background: bg, border: isNone ? "2px dashed #E2E8F0" : "none" }}>
                    {Icon && <Icon className="w-5 h-5" style={{ color: text }} strokeWidth={3} />}
                  </div>

                  {/* Tooltip */}
                  {!isNone && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-max">
                      <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl text-xs font-medium space-y-1">
                        <p className="font-bold text-sm mb-1.5 text-white">{d.dayOfMonth} {d.month}</p>
                        <p className="flex justify-between gap-4"><span className="text-slate-400">Status:</span> <span className="capitalize" style={{ color: isPresent ? "#4ADE80" : isLate ? "#FBBF24" : "#F87171" }}>{d.status}</span></p>
                        {d.time && d.time !== "-" && <p className="flex justify-between gap-4"><span className="text-slate-400">Check-in:</span> <span>{d.time}</span></p>}
                        {d.wage > 0 && <p className="flex justify-between gap-4"><span className="text-slate-400">Wage:</span> <span>{formatCurrency(d.wage)}</span></p>}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F172A]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Insights Section */}
        <div className="mt-2 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100">
          <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "#F8FAFC" }}>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Best Streak</p>
              <p className="text-lg font-black text-slate-900 leading-none">{insights.maxStreak} Days</p>
              {insights.maxStreak > 0 && (
                <p className="text-xs font-semibold text-slate-500 mt-1.5">{insights.maxStart} – {insights.maxEnd}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "#F8FAFC" }}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Monthly Goal</p>
              <p className="text-lg font-black text-slate-900 leading-none">{periodPresent + periodLate} / {insights.expectedWorkDays} Days</p>
              {insights.goalAchieved ? (
                <p className="text-xs font-bold text-emerald-600 mt-1.5">Goal Achieved 🎉</p>
              ) : (
                <p className="text-xs font-semibold text-slate-500 mt-1.5">{insights.expectedWorkDays - (periodPresent + periodLate)} days remaining</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "#F8FAFC" }}>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Consistency</p>
              <p className="text-lg font-black text-slate-900 leading-none">{insights.consistency}</p>
              <p className="text-xs font-bold text-purple-600 mt-1.5">Keep it up! {insights.consistencyEmoji}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick nav grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/worker/attendance-history", label: t("my_attendance"),    desc: t("my_attendance"),   icon: Calendar,      color: "#3B82F6", bg: "#EFF6FF" },
          { href: "/worker/face-attendance",    label: t("face_attendance"),   desc: t("face_attendance"),  icon: Camera,        color: "#22C55E", bg: "#F0FDF4" },
          { href: "/worker/leave",              label: t("apply_leave"),        desc: t("apply_leave"),      icon: ClipboardCheck,color: "#8B5CF6", bg: "#F5F3FF" },
          { href: "/worker/documents",          label: t("my_documents"),       desc: t("my_documents"),     icon: FileText,      color: "#3B82F6", bg: "#EFF6FF" },
          { href: "/worker/expected-wage",      label: t("expected_wage"),      desc: t("expected_wage"),    icon: IndianRupee,   color: "#F59E0B", bg: "#FFFBEB" },
          { href: "/worker/profile",            label: t("my_profile"),         desc: t("my_profile"),       icon: User,          color: "#8B5CF6", bg: "#F5F3FF" },
        ].map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 group transition-all"
                  style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; el.style.transform = ""; }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: link.bg }}>
                <Icon className="w-4 h-4" style={{ color: link.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: "#1A1A2E" }}>{link.label}</p>
                <p className="text-xs truncate" style={{ color: "#9CA3AF" }}>{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                            style={{ color: link.color }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
