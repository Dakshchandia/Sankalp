"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
  className?:   string;
}

export function SearchBar({ value, onChange, placeholder = "Search…", className = "" }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:"var(--text-2)" }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
        style={{ background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.08)", color:"var(--text)" }}
        onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(34,197,94,0.4)"}
        onBlur={e  => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"}
      />
      {value && (
        <button onClick={() => onChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-colors"
                style={{ color:"var(--text-2)" }}
                aria-label="Clear search">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
