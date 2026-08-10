"use client";

import { use } from "react";
import { useWorker } from "@/hooks/useWorkers";
import {
  ArrowLeft, Phone, MapPin, Building2, IndianRupee,
  CheckCircle, XCircle, Clock, TrendingUp, ShieldCheck,
  Brain, Sparkles, Calendar, User, Activity,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatusBadge }    from "@/components/shared/StatusBadge";
import { ProfileSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState }      from "@/components/shared/ErrorState";
import { formatCurrency, formatDate, formatPhone, getInitials, getImageUrl } from "@/utils/formatters";
import { ROUTES, API_BASE_URL } from "@/lib/constants";

interface PageProps { params: Promise<{ id: string }> }

/* ── Animated counter ── */
function Num({ v }: { v: number }) {
  return <motion.span initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>{v}</motion.span>;
}

/* ── AI insight item ── */
function AIInsight({ icon, text, color }: { icon: React.ElementType; color: string; text: string }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
      <span style={{ color:"rgba(255,255,255,0.55)" }}>{text}</span>
    </div>
  );
}

export default function WorkerProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { worker, isLoading, error } = useWorker(id);

  if (isLoading) return <ProfileSkeleton />;
  if (error || !worker) {
    return <ErrorState title="Worker Not Found" message={error ?? "This worker does not exist or was removed."} variant="default" />;
  }

  const pct = worker.attendancePercentage ?? 0;
  const pctColor = pct >= 85 ? "#22C55E" : pct >= 70 ? "#F59E0B" : "#EF4444";

  const stats = [
    { label:"Attendance",   value:pct.toFixed(1)+"%", icon:TrendingUp, color:"#22C55E", bg:"rgba(34,197,94,0.1)" },
    { label:"Present Days", value:worker.presentDays ?? 0, icon:CheckCircle, color:"#22C55E", bg:"rgba(34,197,94,0.1)" },
    { label:"Late Days",    value:worker.lateDays    ?? 0, icon:Clock,       color:"#F59E0B", bg:"rgba(245,158,11,0.1)" },
    { label:"Absent Days",  value:worker.absentDays  ?? 0, icon:XCircle,     color:"#EF4444", bg:"rgba(239,68,68,0.1)" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href={ROUTES.SUPERVISOR.WORKERS}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"}>
          <ArrowLeft className="w-4 h-4" style={{ color:"rgba(255,255,255,0.6)" }} />
        </Link>
        <div>
          <h1 className="font-black text-white" style={{ fontSize:"1.3rem", letterSpacing:"-0.03em" }}>Worker Profile</h1>
          <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.35)" }}>Detailed profile · Attendance · Wage summary</p>
        </div>
      </div>

      {/* ── HERO PROFILE CARD ── */}
      <div className="rounded-3xl overflow-hidden"
           style={{ background:"linear-gradient(135deg,#071A0D 0%,#0C2518 60%,#081525 100%)", border:"1px solid rgba(34,197,94,0.15)" }}>
        <div className="absolute pointer-events-none w-64 h-64 rounded-full"
             style={{ top:-64, right:-32, background:"radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)" }} />

        {/* Attendance % banner */}
        <div className="h-1.5" style={{ background:`linear-gradient(90deg,${pctColor} 0%,${pctColor}40 ${pct}%,rgba(255,255,255,0.06) ${pct}%)` }} />

        <div className="relative p-6">
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                   style={{ background:"rgba(255,255,255,0.06)", border:"2px solid rgba(34,197,94,0.2)" }}>
                {worker.profileImage
                  ? <img src={getImageUrl(worker.profileImage)} alt={worker.fullName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400">{getInitials(worker.fullName)}</div>}
              </div>
              {worker.faceEnrolled && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
                     style={{ background:"#22C55E", border:"2px solid #071A0D", boxShadow:"0 0 8px rgba(34,197,94,0.5)" }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <h2 className="font-black text-white text-2xl tracking-tight" style={{ letterSpacing:"-0.03em" }}>
                    {worker.fullName}
                  </h2>
                  <code className="text-sm font-mono mt-1 inline-block px-2 py-0.5 rounded-lg"
                        style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)" }}>
                    {worker.workerId.toUpperCase()}
                  </code>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {worker.faceEnrolled && (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background:"rgba(34,197,94,0.12)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.2)" }}>
                      <ShieldCheck className="w-3 h-3" /> Face Enrolled
                    </span>
                  )}
                  <StatusBadge status={worker.faceEnrolled ? "active" : "inactive"} />
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Phone,       val: formatPhone(worker.phone) },
                  { icon: MapPin,      val: worker.village },
                  { icon: Building2,   val: worker.department },
                  { icon: IndianRupee, val: `${formatCurrency(worker.dailyWage)}/day` },
                ].map(({ icon: Icon, val }) => (
                  <div key={val} className="flex items-center gap-1.5 text-sm" style={{ color:"rgba(255,255,255,0.5)" }}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color:"rgba(255,255,255,0.25)" }} />
                    <span className="truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                        transition={{ duration:0.3, delay: i * 0.07 }}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:s.bg }}>
                <Icon className="w-5 h-5" style={{ color:s.color }} />
              </div>
              <div>
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>{s.label}</p>
                <p className="font-black text-white text-xl leading-none mt-0.5">{s.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── WAGE + DETAILS + AI ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Wage */}
        <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <IndianRupee className="w-4 h-4" style={{ color:"#A78BFA" }} />
            <span className="text-sm font-bold text-white">Wage Summary</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.4)" }}>Daily Wage</span>
              <span className="font-semibold text-white">{formatCurrency(worker.dailyWage)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.4)" }}>Present Days</span>
              <span className="font-semibold text-white">{worker.presentDays ?? 0} days</span>
            </div>
            <div className="pt-3 flex justify-between" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-semibold" style={{ color:"rgba(255,255,255,0.7)" }}>Monthly Estimate</span>
              <span className="font-black text-lg" style={{ color:"#A78BFA" }}>
                {formatCurrency(worker.expectedMonthlyWage ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <User className="w-4 h-4" style={{ color:"#06B6D4" }} />
            <span className="text-sm font-bold text-white">Worker Details</span>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { label:"Gender",        val: worker.gender, cap: true },
              { label:"Age",           val: `${worker.age} yrs` },
              { label:"Face Enrolled", val: worker.faceEnrolled ? "Yes" : "No",
                color: worker.faceEnrolled ? "#22C55E" : "#EF4444" },
              { label:"Registered",    val: formatDate(worker.createdAt) },
            ].map(({ label, val, cap, color }) => (
              <div key={label} className="flex justify-between">
                <span style={{ color:"rgba(255,255,255,0.35)" }}>{label}</span>
                <span className={cap ? "capitalize" : ""} style={{ color: color ?? "rgba(255,255,255,0.7)", fontWeight:600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl p-5"
             style={{ background:"linear-gradient(135deg,#0A1A28 0%,#0E1F30 100%)", border:"1px solid rgba(6,182,212,0.15)" }}>
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <Brain className="w-4 h-4" style={{ color:"#06B6D4" }} />
            <span className="text-sm font-bold text-white">AI Insights</span>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background:"rgba(6,182,212,0.12)", color:"#06B6D4" }}>LIVE</span>
          </div>
          <div className="space-y-3">
            <AIInsight icon={TrendingUp}
                       color={pct >= 85 ? "#22C55E" : "#F59E0B"}
                       text={pct >= 85 ? `Attendance at ${pct.toFixed(0)}% — above 85% benchmark.` : `Attendance at ${pct.toFixed(0)}% — below target. Follow up recommended.`} />
            <AIInsight icon={ShieldCheck} color="#22C55E"
                       text={worker.faceEnrolled ? "Biometric enrollment complete — full AI verification active." : "Face not enrolled — manual attendance only."} />
            <AIInsight icon={Activity} color="#A78BFA"
                       text={`Expected monthly wage: ${formatCurrency(worker.expectedMonthlyWage ?? 0)} based on ${worker.presentDays ?? 0} present days.`} />
            {(worker.lateDays ?? 0) > 3 && (
              <AIInsight icon={Clock} color="#F59E0B"
                         text={`${worker.lateDays} late arrivals detected. Consider punctuality review.`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
