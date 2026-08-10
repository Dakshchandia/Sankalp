"use client";

import { useEffect, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import api from "@/services/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/utils/formatters";

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  description: string;
  timestamp: string;
  category: string;
}

function actionStyle(action: string): { bg: string; color: string } {
  if (action.includes("Approved") || action.includes("Marked") || action.includes("Created"))
    return { bg: "var(--success-light)", color: "var(--success)" };
  if (action.includes("Rejected") || action.includes("Deleted"))
    return { bg: "var(--danger-light)", color: "var(--danger)" };
  if (action.includes("Updated") || action.includes("Review"))
    return { bg: "var(--warning-light)", color: "#92400E" };
  if (action.includes("Report") || action.includes("Export"))
    return { bg: "var(--info-light)", color: "var(--info)" };
  return { bg: "var(--surface-2)", color: "var(--text-2)" };
}

const ACTION_OPTIONS = [
  "Worker Created", "Worker Updated", "Worker Deleted",
  "Attendance Marked", "Attendance Approved", "Attendance Rejected",
  "Report Generated", "Login", "Logout",
];

export default function AuditLogsPage() {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("");

  useEffect(() => {
    api
      .get("/audit-logs", { params: { search, action: filter || undefined } })
      .then((r) => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, [search, filter]);

  const filtered = logs.filter((log) =>
    search
      ? log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1
          className="font-bold text-2xl tracking-tight"
          style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
        >
          Audit Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Every action, every supervisor, every timestamp — nothing quietly undone.
        </p>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-2)" }}
          />
          <input
            type="text"
            placeholder="Search by action, user, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full skeleton" />
                  <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />
                </div>
                <div className="flex-1 pb-6 space-y-2">
                  <div className="h-4 skeleton w-32 rounded" />
                  <div className="h-3 skeleton w-64 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit entries yet"
            description="Actions appear here as supervisors use the system — attendance approvals, worker edits, report exports."
          />
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[6px] top-2 bottom-2 w-px"
              style={{ background: "var(--border)" }}
            />
            <div className="space-y-0">
              {filtered.map((log) => {
                const { bg, color } = actionStyle(log.action);
                return (
                  <div key={log.id} className="flex gap-5 pb-6 relative">
                    {/* Dot */}
                    <div
                      className="relative z-10 flex-shrink-0 mt-[3px] w-3.5 h-3.5 rounded-full border-2"
                      style={{ background: bg, borderColor: color }}
                    />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: bg, color }}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text)" }}>{log.description}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--text-2)" }}>
                        by {log.performedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
