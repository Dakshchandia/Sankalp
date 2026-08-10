import type { AttendanceStatus } from "@/types/attendance.types";

interface StatusBadgeProps {
  status: AttendanceStatus | string;
  size?: "sm" | "md";
  showDot?: boolean;
}

type StatusCfg = { label: string; bg: string; color: string; dot: string };

const CFG: Record<string, StatusCfg> = {
  present:        { label: "Present",        bg: "var(--success-light)",  color: "var(--success)",  dot: "var(--success)" },
  late:           { label: "Late",           bg: "var(--warning-light)",  color: "#92400E",          dot: "var(--warning)" },
  absent:         { label: "Absent",         bg: "var(--danger-light)",   color: "var(--danger)",   dot: "var(--danger)" },
  pending_review: { label: "Pending Review", bg: "var(--surface-2)",      color: "var(--text-2)",   dot: "#94A3B8" },
  approved:       { label: "Approved",       bg: "var(--success-light)",  color: "var(--success)",  dot: "var(--success)" },
  rejected:       { label: "Rejected",       bg: "var(--danger-light)",   color: "var(--danger)",   dot: "var(--danger)" },
  active:         { label: "Active",         bg: "var(--info-light)",     color: "var(--info)",     dot: "var(--info)" },
  inactive:       { label: "Inactive",       bg: "var(--surface-2)",      color: "var(--text-2)",   dot: "#94A3B8" },
};

export function StatusBadge({ status, size = "md", showDot = true }: StatusBadgeProps) {
  const cfg: StatusCfg = CFG[status] ?? {
    label: status,
    bg: "var(--surface-2)",
    color: "var(--text-2)",
    dot: "#94A3B8",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        borderRadius: "9999px",
        fontWeight: 600,
        fontSize: size === "sm" ? "0.65rem" : "0.7rem",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        background: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.01em",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {showDot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
      )}
      {cfg.label}
    </span>
  );
}
