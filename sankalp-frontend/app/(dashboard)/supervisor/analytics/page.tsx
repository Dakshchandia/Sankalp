"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, Clock, IndianRupee, UserCheck, UserX,
  AlertTriangle, Info, CheckCircle, Brain, Sparkles,
  RefreshCw, ArrowUpRight, ArrowDownRight, Activity,
  BarChart2, PieChartIcon, Layers,
} from "lucide-react";
import { analyticsService } from "@/services/analytics.service";
import { ErrorState }       from "@/components/shared/ErrorState";
import { formatCurrency }   from "@/utils/formatters";
import type { AnalyticsData, SmartInsight } from "@/types/analytics.types";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, ComposedChart,
} from "recharts";

/* ─────────────────────────────────────────
   Types / helpers
───────────────────────────────────────── */
type Period = "today" | "week" | "month";

/* ── Animated counter ── */
function useCount(target: number, dur = 800) {
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, dur]);
  return v;
}

/* ── Chart tooltip ── */
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:"#161F2E", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
          <span style={{ color:"rgba(255,255,255,0.5)" }}>{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Chart wrapper card ── */
function ChartCard({ title, subtitle, children, className = "", action }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
         style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          {subtitle && <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── KPI card ── */
function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
  trend?: { v: number; positive: boolean; label: string };
}) {
  const num  = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const disp = typeof value === "string" ? value : useCount(num);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200"
         style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}
         onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${color}30`; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)"; }}
         onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = ""; el.style.boxShadow = ""; }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-white leading-none" style={{ letterSpacing:"-0.04em" }}>{disp}</p>
        <p className="text-xs font-semibold mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color:"rgba(255,255,255,0.25)" }}>{sub}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5">
          {trend.positive ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color:"#22C55E" }} /> : <ArrowDownRight className="w-3.5 h-3.5" style={{ color:"#EF4444" }} />}
          <span className="text-xs font-bold" style={{ color: trend.positive ? "#22C55E" : "#EF4444" }}>{trend.v}%</span>
          <span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

/* ── AI Insight card ── */
const INSIGHT_STYLE = {
  success: { bg:"rgba(34,197,94,0.08)",  color:"#22C55E", border:"rgba(34,197,94,0.2)",  icon: CheckCircle },
  warning: { bg:"rgba(245,158,11,0.08)", color:"#F59E0B", border:"rgba(245,158,11,0.2)", icon: AlertTriangle },
  info:    { bg:"rgba(59,130,246,0.08)", color:"#60A5FA", border:"rgba(59,130,246,0.2)", icon: Info },
  danger:  { bg:"rgba(239,68,68,0.08)",  color:"#F87171", border:"rgba(239,68,68,0.2)",  icon: AlertTriangle },
};

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [data,      setData]     = useState<AnalyticsData | null>(null);
  const [period,    setPeriod]   = useState<Period>("week");
  const [isLoading, setLoading]  = useState(true);
  const [error,     setError]    = useState<string | null>(null);
  const [refreshKey,setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    analyticsService
      .getAnalytics(period)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [period, refreshKey]);

  if (error) return <ErrorState title="Analytics Error" message={error} onRetry={() => { setError(null); setRefreshKey(k => k + 1); }} />;

  const s = data?.summary;

  /* Chart gradient defs (inline SVG) */
  const GradDefs = () => (
    <defs>
      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.15} />
        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.12} />
        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
      </linearGradient>
    </defs>
  );

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── PAGE HEADER ── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#0A1520 0%,#0E1D2E 50%,#071020 100%)", border:"1px solid rgba(59,130,246,0.15)" }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart2 className="w-4 h-4" style={{ color:"#60A5FA" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(96,165,250,0.7)" }}>
                Business Intelligence
              </span>
            </div>
            <h1 className="font-black text-white" style={{ fontSize:"clamp(1.3rem,2.5vw,1.75rem)", letterSpacing:"-0.035em" }}>
              Analytics
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
              AI-powered workforce intelligence · {period} view
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period selector */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
              {(["today","week","month"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                        style={period === p
                          ? { background:"#3B82F6", color:"#fff" }
                          : { color:"rgba(255,255,255,0.45)" }}>
                  {p}
                </button>
              ))}
            </div>
            {/* Refresh */}
            <button onClick={() => setRefreshKey(k => k + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color="#60A5FA"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(96,165,250,0.3)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.08)"; }}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-36 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Workers"   value={s?.totalWorkers  ?? 0} icon={Users}     color="#3B82F6" trend={{ v:2.1, positive:true,  label:"vs last period" }} />
          <KpiCard label="Present Today"   value={s?.presentToday  ?? 0} icon={UserCheck}  color="#22C55E" trend={{ v:4.2, positive:true,  label:"vs yesterday" }} />
          <KpiCard label="Absent Today"    value={s?.absentToday   ?? 0} icon={UserX}      color="#EF4444" trend={{ v:1.5, positive:false, label:"vs yesterday" }} />
          <KpiCard label="Attendance Rate" value={`${(s?.attendancePercentage ?? 0).toFixed(1)}%`} icon={TrendingUp} color="#A78BFA" trend={{ v:2.8, positive:true, label:"this week" }} />
        </div>
      )}

      {/* ── SECONDARY KPIs ── */}
      {!isLoading && s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:"Late Today",      v: s.lateToday ?? 0,           color:"#F59E0B", icon: Clock },
            { label:"Pending Reviews", v: s.pendingReviews ?? 0,      color:"#F59E0B", icon: Activity },
            { label:"Monthly Payroll", v: formatCurrency(s.expectedPayrollMonth ?? 0), color:"#A78BFA", icon: IndianRupee },
            { label:"Today Payroll",   v: formatCurrency(s.expectedPayrollToday ?? 0), color:"#06B6D4", icon: IndianRupee },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl p-4 flex items-center gap-3"
                   style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background:`${k.color}12` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: k.color }} />
                </div>
                <div>
                  <p className="font-bold text-white text-base leading-none">{k.v}</p>
                  <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>{k.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ROW 1: Trend + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard className="lg:col-span-2" title="Attendance Trend" subtitle="Present · Late · Absent over time">
          {isLoading ? <div className="h-56 skeleton rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={data?.dailyTrend ?? []} margin={{ top:4, right:0, left:-22, bottom:0 }}>
                <GradDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#22C55E" fill="url(#gP)" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:"#22C55E", stroke:"#0C1623", strokeWidth:2 }} />
                <Area type="monotone" dataKey="late"    name="Late"    stroke="#F59E0B" fill="url(#gL)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#EF4444" fill="url(#gA)" strokeWidth={1.5} dot={false} />
                <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Today's Split" subtitle="Attendance distribution">
          {isLoading ? <div className="h-56 skeleton rounded-xl" /> : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={[
                    { name:"Present", value: s?.presentToday ?? 0 },
                    { name:"Late",    value: s?.lateToday    ?? 0 },
                    { name:"Absent",  value: s?.absentToday  ?? 0 },
                  ]} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value">
                    <Cell fill="#22C55E" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip formatter={v => [v,""]} contentStyle={{ background:"#161F2E", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                {[["#22C55E","Present",(s?.presentToday ?? 0)],["#F59E0B","Late",(s?.lateToday ?? 0)],["#EF4444","Absent",(s?.absentToday ?? 0)]].map(([c,l,v]) => (
                  <div key={String(l)} className="text-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: String(c) }} />
                      <span className="text-xs" style={{ color:"rgba(255,255,255,0.45)" }}>{String(l)}</span>
                    </div>
                    <p className="font-bold text-white text-sm">{String(v)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* ── ROW 2: Dept + Village ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Department Breakdown" subtitle="Present vs Absent by department">
          {isLoading ? <div className="h-52 skeleton rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.departmentStats ?? []} margin={{ top:4, right:0, left:-18, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="department" tick={{ fontSize:10, fill:"rgba(255,255,255,0.35)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="present" name="Present" fill="#22C55E" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="absent"  name="Absent"  fill="#EF4444" radius={[4,4,0,0]} maxBarSize={28} />
                <Legend wrapperStyle={{ fontSize:11, paddingTop:8 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Village Breakdown" subtitle="Attendance % by village">
          {isLoading ? <div className="h-52 skeleton rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.villageStats ?? []} layout="vertical" margin={{ top:4, right:8, left:12, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="village" tick={{ fontSize:10, fill:"rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="percentage" name="Attendance %" fill="#A78BFA" radius={[0,6,6,0]} maxBarSize={18}
                     background={{ fill:"rgba(255,255,255,0.03)", radius:[0,6,6,0] as any }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── AI INSIGHTS ── */}
      {data?.insights && data.insights.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
             style={{ background:"linear-gradient(135deg,#0A1A28 0%,#0E1F30 100%)", border:"1px solid rgba(59,130,246,0.15)" }}>
          <div className="flex items-center gap-2.5 px-5 py-3.5"
               style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(59,130,246,0.05)" }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:"rgba(59,130,246,0.15)" }}>
              <Brain className="w-4 h-4" style={{ color:"#60A5FA" }} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(96,165,250,0.8)" }}>
              AI Smart Insights
            </p>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold" style={{ color:"rgba(34,197,94,0.7)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />Live
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {data.insights.map((insight, i) => {
              const style = INSIGHT_STYLE[insight.type];
              const Icon  = style.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4"
                     style={{ borderBottom: i < data.insights.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background:`${style.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: style.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: style.color }}>{insight.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color:"rgba(255,255,255,0.45)" }}>{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LOW ATTENDANCE TABLE ── */}
      {data?.lowAttendanceWorkers && data.lowAttendanceWorkers.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
             style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-5 py-3.5"
               style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-sm font-bold text-white">Workers Requiring Attention</p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>Attendance below 80% this {period}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background:"rgba(239,68,68,0.1)", color:"#F87171", border:"1px solid rgba(239,68,68,0.2)" }}>
              {data.lowAttendanceWorkers.length} workers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, fontSize:13 }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.02)" }}>
                  {["Worker","Department","Village","Attendance"].map((h, i) => (
                    <th key={i} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700,
                                        textTransform:"uppercase", letterSpacing:"0.09em",
                                        color:"rgba(255,255,255,0.25)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.lowAttendanceWorkers.map((w, i) => (
                  <tr key={w.workerId}
                      style={{ borderBottom: i < data.lowAttendanceWorkers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                    <td style={{ padding:"12px 16px" }}>
                      <p className="font-semibold text-white">{w.fullName}</p>
                      <code className="text-[11px] font-mono" style={{ color:"rgba(255,255,255,0.3)" }}>{w.workerId}</code>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                            style={{ background:"rgba(6,182,212,0.1)", color:"#06B6D4" }}>
                        {w.department}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", color:"rgba(255,255,255,0.5)", fontSize:13 }}>{w.village}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width:`${w.attendancePercentage ?? 0}%`, background:"#EF4444", boxShadow:"0 0 6px rgba(239,68,68,0.4)" }} />
                        </div>
                        <span className="text-xs font-black font-mono" style={{ color:"#F87171" }}>
                          {(w.attendancePercentage ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
