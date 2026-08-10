"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id:      string;
  label:   string;
  badge?:  number | string;
}

interface AppTabsProps {
  tabs:      Tab[];
  active:    string;
  onChange:  (id: string) => void;
  className?: string;
}

export function AppTabs({ tabs, active, onChange, className }: AppTabsProps) {
  return (
    <div
      className={cn("tabs-root w-fit", className)}
      role="tablist"
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn("tab-trigger flex items-center gap-2", active === tab.id && "active")}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
              style={
                active === tab.id
                  ? { background: "var(--primary-light)", color: "var(--primary)" }
                  : { background: "rgba(255,255,255,0.06)", color: "var(--text-3)" }
              }
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
