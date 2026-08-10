"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Calendar, Building2, MapPin,
  User, Clock, CheckCircle2, Sparkles, BarChart2,
  RefreshCw, FileSpreadsheet, X, ChevronRight,
  TrendingUp, Users,
} from "lucide-react";
import { reportService, type ReportType } from "@/services/report.service";
import { DEFAULT_DEPARTMENTS, ROUTES }    from "@/lib/constants";
import { formatDateTime }                  from "@/utils/formatters";
import { toast }                           from "sonner";

/* ── Types ── */
interface ReportOption {
  type:        ReportType;
  label:       string;
  description: string;
  icon:        React.ElementType;
  color:       string;
  gradient:    string;
}

interface GeneratedReport {
  type:        string;
  label:       string;
  generatedAt: string;
  status:      "ready";
}

/* ── Report catalogue ── */
const REPORT_OPTIONS: ReportOption[] = [
  { type:"today",      label:"Today's Report",   description:"Complete attendance for today",        icon:Clock,       color:"#22C55E", gradient:"linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.04))" },
  { type:"weekly",     label:"Weekly Report",    description:"Last 7 days attendance summary",       icon:Calendar,    color:"#3B82F6", gradient:"linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.04))" },
  { type:"monthly",    label:"Monthly Report",   description:"Full month attendance and wages",      icon:TrendingUp,  color:"#A78BFA", gradient:"linear-gradient(135deg,rgba(167,139,250,0.12),rgba(167,139,250,0.04))" },
  { type:"department", label:"Department Report",description:"Attendance by department",             icon:Building2,   color:"#06B6D4", gradient:"linear-gradient(135deg,rgba(6,182,212,0.12),rgba(6,182,212,0.04))" },
  { type:"village",    label:"Village Report",   description:"Attendance by village",                icon:MapPin,      color:"#F59E0B", gradient:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))" },
  { type:"worker",     label:"Worker Report",    description:"Individual worker attendance history", icon:Users,       color:"#EF4444", gradient:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.04))" },
];

/* ── Report type selection card ── */
function ReportTypeCard({ opt, selected, onClick }: { opt: ReportOption; selected: boolean; onClick: () => void }) {
  const Icon = opt.icon;
  return (
    <button onClick={onClick}
            className="text-left p-4 rounded-2xl transition-all duration-150 w-full"
            style={{
              background: selected ? opt.gradient : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${selected ? `${opt.color}35` : "rgba(255,255,255,0.07)"}`,
              boxShadow: selected ? `0 4px 20px ${opt.color}18` : "none",
            }}
            onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background:`${opt.color}18`, border:`1px solid ${opt.color}25` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: opt.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-none" style={{ color: selected ? opt.color : "#F8FAFC" }}>{opt.label}</p>
          <p className="text-xs mt-1 leading-snug" style={{ color:"rgba(255,255,255,0.35)" }}>{opt.description}</p>
        </div>
        {selected && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: opt.color }} />}
      </div>
    </button>
  );
}

/* ── Generated report row ── */
function ReportRow({ report, onDownload, index }: { report: GeneratedReport; onDownload: () => void; index: number }) {
  const opt = REPORT_OPTIONS.find(o => o.type === report.type) ?? REPORT_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <motion.div
      initial={{ opacity:0, x:12 }}
      animate={{ opacity:1, x:0 }}
      transition={{ duration:0.3, delay: index * 0.05 }}
      className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: opt.gradient, border:`1px solid ${opt.color}25` }}>
        <Icon className="w-4.5 h-4.5" style={{ color: opt.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{report.label}</p>
        <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>{formatDateTime(report.generatedAt)}</p>
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background:"rgba(34,197,94,0.1)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.15)" }}>
        Ready
      </span>
      <button onClick={onDownload}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#22C55E"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              title="Download CSV">
        <Download className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function ReportsPage() {
  const [selectedType, setSelectedType]   = useState<ReportType>("monthly");
  const [dateFrom,     setDateFrom]       = useState("");
  const [dateTo,       setDateTo]         = useState("");
  const [selectedDept, setSelectedDept]   = useState("");
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isDownloading,setIsDownloading]  = useState(false);
  const [reports,      setReports]        = useState<GeneratedReport[]>([]);
  const [showSuccess,  setShowSuccess]    = useState(false);

  const getFilters = () => ({ type:selectedType, dateFrom:dateFrom||undefined, dateTo:dateTo||undefined, department:selectedDept||undefined });

  const selectedOpt = REPORT_OPTIONS.find(r => r.type === selectedType)!;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await reportService.generateReport(getFilters());
      const label = selectedOpt.label;
      setReports(p => [{ type:selectedType, label, generatedAt:new Date().toISOString(), status:"ready" }, ...p.slice(0,9)]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success(`${label} generated successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Report generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await reportService.downloadCSV(getFilters());
      reportService.triggerDownload(blob, `sankalp_${selectedType}_${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("CSV downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── PAGE HEADER ── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#0D1A10 0%,#121D25 50%,#0A0F1A 100%)", border:"1px solid rgba(167,139,250,0.15)" }}>
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5">
          <div className="flex items-center gap-2 mb-1.5">
            <FileSpreadsheet className="w-4 h-4" style={{ color:"#A78BFA" }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(167,139,250,0.7)" }}>
              Report Center
            </span>
          </div>
          <h1 className="font-black text-white" style={{ fontSize:"clamp(1.3rem,2.5vw,1.75rem)", letterSpacing:"-0.035em" }}>
            Reports & Exports
          </h1>
          <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
            Generate government-ready attendance and payroll reports
          </p>
        </div>
      </div>

      {/* ── SUCCESS BANNER ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
                      className="rounded-2xl p-4 flex items-center gap-3"
                      style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color:"#22C55E" }} />
            <p className="text-sm font-semibold" style={{ color:"#22C55E" }}>
              {selectedOpt.label} generated successfully — ready to download
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT: Builder ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Report type grid */}
          <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm font-bold text-white mb-4">Select Report Type</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REPORT_OPTIONS.map(opt => (
                <ReportTypeCard key={opt.type} opt={opt} selected={selectedType === opt.type} onClick={() => setSelectedType(opt.type)} />
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm font-bold text-white mb-4">Filters</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label:"From Date", type:"date", value:dateFrom, set:setDateFrom },
                { label:"To Date",   type:"date", value:dateTo,   set:setDateTo },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-2" style={{ color:"rgba(255,255,255,0.4)" }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                         className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                         style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"var(--text)" }}
                         onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = `${selectedOpt.color}50`}
                         onBlur={e  => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"} />
                </div>
              ))}
              {selectedType === "department" && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-2" style={{ color:"rgba(255,255,255,0.4)" }}>Department</label>
                  <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"var(--text)" }}>
                    <option value="">All Departments</option>
                    {DEFAULT_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleGenerate} disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background:selectedOpt.color, color:"#0A0F1C", boxShadow:`0 4px 16px ${selectedOpt.color}35` }}
                    onMouseEnter={e => { if (!isGenerating) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${selectedOpt.color}45`; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${selectedOpt.color}35`; }}>
              {isGenerating
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Generating…</>
                : <><FileText className="w-4 h-4" />Generate Report</>}
            </button>
            <button onClick={handleDownload} disabled={isDownloading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.12)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}>
              {isDownloading
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Downloading…</>
                : <><Download className="w-4 h-4" />Export CSV</>}
            </button>
          </div>
        </div>

        {/* ── RIGHT: History ── */}
        <div className="rounded-2xl overflow-hidden flex flex-col"
             style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
               style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm font-bold text-white">Report History</p>
            {reports.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background:"rgba(34,197,94,0.1)", color:"#22C55E" }}>
                {reports.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                     style={{ background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.12)" }}>
                  <FileText className="w-7 h-7" style={{ color:"rgba(167,139,250,0.4)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">No reports yet</p>
                  <p className="text-xs mt-1 max-w-[160px]" style={{ color:"rgba(255,255,255,0.3)" }}>
                    Generated reports will appear here for quick download
                  </p>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background:"rgba(167,139,250,0.1)", color:"#A78BFA", border:"1px solid rgba(167,139,250,0.2)" }}>
                  <FileText className="w-3.5 h-3.5" />
                  Generate First Report
                </button>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {reports.map((r, i) => (
                  <ReportRow key={`${r.type}-${r.generatedAt}`} report={r} index={i} onDownload={handleDownload} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
