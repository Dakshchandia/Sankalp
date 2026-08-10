"use client";

import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen:       boolean;
  title:        string;
  description:  string;
  confirmLabel?: string;
  cancelLabel?:  string;
  variant?:     "danger" | "warning" | "info";
  isLoading?:   boolean;
  onConfirm:    () => void;
  onCancel:     () => void;
}

const VARIANT: Record<string, { color: string; bg: string; border: string; iconBg: string }> = {
  danger:  { color: "var(--danger)",  bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.25)",  iconBg: "rgba(239,68,68,0.1)"  },
  warning: { color: "var(--warning)", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.25)", iconBg: "rgba(245,158,11,0.1)" },
  info:    { color: "var(--info)",    bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.25)", iconBg: "rgba(59,130,246,0.1)"  },
};

export function ConfirmDialog({
  isOpen, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "danger", isLoading = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const v = VARIANT[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity:0, scale:0.94, y:12 }}
            animate={{ opacity:1, scale:1,    y:0 }}
            exit={{ opacity:0, scale:0.94,    y:12 }}
            transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
            className="relative w-full max-w-md p-6 rounded-3xl"
            style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                 style={{ background:`linear-gradient(90deg,transparent,${v.color},transparent)` }} />

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                   style={{ background: v.iconBg, border: `1px solid ${v.border}` }}>
                <AlertTriangle className="w-5 h-5" style={{ color: v.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold" style={{ color:"var(--text)" }}>{title}</h3>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color:"var(--text-2)" }}>{description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onCancel} disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ background:"rgba(255,255,255,0.06)", color:"var(--text)", border:"1px solid rgba(255,255,255,0.1)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"}>
                {cancelLabel}
              </button>
              <button onClick={onConfirm} disabled={isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}` }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "0.85"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.opacity = "1"; }}>
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Processing…</>
                ) : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
