"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSearchBarProps {
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  className?:  string;
  shortcut?:   string;
}

export function AppSearchBar({ value, onChange, placeholder = "Search…", className, shortcut }: AppSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "var(--text-3)" }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
        style={{ borderRadius: "var(--r-lg)" }}
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-colors"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"}
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcut ? (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none"
          style={{ background: "var(--surface-3)", color: "var(--text-3)", border: "1px solid var(--border)" }}
        >
          {shortcut}
        </span>
      ) : null}
    </div>
  );
}
