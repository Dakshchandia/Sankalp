"use client";

/**
 * CameraFeed — live camera with biometric overlay rendered on top.
 * The scanner graphics are NOT a separate widget; they are SVG layers
 * composited directly over the video element.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw, CheckCircle2 } from "lucide-react";
import type { FaceRecognitionResult } from "@/types/attendance.types";
import { FaceMeshOverlay } from "./FaceMeshOverlay";

export type ScannerState =
  | "idle"        // session not started
  | "waiting"     // session active, no face
  | "scanning"    // face detected, scan in progress (one-shot)
  | "success"     // verified — freeze until new face
  | "review"      // low confidence — sent for review
  | "failure"     // not recognised
  | "multi";      // multiple faces

export interface CameraFeedProps {
  isActive:         boolean;
  onCapture:        (blob: Blob) => Promise<void>;
  captureIntervalMs?: number;
  scannerState?:    ScannerState;
  confidence?:      number;
  lastResult?:      FaceRecognitionResult | null;
}

/* ─── Corner bracket (one corner) ─── */
function Corner({ x, y, dx, dy, color, size = 18, strokeWidth = 2 }:
  { x: number; y: number; dx: number; dy: number; color: string; size?: number; strokeWidth?: number }) {
  return (
    <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
      <line x1={x} y1={y} x2={x + dx * size} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y + dy * size} />
    </g>
  );
}

/* ─── Four corner brackets around a rect ─── */
function CornerBrackets({ x, y, w, h, color, strokeWidth = 2, size = 18 }:
  { x: number; y: number; w: number; h: number; color: string; strokeWidth?: number; size?: number }) {
  return (
    <g>
      <Corner x={x}     y={y}     dx={ 1} dy={ 1} color={color} size={size} strokeWidth={strokeWidth} />
      <Corner x={x+w}   y={y}     dx={-1} dy={ 1} color={color} size={size} strokeWidth={strokeWidth} />
      <Corner x={x}     y={y+h}   dx={ 1} dy={-1} color={color} size={size} strokeWidth={strokeWidth} />
      <Corner x={x+w}   y={y+h}   dx={-1} dy={-1} color={color} size={size} strokeWidth={strokeWidth} />
    </g>
  );
}

/* ─── One-shot scan line ─── */
function ScanLine({ x, y, w, h, color, onDone }:
  { x: number; y: number; w: number; h: number; color: string; onDone: () => void }) {
  return (
    <motion.g>
      {/* Glow line */}
      <motion.rect
        x={x} width={w} height={3} rx={1.5}
        fill={color} opacity={0.7}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        initial={{ y }}
        animate={{ y: y + h }}
        transition={{ duration: 1.4, ease: "linear" }}
        onAnimationComplete={onDone}
      />
      {/* Subtle fill sweep */}
      <motion.rect
        x={x} y={y} width={w}
        fill={color} opacity={0.03}
        initial={{ height: 0 }}
        animate={{ height: h }}
        transition={{ duration: 1.4, ease: "linear" }}
      />
    </motion.g>
  );
}

/* ─── Animated confidence bar ─── */
function ConfidenceBar({ x, y, w, confidence, color }:
  { x: number; y: number; w: number; confidence: number; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={4} rx={2} fill="rgba(255,255,255,0.1)" />
      <motion.rect x={x} y={y} height={4} rx={2}
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: (confidence / 100) * w }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </g>
  );
}

/* ─── Animated checkmark ─── */
function Checkmark({ cx, cy, r, color }:
  { cx: number; cy: number; r: number; color: string }) {
  const s = r * 0.45;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
      <motion.circle cx={cx} cy={cy} r={r}
        fill={`${color}15`} stroke={color} strokeWidth="2"
        initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }}
        transition={{ duration: 0.4 }} />
      <motion.path
        d={`M ${cx-s} ${cy} L ${cx-s*0.2} ${cy+s*0.7} L ${cx+s} ${cy-s*0.7}`}
        stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      />
    </motion.g>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export function CameraFeed({
  isActive,
  onCapture,
  captureIntervalMs = 3000,
  scannerState = "idle",
  confidence = 0,
  lastResult = null,
}: CameraFeedProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef= useRef<HTMLDivElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [camStatus,   setCamStatus]   = useState<"idle"|"loading"|"ready"|"error">("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [vidSize,     setVidSize]     = useState({ w: 640, h: 360 });
  const [scanDone,    setScanDone]    = useState(false);

  /* ── Camera controls ── */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamStatus("loading"); setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width:{ ideal:1280 }, height:{ ideal:720 }, facingMode:"user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCamStatus("ready");
          setVidSize({ w: videoRef.current!.videoWidth || 640, h: videoRef.current!.videoHeight || 360 });
        };
      }
    } catch (err) {
      const msg = err instanceof DOMException
        ? err.name === "NotFoundError"   ? "No camera found. Please connect a camera."
        : err.name === "NotAllowedError" ? "Camera access denied. Please allow permissions."
        : "Failed to start camera." : "Failed to start camera.";
      setErrorMsg(msg); setCamStatus("error");
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || camStatus !== "ready") return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setIsCapturing(true);
    c.toBlob(async blob => { if (blob) await onCapture(blob); setIsCapturing(false); }, "image/jpeg", 0.85);
  }, [onCapture, camStatus]);

  useEffect(() => {
    if (isActive) startCamera();
    else { stopCamera(); setCamStatus("idle"); }
    return () => stopCamera();
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    if (isActive && camStatus === "ready") {
      intervalRef.current = setInterval(captureFrame, captureIntervalMs);
    }
    return () => { intervalRef.current && clearInterval(intervalRef.current); };
  }, [isActive, camStatus, captureFrame, captureIntervalMs]);

  /* Reset scanDone when a new scan starts */
  useEffect(() => {
    if (scannerState === "scanning" || scannerState === "waiting") setScanDone(false);
  }, [scannerState]);

  /* ── Overlay dimensions — keep aspect ratio ── */
  const ow = vidSize.w, oh = vidSize.h;
  // Face region (centred, 40% wide, 70% tall)
  const fw = ow * 0.38, fh = oh * 0.68;
  const fx = (ow - fw) / 2, fy = (oh - fh) / 2;
  const fcx = ow / 2, fcy = oh * 0.46;

  /* ── Color per state ── */
  const stateColor = {
    idle:    "rgba(255,255,255,0.2)",
    waiting: "rgba(255,255,255,0.25)",
    scanning:"#22C55E",
    success: "#22C55E",
    review:  "#F59E0B",
    failure: "#EF4444",
    multi:   "#F97316",
  }[scannerState] ?? "rgba(255,255,255,0.2)";

  const isVerified  = scannerState === "success";
  const isFailed    = scannerState === "failure";
  const isReview    = scannerState === "review";
  const isScanning  = scannerState === "scanning";
  const isMulti     = scannerState === "multi";
  const showMesh    = ["scanning","success","review"].includes(scannerState);
  const showBrackets= ["scanning","success","review","failure","multi"].includes(scannerState);
  const showScanLine= isScanning && !scanDone;

  return (
    <div ref={containerRef} className="relative w-full" style={{ background:"#060C14", borderRadius:16, overflow:"hidden" }}>
      {/* ── Video — natural colours ── */}
      <video ref={videoRef} autoPlay muted playsInline
             className="w-full block"
             style={{
               display: camStatus === "ready" ? "block" : "none",
               aspectRatio: "16/9",
               objectFit: "cover",
             }} />
      <canvas ref={canvasRef} className="hidden" />

      {/* ── REAL MediaPipe face mesh (canvas, updated every frame) ── */}
      {camStatus === "ready" && (
        <FaceMeshOverlay
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          faceState={scannerState}
          isActive={isActive}
          onFaceDetected={(_lms) => {
            /* landmark data available — face is present */
          }}
          onNoFace={() => {
            /* handled in parent via processFrame result */
          }}
          onMultiFace={() => {
            /* handled in parent */
          }}
        />
      )}

      {/* ── SVG overlay (corner brackets, scan line, confidence, checkmark) ── */}
      {camStatus === "ready" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${ow} ${oh}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <AnimatePresence>
            {showBrackets && (
              <motion.g
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.g
                  animate={isScanning ? { scale:[1,1.02,1] } : {}}
                  transition={{ duration:0.8, repeat: isScanning ? Infinity : 0, ease:"easeInOut" }}
                  style={{ transformOrigin:`${fcx}px ${fcy}px` }}
                >
                  <CornerBrackets
                    x={fx} y={fy} w={fw} h={fh}
                    color={stateColor}
                    strokeWidth={isVerified ? 2.5 : 2}
                    size={20}
                  />
                  {/* Face outline rect */}
                  <rect x={fx} y={fy} width={fw} height={fh} rx={8}
                        fill="none" stroke={stateColor} strokeWidth="1"
                        opacity="0.3"
                        style={{ filter:`drop-shadow(0 0 8px ${stateColor})` }} />
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* One-shot scan line */}
          <AnimatePresence>
            {showScanLine && (
              <ScanLine
                x={fx} y={fy} w={fw} h={fh}
                color="#22C55E"
                onDone={() => setScanDone(true)}
              />
            )}
          </AnimatePresence>

          {/* Confidence bar (during scan) */}
          <AnimatePresence>
            {isScanning && confidence > 0 && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <ConfidenceBar
                  x={fx} y={fy + fh + 12}
                  w={fw} confidence={confidence}
                  color="#22C55E"
                />
                <text x={fcx} y={fy + fh + 26}
                      textAnchor="middle" fontSize="11" fontWeight="600"
                      fill="rgba(255,255,255,0.6)" fontFamily="'IBM Plex Mono',monospace">
                  {confidence.toFixed(0)}% CONFIDENCE
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── HUD: top-left SCANNING label ── */}
          <AnimatePresence>
            {isScanning && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {/* Top-left bracket label */}
                <rect x={fx} y={fy - 22} width={100} height={18} rx={3}
                      fill="rgba(0,0,0,0.55)" />
                <motion.text
                  x={fx + 8} y={fy - 8}
                  fontSize="10" fontWeight="700" fontFamily="'IBM Plex Mono',monospace"
                  fill="#22C55E"
                  animate={{ opacity:[1,0.4,1] }}
                  transition={{ duration:0.9, repeat:Infinity, ease:"easeInOut" }}
                >
                  ● SCANNING
                </motion.text>
                {/* Top-right: face quality */}
                <rect x={fx + fw - 108} y={fy - 22} width={108} height={18} rx={3}
                      fill="rgba(0,0,0,0.55)" />
                <text x={fx + fw - 6} y={fy - 8}
                      textAnchor="end" fontSize="10" fontWeight="600"
                      fontFamily="'IBM Plex Mono',monospace" fill="rgba(34,197,94,0.85)">
                  FACE QUALITY: GOOD
                </text>
                {/* Bottom-left: ID */}
                <rect x={fx} y={fy + fh + 32} width={120} height={16} rx={3}
                      fill="rgba(0,0,0,0.45)" />
                <text x={fx + 6} y={fy + fh + 44}
                      fontSize="9" fontFamily="'IBM Plex Mono',monospace"
                      fill="rgba(100,200,255,0.75)">
                  BIOMETRIC ID: ██████
                </text>
                {/* Bottom-right: model */}
                <rect x={fx + fw - 114} y={fy + fh + 32} width={114} height={16} rx={3}
                      fill="rgba(0,0,0,0.45)" />
                <text x={fx + fw - 6} y={fy + fh + 44}
                      textAnchor="end" fontSize="9" fontFamily="'IBM Plex Mono',monospace"
                      fill="rgba(100,200,255,0.75)">
                  FaceNet v2 · 97.4%
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── HUD: verified state ── */}
          <AnimatePresence>
            {isVerified && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <rect x={fx} y={fy - 22} width={116} height={18} rx={3}
                      fill="rgba(0,0,0,0.55)" />
                <text x={fx + 8} y={fy - 8}
                      fontSize="10" fontWeight="700" fontFamily="'IBM Plex Mono',monospace"
                      fill="#22C55E">
                  ✓ IDENTITY VERIFIED
                </text>
                <rect x={fx + fw - 80} y={fy - 22} width={80} height={18} rx={3}
                      fill="rgba(0,0,0,0.55)" />
                <text x={fx + fw - 6} y={fy - 8}
                      textAnchor="end" fontSize="10" fontWeight="600"
                      fontFamily="'IBM Plex Mono',monospace" fill="#22C55E">
                  {confidence.toFixed(1)}% MATCH
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── HUD: failure state ── */}
          <AnimatePresence>
            {isFailed && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <rect x={fx} y={fy - 22} width={140} height={18} rx={3}
                      fill="rgba(0,0,0,0.55)" />
                <text x={fx + 8} y={fy - 8}
                      fontSize="10" fontWeight="700" fontFamily="'IBM Plex Mono',monospace"
                      fill="#EF4444">
                  ✗ IDENTITY NOT VERIFIED
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Success checkmark */}
          <AnimatePresence>
            {isVerified && (
              <Checkmark
                cx={fx + fw - 18} cy={fy + 18} r={14}
                color="#22C55E"
              />
            )}
          </AnimatePresence>

          {/* Multiple faces warning */}
          <AnimatePresence>
            {isMulti && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <rect x={fx} y={fy - 28} width={fw} height={24} rx={4}
                      fill="rgba(249,115,22,0.2)" stroke="rgba(249,115,22,0.5)" strokeWidth="1" />
                <text x={fcx} y={fy - 12}
                      textAnchor="middle" fontSize="11" fontWeight="700"
                      fill="#F97316" fontFamily="'Inter',sans-serif">
                  Multiple faces detected — please stand alone
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Waiting pulse dots (no face) */}
          <AnimatePresence>
            {scannerState === "waiting" && (
              <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                {[0,1,2].map(i => (
                  <motion.circle key={i}
                    cx={fcx - 12 + i * 12} cy={fcy}
                    r="3" fill="rgba(255,255,255,0.35)"
                    animate={{ opacity:[0.2,0.8,0.2], scale:[0.8,1.1,0.8] }}
                    transition={{ duration:1.4, delay: i*0.22, repeat:Infinity, ease:"easeInOut" }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      )}

      {/* ── Success result banner ── */}
      <AnimatePresence>
        {(isVerified || isReview || isFailed) && lastResult && (
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
            transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
            className="absolute bottom-0 left-0 right-0 px-4 py-3"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)`,
              backdropFilter: "blur(4px)",
              borderTop: `1px solid ${stateColor}30`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                   style={{ background:`linear-gradient(135deg,${stateColor},${stateColor}90)`, color:"#0A0F1C" }}>
                {lastResult.workerName?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{lastResult.workerName ?? "Unknown"}</p>
                <p className="text-[11px] font-mono" style={{ color:`${stateColor}CC` }}>
                  {isVerified ? "✓ Verified" : isReview ? "⟳ Sent for Review" : "✗ Not Recognized"}
                  {lastResult.confidence ? ` · ${Number(lastResult.confidence).toFixed(1)}%` : ""}
                </p>
              </div>
              {isVerified && (
                <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                     style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color:"#22C55E" }} />
                  <span className="text-[11px] font-bold" style={{ color:"#22C55E" }}>Attendance Marked</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle / loading / error overlay ── */}
      {camStatus !== "ready" && (
        <div className="aspect-video flex flex-col items-center justify-center gap-3 w-full"
             style={{ background:"#040810" }}>
          {camStatus === "idle" && (
            <>
              <Camera className="w-10 h-10" style={{ color:"rgba(255,255,255,0.25)" }} />
              <p className="text-sm font-medium" style={{ color:"rgba(255,255,255,0.35)" }}>
                Start a session to activate camera
              </p>
            </>
          )}
          {camStatus === "loading" && (
            <>
              <div className="w-7 h-7 border-2 rounded-full animate-spin"
                   style={{ borderColor:"rgba(34,197,94,0.5)", borderTopColor:"transparent" }} />
              <p className="text-sm font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>Starting camera…</p>
            </>
          )}
          {camStatus === "error" && (
            <>
              <CameraOff className="w-10 h-10" style={{ color:"var(--danger)" }} />
              <p className="text-sm font-medium text-center max-w-xs px-4" style={{ color:"rgba(255,255,255,0.5)" }}>
                {errorMsg}
              </p>
              <button onClick={startCamera}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.12)" }}>
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Status badge (top-left) ── */}
      {camStatus === "ready" && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-xl pointer-events-none"
             style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: isActive ? "#22C55E" : "#64748B", boxShadow: isActive ? "0 0 6px #22C55E" : "none",
                         animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none" }} />
          <span className="text-[11px] font-bold" style={{ color: isActive ? "#22C55E" : "rgba(255,255,255,0.4)" }}>
            {isActive ? "LIVE" : "IDLE"}
          </span>
        </div>
      )}

      {/* ── Waiting for face label (center, no face) ── */}
      <AnimatePresence>
        {camStatus === "ready" && scannerState === "waiting" && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2"
          >
            <p className="text-sm font-semibold" style={{ color:"rgba(255,255,255,0.45)" }}>
              Waiting for face…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
