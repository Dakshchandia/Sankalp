"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does face verification handle outdoor lighting or low connectivity?",
    a: "SANKALP features on-device local face vector matching for offline field sites. Verification logs sync automatically once internet connectivity is restored.",
  },
  {
    q: "Is worker facial data encrypted and compliant with government privacy norms?",
    a: "Yes. Raw images are never saved permanently on devices. Facial feature vectors are encrypted using AES-256 standards with strict role-based data access.",
  },
  {
    q: "What happens if a worker's match confidence score is low?",
    a: "Attenances with low confidence match scores are automatically flagged for supervisor manual review with photo side-by-side verification.",
  },
  {
    q: "How are wages calculated and exported?",
    a: "Wages are computed directly from verified daily attendance timestamps and pre-configured wage rates. You can export ready-to-process CSV/PDF payroll sheets in one click.",
  },
  {
    q: "Can supervisors edit attendance logs after submission?",
    a: "Any edit or manual override requires a reason code and creates an immutable audit entry with timestamp and supervisor ID, ensuring total transparency.",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full inline-block border border-teal-200/60">
            Frequently Asked Questions
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Know
          </h3>
          <p className="text-slate-600 text-base">
            Common questions regarding security, deployment, and daily operation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-xl overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-slate-900 text-base flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-teal-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-teal-600" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
