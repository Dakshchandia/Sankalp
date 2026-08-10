"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2, XCircle, Clock, Download, FolderOpen } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { API_BASE_URL } from "@/lib/constants";
import { useLang } from "@/context/LanguageContext";

interface WorkerDoc {
  id: string; workerId: string; workerName: string;
  documentName: string; documentType: string; fileName: string;
  status: "pending"|"verified"|"rejected"; rejectReason?: string;
  uploadedAt: string; verifiedBy?: string;
}

function StatusChip({ status }: { status: string }) {
  if (status === "verified") return <span className="badge badge-green">✓ Verified</span>;
  if (status === "rejected") return <span className="badge badge-red">✕ Rejected</span>;
  return <span className="badge badge-yellow">⏳ Pending</span>;
}

export default function DocumentReviewPage() {
  const [docs,       setDocs]       = useState<WorkerDoc[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter,     setFilter]     = useState<"all"|"pending"|"verified"|"rejected">("all");
  const [rejectId,   setRejectId]   = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    api.get<WorkerDoc[]>("/documents").then(r => setDocs(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const { t } = useLang();

  const decide = async (id: string, decision: "verified" | "rejected") => {
    setProcessing(id);
    try {
      await api.post(`/documents/${id}/decide`, { decision, rejectReason: decision === "rejected" ? rejectReason : "" });
      toast.success(`Document ${decision}`);
      setRejectId(null); setRejectReason("");
      load();
    } catch { toast.error("Failed. Please try again."); }
    finally { setProcessing(null); }
  };

  const filtered = filter === "all" ? docs : docs.filter(d => d.status === filter);
  const pending  = docs.filter(d => d.status === "pending").length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">{t("document_review")}</h1>
          <p className="page-subtitle">Verify worker uploaded documents</p>
        </div>
        {pending > 0 && (
          <span className="badge badge-yellow text-sm px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" /> {pending} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all","pending","verified","rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors"
                  style={filter === f
                    ? { background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0" }
                    : { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E8EAED" }}>
            {f} {f === "all" ? `(${docs.length})` : f === "pending" ? `(${pending})` : ""}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl overflow-hidden"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">{[0,1,2].map(i => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No {filter === "all" ? "" : filter} documents</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>{["Worker","Document","Type","Uploaded","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#1A1A2E" }}>{d.workerName}</p>
                        <p className="text-xs font-mono" style={{ color: "#9CA3AF" }}>{d.workerId}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#3B82F6" }} />
                        <span className="text-sm font-medium" style={{ color: "#374151" }}>{d.documentName}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue text-[11px]">{d.documentType}</span></td>
                    <td className="text-xs" style={{ color: "#9CA3AF" }}>
                      {d.uploadedAt && format(new Date(d.uploadedAt), "dd MMM yyyy")}
                    </td>
                    <td>
                      <div className="space-y-1">
                        <StatusChip status={d.status} />
                        {d.status === "rejected" && d.rejectReason && (
                          <p className="text-[11px]" style={{ color: "#B91C1C" }}>{d.rejectReason}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View */}
                        <a href={d.fileName.startsWith('http') ? d.fileName : `${API_BASE_URL}/uploads/documents/${d.fileName}`}
                           target="_blank" rel="noreferrer"
                           className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                           style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                           onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#DBEAFE"; }}
                           onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#EFF6FF"; }}>
                          <Download className="w-3.5 h-3.5" /> View
                        </a>

                        {d.status === "pending" && (
                          rejectId === d.id ? (
                            <div className="flex flex-col gap-1.5 min-w-[160px]">
                              <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                     placeholder="Rejection reason…" className="input-field text-xs py-1.5" />
                              <div className="flex gap-1.5">
                                <button onClick={() => decide(d.id, "rejected")} disabled={!!processing}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                                        style={{ background: "#FEE2E2", color: "#B91C1C" }}>Confirm</button>
                                <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                                        style={{ background: "#F3F4F6", color: "#6B7280" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => decide(d.id, "verified")} disabled={!!processing}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                                      style={{ background: "#DCFCE7", color: "#15803D" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#BBF7D0"; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#DCFCE7"; }}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                              </button>
                              <button onClick={() => setRejectId(d.id)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                      style={{ background: "#FEE2E2", color: "#B91C1C" }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FECACA"; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; }}>
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
