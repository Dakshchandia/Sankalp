"use client";

import { cn } from "@/lib/utils";

interface AppProgressProps {
  value:     number;
  max?:      number;
  label?:    string;
  showValue?: boolean;
  color?:    string;
  size?:     "xs" | "sm" | "md";
  className?: string;
  animated?:  boolean;
}

export function AppProgress({ value, max = 100, label, showValue, color, size = "sm", className, animated = true }: AppProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const h = { xs: "h-1", sm: "h-1.5", md: "h-2.5" }[size];

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{label}</span>}
          {showValue && <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn("progress-track", h)}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: color ?? "linear-gradient(90deg,var(--primary) 0%,var(--secondary) 100%)",
            transition: animated ? "width 600ms cubic-bezier(0.16,1,0.3,1)" : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ── Circular progress ring ── */
interface AppProgressRingProps {
  value:  number;
  max?:   number;
  size?:  number;
  stroke?: number;
  color?: string;
  label?: React.ReactNode;
  className?: string;
}

export function AppProgressRing({ value, max = 100, size = 80, stroke = 7, color, label, className }: AppProgressRingProps) {
  const pct    = Math.min(100, Math.max(0, (value / max) * 100));
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {/* Fill */}
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color ?? "var(--primary)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 6px ${color ?? "var(--primary)"})` }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">{label}</div>
      )}
    </div>
  );
}
