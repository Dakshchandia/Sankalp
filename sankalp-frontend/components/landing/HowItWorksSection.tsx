"use client";

import { motion } from "framer-motion";
import { UserPlus, ScanFace, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Worker Registration",
    description: "Supervisors register workers in under 2 minutes with basic details and a single high-resolution reference photo for facial embedding.",
  },
  {
    step: "02",
    icon: ScanFace,
    title: "Face Verification at Site",
    description: "At the start of the shift, workers scan their face using the mobile app. AI matches the scan instantly with confidence scores.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Auto-Wage & Audit Report",
    description: "Attendance data populates the dashboard automatically. Wages are computed accurately with zero room for proxy attendance.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full inline-block border border-teal-500/20">
            Simple & Transparent Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            How SANKALP Works in 3 Steps
          </h3>
          <p className="text-slate-400 text-base">
            Designed for field workers and supervisors with zero technical friction.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-8 relative flex flex-col justify-between hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-4xl font-extrabold font-mono text-teal-400/30">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h4>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center gap-2 text-xs font-semibold text-teal-400">
                  <span>Step {idx + 1} Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
