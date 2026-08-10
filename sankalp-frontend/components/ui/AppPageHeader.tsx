import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AppPageHeaderProps {
  title:      string;
  subtitle?:  string;
  icon?:      LucideIcon;
  badge?:     ReactNode;
  actions?:   ReactNode;
  className?: string;
}

export function AppPageHeader({ title, subtitle, icon: Icon, badge, actions, className }: AppPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "var(--primary-light)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1
              className="font-bold tracking-tight leading-none"
              style={{ fontSize: "1.375rem", color: "var(--text)", letterSpacing: "-0.025em" }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm mt-1.5" style={{ color: "var(--text-2)" }}>{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

/* ── Section header (within a card) ── */
export function AppSectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)", letterSpacing: "-0.01em" }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
