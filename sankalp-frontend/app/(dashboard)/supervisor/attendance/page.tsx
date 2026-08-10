"use client";

/**
 * Attendance Page — PHASE 4 redesign
 * The camera feed is the hero. All scanner graphics are overlaid ON TOP
 * of the camera — no separate scanner widget. Scan fires once per unique
 * face; freezes on success until the person leaves.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Square, Wifi, WifiOff, Brain, Users, UserCheck,
  Clock, AlertTriangle, Download, ClipboardCheck, Cpu,
  Database, Activity, CheckCircle2, RotateCcw,
} from "lucide-react";
import { CameraFeed, type ScannerState } from "@/components/features/attendance/CameraFeed";
import { LiveTimeline }    from "@/components/features/attendance/LiveTimeline";
import { useAttendanceSession } from "@/hooks/useAttendance";
import { useAppStore }          from "@/store/useAppStore";
import { attendanceService }    from "@/services/attendance.service";
import type { FaceRecognitionResult } from "@/types/attendance.types";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

/* ── Animated counter ── */
function Count({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const r = useRef<number>(0);
  useEffect(() => {
    const t = performance.now();
    const tick = (n: number) => {
      const p = Math.min((n - t) / 700, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) r.current = requestAnimationFrame(tick);
    };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return <>{v}</>;
}

/* ── Compact status pill ── */
function StatusPill({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl flex-1" style={{ background:`${color}0C`, border:`1px solid ${color}20` }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-black leading-none" style={{ color, letterSpacing:"-0.04em" }}><Count to={value} /></p>
        <p className="text-[11px] mt-0.5 font-semibold" style={{ color:"rgba(255,255,255,0.35)" }}>{label}</p>
      </div>
    </div>
  );
}

/* ── AI Engine status card ── */
function AIStatusCard({ isActive }: { isActive: boolean }) {
  const items = [
    { icon: Cpu,      label:"Recognition", value:"97.4%", ok:true },
    { icon: Activity, label:"Face Detect",  value: isActive ? "Active" : "Idle", ok:isActive },
    { icon: Database, label:"Database",     value:"12 ms", ok:true },
  ];
  return (
    <div className="rounded-2xl p-4" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"rgba(255,255,255,0.2)" }}>
        AI Engine
      </p>
      <div className="space-y-2">
        {items.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: s.ok ? "#22C55E" : "#64748B", boxShadow: s.ok ? "0 0 4px #22C55E" : "none" }} />
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color:"rgba(255,255,255,0.25)" }} />
              <span className="flex-1 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>{s.label}</span>
              <span className="text-[11px] font-bold font-mono" style={{ color: s.ok ? "#22C55E" : "#64748B" }}>{s.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function AttendancePage() {
  const { isSessionActive, isStarting, isEnding, startSession, endSession, processFrame } = useAttendanceSession();
  const { todayFeed, setTodayFeed } = useAppStore();

  const [lastResult,   setLastResult]   = useState<FaceRecognitionResult | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [confidence,   setConfidence]   = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  /* Freeze timer ref — reset if person leaves */
  const freezeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFrozenRef     = useRef(false);   // true = verified, don't rescan same person
  const noFaceCountRef  = useRef(0);       // consecutive captures with no result

  useEffect(() => { attendanceService.getTodayFeed().then(setTodayFeed).catch(() => {}); }, [setTodayFeed]);
  useEffect(() => { setPendingCount(todayFeed.filter(r => r.status === "pending_review").length); }, [todayFeed]);

  /* Sync with session active state */
  useEffect(() => {
    if (!isSessionActive) {
      setScannerState("idle");
      setConfidence(0);
      isFrozenRef.current = false;
      noFaceCountRef.current = 0;
      freezeTimerRef.current && clearTimeout(freezeTimerRef.current);
    } else {
      setScannerState("waiting");
    }
  }, [isSessionActive]);

  /* Core recognition handler — smart scan-once logic */
  const handleRecognition = useCallback(async (blob: Blob) => {
    /* If already verified for this person, skip */
    if (isFrozenRef.current) return;

    const result = await processFrame(blob);

    /* No result = no face detected */
    if (!result) {
      noFaceCountRef.current += 1;
      /* After 3 consecutive no-face frames (9s), unfreeze */
      if (noFaceCountRef.current >= 3 && isFrozenRef.current) {
        isFrozenRef.current = false;
        setScannerState("waiting");
        setConfidence(0);
        setLastResult(null);
        noFaceCountRef.current = 0;
      } else if (!isFrozenRef.current) {
        setScannerState("waiting");
      }
      return;
    }

    /* Face detected */
    noFaceCountRef.current = 0;
    setScannerState("scanning");

    /* Animate confidence rising */
    const target = result.confidence ?? 0;
    let step = 0;
    const steps = 12;
    const iv = setInterval(() => {
      step++;
      setConfidence(Math.round((step / steps) * target));
      if (step >= steps) clearInterval(iv);
    }, 80);

    setLastResult(result);

    /* Final state */
    const finalState: ScannerState = result.success ? "success" : result.requiresReview ? "review" : "failure";

    setTimeout(() => {
      setScannerState(finalState);
      setConfidence(target);
      if (result.success || result.requiresReview) {
        isFrozenRef.current = true;   /* Freeze — don't scan this person again */
      } else {
        /* Failed — allow retry after 4s */
        freezeTimerRef.current = setTimeout(() => {
          setScannerState("waiting");
          setConfidence(0);
        }, 4000);
      }
    }, 1500);
  }, [processFrame]);

  /* Stats */
  const present = todayFeed.filter(r => r.status === "present").length;
  const late    = todayFeed.filter(r => r.status === "late").length;
  const pending = todayFeed.filter(r => r.status === "pending_review").length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── SESSION HEADER ── */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#071A0D 0%,#0C2518 50%,#081525 100%)",
                    border:"1px solid rgba(34,197,94,0.15)", boxShadow:"0 8px 40px rgba(0,0,0,0.4)" }}>
        <div className="absolute pointer-events-none w-64 h-64 rounded-full"
             style={{ top:-64, left:-32, background:"radial-gradient(circle,rgba(34,197,94,0.1) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-4 h-4" style={{ color:"#22C55E" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(34,197,94,0.7)" }}>
                AI Biometric Attendance
              </span>
            </div>
            <h1 className="font-black text-white leading-tight"
                style={{ fontSize:"clamp(1.2rem,2.5vw,1.6rem)", letterSpacing:"-0.035em" }}>
              Attendance Session
            </h1>
            <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
              Face-verified attendance · Scan-once per worker
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={isSessionActive ? { scale:[1,1.02,1] } : {}}
              transition={{ duration:2, repeat:Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={isSessionActive
                ? { background:"rgba(34,197,94,0.12)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.25)" }
                : { background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)" }}
            >
              {isSessionActive
                ? <><span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />Session Active</>
                : <><span className="w-2 h-2 rounded-full" style={{ background:"rgba(255,255,255,0.3)" }} />Inactive</>}
            </motion.div>
            {isSessionActive ? (
              <button onClick={endSession} disabled={isEnding}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      style={{ background:"rgba(239,68,68,0.15)", color:"#EF4444", border:"1px solid rgba(239,68,68,0.25)" }}>
                <Square className="w-4 h-4" />
                {isEnding ? "Ending…" : "End Session"}
              </button>
            ) : (
              <button onClick={startSession} disabled={isStarting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      style={{ background:"#22C55E", color:"#071A0D", boxShadow:"0 4px 16px rgba(34,197,94,0.35)" }}>
                <Play className="w-4 h-4" />
                {isStarting ? "Starting…" : "Start Session"}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── ACTION BAR ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isSessionActive
            ? <><Wifi className="w-4 h-4" style={{ color:"#22C55E" }} /><span className="text-sm font-semibold" style={{ color:"#22C55E" }}>AI Recognition Active</span></>
            : <><WifiOff className="w-4 h-4" style={{ color:"rgba(255,255,255,0.25)" }} /><span className="text-sm" style={{ color:"rgba(255,255,255,0.25)" }}>Session inactive</span></>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rescan button — allows forcing a new scan */}
          {isSessionActive && isFrozenRef.current && (
            <button
              onClick={() => { isFrozenRef.current = false; setScannerState("waiting"); setConfidence(0); setLastResult(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background:"rgba(34,197,94,0.08)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.2)" }}>
              <RotateCcw className="w-3.5 h-3.5" /> Rescan
            </button>
          )}
          {[
            { label:"Manual Entry",   icon:ClipboardCheck, href:ROUTES.SUPERVISOR.MANUAL_REVIEW, badge:pendingCount },
            { label:"Analytics",      icon:Brain,           href:ROUTES.SUPERVISOR.ANALYTICS },
            { label:"Export CSV",     icon:Download,        href:ROUTES.SUPERVISOR.REPORTS },
          ].map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.08)"; (e.currentTarget as HTMLAnchorElement).style.color="#F8FAFC"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,0.55)"; }}>
                <Icon className="w-3.5 h-3.5" />
                {a.label}
                {a.badge !== undefined && a.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                        style={{ background:"#F59E0B", color:"#0B1220" }}>
                    {a.badge! > 9 ? "9+" : a.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

        {/* ── CAMERA (hero — overlays rendered inside) ── */}
        <div className="rounded-3xl overflow-hidden flex flex-col"
             style={{
               background:"#060C14",
               border:`1px solid ${isSessionActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
               boxShadow: isSessionActive ? "0 0 32px rgba(34,197,94,0.08)" : "none",
               transition:"border-color 500ms, box-shadow 500ms",
             }}>

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5"
               style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                   style={{ background: isSessionActive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)" }}>
                <Cpu className="w-3.5 h-3.5" style={{ color: isSessionActive ? "#22C55E" : "rgba(255,255,255,0.3)" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Biometric Terminal</p>
                <p className="text-[11px]" style={{ color:"rgba(255,255,255,0.35)" }}>
                  {isSessionActive ? "Face detection active · Scan-once mode" : "Session paused · No scanning"}
                </p>
              </div>
            </div>
            {isSessionActive && (
              <motion.span
                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background:"rgba(34,197,94,0.1)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.2)" }}
                animate={{ opacity:[1,0.6,1] }} transition={{ duration:1.5, repeat:Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />REC
              </motion.span>
            )}
          </div>

          {/* Camera with overlay — this is the hero */}
          <div className="flex-1 p-3">
            <CameraFeed
              isActive={isSessionActive}
              onCapture={handleRecognition}
              captureIntervalMs={3000}
              scannerState={scannerState}
              confidence={confidence}
              lastResult={lastResult}
            />
          </div>

          {/* Idle instructions */}
          <AnimatePresence>
            {!isSessionActive && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                          exit={{ opacity:0, height:0 }} className="px-5 pb-5 overflow-hidden">
                <div className="rounded-2xl p-4"
                     style={{ background:"rgba(34,197,94,0.04)", border:"1px solid rgba(34,197,94,0.1)" }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color:"rgba(34,197,94,0.6)" }}>
                    How It Works
                  </p>
                  <ol className="space-y-2">
                    {[
                      "Press Start Session — camera activates automatically",
                      "Worker stands 30–60 cm from camera, face clearly visible",
                      "AI scans once per person — no continuous loops",
                      "97%+ confidence marks attendance instantly",
                      "Low confidence sends to Manual Review queue",
                    ].map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                              style={{ background:"rgba(34,197,94,0.15)", color:"#22C55E" }}>{i+1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col gap-4">
          {/* AI Engine health */}
          <AIStatusCard isActive={isSessionActive} />

          {/* Current verification status */}
          <div className="rounded-2xl p-4" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"rgba(255,255,255,0.2)" }}>
              Verification Status
            </p>
            <AnimatePresence mode="wait">
              <motion.div key={scannerState}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:0.25 }}>
                {scannerState === "idle" && (
                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>Session not started</p>
                )}
                {scannerState === "waiting" && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full"
                          style={{ background:"rgba(255,255,255,0.3)" }}
                          animate={{ opacity:[0.3,0.8,0.3] }}
                          transition={{ duration:1.2, delay:i*0.2, repeat:Infinity }} />
                      ))}
                    </div>
                    <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)" }}>Waiting for face…</p>
                  </div>
                )}
                {scannerState === "scanning" && (
                  <div>
                    <p className="text-sm font-semibold" style={{ color:"#22C55E" }}>Scanning…</p>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full" style={{ background:"#22C55E" }}
                        animate={{ width:["0%","100%"] }} transition={{ duration:1.4, ease:"linear" }} />
                    </div>
                    <p className="text-xs mt-1.5 font-mono" style={{ color:"rgba(34,197,94,0.6)" }}>
                      {confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                )}
                {scannerState === "success" && lastResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" style={{ color:"#22C55E" }} />
                      <span className="text-sm font-bold" style={{ color:"#22C55E" }}>Verified</span>
                    </div>
                    <p className="font-bold text-white">{lastResult.workerName}</p>
                    <p className="text-xs font-mono" style={{ color:"rgba(255,255,255,0.4)" }}>
                      {lastResult.confidence?.toFixed(1)}% · Attendance Marked
                    </p>
                    <p className="text-[11px] mt-1" style={{ color:"rgba(255,255,255,0.3)" }}>
                      Scanner frozen — waiting for next person
                    </p>
                  </div>
                )}
                {scannerState === "review" && lastResult && (
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold" style={{ color:"#F59E0B" }}>Sent for Review</p>
                    <p className="text-sm text-white">{lastResult.workerName}</p>
                    <p className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                      {lastResult.confidence?.toFixed(1)}% — below threshold
                    </p>
                  </div>
                )}
                {scannerState === "failure" && (
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold" style={{ color:"#EF4444" }}>Not Recognized</p>
                    <p className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>
                      Face not found in registry
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Live timeline — compact */}
          <div className="flex-1 rounded-2xl overflow-hidden" style={{ minHeight:240, background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.2)" }}>
                Recent
              </p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:"rgba(34,197,94,0.1)", color:"#22C55E" }}>
                {todayFeed.length} today
              </span>
            </div>
            <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight:240 }}>
              {todayFeed.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>No records yet</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                  {todayFeed.slice(0, 8).map((r, i) => {
                    const dotColor = r.status==="present" ? "#22C55E" : r.status==="late" ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={r.id} className="flex items-center gap-2.5 px-4 py-2.5"
                           style={{ animationDelay:`${i*30}ms` }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                             style={{ background:"linear-gradient(135deg,#22C55E,#06B6D4)", color:"#0A0F1C" }}>
                          {r.workerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{r.workerName}</p>
                          <p className="text-[10px] font-mono" style={{ color:"rgba(255,255,255,0.3)" }}>
                            {new Date(r.time).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                          </p>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background:dotColor, boxShadow:`0 0 4px ${dotColor}` }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL TIMELINE ── */}
      <div style={{ height:300 }}>
        <LiveTimeline records={todayFeed} />
      </div>
    </div>
  );
}
