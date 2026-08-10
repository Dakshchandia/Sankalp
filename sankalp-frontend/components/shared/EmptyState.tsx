import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Users, FileSearch, ClipboardList } from "lucide-react";

interface EmptyStateProps {
  icon?:       LucideIcon;
  title:       string;
  description?: string;
  action?:     { label: string; onClick: () => void };
  className?:  string;
}

export function EmptyState({ icon: Icon = FileSearch, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
           style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Icon className="w-8 h-8" style={{ color: "var(--text-3)" }} />
      </div>
      <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h3>
      {description && (
        <p className="text-sm mt-1.5 max-w-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="mt-5 btn-primary text-sm">{action.label}</button>
      )}
    </div>
  );
}

export function NoWorkersState({ onRegister }: { onRegister?: () => void }) {
  return (
    <EmptyState icon={Users} title="No Workers Registered"
      description="Get started by registering your first worker."
      action={onRegister ? { label: "Register Worker", onClick: onRegister } : undefined} />
  );
}

export function NoAttendanceState() {
  return (
    <EmptyState icon={ClipboardList} title="No Attendance Recorded Yet"
      description="Start an attendance session to begin marking attendance." />
  );
}

export function NoReportsState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <EmptyState icon={FileSearch} title="No Reports Generated"
      description="Generate your first report to get started."
      action={onGenerate ? { label: "Generate Report", onClick: onGenerate } : undefined} />
  );
}
