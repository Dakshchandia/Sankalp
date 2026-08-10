"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Activity, Globe } from "lucide-react";

const SPLASH_DURATION = 10000;
const LOGO_SIZE = 150;

interface FlowLine {
  id: number;
  top: string;
  width: number;
}

function FlowingLines() {
  const [lines, setLines] = useState<FlowLine[]>([]);

  const spawn = useCallback(() => {
    const positions = ["4%", "8%", "12%"];
    setLines((prev) =>
      [
        ...prev,
        {
          id: Date.now() + Math.random(),
          top: positions[Math.floor(Math.random() * positions.length)],
          width: 60 + Math.random() * 100,
        },
      ].slice(-4)
    );
  }, []);

  useEffect(() => {
    spawn();
    const interval = setInterval(spawn, 900);
    return () => clearInterval(interval);
  }, [spawn]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[30vh] overflow-hidden">
      <AnimatePresence>
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.7, 0] }}
            transition={{ duration: 2 }}
            className="absolute left-1/2 h-px origin-center -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent"
            style={{ top: line.top, width: line.width }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const [showTagline, setShowTagline] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  // Text is now visible instantly.

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / SPLASH_DURATION) * 100, 100));
    }, 50);
    const timeout = setTimeout(() => {
      onComplete();
    }, SPLASH_DURATION);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0A1F13] font-sans">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-emerald-900/20" />
      <FlowingLines />

      {/* Glow — fixed behind logo area, never moves */}
      <div className="pointer-events-none absolute left-1/2 top-[22vh] z-0 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-52 w-52 rounded-full bg-emerald-500/30 blur-3xl"
        />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[22vh] z-0 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="h-36 w-36 rounded-full bg-amber-500/20 blur-2xl"
        />
      </div>

      {/* Logo — pinned position */}
      <div 
        className="absolute left-1/2 top-[14vh] z-20 -translate-x-1/2"
        style={{ width: LOGO_SIZE + 40, height: LOGO_SIZE + 40 }}
      >
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0 }}
          className="w-full h-full relative"
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${LOGO_SIZE + 40} ${LOGO_SIZE + 40}`}
          >
            <motion.circle
              cx={(LOGO_SIZE + 40) / 2}
              cy={(LOGO_SIZE + 40) / 2}
              r={LOGO_SIZE / 2 + 14}
              fill="none"
              stroke="rgba(16,185,129,0.6)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.circle
              cx={(LOGO_SIZE + 40) / 2}
              cy={(LOGO_SIZE + 40) / 2}
              r={LOGO_SIZE / 2 + 6}
              fill="none"
              stroke="rgba(16,185,129,0.9)"
              strokeWidth="2"
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.8] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5 }}
            />
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 30px 10px rgba(16,185,129,0.3), 0 0 60px 25px rgba(16,185,129,0.15)",
                  "0 0 45px 15px rgba(16,185,129,0.6), 0 0 90px 35px rgba(16,185,129,0.3)",
                  "0 0 30px 10px rgba(16,185,129,0.3), 0 0 60px 25px rgba(16,185,129,0.15)",
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full flex items-center justify-center overflow-hidden bg-white"
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            >
              <img src="/logo.png" alt="SANKALP Logo" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* SANKALP — pinned position */}
      <div className="absolute left-1/2 top-[42vh] z-20 w-full -translate-x-1/2 px-6 text-center">
        <motion.h1
          animate={
            showTitle
              ? {
                  opacity: 1,
                  textShadow: [
                    "0 0 20px rgba(16,185,129,0.3)",
                    "0 0 40px rgba(16,185,129,0.7)",
                    "0 0 20px rgba(16,185,129,0.3)",
                  ],
                }
              : { opacity: 0 }
          }
          transition={{
            opacity: { duration: 0.9 },
            textShadow: { duration: 1.4, repeat: Infinity },
          }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          SANKALP
        </motion.h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <motion.div
            animate={
              showTitle
                ? { scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }
                : { scaleX: 0, opacity: 0 }
            }
            transition={{ duration: 2.5, repeat: Infinity }}
            className="h-px w-12 origin-center bg-gradient-to-r from-transparent to-emerald-400 sm:w-16"
          />
          <motion.div
            animate={showTitle ? { scale: [0.8, 1.2, 0.8] } : { scale: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-amber-400"
          />
          <motion.div
            animate={
              showTitle
                ? { scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }
                : { scaleX: 0, opacity: 0 }
            }
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
            className="h-px w-12 origin-center bg-gradient-to-l from-transparent to-emerald-400 sm:w-16"
          />
        </div>
      </div>

      {/* Bottom text — pinned box, fixed height, opacity fade only */}
      <div className="absolute bottom-[68px] left-0 right-0 z-10 h-[30vh] px-6 text-center">
        <motion.p
          animate={{ opacity: showTagline ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 sm:text-sm"
        >
          The New Standard in Workforce Management
        </motion.p>

        <motion.div
          animate={{ opacity: showDescription ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-3 max-w-sm space-y-3 sm:max-w-md"
        >
          <motion.div
            animate={
              showDescription
                ? { scaleX: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] }
                : {}
            }
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto h-px w-36 origin-center bg-gradient-to-r from-transparent via-white/40 to-transparent sm:w-48"
          />
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Seamlessly manage rural workforce attendance, verification, and wages with an enterprise-grade platform.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: ShieldCheck, label: "Tamper-Proof" },
              { icon: Activity, label: "Real-Time Insights" },
              { icon: Globe, label: "Cloud-Native" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-100 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress bar — pinned bottom */}
      <div className="absolute bottom-4 left-1/2 z-20 w-full max-w-xs -translate-x-1/2 px-6">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={onComplete}
          className="mt-3 w-full text-center text-sm text-slate-400 transition-colors hover:text-white"
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}
