"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, HardHat, Check } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"supervisor" | "worker" | null>(null);

  const handleContinue = (authMode: "sign-in" | "sign-up") => {
    if (selectedRole) {
      localStorage.setItem("selectedRole", selectedRole);
      router.push(`/${authMode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1F13] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#0A1F13] rounded-[24px] shadow-2xl border border-white/10 overflow-hidden relative p-8"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Select Role</h2>
        <p className="text-sm text-slate-400 mb-8">Who is logging in?</p>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setSelectedRole("supervisor")}
            className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              selectedRole === "supervisor"
                ? "bg-emerald-500/10 border-emerald-500 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              selectedRole === "supervisor" ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-400"
            }`}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Manager</h3>
              <p className="text-xs text-slate-400">Administrators & Supervisors</p>
            </div>
            {selectedRole === "supervisor" && (
              <Check className="w-5 h-5 text-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setSelectedRole("worker")}
            className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
              selectedRole === "worker"
                ? "bg-amber-500/10 border-amber-500 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              selectedRole === "worker" ? "bg-amber-500 text-white" : "bg-white/5 text-slate-400"
            }`}>
              <HardHat className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Worker</h3>
              <p className="text-xs text-slate-400">Field Operations & Labor</p>
            </div>
            {selectedRole === "worker" && (
              <Check className="w-5 h-5 text-amber-400" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleContinue("sign-up")}
            disabled={!selectedRole}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
              selectedRole 
                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            }`}
          >
            Continue to Sign Up
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-slate-500">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <button
            onClick={() => handleContinue("sign-in")}
            disabled={!selectedRole}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
              selectedRole 
                ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" 
                : "bg-transparent text-slate-500 cursor-not-allowed border border-white/5"
            }`}
          >
            Log In to Existing Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
