"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Upload, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/context/LanguageContext";

interface WorkerDoc {
  id: string; documentName: string; documentType: string;
  fileName: string; status: "pending"|"verified"|"rejected";
  rejectReason?: string; uploadedAt: string;
}

const DOC_TYPES = ["Identity Proof","Address Proof","Employment Document","Bank Document","Other"];

function StatusChip({ status }: { status: string }) {
  if (status === "verified") return <span className="badge badge-green">✓ Verified</span>;
  if (status === "rejected") return <span className="badge badge-red">✕ Rejected</span>;
  return <span className="badge badge-yellow">⏳ Pending Verification</span>;
}

export default function WorkerDocumentsPage() {
  const [docs,      setDocs]      = useState<WorkerDoc[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docName,   setDocName]   = useState("");
  const [docType,   setDocType]   = useState("");
  const [file,      setFile]      = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();

  const loadDocs = () => {
    api.get<WorkerDoc[]>("/documents/me").then(r => setDocs(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(loadDocs, []);

  const handleUpload = async () => {
    if (!file || !docName || !docType) { toast.error("Please fill all fields and select a file."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentName", docName);
      fd.append("documentType", docType);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully!");
      setDocName(""); setDocType(""); setFile(null); setShowForm(false); loadDocs();
    } catch { toast.error("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t("my_documents")}</h1>
          <p className="page-subtitle">Upload and track your verification documents</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          {showForm ? "Cancel" : "Upload Document"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: "#1A1A2E" }}>Upload New Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Document Name</label>
              <input value={docName} onChange={e => setDocName(e.target.value)}
                     type="text" placeholder="e.g. Aadhaar Card" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="input-field text-sm">
                <option value="">Select type</option>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>File</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()}
                        className="btn-secondary flex items-center gap-2 text-xs px-3 py-2">
                  <Upload className="w-3.5 h-3.5" /> Choose File
                </button>
                <span className="text-xs" style={{ color: file ? "#16A34A" : "#9CA3AF" }}>
                  {file ? file.name : "PDF, JPG, PNG accepted"}
                </span>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                       onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>
            <button onClick={handleUpload} disabled={uploading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
              {uploading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</> : "Upload Document"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden"
           style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-5 py-3.5"
             style={{ borderBottom: "1px solid #F3F4F6" }}>
          <h2 className="font-semibold text-sm" style={{ color: "#1A1A2E" }}>My Documents</h2>
          <span className="badge badge-gray">{docs.length} uploaded</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[0,1].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : docs.length === 0 ? (
          <div className="py-14 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No documents uploaded yet</p>
          </div>
        ) : (
          <div>
            {docs.map((d, i) => (
              <div key={d.id} className="px-5 py-4 flex items-center gap-3"
                   style={{ borderBottom: i < docs.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: "#EFF6FF" }}>
                  <FileText className="w-4 h-4" style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate" style={{ color: "#1A1A2E" }}>{d.documentName}</p>
                    <StatusChip status={d.status} />
                  </div>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{d.documentType}</p>
                  {d.status === "rejected" && d.rejectReason && (
                    <p className="text-xs mt-0.5 font-medium" style={{ color: "#DC2626" }}>Reason: {d.rejectReason}</p>
                  )}
                </div>
                <p className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>
                  {d.uploadedAt && format(new Date(d.uploadedAt), "dd MMM yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
