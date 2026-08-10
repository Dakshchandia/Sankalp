"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  User, Camera, Brain, Zap, Shield,
  ScanLine, ChevronRight, Sparkles,
} from "lucide-react";
import { useManualReviews }  from "@/hooks/useAttendance";
import { StatusBadge }       from "@/components/shared/StatusBadge";
import { EmptyState }        from "@/components/shared/EmptyState";
import { formatDateTime, getImageUrl }    from "@/utils/formatters";
import { API_BASE_URL }      from "@/lib/constants";
import type { ManualReview } from "@/types/attendance.types";
import { useLang }           from "@/context/LanguageContext";

/* ── Confidence ring ── */
function ConfRing({ conf, size = 64 }: { conf: number; size?: number }) {
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (conf / 100) * circ;
  const color = conf >= 70 ? "#22C55E" : conf >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeLinecap="round" strokeDasharray={`${fill} ${circ - fill}`}
                style={{ filter:`drop-shadow(0 0 4px ${color})`, transition:"stroke-dasharray 600ms" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black leading-none" style={{ color }}>{conf.toFixed(0)}%</span>
        <span className="text-[9px] font-semibold mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>CONF</span>
      </div>
    </div>
  );
}

/* ── Photo panel ── */
function PhotoPanel({ src, label, accent, empty }: {
  src?: string; label: string; accent: string; empty: React.ReactNode;
}) {
  return (
    <div className="flex-1 rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${accent}` }}>
      <div className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-widest"
           style={{ background:`${accent.replace("0.15","0.07")}`, borderBottom:`1px solid ${accent}`, color: accent.includes("34,197") ? "#22C55E" : accent.includes("245,158") ? "#F59E0B" : "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
      <div className="flex items-center justify-center p-3" style={{ minHeight:140 }}>
        {src
          ? <img src={getImageUrl(src)} alt={label} className="w-full max-h-36 object-cover rounded-xl" />
          : <div className="flex flex-col items-center gap-2 py-6">{empty}</div>}
      </div>
    </div>
  );
}

/* ── Review Card ── */
function ReviewCard({ review, remark, onRemarkChange, onApprove, onReject, isApproving, isRejecting }: {
  review: ManualReview;
  remark: string;
  onRemarkChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const worker     = review.worker;
  const attendance = review.attendance;
  const conf       = attendance.confidence ?? 0;
  const confColor  = conf >= 70 ? "#22C55E" : conf >= 50 ? "#F59E0B" : "#EF4444";
  const isProcessing = isApproving || isRejecting;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:16, scale:0.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, scale:0.95, transition:{ duration:0.2 } }}
      transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
      className="rounded-3xl overflow-hidden"
      style={{
        background:"#0A1520",
        border:"1px solid rgba(255,255,255,0.08)",
        boxShadow:"0 4px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Top accent + header */}
      <div className="h-0.5" style={{ background: conf >= 70 ? "#22C55E" : conf >= 50 ? "#F59E0B" : "#EF4444" }} />

      <div className="p-5 space-y-4">
        {/* Worker identity row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
               style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
            {worker.profileImage
              ? <img src={getImageUrl(worker.profileImage)} alt="" className="w-full h-full object-cover" />
              : <User className="w-6 h-6" style={{ color:"rgba(255,255,255,0.3)" }} />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{worker.fullName}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color:"rgba(255,255,255,0.35)" }}>
              {worker.workerId} · {worker.department} · {worker.village}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={attendance.status} size="sm" />
              <span className="text-[11px] flex items-center gap-1" style={{ color:"rgba(255,255,255,0.3)" }}>
                <Clock className="w-3 h-3" />
                {formatDateTime(attendance.createdAt)}
              </span>
            </div>
          </div>

          {/* Confidence ring */}
          <ConfRing conf={conf} size={68} />
        </div>

        {/* AI recommendation banner */}
        <div className="rounded-xl p-3 flex items-start gap-2.5"
             style={{ background: conf >= 70 ? "rgba(34,197,94,0.07)" : conf >= 50 ? "rgba(245,158,11,0.07)" : "rgba(239,68,68,0.07)",
                      border: `1px solid ${conf >= 70 ? "rgba(34,197,94,0.2)" : conf >= 50 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          <Brain className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: confColor }} />
          <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.5)" }}>
            <strong style={{ color: confColor }}>AI {conf >= 70 ? "recommends approval" : conf >= 50 ? "suggests review" : "flags rejection"}</strong>
            {" — "}
            {conf >= 70
              ? `${conf.toFixed(1)}% match confidence is above threshold. High probability of correct identity.`
              : conf >= 50
              ? `${conf.toFixed(1)}% match — borderline confidence. Manual review advised before approval.`
              : `${conf.toFixed(1)}% match is below minimum threshold. Face likely does not match enrollment.`}
          </p>
        </div>

        {/* Photo comparison */}
        <div className="flex gap-3">
          <PhotoPanel
            src={worker.profileImage}
            label="On File (Enrolled)"
            accent="rgba(34,197,94,0.15)"
            empty={<><User className="w-8 h-8" style={{ color:"rgba(255,255,255,0.2)" }} /><span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>No photo</span></>}
          />
          <PhotoPanel
            src={attendance.capturedImage}
            label={`Captured · ${conf.toFixed(1)}%`}
            accent={conf >= 70 ? "rgba(34,197,94,0.25)" : conf >= 50 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}
            empty={<><Camera className="w-8 h-8" style={{ color:"rgba(255,255,255,0.2)" }} /><span className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>No capture</span></>}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color:"rgba(255,255,255,0.3)" }}>
            Supervisor Remarks (optional)
          </label>
          <textarea value={remark} onChange={e => onRemarkChange(e.target.value)}
                    placeholder="Add a note about this decision…"
                    rows={2} maxLength={500}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium resize-none outline-none transition-all"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"var(--text)" }}
                    onFocus={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(34,197,94,0.4)"}
                    onBlur={e  => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.08)"} />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onApprove} disabled={isProcessing}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-40"
                  style={{ background:"rgba(34,197,94,0.12)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.25)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; if (!isProcessing) { el.style.background = "rgba(34,197,94,0.2)"; el.style.boxShadow = "0 4px 16px rgba(34,197,94,0.2)"; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(34,197,94,0.12)"; el.style.boxShadow = ""; }}>
            {isApproving
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />}
            Approve
          </button>
          <button onClick={onReject} disabled={isProcessing}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-40"
                  style={{ background:"rgba(239,68,68,0.1)", color:"#F87171", border:"1px solid rgba(239,68,68,0.2)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; if (!isProcessing) { el.style.background = "rgba(239,68,68,0.18)"; el.style.boxShadow = "0 4px 16px rgba(239,68,68,0.2)"; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(239,68,68,0.1)"; el.style.boxShadow = ""; }}>
            {isRejecting
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function ManualReviewPage() {
  const { reviews, isLoading, submitReview } = useManualReviews();
  const { t } = useLang();
  const [remarks,    setRemarks]    = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    setProcessing(`${id}-${decision}`);
    await submitReview(id, decision, remarks[id]);
    setProcessing(null);
  };

  const pending   = reviews.filter(r => !r.decision);
  const avgConf   = pending.length > 0 ? pending.reduce((a, r) => a + (r.attendance.confidence ?? 0), 0) / pending.length : 0;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── HEADER ── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#1A0A07 0%,#251510 50%,#0D1525 100%)", border:"1px solid rgba(245,158,11,0.15)" }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-4 h-4" style={{ color:"#F59E0B" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(245,158,11,0.7)" }}>
                AI Verification Queue
              </span>
            </div>
            <h1 className="font-black text-white" style={{ fontSize:"clamp(1.3rem,2.5vw,1.75rem)", letterSpacing:"-0.035em" }}>
              {t("manual_review")}
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
              Low-confidence captures requiring supervisor decision
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pending.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                   style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.2)" }}>
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-sm font-bold" style={{ color:"#F59E0B" }}>{pending.length} pending</span>
              </div>
            )}
            {pending.length > 0 && (
              <div className="text-center">
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>Avg confidence</p>
                <p className="font-black text-lg leading-none" style={{ color: avgConf >= 70 ? "#22C55E" : "#F59E0B" }}>
                  {avgConf.toFixed(0)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[0,1,2,3].map(i => <div key={i} className="rounded-3xl skeleton" style={{ height:460 }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity:0, scale:0.97 }}
          animate={{ opacity:1, scale:1 }}
          className="rounded-3xl py-20 flex flex-col items-center gap-5"
          style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
               style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.15)" }}>
            <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }}>
              <CheckCircle2 className="w-10 h-10" style={{ color:"rgba(34,197,94,0.5)" }} />
            </motion.div>
          </div>
          <div className="text-center">
            <p className="font-black text-white text-xl">All cleared!</p>
            <p className="text-sm mt-2 max-w-xs" style={{ color:"rgba(255,255,255,0.35)" }}>
              No attendance records are pending review. Every capture today matched with high confidence.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
               style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.15)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color:"#22C55E" }} />
            <span className="text-xs font-semibold" style={{ color:"#22C55E" }}>AI auto-verified all captures</span>
          </div>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {reviews.map(r => (
              <ReviewCard
                key={r.id}
                review={r}
                remark={remarks[r.id] ?? ""}
                onRemarkChange={val => setRemarks(prev => ({ ...prev, [r.id]: val }))}
                onApprove={() => handleDecision(r.id, "approved")}
                onReject={()  => handleDecision(r.id, "rejected")}
                isApproving={processing === `${r.id}-approved`}
                isRejecting={processing  === `${r.id}-rejected`}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
