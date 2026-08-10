"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar }  from "@/components/layout/Navbar";
import { useAuth }     from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
         style={{ background: "#F8F9FA" }}>
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#16A34A", opacity: 0.2 }} />
        <div className="absolute inset-2 rounded-full border-4 animate-spin" style={{ borderColor: "#16A34A", borderTopColor: "transparent" }} />
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center relative z-10">
            <img src="/logo.png" alt="SANKALP Logo" className="w-full h-full object-cover p-1" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold" style={{ color: "#1A1A2E" }}>Preparing Workspace...</p>
          <p className="text-sm font-medium" style={{ color: "#6B7280" }}>Securing your connection</p>
          <div className="flex gap-1.5 mt-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                   style={{ background: "#16A34A", animationDelay: `${i*150}ms` }} />
            ))}
          </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isSupervisor, isWorker } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed } = useAppStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (isWorker     && pathname.startsWith("/supervisor")) { router.push("/worker/dashboard"); return; }
    if (isSupervisor && pathname.startsWith("/worker"))     { router.push("/supervisor/dashboard"); return; }
  }, [isAuthenticated, isLoading, isSupervisor, isWorker, pathname, router]);

  if (isLoading)        return <LoadingScreen />;
  if (!isAuthenticated) return null;
  if (isWorker     && pathname.startsWith("/supervisor")) return <LoadingScreen />;
  if (isSupervisor && pathname.startsWith("/worker"))     return <LoadingScreen />;

  const leftOffset = sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FA" }}>
      <Sidebar />
      <Navbar />
      <main
        style={{
          marginLeft: leftOffset,
          marginTop: 60,
          transition: "margin-left 260ms cubic-bezier(0.16,1,0.3,1)",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        <div className="animate-fade-in" style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
