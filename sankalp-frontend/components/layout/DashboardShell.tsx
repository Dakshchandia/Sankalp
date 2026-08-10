"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar }  from "@/components/layout/Navbar";
import { useAuth }     from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

/* ── Full-page loading splash ── */
function LoadingSplash() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(135deg,#080E1A 0%,#0A1220 50%,#07101C 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400, height: 400,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(ellipse at center,rgba(34,197,94,0.08) 0%,transparent 70%)",
        }}
      />

      {/* Logo */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl relative z-10"
          style={{
            background: "linear-gradient(135deg,#22C55E 0%,#16A34A 100%)",
            color: "#080E1A",
            boxShadow: "0 0 0 1px rgba(34,197,94,0.3), 0 8px 32px rgba(34,197,94,0.35)",
          }}
        >
          S
        </div>
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "rgba(34,197,94,0.15)",
            animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
      </div>

      {/* Brand */}
      <div className="text-center">
        <p className="font-black text-white tracking-tight" style={{ fontSize: 20 }}>SANKALP</p>
        <p className="text-xs mt-1 font-semibold" style={{ color: "rgba(34,197,94,0.6)" }}>
          AI Workforce Platform
        </p>
      </div>

      {/* Dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "#22C55E",
              opacity: 0.8,
              animation: `bounce 1s infinite ${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Shell ── */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { sidebarCollapsed } = useAppStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading)        return <LoadingSplash />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg)" }}>

      {/* Layered background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: sidebarCollapsed ? 72 : 272,
            width: 600, height: 600,
            background: "radial-gradient(ellipse at 20% 10%, rgba(34,197,94,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0, right: 0,
            width: 500, height: 500,
            background: "radial-gradient(ellipse at 80% 90%, rgba(6,182,212,0.03) 0%, transparent 60%)",
          }}
        />
        {/* Subtle noise */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.015,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
          }}
        />
      </div>

      {/* Shell */}
      <Sidebar />
      <Navbar />

      {/* Content */}
      <main
        className="relative min-h-screen"
        style={{
          transition: "padding-left 280ms cubic-bezier(0.16,1,0.3,1)",
          paddingLeft: sidebarCollapsed ? 72 : 272,
          paddingTop: 68,
        }}
      >
        <div
          className="animate-fade-in"
          style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 28px 48px" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
