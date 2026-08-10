"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";
import { useLang } from "@/context/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors text-sm"
        style={{ border: "1px solid #E8EAED", color: "#374151", background: "#FFFFFF" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; }}
        title="Select language"
      >
        <Globe className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-medium">{current.native}</span>
        <ChevronDown className="w-3 h-3" style={{ color: "#9CA3AF" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-20 rounded-xl overflow-hidden animate-scale-in"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8EAED",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              width: 200,
            }}
          >
            <div className="p-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5"
                 style={{ color: "#9CA3AF" }}>
                Select Language
              </p>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code as any); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                  style={lang === l.code
                    ? { background: "#F0FDF4", color: "#16A34A" }
                    : { color: "#374151" }
                  }
                  onMouseEnter={e => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
                  onMouseLeave={e => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                >
                  <span className="text-base w-5 text-center">{l.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs">{l.native}</p>
                    <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{l.label}</p>
                  </div>
                  {lang === l.code && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#16A34A" }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
