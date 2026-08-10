"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  subtitle?: string;
  children:  ReactNode;
  footer?:   ReactNode;
  size?:     "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export function AppModal({ isOpen, onClose, title, subtitle, children, footer, size = "md", className }: AppModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className={cn("w-full animate-scale-in", sizeMap[size], className)}
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-3xl)", boxShadow: "var(--s-xl)", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              {title && (
                <h2 className="text-lg font-bold" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ml-4"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
