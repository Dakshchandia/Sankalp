"use client";

/**
 * BiometricScanner — layered SVG + CSS + Framer Motion scanner
 * All sub-rings, scan lines, HUD brackets, confidence arc, and
 * success / failure states are independently animated so they
 * respond to real face-detection events.
 */

import { useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

/* ── Types ── */
export type ScannerState = "idle" | "scanning" | "detected" | "success" | "failure" | "review" | "loading";

interface BiometricScannerProps {
  state:      ScannerState;
  confidence: number;       // 0-100
  workerName?: string;
  size?:       number;
}

/* ── Color map ── */
const COLOR: Record<ScannerState, { primary: string; glow: string; ring: string }> = {
  idle:     { primary: "#334155", glow: "rgba(51,65,85,0.3)",     ring: "#1E293B" },
  loading:  { primary: "#06B6D4", glow: "rgba(6,182,212,0.25)",   ring: "#0E7490" },
  scanning: { primary: "#22C55E", glow: "rgba(34,197,94,0.3)",    ring: "#16A34A" },
  detected: { primary: "#22C55E", glow: "rgba(34,197,94,0.4)",    ring: "#22C55E" },
  success:  { primary: "#22C55E", glow: "rgba(34,197,94,0.6)",    ring: "#22C55E" },
  failure:  { primary: "#EF4444", glow: "rgba(239,68,68,0.5)",    ring: "#EF4444" },
  review:   { primary: "#F59E0B", glow: "rgba(245,158,11,0.45)",  ring: "#F59E0B" },
};

/* ── Segmented outer arc ── */
function SegmentedArc({ r, count = 24, gap = 6, color, opacity = 0.5, strokeWidth = 2 }:
  { r: number; count?: number; gap?: number; color: string; opacity?: number; strokeWidth?: number }) {
  const circumference = 2 * Math.PI * r;
  const segLen = (circumference - count * gap) / count;
  return (
    <circle
      cx="0" cy="0" r={r} fill="none"
      stroke={color} strokeWidth={strokeWidth} opacity={opacity}
      strokeDasharray={`${segLen} ${gap}`}
      strokeLinecap="round"
    />
  );
}

/* ── HUD corner brackets ── */
function HUDCorners({ size, color }: { size: number; color: string }) {
  const s = size / 2;
  const arm = size * 0.14;
  const corners = [
    [[-s, -s], [arm, 0], [0, arm]],
    [[ s, -s], [-arm, 0],[0, arm]],
    [[ s,  s], [-arm, 0],[0, -arm]],
    [[-s,  s], [arm, 0], [0, -arm]],
  ] as const;

  return (
    <g stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none">
      {corners.map(([origin, dx, dy], i) => (
        <g key={i}>
          <line x1={origin[0]} y1={origin[1]} x2={origin[0] + dx[0]} y2={origin[1] + dx[1]} />
          <line x1={origin[0]} y1={origin[1]} x2={origin[0] + dy[0]} y2={origin[1] + dy[1]} />
        </g>
      ))}
    </g>
  );
}

/* ── Confidence arc ── */
function ConfidenceArc({ r, confidence, color }: { r: number; confidence: number; color: string }) {
  const circumference = 2 * Math.PI * r;
  const fill = (confidence / 100) * circumference;
  return (
    <circle
      cx="0" cy="0" r={r} fill="none"
      stroke={color} strokeWidth="4" strokeLinecap="round"
      strokeDasharray={`${fill} ${circumference - fill}`}
      style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 4px ${color})` }}
    />
  );
}

/* ── Scan line (single) ── */
function ScanLine({ y, width, opacity, color, delay }:
  { y: number; width: number; opacity: number; color: string; delay: number }) {
  return (
    <motion.line
      x1={-width / 2} y1={y}
      x2={ width / 2} y2={y}
      stroke={color} strokeWidth="1" opacity={opacity}
      animate={{ y: [-width / 2, width / 2], opacity: [0, opacity, opacity, 0] }}
      transition={{ duration: 2.4, ease: "linear", repeat: Infinity, delay }}
    />
  );
}

/* ── Facial mesh dots (schematic – not real landmark detection) ── */
function FacialMesh({ visible, color }: { visible: boolean; color: string }) {
  // Symmetric landmark-like positions centred at (0,0) for a ~100px face oval
  const dots = [
    // Eyes
    [-22,-8],[-14,-10],[-6,-10],[6,-10],[14,-10],[22,-8],
    // Brow
    [-22,-18],[-14,-22],[0,-23],[14,-22],[22,-18],
    // Nose bridge & tip
    [0,-8],[0,0],[0,10],[-5,12],[5,12],
    // Lips
    [-14,22],[-7,19],[0,18],[7,19],[14,22],[-7,27],[0,28],[7,27],
    // Jaw
    [-26,10],[-24,20],[-18,30],[-8,38],[0,40],[8,38],[18,30],[24,20],[26,10],
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],
    [6,7],[7,8],[8,9],[9,10],
    [11,12],[12,13],[13,14],[14,15],
    [16,17],[17,18],[18,19],[19,20],[16,21],[21,22],[22,23],[20,23],
    [24,25],[25,26],[26,27],[27,28],[28,29],[29,30],[30,31],[31,24],
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {edges.map(([a, b], i) => (
            <motion.line
              key={`e${i}`}
              x1={dots[a][0]} y1={dots[a][1]}
              x2={dots[b][0]} y2={dots[b][1]}
              stroke={color} strokeWidth="0.75" opacity="0.45"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.015 }}
            />
          ))}
          {dots.map(([x, y], i) => (
            <motion.circle
              key={`d${i}`} cx={x} cy={y} r="1.5"
              fill={color} opacity="0.7"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
            />
          ))}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ── Animated checkmark ── */
function Checkmark({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
          <motion.circle cx="0" cy="0" r="36" fill="rgba(34,197,94,0.12)"
                         stroke="#22C55E" strokeWidth="2"
                         initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
                         transition={{ duration: 0.6, ease: "easeOut" }} />
          <motion.path
            d="M -18 0 L -6 12 L 18 -14"
            stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            style={{ filter: "drop-shadow(0 0 6px #22C55E)" }}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ── X mark for failure ── */
function XMark({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
          <circle cx="0" cy="0" r="36" fill="rgba(239,68,68,0.12)" stroke="#EF4444" strokeWidth="2" />
          {[["M -14 -14 L 14 14", 0], ["M 14 -14 L -14 14", 0.1]].map(([d, delay], i) => (
            <motion.path key={i} d={String(d)} stroke="#EF4444" strokeWidth="3.5"
                         strokeLinecap="round" fill="none"
                         style={{ filter: "drop-shadow(0 0 6px #EF4444)" }}
                         initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                         transition={{ duration: 0.3, delay: Number(delay) }} />
          ))}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════ */
export function BiometricScanner({ state, confidence, workerName, size = 340 }: BiometricScannerProps) {
  const c = COLOR[state];
  const cx = size / 2;
  const isActive  = ["scanning", "detected", "success", "review", "failure"].includes(state);
  const showMesh  = ["detected", "success", "review"].includes(state);
  const showCheck = state === "success";
  const showX     = state === "failure";
  const showLines = ["scanning", "detected"].includes(state);

  /* Radii */
  const R = {
    outer3: cx - 8,
    outer2: cx - 20,
    outer1: cx - 34,
    middle: cx - 52,
    inner:  cx - 70,
    face:   cx - 90,
  };

  return (
    <div
      className="relative select-none"
      style={{
        width: size, height: size,
        filter: `drop-shadow(0 0 ${isActive ? 40 : 8}px ${c.glow})`,
        transition: "filter 600ms ease",
      }}
    >
      <svg
        width={size} height={size}
        viewBox={`${-cx} ${-cx} ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {/* ── DEFS: gradients ── */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0A1628" />
            <stop offset="100%" stopColor="#060D18" />
          </radialGradient>
          <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={c.primary} stopOpacity="0.12" />
            <stop offset="100%" stopColor={c.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Background circle ── */}
        <circle cx="0" cy="0" r={cx - 2} fill="url(#bgGrad)"
                stroke={c.primary} strokeWidth="1.5" opacity="0.7" />

        {/* ── Face glow pool ── */}
        <circle cx="0" cy="0" r={R.face + 10} fill="url(#faceGlow)" />

        {/* ── Outer segmented rings ── */}
        <motion.g
          animate={isActive ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        >
          <SegmentedArc r={R.outer3} count={36} gap={4} color={c.primary} opacity={0.2} strokeWidth={1} />
        </motion.g>

        <motion.g
          animate={isActive ? { rotate: -360 } : { rotate: 0 }}
          transition={{ duration: 12, ease: "linear", repeat: Infinity }}
        >
          <SegmentedArc r={R.outer2} count={24} gap={6} color={c.primary} opacity={0.35} strokeWidth={1.5} />
        </motion.g>

        {/* ── Middle rotating ring ── */}
        <motion.g
          animate={isActive ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 7, ease: "linear", repeat: Infinity }}
        >
          <SegmentedArc r={R.outer1} count={16} gap={8} color={c.primary} opacity={0.55} strokeWidth={2} />
        </motion.g>

        {/* ── Confidence progress arc ── */}
        <g style={{ transform: "rotate(-90deg)" }}>
          <circle cx="0" cy="0" r={R.middle} fill="none"
                  stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <ConfidenceArc r={R.middle} confidence={confidence} color={c.primary} />
        </g>

        {/* ── Inner targeting ring ── */}
        <motion.circle
          cx="0" cy="0" r={R.inner}
          fill="none" stroke={c.primary} strokeWidth="1.5"
          strokeDasharray="6 4" opacity={isActive ? 0.7 : 0.2}
          animate={isActive ? { rotate: -360 } : { rotate: 0 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />

        {/* ── HUD corners ── */}
        <motion.g animate={{ opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
          <HUDCorners size={R.inner * 2} color={c.primary} />
        </motion.g>

        {/* ── Scan lines (clipped to face circle) ── */}
        <clipPath id="faceClip">
          <circle cx="0" cy="0" r={R.face} />
        </clipPath>
        <g clipPath="url(#faceClip)">
          {showLines && [0, 1, 2, 3, 4, 5].map(i => (
            <ScanLine
              key={i}
              y={0}
              width={R.face * 2}
              opacity={0.12 + i * 0.04}
              color={c.primary}
              delay={i * 0.4}
            />
          ))}
        </g>

        {/* ── Facial mesh ── */}
        <FacialMesh visible={showMesh} color={c.primary} />

        {/* ── Center icon / result ── */}
        <Checkmark visible={showCheck} />
        <XMark     visible={showX} />

        {/* ── Idle / scanning text ── */}
        {!showCheck && !showX && (
          <text x="0" y={R.face + 22} textAnchor="middle"
                fontSize="11" fontWeight="600" fontFamily="'Inter',monospace"
                fill={c.primary} opacity="0.8">
            {state === "idle"     ? "AWAITING SESSION"  :
             state === "loading"  ? "INITIALIZING AI…"  :
             state === "scanning" ? "SCANNING…"         :
             state === "detected" ? "ANALYZING FACE"    :
             state === "review"   ? "SENDING TO REVIEW" : ""}
          </text>
        )}

        {/* ── Pulse ripple on success ── */}
        {state === "success" && (
          <>
            {[0, 1, 2].map(i => (
              <motion.circle key={i} cx="0" cy="0" r="50" fill="none"
                             stroke="#22C55E" strokeWidth="1.5"
                             initial={{ scale: 0.8, opacity: 0.6 }}
                             animate={{ scale: 3, opacity: 0 }}
                             transition={{ duration: 1.8, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }} />
            ))}
          </>
        )}

        {/* ── Failure shake effect applied via SVG translate ── */}
        {state === "failure" && (
          <motion.g
            animate={{ x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
          >
            <circle cx="0" cy="0" r={cx - 2} fill="none"
                    stroke="#EF4444" strokeWidth="2" opacity="0.5" />
          </motion.g>
        )}
      </svg>

      {/* ── Confidence badge (HTML overlay, centered below) ── */}
      {confidence > 0 && isActive && !showCheck && !showX && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono"
          style={{
            bottom: "14%",
            background: "rgba(0,0,0,0.65)",
            border: `1px solid ${c.primary}40`,
            color: c.primary,
            backdropFilter: "blur(8px)",
          }}
        >
          {confidence.toFixed(1)}% CONF
        </div>
      )}
    </div>
  );
}
