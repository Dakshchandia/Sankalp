import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#F8F9FA" }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[44%] relative flex-col justify-between p-12"
           style={{ background: "#16A34A" }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
              <img src="/logo.png" alt="Sankalp Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-none">SANKALP</p>
              <p className="text-xs mt-0.5 text-green-200">AI Workforce Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered<br />Workforce<br />Management
          </h2>
          <p className="text-green-100 text-base leading-relaxed max-w-xs">
            Biometric attendance, transparent wage management, and complete audit trails for government employment schemes.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-10">
            {[
              { value: "97.4%", label: "Recognition Accuracy" },
              { value: "< 1s",  label: "Verification Speed" },
              { value: "10K+",  label: "Workers Managed" },
              { value: "500+",  label: "Sites Covered" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.15)" }}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-green-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-green-300">
          Government of India · MGNREGA · Digital India
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white p-1">
              <img src="/logo.png" alt="Sankalp Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg" style={{ color: "#111827" }}>SANKALP</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
