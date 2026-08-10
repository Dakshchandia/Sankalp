import { cn } from "@/lib/utils";

/* ── Spinner ── */
export function AppSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-[3px]" }[size];
  return (
    <span
      className={cn("rounded-full border-current border-t-transparent animate-spin flex-shrink-0", s, className)}
      style={{ animationDuration: "700ms", color: "var(--primary)" }}
      aria-label="Loading"
    />
  );
}

/* ── Skeleton line ── */
export function AppSkeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} />;
}

/* ── Skeleton card ── */
export function AppSkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="sankalp-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <AppSkeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <AppSkeleton className="h-4 w-32" />
          <AppSkeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <AppSkeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton stat row ── */
export function AppSkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kpi-card">
          <div className="flex items-start justify-between mb-4">
            <AppSkeleton className="w-11 h-11 rounded-xl" />
            <AppSkeleton className="w-16 h-6 rounded" />
          </div>
          <AppSkeleton className="h-8 w-20 mb-1.5" />
          <AppSkeleton className="h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/* ── Skeleton table ── */
export function AppSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <div className="flex gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-3)" }}>
        {[40, 120, 80, 80, 60, 60].map((w, i) => (
          <AppSkeleton key={i} className="h-3 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <AppSkeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <AppSkeleton className="h-3.5 w-36" />
            <AppSkeleton className="h-3 w-24" />
          </div>
          <AppSkeleton className="h-6 w-16 rounded-full" />
          <AppSkeleton className="h-7 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* ── Full page loader ── */
export function AppPageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: "var(--bg)" }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
           style={{ background: "var(--primary)", color: "#0B1220", boxShadow: "var(--s-glow-green)" }}>
        S
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
               style={{ background: "var(--primary)", animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{message}</p>
    </div>
  );
}
