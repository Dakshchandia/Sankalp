"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, AppWindow, CreditCard,
  Users, Briefcase, FolderKanban, ClipboardCheck,
  MessageSquare, CalendarDays, Settings, HelpCircle,
  LogOut, ChevronRight, Camera, FolderOpen, CalendarClock,
  ScrollText, FileText, History, User, Wallet, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { useLang } from "@/context/LanguageContext";

const supervisorNav = {
  main: [
    { label: "Dashboard",          href: "/supervisor/dashboard",       icon: LayoutDashboard },
    { label: "Analytics",          href: "/supervisor/analytics",       icon: BarChart3 },
    { label: "Workers",            href: "/supervisor/workers",         icon: Users },
    { label: "Manual Review",      href: "/supervisor/manual-review",   icon: ClipboardList },
    { label: "Leave Applications", href: "/supervisor/leave-requests",  icon: CalendarClock },
    { label: "Document Review",    href: "/supervisor/document-review", icon: FolderOpen },
    { label: "Reports",            href: "/supervisor/reports",         icon: FileText },
    { label: "Audit Logs",         href: "/supervisor/audit-logs",      icon: ScrollText },
  ],
  others: [
    { label: "Settings",  href: "/supervisor/settings", icon: Settings },
  ],
};

const workerNav = {
  main: [
    { label: "Dashboard",       href: "/worker/dashboard",          icon: LayoutDashboard },
    { label: "My Attendance",   href: "/worker/attendance-history", icon: History },
    { label: "Face Attendance", href: "/worker/face-attendance",    icon: Camera },
    { label: "My Profile",      href: "/worker/profile",            icon: User },
    { label: "Apply for Leave", href: "/worker/leave",              icon: CalendarClock },
    { label: "My Documents",    href: "/worker/documents",          icon: FolderOpen },
    { label: "Expected Wage",   href: "/worker/expected-wage",      icon: Wallet },
  ],
  others: [
    { label: "Settings", href: "/worker/settings", icon: Settings },
  ],
};

function NavItem({ item, isActive, collapsed }: {
  item: { label: string; href: string; icon: React.ElementType; badge?: number };
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
        collapsed && "justify-center px-0 py-2.5 mx-auto w-10 h-10",
        isActive ? "text-white" : "text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]"
      )}
      style={isActive
        ? { background: "#22C55E", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" }
        : {}
      }
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "")} />
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: isActive ? "rgba(255,255,255,0.25)" : "#FEF3C7", color: isActive ? "#fff" : "#92400E" }}>
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logoutAndRedirect, isSupervisor } = useAuth();
  const { sidebarCollapsed, toggleSidebar, pendingReviewCount } = useAppStore();
  const { t } = useLang();

  // Translated nav items
  const supervisorNavT = [
    { label: t("dashboard"),           href: "/supervisor/dashboard",       icon: LayoutDashboard },
    { label: t("workers"),             href: "/supervisor/workers",         icon: Users },
    { label: t("manual_review"),       href: "/supervisor/manual-review",   icon: ClipboardCheck },
    { label: t("leave_applications"),  href: "/supervisor/leave-requests",  icon: CalendarClock },
    { label: t("document_review"),     href: "/supervisor/document-review", icon: FolderOpen },
    { label: t("analytics"),           href: "/supervisor/analytics",       icon: BarChart3 },
    { label: t("reports"),             href: "/supervisor/reports",         icon: FileText },
    { label: t("audit_logs"),          href: "/supervisor/audit-logs",      icon: ScrollText },
    { label: t("settings"),            href: "/supervisor/settings",        icon: Settings },
  ];

  const workerNavT = [
    { label: t("dashboard"),       href: "/worker/dashboard",          icon: LayoutDashboard },
    { label: t("my_attendance"),   href: "/worker/attendance-history", icon: History },
    { label: t("face_attendance"), href: "/worker/face-attendance",    icon: Camera },
    { label: t("my_profile"),      href: "/worker/profile",            icon: User },
    { label: t("apply_leave"),     href: "/worker/leave",              icon: CalendarClock },
    { label: t("my_documents"),    href: "/worker/documents",          icon: FolderOpen },
    { label: t("expected_wage"),   href: "/worker/expected-wage",      icon: Wallet },
    { label: t("settings"),        href: "/worker/settings",           icon: Settings },
  ];

  const nav = isSupervisor
    ? { main: supervisorNavT.slice(0, 8), others: supervisorNavT.slice(8) }
    : { main: workerNavT.slice(0, 7),     others: workerNavT.slice(7) };
  const W = sidebarCollapsed ? 72 : 240;

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: W,
        transition: "width 260ms cubic-bezier(0.16,1,0.3,1)",
        background: "#FFFFFF",
        borderRight: "1px solid #E8EAED",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0"
           style={{ height: 60, padding: "0 16px", borderBottom: "1px solid #E8EAED" }}>
        <div className="w-8 h-8 flex-shrink-0">
          <img src="/logo.png" alt="Sankalp Logo" className="w-full h-full object-contain" />
        </div>
      {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: "#1A1A2E" }}>SANKALP</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>AI Workforce Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin" style={{ padding: sidebarCollapsed ? "12px 8px" : "12px 12px" }}>

        {!sidebarCollapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
             style={{ color: "#9CA3AF" }}>
            {isSupervisor ? t("supervisor_label") : t("worker_label")}
          </p>
        )}
        <div className="space-y-0.5">
          {nav.main.map(item => (
            <NavItem
              key={item.href}
              item={{
                ...item,
                badge: item.href.includes("manual-review") ? pendingReviewCount : undefined,
              }}
              isActive={pathname.startsWith(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Others section */}
        <div className="mt-4">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
               style={{ color: "#9CA3AF" }}>{t("others_label")}</p>
          )}
          <div className="space-y-0.5">
            {nav.others.map(item => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname.startsWith(item.href)}
                collapsed={sidebarCollapsed}
              />
            ))}
            <button
              onClick={logoutAndRedirect}
              title={sidebarCollapsed ? "Logout" : undefined}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]",
                sidebarCollapsed && "justify-center px-0 py-2.5 mx-auto w-10 h-10"
              )}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{t("logout")}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* User info at bottom */}
      {!sidebarCollapsed && user && (
        <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid #E8EAED" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background: "#22C55E" }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-none" style={{ color: "#1A1A2E" }}>{user.name}</p>
              <p className="text-[10px] mt-0.5 capitalize" style={{ color: "#9CA3AF" }}>{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute flex items-center justify-center rounded-full transition-all duration-150"
        style={{
          width: 22, height: 22,
          right: -11, top: 76,
          background: "#FFFFFF",
          border: "1.5px solid #E8EAED",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          color: "#9CA3AF",
          zIndex: 10,
        }}
        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor="#22C55E"; b.style.color="#22C55E"; }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor="#E8EAED"; b.style.color="#9CA3AF"; }}
      >
        <ChevronRight className={cn("w-3 h-3 transition-transform", !sidebarCollapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
