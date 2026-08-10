"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, TrendingUp, Users, Shield, Award } from "lucide-react";

const stats = [
  { value: "10,000+", label: "Workers Registered", icon: Users },
  { value: "5 Lakh+", label: "Attendance Logs", icon: TrendingUp },
  { value: "~97%", label: "Proxy Eliminated", icon: Shield },
  { value: "500+", label: "Villages Covered", icon: Award },
];

const comparison = [
  { aspect: "Attendance Verification", traditional: "Paper Register / Thumb Sign", sankalp: "AI Face Recognition" },
  { aspect: "Proxy Risk", traditional: "High (Easy Manipulation)", sankalp: "Eliminated at Source" },
  { aspect: "Wage Dispute Resolution", traditional: "Verbal / Hard to prove", sankalp: "Photo + Timestamp Audit Trail" },
  { aspect: "Payroll Compilation", traditional: "Manual Spreadsheets (Days)", sankalp: "Instant One-Click Export" },
  { aspect: "Audit Trail", traditional: "Easily Altered / Missing", sankalp: "Immutable Log with Supervisor IDs" },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {st.value}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                  {st.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full inline-block border border-teal-200/60">
            Why Upgrade?
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Traditional Methods vs SANKALP
          </h3>
          <p className="text-slate-600 text-base">
            See how SANKALP transforms government workforce operations into a transparent, fraud-free ecosystem.
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-12 bg-slate-900 text-white px-6 py-4 font-semibold text-sm">
            <div className="col-span-4">Operation Aspect</div>
            <div className="col-span-4 text-slate-400">Traditional System</div>
            <div className="col-span-4 text-emerald-400 flex items-center gap-1.5">
              <span>SANKALP Platform</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {comparison.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-6 py-4 items-center text-sm hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-4 font-semibold text-slate-800">
                  {row.aspect}
                </div>

                <div className="col-span-4 text-slate-500 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{row.traditional}</span>
                </div>

                <div className="col-span-4 font-medium text-teal-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{row.sankalp}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
