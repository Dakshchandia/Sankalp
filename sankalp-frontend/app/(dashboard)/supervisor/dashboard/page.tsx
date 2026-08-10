"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, UserX, Clock, TrendingUp,
  CalendarClock, Camera, FileText, BarChart3,
  ChevronLeft, ChevronRight, Download, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { analyticsService }  from "@/services/analytics.service";
import { attendanceService } from "@/services/attendance.service";
import type { AnalyticsSummary } from "@/types/analytics.types";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/context/LanguageContext";
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay, isToday } from "date-fns";

/* ── KPI Card — matches reference with colored left border ── */
function KpiCard({ title, value, sub, color, borderColor, icon: Icon }: {
  title: string; value: string | number; sub?: string;
  color: string; borderColor: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-2"
         style={{
           border: "1px solid #E8EAED",
           borderLeft: `3px solid ${borderColor}`,
           boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
           flex: 1,
           minWidth: 0,
         }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{title}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold leading-none" style={{ color: "#1A1A2E" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "#9CA3AF" }}>{sub}</p>}
    </div>
  );
}

/* ── Side Panel for Daily Attendance ── */
function DailyAttendancePanel({ date, onClose, t }: { date: Date, onClose: () => void, t: any }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const data = await attendanceService.getAttendanceRecords({ date: dateStr });
        setRecords(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [date]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-40 animate-fade-in backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
           style={{ animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-black text-lg text-slate-900 tracking-tight">Daily Attendance</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{format(date, "EEEE, MMMM d, yyyy")}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-sm" />)}
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-3">
              {records.map(record => (
                <div key={record.id || record._id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{record.workerName}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">{record.workerId}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md ${
                      record.status === 'present' ? 'bg-green-100 text-green-700' :
                      record.status === 'late' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                    {record.time && record.time !== "-" && <span className="text-[11px] font-semibold text-slate-500 mt-1.5">{record.time}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <CalendarClock className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No records found</p>
              <p className="text-xs text-slate-400 mt-1">No attendance data exists for this date.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Mini calendar ── */
function MiniCalendar({ selectedDate, onSelectDate }: { selectedDate: Date | null, onSelectDate: (d: Date) => void }) {
  const [date, setDate] = useState(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
  const firstDOW = startOfMonth(date).getDay();

  return (
    <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>
          {format(date, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ border: "1px solid #E8EAED", color: "#6B7280" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}>
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ border: "1px solid #E8EAED", color: "#6B7280" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: "#9CA3AF" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: (firstDOW === 0 ? 6 : firstDOW - 1) }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {days.map(day => {
          const isSel = selectedDate ? isSameDay(day, selectedDate) : false;
          const isTod = isToday(day);
          return (
            <button key={day.toISOString()}
                    onClick={() => onSelectDate(day)}
                    className="text-center text-xs py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                    style={isSel 
                      ? { background: "#3B82F6", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(59,130,246,0.4)" }
                      : isTod
                      ? { background: "#22C55E", color: "#FFFFFF" }
                      : { color: "#374151" }}
                    onMouseEnter={e => { if (!isTod && !isSel) (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
                    onMouseLeave={e => { if (!isTod && !isSel) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="mt-3 pt-3 grid grid-cols-2 gap-1.5" style={{ borderTop: "1px solid #F3F4F6" }}>
        {[
          { label: "Present", color: "#22C55E", value: "—" },
          { label: "Absent",  color: "#EF4444", value: "—" },
          { label: "Leave",   color: "#F59E0B", value: "—" },
          { label: "WFH",     color: "#3B82F6", value: "—" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-[11px]" style={{ color: "#6B7280" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Department progress bars ── */
function DeptAttendance({ deptStats, t }: { deptStats: any[]; t: (k: string) => string }) {
  const [period, setPeriod] = useState("This Month");
  const colors = ["#22C55E", "#F59E0B", "#3B82F6", "#8B5CF6", "#EF4444", "#06B6D4"];
  const data = deptStats.length > 0 ? deptStats.slice(0, 6) : [
    { department: "Construction", percentage: 0 },
    { department: "Road Works",   percentage: 0 },
    { department: "Water Supply", percentage: 0 },
    { department: "Sanitation",   percentage: 0 },
    { department: "Agriculture",  percentage: 0 },
  ];
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-3"
         style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>{t("dept_attendance")}</h3>
        <select value={period} onChange={e => setPeriod(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg outline-none"
                style={{ border: "1px solid #E8EAED", color: "#6B7280", background: "#FAFAFA" }}>
          <option>{t("this_month")}</option>
        </select>
      </div>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.department}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate pr-2" style={{ color: "#374151" }}>{d.department}</span>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#1A1A2E" }}>{d.percentage}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
              <div className="h-full rounded-full transition-all"
                   style={{ width: `${d.percentage}%`, background: colors[i % colors.length] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut chart — Attendance Distribution ── */
function AttendanceDistribution({ summary, t }: { summary: AnalyticsSummary | null; t: (k: string) => string }) {
  const present = summary?.presentToday ?? 0;
  const absent  = summary?.absentToday  ?? 0;
  const late    = summary?.lateToday    ?? 0;
  const total   = present + absent + late || 1;
  const data = [
    { name: t("present"), value: present, color: "#22C55E" },
    { name: t("absent"),  value: absent,  color: "#EF4444" },
    { name: "Late",       value: late,    color: "#F59E0B" },
  ];
  return (
    <div className="bg-white rounded-xl p-4"
         style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <h3 className="font-semibold text-sm mb-3" style={{ color: "#1A1A2E" }}>Attendance Distribution</h3>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <PieChart width={120} height={120}>
            <Pie data={data} cx={55} cy={55} innerRadius={36} outerRadius={55} paddingAngle={2} dataKey="value">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs" style={{ color: "#6B7280" }}>{d.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold" style={{ color: "#1A1A2E" }}>{d.value}</span>
                <span className="text-[10px] ml-1" style={{ color: "#9CA3AF" }}>
                  {Math.round((d.value / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [summary,    setSummary]    = useState<AnalyticsSummary | null>(null);
  const [chartData,  setChartData]  = useState<any[]>([]);
  const [deptStats,  setDeptStats]  = useState<any[]>([]);
  const [pending,    setPending]    = useState({ pendingLeaves: 0, pendingDocuments: 0 });
  const [loading,    setLoading]    = useState(true);
  const [today]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [analytics, counts] = await Promise.all([
          analyticsService.getAnalytics("week"),
          analyticsService.getPendingCounts(),
        ]);
        setSummary(analytics.summary);
        setDeptStats(analytics.departmentStats ?? []);
        setPending(counts);

        // Build weekly chart data
        const raw = analytics.weeklyTrend ?? analytics.dailyTrend?.slice(-7) ?? [];
        setChartData(raw.map((d: any) => ({
          day: d.date ? new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }) : (d.day ?? ""),
          Present:       d.present ?? 0,
          Absent:        d.absent  ?? 0,
          Leave:         0,
          "Work from home": d.late ?? 0,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-64 rounded-lg skeleton" />
      <div className="flex gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="flex-1 h-24 rounded-xl skeleton" />)}
      </div>
      <div className="h-72 rounded-xl skeleton" />
    </div>
  );

  const attRate = summary?.attendancePercentage ?? 0;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{t("attendance_dashboard")}</h1>
          <p className="page-subtitle">Search or type a command</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Date picker */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "#FFFFFF", border: "1px solid #E8EAED", color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 13 }}>📅</span>
            {format(today, "MMM dd, yyyy")}
            <ChevronRight className="w-3.5 h-3.5 rotate-90" style={{ color: "#9CA3AF" }} />
          </button>
          {/* Export */}
          <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Download className="w-4 h-4" /> {t("export_report")}
          </button>
        </div>
      </div>

      {/* ── KPI Row — exactly like reference ── */}
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <KpiCard title={t("total_employees")}  value={summary?.totalWorkers  ?? 0}  sub={t("employees")}   color="#22C55E" borderColor="#22C55E" icon={Users} />
        <KpiCard title={t("present_today")}    value={summary?.presentToday  ?? 0}  sub={`${attRate.toFixed(0)}%`} color="#3B82F6" borderColor="#3B82F6" icon={UserCheck} />
        <KpiCard title={t("absent_today")}     value={summary?.absentToday   ?? 0}  sub={`${summary?.totalWorkers ? ((summary.absentToday / summary.totalWorkers) * 100).toFixed(1) : 0}%`} color="#EF4444" borderColor="#EF4444" icon={UserX} />
        <KpiCard title={t("late_arrivals")}    value={summary?.lateToday     ?? 0}  sub={`${summary?.totalWorkers ? ((summary.lateToday / summary.totalWorkers) * 100).toFixed(1) : 0}%`} color="#F59E0B" borderColor="#F59E0B" icon={Clock} />
        <KpiCard title={t("leave_requests")}   value={pending.pendingLeaves}         sub={t("pending")}     color="#8B5CF6" borderColor="#8B5CF6" icon={CalendarClock} />
        <KpiCard title={t("attendance_rate")}  value={`${attRate.toFixed(1)}%`}     sub={t("this_month")}  color="#06B6D4" borderColor="#06B6D4" icon={TrendingUp} />
      </div>

      {/* ── Attendance Overview Chart ── */}
      <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: "#1A1A2E" }}>
            {t("attendance_overview")}
          </h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ border: "1px solid #E8EAED", color: "#6B7280", background: "#FAFAFA" }}>
            <span>📅</span> Last Week
            <ChevronRight className="w-3 h-3 rotate-90" />
          </button>
        </div>

        {/* Chart legend — matches reference */}
        <div className="flex items-center gap-5 mb-4">
          {[
            { label: t("present"),        color: "#22C55E" },
            { label: t("absent"),         color: "#F59E0B" },
            { label: t("leave"),          color: "#EF4444" },
            { label: "Work from home",    color: "#8B5CF6" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-0.5 w-6 rounded-full" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: "#6B7280" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="Present"        fill="#22C55E" radius={[3,3,0,0]} maxBarSize={32} />
              <Bar dataKey="Absent"         fill="#F59E0B" radius={[3,3,0,0]} maxBarSize={32} />
              <Bar dataKey="Leave"          fill="#EF4444" radius={[3,3,0,0]} maxBarSize={32} />
              <Bar dataKey="Work from home" fill="#8B5CF6" radius={[3,3,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-56">
            <div className="text-center">
              <Camera className="w-10 h-10 mx-auto mb-2" style={{ color: "#E5E7EB" }} />
              <p className="text-sm" style={{ color: "#9CA3AF" }}>No attendance data yet</p>
              <p className="text-xs mt-1" style={{ color: "#D1D5DB" }}>Start an attendance session to collect data</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom row — exactly like reference ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Attendance distribution donut */}
        <AttendanceDistribution summary={summary} t={t} />

        {/* Department attendance */}
        <DeptAttendance deptStats={deptStats} t={t} />
      </div>

      {/* ── Daily Attendance Sidebar Drawer ── */}
      {selectedDate && (
        <DailyAttendancePanel date={selectedDate} onClose={() => setSelectedDate(null)} t={t} />
      )}
    </div>
  );
}
