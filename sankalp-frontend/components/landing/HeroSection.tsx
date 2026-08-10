"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Scan, Users, Activity, Lock } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-slate-50/50">
      {/* Background Gradients & Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial-glow pointer-events-none opacity-80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-xs font-semibold text-teal-800 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Next-Generation Rural Workforce Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
          >
            Transparent AI-Powered{" "}
            <span className="gradient-text-teal">Attendance & Payroll</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed font-normal"
          >
            SANKALP eliminates proxy attendance and streamlines wage verification with face recognition, real-time analytics, and tamper-proof audit logs for government and enterprise workforces.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href={ROUTES.LOGIN}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-teal-700/25 hover:shadow-teal-700/35 transition-all duration-200 active:scale-[0.98]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold px-7 py-3.5 rounded-xl shadow-xs transition-all duration-200"
            >
              <span>Explore Features</span>
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-3"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 97%+ Proxy Elimination
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Audit Ready
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" /> End-to-End Encrypted
            </span>
          </motion.div>
        </div>

        {/* Hero Visual Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto relative rounded-2xl p-2 bg-gradient-to-b from-slate-200/60 via-slate-200/30 to-transparent shadow-2xl"
        >
          <div className="bg-slate-900 rounded-xl overflow-hidden text-white border border-slate-800 shadow-2xl">
            {/* Top Toolbar */}
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">sankalp.gov.in/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Verification Feed
              </div>
            </div>

            {/* Dashboard UI Grid Mockup */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900">
              {/* Card 1: Face Scan Demo */}
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/60 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-slate-300">AI Face Verification</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                    99.4% Match
                  </span>
                </div>

                <div className="relative aspect-video rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-700/40 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-teal-400/60 flex items-center justify-center animate-spin-slow">
                    <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Scan className="w-8 h-8 text-teal-300" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 z-20 text-[11px] font-mono text-slate-300">
                    ID: WKR-8042 • Village: Ramnagar
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Timestamp: 08:31:40 AM</span>
                  <span className="text-emerald-400 font-semibold">Verified</span>
                </div>
              </div>

              {/* Card 2: Attendance Metrics */}
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-300">Today's Attendance</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live Sync</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Verified Workers</span>
                      <span className="font-semibold text-emerald-400">1,482 / 1,500</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 w-[98.8%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Proxy Rejections</span>
                      <span className="font-semibold text-rose-400">0 Flags</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-rose-500 w-[2%]" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                    <span>Wage Disbursable</span>
                    <span className="font-bold text-white font-mono">₹4,44,600</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Audit Trail */}
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300">Audit Stream</span>
                  </div>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">
                    Immutable
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-700/40 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200">Site #104 Attendance Signed</div>
                      <div className="text-[10px] text-slate-400">Supervisor: R. Sharma</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">08:45 AM</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-700/40 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200">Wage Sheet Generated</div>
                      <div className="text-[10px] text-slate-400">Direct Benefit Transfer</div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-400">09:10 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
