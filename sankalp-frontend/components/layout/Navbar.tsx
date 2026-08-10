"use client";

import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, LogOut, Settings, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";

export function Navbar() {
  const { user, logoutAndRedirect } = useAuth();
  const { sidebarCollapsed } = useAppStore();
  const { t } = useLang();
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const leftOffset = sidebarCollapsed ? 72 : 240;

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center transition-all duration-300"
      style={{
        left: leftOffset,
        height: 60,
        padding: "0 20px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E8EAED",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        gap: 12,
      }}
    >
      {/* Search bar */}
      <div className="flex-1 max-w-sm relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search or type a command"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none transition-all"
          style={{
            background: "#F5F6FA",
            border: "1px solid #E8EAED",
            color: "#1A1A2E",
            fontSize: 13,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)"; }}
          onBlur={e  => { e.currentTarget.style.borderColor = "#E8EAED"; e.currentTarget.style.boxShadow = ""; }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Bell */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
          style={{ color: "#6B7280" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
        </button>

        {/* Dark mode toggle (decorative) */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: "#6B7280" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: "#E8EAED" }} />

        {/* User profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F6FA"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-none" style={{ color: "#1A1A2E" }}>
                {user?.name?.split(" ")[0] ?? "User"}
              </p>
              <p className="text-[11px] mt-0.5 capitalize" style={{ color: "#9CA3AF" }}>
                {user?.role === "supervisor" ? "Admin" : "Worker"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:block" style={{ color: "#9CA3AF" }} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-52 z-20 rounded-xl overflow-hidden animate-scale-in"
                style={{ background: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
              >
                <div className="p-3.5" style={{ borderBottom: "1px solid #E8EAED" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                         style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>{user?.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <span className="badge badge-green capitalize">{user?.role}</span>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setShowDropdown(false); logoutAndRedirect(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                    style={{ color: "#EF4444" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
