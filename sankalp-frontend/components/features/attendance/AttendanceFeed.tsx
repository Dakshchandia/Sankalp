"use client";

import { formatTime } from "@/utils/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { AttendanceRecord } from "@/types/attendance.types";
import { User, Clock, Activity } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

interface AttendanceFeedProps {
  records: AttendanceRecord[];
  maxItems?: number;
}

export function AttendanceFeed({ records, maxItems = 20 }: AttendanceFeedProps) {
  const displayed = records.slice(0, maxItems);

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden"
         style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--s-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
           style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
               style={{ background: "rgba(37,99,235,0.08)" }}>
            <Activity className="w-4 h-4" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>Live Feed</h3>
            <p className="text-xs" style={{ color: "var(--text-2)" }}>Real-time attendance</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
          {records.length} today
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                 style={{ background: "var(--surface-2)" }}>
              <Clock className="w-7 h-7" style={{ color: "var(--text-3)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>No attendance yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Start a session to begin marking</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {displayed.map((record, idx) => (
              <div
                key={record.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors animate-fade-in"
                style={{
                  background: idx === 0 ? "rgba(34,197,94,0.04)" : "transparent",
                  animationDelay: `${idx * 30}ms`,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = idx === 0 ? "rgba(34,197,94,0.04)" : "transparent"}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                     style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)" }}>
                  {record.workerImage ? (
                    <img src={`${API_BASE_URL}/uploads/${record.workerImage}`}
                         alt={record.workerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" style={{ color: "var(--text-3)" }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                    {record.workerName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
                      {formatTime(record.time)}
                    </span>
                    {record.confidence != null && record.confidence > 0 && (
                      <>
                        <span style={{ color: "var(--border-strong)" }}>·</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                          {Number(record.confidence).toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <StatusBadge status={record.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
