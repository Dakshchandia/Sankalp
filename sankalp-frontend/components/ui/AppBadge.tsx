import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "present" | "absent" | "late" | "pending" | "active" | "inactive" | "review";

interface AppBadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  icon?:     LucideIcon;
  dot?:      boolean;
  size?:     "sm" | "md";
  className?: string;
}

const styles: Record<BadgeVariant, { bg: string; color: string; border: string; dot: string }> = {
  success:  { bg:"rgba(34,197,94,0.12)",    color:"#4ADE80", border:"rgba(34,197,94,0.2)",   dot:"#22C55E" },
  warning:  { bg:"rgba(245,158,11,0.12)",   color:"#FBD048", border:"rgba(245,158,11,0.2)",  dot:"#F59E0B" },
  danger:   { bg:"rgba(239,68,68,0.12)",    color:"#F87171", border:"rgba(239,68,68,0.2)",   dot:"#EF4444" },
  info:     { bg:"rgba(59,130,246,0.12)",   color:"#60A5FA", border:"rgba(59,130,246,0.2)",  dot:"#3B82F6" },
  neutral:  { bg:"rgba(148,163,184,0.08)",  color:"#94A3B8", border:"rgba(148,163,184,0.12)", dot:"#64748B" },
  present:  { bg:"rgba(34,197,94,0.12)",    color:"#4ADE80", border:"rgba(34,197,94,0.2)",   dot:"#22C55E" },
  absent:   { bg:"rgba(239,68,68,0.12)",    color:"#F87171", border:"rgba(239,68,68,0.2)",   dot:"#EF4444" },
  late:     { bg:"rgba(245,158,11,0.12)",   color:"#FBD048", border:"rgba(245,158,11,0.2)",  dot:"#F59E0B" },
  pending:  { bg:"rgba(148,163,184,0.08)",  color:"#94A3B8", border:"rgba(148,163,184,0.12)", dot:"#64748B" },
  active:   { bg:"rgba(34,197,94,0.12)",    color:"#4ADE80", border:"rgba(34,197,94,0.2)",   dot:"#22C55E" },
  inactive: { bg:"rgba(148,163,184,0.08)",  color:"#94A3B8", border:"rgba(148,163,184,0.12)", dot:"#64748B" },
  review:   { bg:"rgba(245,158,11,0.12)",   color:"#FBD048", border:"rgba(245,158,11,0.2)",  dot:"#F59E0B" },
};

export function AppBadge({ variant = "neutral", children, icon: Icon, dot, size = "md", className }: AppBadgeProps) {
  const s = styles[variant];
  const isSmall = size === "sm";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 font-bold rounded-full", className)}
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize:   isSmall ? "10px" : "11px",
        padding:    isSmall ? "2px 8px" : "3px 10px",
        letterSpacing: "0.02em",
      }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      )}
      {Icon && <Icon className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {children}
    </span>
  );
}
