"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string; positive?: boolean };
  accent?: string;
  className?: string;
  sparkData?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64, h = 28;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="flex-shrink-0">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  );
}

function AnimatedNumber({ value }: { value: string | number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const num =
      typeof value === "number"
        ? value
        : parseFloat(String(value).replace(/[^0-9.]/g, ""));

    if (isNaN(num) || typeof value === "string") {
      setDisplay(value);
      return;
    }

    let rafId: number;
    const duration = 700;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * num));
      if (progress < 1) rafId = requestAnimationFrame((ts) => step(ts, startTime));
    };
    rafId = requestAnimationFrame((ts) => step(ts, ts));
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <>{display}</>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  accent,
  className,
  sparkData,
}: StatCardProps) {
  const accentColor  = accent    ?? "var(--primary)";
  const _iconBg      = iconBg    ?? "rgba(15,118,110,0.08)";
  const _iconColor   = iconColor ?? "var(--primary)";

  return (
    <div
      className={cn("kpi-card", className)}
      style={{ borderRadius: "var(--r-xl)" }}
    >
      {/* Top row: icon + sparkline */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: _iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: _iconColor }} />
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={_iconColor} />
        )}
      </div>

      {/* Value */}
      <p
        className="text-3xl font-bold tracking-tight leading-none mb-1 animate-count-up"
        style={{ color: "var(--text)" }}
      >
        <AnimatedNumber value={value} />
      </p>

      {/* Title */}
      <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{title}</p>

      {/* Subtitle / trend */}
      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-1.5">
          {trend && (
            <span
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: (trend.positive ?? true) ? "var(--success)" : "var(--danger)" }}
            >
              {(trend.positive ?? true)
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {(subtitle || trend?.label) && (
            <span className="text-xs" style={{ color: "var(--text-2)" }}>
              {subtitle ?? trend?.label}
            </span>
          )}
        </div>
      )}

      {/* Accent bottom bar */}
      <div className="mt-3 h-0.5 rounded-full" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-0.5 rounded-full w-3/4"
          style={{ background: accentColor, opacity: 0.35 }}
        />
      </div>
    </div>
  );
}
