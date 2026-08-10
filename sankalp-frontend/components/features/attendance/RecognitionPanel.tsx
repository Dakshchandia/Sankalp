"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Brain, Zap, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatTime } from "@/utils/formatters";
import type { FaceRecognitionResult } from "@/types/attendance.types";
import type { ScannerState } from "./BiometricScanner";
import { API_BASE_URL } from "@/lib/constants";

interface RecognitionPanelProps {
  state:      ScannerState;
  confidence: number;
  lastResult: FaceRecognitionResult | null;
}

/* ── Metric row ── */
function Metric({ label, value, color = "var(--text)", icon: Icon }: {
  label: string; value: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-2.5"
         style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />}
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
      </div>
      <span className="text-xs font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

/* ── State message ── */
const STATE_MSG: Record<ScannerState, { title: string; sub: string; color: string }> = {
  idle:     { title: "Session Inactive",    sub: "Start a session to begin",          color: "#64748B" },
  loading:  { title: "Initializing AI…",   sub: "Loading recognition models",         color: "#06B6D4" },
  scanning: { title: "Scanning for Face…", sub: "Position face within frame",         color: "#22C55E" },
  detected: { title: "Face Detected",      sub: "Analyzing biometrics",               color: "#22C55E" },
  success:  { title: "✓ Identity Verified", sub: "Attendance recorded successfully",  color: "#22C55E" },
  failure:  { title: "Identity Not Verified",sub: "Face not found in registry",       color: "#EF4444" },
  review:   { title: "Sent for Review",     sub: "Low confidence — needs approval",   color: "#F59E0B" },
};

export function RecognitionPanel({ state, confidence, lastResult }: RecognitionPanelProps) {
  const msg = STATE_MSG[state];

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── State card ── */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-4"
        style={{
          background: `${msg.color}10`,
          border: `1px solid ${msg.color}25`,
        }}
      >
        <p className="text-sm font-bold" style={{ color: msg.color }}>{msg.title}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{msg.sub}</p>
      </motion.div>

      {/* ── Recognition metrics ── */}
      <div className="rounded-2xl p-4" style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: "#06B6D4" }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(6,182,212,0.8)" }}>AI Recognition</span>
        </div>
        <Metric label="Confidence"       value={confidence > 0 ? `${confidence.toFixed(1)}%` : "—"} color={confidence > 80 ? "#22C55E" : confidence > 50 ? "#F59E0B" : "#EF4444"} icon={Brain} />
        <Metric label="Face Quality"     value={confidence > 0 ? (confidence > 85 ? "Excellent" : confidence > 70 ? "Good" : "Fair") : "—"} color="#06B6D4" />
        <Metric label="Recognition Time" value={lastResult ? "< 1s" : "—"} color="#A78BFA" icon={Zap} />
        <Metric label="Status"           value={state.charAt(0).toUpperCase() + state.slice(1)} color={msg.color} />
      </div>

      {/* ── Last result worker card ── */}
      <AnimatePresence mode="wait">
        {lastResult && (
          <motion.div
            key={lastResult.workerId ?? "unknown"}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden flex-1"
            style={{
              background: "#0C1623",
              border: `1px solid ${lastResult.success ? "rgba(34,197,94,0.25)" : lastResult.requiresReview ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
              boxShadow: `0 4px 24px ${lastResult.success ? "rgba(34,197,94,0.1)" : lastResult.requiresReview ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.1)"}`,
            }}
          >
            {/* Top accent bar */}
            <div className="h-0.5 w-full"
                 style={{ background: lastResult.success ? "#22C55E" : lastResult.requiresReview ? "#F59E0B" : "#EF4444" }} />

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                     style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)" }}>
                  {lastResult.workerImage ? (
                    <img src={`${API_BASE_URL}/uploads/${lastResult.workerImage}`}
                         alt={lastResult.workerName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {lastResult.workerName?.charAt(0) ?? <User className="w-6 h-6" />}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {lastResult.success
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#22C55E" }} />
                      : lastResult.requiresReview
                      ? <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#F59E0B" }} />
                      : <XCircle      className="w-4 h-4 flex-shrink-0" style={{ color: "#EF4444" }} />}
                    <span className="text-sm font-bold text-white truncate">
                      {lastResult.success ? "Attendance Marked" : lastResult.requiresReview ? "Sent for Review" : "Not Recognized"}
                    </span>
                  </div>
                  {lastResult.workerName && (
                    <p className="text-base font-bold truncate" style={{ color: "#F8FAFC" }}>{lastResult.workerName}</p>
                  )}
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-0">
                {lastResult.status && (
                  <div className="flex items-center justify-between py-2"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Status</span>
                    <StatusBadge status={lastResult.status} size="sm" />
                  </div>
                )}
                {lastResult.confidence != null && (
                  <div className="flex items-center justify-between py-2"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Confidence</span>
                    <span className="text-xs font-bold font-mono"
                          style={{ color: lastResult.success ? "#22C55E" : "#F59E0B" }}>
                      {Number(lastResult.confidence).toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Timestamp</span>
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Message */}
              {!lastResult.success && lastResult.message && (
                <p className="text-xs mt-3 p-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.7)" }}>
                  {lastResult.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty placeholder ── */}
      {!lastResult && (
        <div className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-3 py-8"
             style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)" }}>
            <Brain className="w-7 h-7" style={{ color: "rgba(34,197,94,0.35)" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>No result yet</p>
          <p className="text-xs text-center max-w-[140px]" style={{ color: "rgba(255,255,255,0.18)" }}>
            Results will appear after face verification
          </p>
        </div>
      )}
    </div>
  );
}
