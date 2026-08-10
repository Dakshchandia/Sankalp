"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, PlusCircle, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, User, LayoutGrid,
  List, TrendingUp, Shield, MapPin, Building2,
  IndianRupee, Sparkles, Filter, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkers } from "@/hooks/useWorkers";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState }    from "@/components/shared/ErrorState";
import { formatCurrency, formatWorkerId } from "@/utils/formatters";
import { ROUTES, DEFAULT_DEPARTMENTS, API_BASE_URL } from "@/lib/constants";
import type { Worker } from "@/types/worker.types";

type ViewMode = "grid" | "table";

/* ── Worker avatar helper ── */
function WorkerAvatar({ worker, size = 40 }: { worker: Worker; size?: number }) {
  const s = `${size}px`;
  if (worker.profileImage) {
    return (
      <img src={`${API_BASE_URL}/uploads/${worker.profileImage}`} alt={worker.fullName}
           className="object-cover rounded-full flex-shrink-0"
           style={{ width: s, height: s, border: "2px solid rgba(255,255,255,0.1)" }} />
    );
  }
  const colors = ["#22C55E,#06B6D4","#3B82F6,#8B5CF6","#F59E0B,#EF4444","#06B6D4,#3B82F6"];
  const gradient = colors[worker.fullName.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
         style={{ width: s, height: s, background: `linear-gradient(135deg,${gradient})`, fontSize: size * 0.35, border: "2px solid rgba(255,255,255,0.1)" }}>
      {worker.fullName.charAt(0).toUpperCase()}
    </div>
  );
}

/* ── Attendance bar ── */
function AttBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? "#22C55E" : pct >= 70 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-9 text-right font-mono" style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

/* ── Grid worker card ── */
function WorkerCard({ worker, onEdit, onDelete }: {
  worker: Worker;
  onEdit: (w: Worker) => void;
  onDelete: (w: Worker) => void;
}) {
  const pct = worker.attendancePercentage ?? 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 cursor-default"
      style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(34,197,94,0.2)"; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)"; el.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.boxShadow = ""; el.style.transform = ""; }}
    >
      {/* Actions on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`${ROUTES.SUPERVISOR.WORKERS}/${worker.workerId}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(34,197,94,0.2)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(34,197,94,0.1)"}
              title="View Profile">
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <button onClick={() => onEdit(worker)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.2)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)"}
                title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(worker)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"}
                title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Avatar + status */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <WorkerAvatar worker={worker} size={48} />
          {worker.faceEnrolled && (
            <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center"
                  style={{ background: "#22C55E", border: "2px solid #0C1623" }}>
              <Shield className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <p className="font-bold text-sm text-white truncate">{worker.fullName}</p>
          <code className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
            {formatWorkerId(worker.workerId)}
          </code>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        {[
          { icon: Building2, val: worker.department },
          { icon: MapPin,    val: worker.village },
          { icon: IndianRupee, val: `${formatCurrency(worker.dailyWage)}/day` },
        ].map(({ icon: Icon, val }) => (
          <div key={val} className="flex items-center gap-2">
            <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Attendance bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>Attendance</span>
        </div>
        <AttBar pct={pct} />
      </div>

      {/* Status */}
      <div className="pt-1 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <StatusBadge status={worker.faceEnrolled ? "active" : "inactive"} size="sm" />
        <Link href={`${ROUTES.SUPERVISOR.WORKERS}/${worker.workerId}`}
              className="text-xs font-semibold transition-colors"
              style={{ color: "rgba(34,197,94,0.5)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#22C55E"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(34,197,94,0.5)"}>
          View profile →
        </Link>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function WorkersPage() {
  const router = useRouter();
  const [searchTerm,   setSearchTerm]   = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [viewMode,     setViewMode]     = useState<ViewMode>("grid");
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const { workers, total, totalPages, currentPage, isLoading, error, updateFilters, setPage, deleteWorker, refresh } =
    useWorkers();

  const handleSearch = (v: string) => { setSearchTerm(v); updateFilters({ search: v }); };
  const handleDept   = (d: string)  => { setSelectedDept(d); updateFilters({ department: d || undefined }); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteWorker(deleteTarget.workerId, deleteTarget.fullName);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (error) return <ErrorState title="Failed to Load Workers" message={error} variant="database" onRetry={refresh} />;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── PAGE HEADER ── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#071A0D 0%,#0C2518 50%,#081525 100%)", border:"1px solid rgba(34,197,94,0.12)" }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4" style={{ color: "#22C55E" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(34,197,94,0.7)" }}>Workforce Registry</span>
            </div>
            <h1 className="font-black text-white" style={{ fontSize:"clamp(1.3rem,2.5vw,1.75rem)", letterSpacing:"-0.035em" }}>
              Worker Management
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
              {isLoading ? "Loading…" : `${total} registered worker${total !== 1 ? "s" : ""} · AI-verified biometric profiles`}
            </p>
          </div>
          <Link href={ROUTES.SUPERVISOR.WORKER_REGISTER}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0"
                style={{ background:"#22C55E", color:"#071A0D", boxShadow:"0 4px 16px rgba(34,197,94,0.35)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform="translateY(-1px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow="0 6px 20px rgba(34,197,94,0.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform=""; (e.currentTarget as HTMLAnchorElement).style.boxShadow="0 4px 16px rgba(34,197,94,0.35)"; }}>
            <PlusCircle className="w-4 h-4" /> Register Worker
          </Link>
        </div>
      </div>

      {/* ── SEARCH + FILTERS + VIEW TOGGLE ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:"rgba(255,255,255,0.3)" }} />
          <input type="text" placeholder="Search by name, ID, village, department…"
                 value={searchTerm} onChange={e => handleSearch(e.target.value)}
                 className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                 style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.08)", color:"var(--text)" }}
                 onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(34,197,94,0.4)"}
                 onBlur={e  => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
          {searchTerm && (
            <button onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dept filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {["", ...DEFAULT_DEPARTMENTS].map(d => (
            <button key={d || "all"} onClick={() => handleDept(d)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={selectedDept === d
                      ? { background:"#22C55E", color:"#071A0D" }
                      : { background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
              {d || "All"}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
          {([["grid", LayoutGrid],["table", List]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={viewMode === mode
                      ? { background:"#22C55E", color:"#071A0D" }
                      : { color:"rgba(255,255,255,0.4)" }}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        /* Skeleton */
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          : "space-y-2"}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl skeleton"
                 style={{ height: viewMode === "grid" ? 220 : 64 }} />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl py-20 flex flex-col items-center gap-4"
             style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.12)" }}>
            <User className="w-8 h-8" style={{ color:"rgba(34,197,94,0.4)" }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-lg">No workers found</p>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.35)" }}>
              {searchTerm || selectedDept ? "Try adjusting your filters" : "Register your first worker to get started"}
            </p>
          </div>
          <Link href={ROUTES.SUPERVISOR.WORKER_REGISTER}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background:"#22C55E", color:"#071A0D" }}>
            <PlusCircle className="w-4 h-4" /> Register Worker
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {workers.map(w => (
              <WorkerCard key={w.workerId} worker={w}
                          onEdit={w => router.push(`${ROUTES.SUPERVISOR.WORKERS}/${w.workerId}?edit=true`)}
                          onDelete={w => setDeleteTarget(w)} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl overflow-hidden"
             style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, fontSize:13 }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                  {["Worker","ID","Village","Department","Daily Wage","Attendance","Status",""].map((h, i) => (
                    <th key={i} style={{ padding:"12px 16px", textAlign: i === 7 ? "right" : "left",
                                        fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.09em",
                                        color:"rgba(255,255,255,0.25)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <tr key={w.workerId}
                      style={{ borderBottom: i < workers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                    <td style={{ padding:"12px 16px" }}>
                      <div className="flex items-center gap-3">
                        <WorkerAvatar worker={w} size={36} />
                        <div>
                          <p className="font-semibold text-white text-sm">{w.fullName}</p>
                          <p className="text-xs font-mono" style={{ color:"rgba(255,255,255,0.3)" }}>{w.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <code className="text-xs font-mono px-2 py-0.5 rounded-lg"
                            style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)" }}>
                        {formatWorkerId(w.workerId)}
                      </code>
                    </td>
                    <td style={{ padding:"12px 16px", color:"rgba(255,255,255,0.55)", fontSize:13 }}>{w.village}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{ background:"rgba(6,182,212,0.1)", color:"#06B6D4" }}>
                        {w.department}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", color:"rgba(255,255,255,0.55)", fontSize:13 }}>
                      {formatCurrency(w.dailyWage)}/day
                    </td>
                    <td style={{ padding:"12px 16px", minWidth:140 }}>
                      <AttBar pct={w.attendancePercentage ?? 0} />
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <StatusBadge status={w.faceEnrolled ? "active" : "inactive"} size="sm" />
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"right" }}>
                      <div className="flex items-center justify-end gap-1">
                        {[
                          { icon: Eye,    href: `${ROUTES.SUPERVISOR.WORKERS}/${w.workerId}`, color: "#22C55E", isLink: true },
                          { icon: Pencil, href: `${ROUTES.SUPERVISOR.WORKERS}/${w.workerId}?edit=true`, color: "#60A5FA", isLink: true },
                        ].map(({ icon: Icon, href, color, isLink }) => (
                          <Link key={href} href={href}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color:"rgba(255,255,255,0.3)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${color}15`; (e.currentTarget as HTMLAnchorElement).style.color = color; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}>
                            <Icon className="w-3.5 h-3.5" />
                          </Link>
                        ))}
                        <button onClick={() => setDeleteTarget(w)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color:"rgba(255,255,255,0.3)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#F87171"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>
                Page {currentPage} of {totalPages} · {total} workers
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}
                        className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30"
                        style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                          className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                          style={p === currentPage ? { background:"#22C55E", color:"#071A0D" } : { color:"rgba(255,255,255,0.4)" }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30"
                        style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination for grid mode */}
      {!isLoading && viewMode === "grid" && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>
            {currentPage} / {totalPages}
          </span>
          <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Worker"
        description={`Remove ${deleteTarget?.fullName} (${deleteTarget?.workerId})? All attendance records will be permanently deleted.`}
        confirmLabel="Delete Worker"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
