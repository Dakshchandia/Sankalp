"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatTime } from "@/utils/formatters";
import type { AttendanceRecord } from "@/types/attendance.types";
import { API_BASE_URL, ROUTES } from "@/lib/constants";
import Link from "next/link";

interface LiveTimelineProps {
  records: AttendanceRecord[];
}

const STATUS_GLOW: Record<string, string> = {
  present: "#22C55E",
  late:    "#F59E0B",
  absent:  "#EF4444",
  pending_review: "#94A3B8",
};

export function LiveTimeline({ records }: LiveTimelineProps) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden h-full"
         style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: "rgba(34,197,94,0.1)" }}>
            <Activity className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Live Timeline</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Real-time attendance feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-semibold" style={{ color: "rgba(34,197,94,0.7)" }}>Live</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.15)" }}>
            {records.length} today
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)" }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="w-7 h-7" style={{ color: "rgba(34,197,94,0.35)" }} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>No activity yet</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.18)" }}>Records will appear here in real-time</p>
            </div>
          </div>
        ) : (
          <div className="relative px-4 pt-4 pb-2">
            {/* Vertical timeline line */}
            <div className="absolute left-[28px] top-6 bottom-6 w-px"
                 style={{ background: "linear-gradient(to bottom,rgba(34,197,94,0.3),rgba(34,197,94,0.05))" }} />

            <AnimatePresence initial={false}>
              {records.map((r, i) => {
                const dotColor = STATUS_GLOW[r.status] ?? "#64748B";
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex items-center gap-3 mb-3 pl-8"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-3 h-3 rounded-full border-2"
                           style={{ background: dotColor, borderColor: "#0C1623", boxShadow: `0 0 6px ${dotColor}` }} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                         style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                         onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"}
                         onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                           style={{ background: "linear-gradient(135deg,#22C55E,#06B6D4)", color: "#071A0D" }}>
                        {r.workerImage
                          ? <img src={`${API_BASE_URL}/uploads/${r.workerImage}`} alt="" className="w-full h-full object-cover" />
                          : <span className="text-xs font-bold">{r.workerName.charAt(0).toUpperCase()}</span>}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{r.workerName}</p>
                        <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {formatTime(r.time)}
                          {r.confidence > 0 && (
                            <span className="ml-1.5" style={{ color: dotColor }}>{r.confidence.toFixed(0)}%</span>
                          )}
                        </p>
                      </div>

                      <StatusBadge status={r.status} size="sm" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="flex-shrink-0 px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href={ROUTES.SUPERVISOR.ATTENDANCE}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: "rgba(34,197,94,0.6)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#22C55E"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(34,197,94,0.6)"}>
          View full attendance <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
