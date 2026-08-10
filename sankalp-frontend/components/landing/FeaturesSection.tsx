"use client";

import { motion } from "framer-motion";
import { Camera, Users, BarChart3, IndianRupee, FileText, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Face-Verified Attendance",
    desc: "Workers verify attendance with facial recognition — not a thumb print or signature. Each capture generates an automated confidence match score.",
    badge: "AI Powered",
    colSpan: "md:col-span-2",
  },
  {
    icon: Users,
    title: "Unified Registry",
    desc: "Centralized profiles across villages and departments. Enrollment takes under 2 minutes per worker.",
    badge: "Speed",
    colSpan: "md:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Automated Analytics",
    desc: "Rule-based insights surface anomalies and attendance patterns automatically — eliminating manual spreadsheet calculations.",
    badge: "Real-time",
    colSpan: "md:col-span-1",
  },
  {
    icon: IndianRupee,
    title: "Wage Transparency",
    desc: "Wages calculated directly from verified attendance logs. Every single rupee is 100% traceable to confirmed attendance.",
    badge: "Zero Leakage",
    colSpan: "md:col-span-2",
  },
  {
    icon: FileText,
    title: "Compliance Reports",
    desc: "One-click CSV/PDF exports formatted strictly according to government and departmental audit standards.",
    badge: "One Click",
    colSpan: "md:col-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Tamper-Proof Audit Trail",
    desc: "Every approval, override, and wage calculation is permanently logged with supervisor IDs and micro-timestamps.",
    badge: "Immutable",
    colSpan: "md:col-span-2",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full inline-block border border-teal-200/60">
            Platform Capabilities
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Integrity & Maximum Efficiency
          </h3>
          <p className="text-slate-600 text-base">
            Replace vulnerable legacy registers with end-to-end facial verification, transparent payroll, and automated reporting.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${item.colSpan}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/70 px-2.5 py-1 rounded-full border border-teal-200/60">
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {item.title}
                </h4>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.desc}
                </p>

                {/* Subtle Hover Glow Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-teal-500/0 group-hover:border-teal-500/20 transition-all duration-300 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
