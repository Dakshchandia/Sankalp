import { AlertCircle, RefreshCw, WifiOff, Camera, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?:     string;
  message:    string;
  onRetry?:   () => void;
  variant?:   "default" | "camera" | "network" | "database";
  className?: string;
}

const VARIANT_CONFIG = {
  default:  { icon: AlertCircle, color: "var(--danger)",  bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.2)" },
  camera:   { icon: Camera,      color: "var(--warning)", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)" },
  network:  { icon: WifiOff,     color: "var(--text-2)",  bg: "rgba(255,255,255,0.03)",  border: "rgba(255,255,255,0.08)" },
  database: { icon: Database,    color: "var(--info)",    bg: "rgba(59,130,246,0.08)",   border: "rgba(59,130,246,0.2)" },
};

export function ErrorState({ title = "Something went wrong", message, onRetry, variant = "default", className }: ErrorStateProps) {
  const { icon: Icon, color, bg, border } = VARIANT_CONFIG[variant];
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-14 px-6 text-center rounded-2xl", className)}
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
           style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-sm mt-1.5 max-w-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text)", border: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"}>
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
         style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
      <p className="text-sm" style={{ color: "var(--danger)" }}>{message}</p>
    </div>
  );
}
