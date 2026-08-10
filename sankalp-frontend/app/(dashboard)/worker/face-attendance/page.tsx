"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Camera, CheckCircle2, XCircle, RotateCcw, Scan } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaceMeshOverlay } from "@/components/features/attendance/FaceMeshOverlay";
import type { FaceState } from "@/components/features/attendance/FaceMeshOverlay";

type ScanState = "idle" | "scanning" | "verified" | "failed" | "review";

export default function WorkerFaceAttendancePage() {
  const { user } = useAuth();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camState,  setCamState]  = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [camError,  setCamError]  = useState("");
  const [result,    setResult]    = useState<{ workerName?: string; confidence?: number; message?: string } | null>(null);

  const faceState: FaceState =
    scanState === "scanning" ? "scanning" :
    scanState === "verified" ? "success"  :
    scanState === "review"   ? "review"   :
    camState  === "ready"    ? "waiting"  : "idle";

  const startCamera = useCallback(async () => {
    setCamState("loading"); setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCamState("ready");
          setScanState("idle");
        };
      }
    } catch {
      setCamError("Camera access denied. Please allow camera permissions.");
      setCamState("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState("idle");
    setScanState("idle");
    setResult(null);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Real face verification — uses worker-specific endpoint (no supervisor role needed)
  const verifyFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || camState !== "ready") return;

    setScanState("scanning");
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);

    c.toBlob(async (blob) => {
      if (!blob) { setScanState("failed"); setResult({ message: "Failed to capture image." }); return; }

      try {
        // Use the worker-only verify endpoint — no session or supervisor needed
        const fd = new FormData();
        fd.append("face_image", blob, "capture.jpg");

        const { data } = await api.post("/attendance/verify-self", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.success) {
          setScanState("verified");
          setResult({ workerName: data.workerName, confidence: data.confidence });
        } else if (data.requiresReview) {
          setScanState("review");
          setResult({ workerName: data.workerName, confidence: data.confidence, message: data.message });
        } else {
          setScanState("failed");
          setResult({ message: data.message || "Face not recognised. Please try again." });
        }
      } catch (e: any) {
        const msg = e?.response?.data?.detail || "Verification failed. Please try again.";
        setScanState("failed");
        setResult({ message: msg });
      }
    }, "image/jpeg", 0.92);
  }, [camState]);

  const reset = () => { setScanState("idle"); setResult(null); };

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <Scan className="w-5 h-5" style={{ color: "#22C55E" }} />
        </div>
        <div>
          <h1 className="font-black text-slate-900 text-2xl tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Face Verification
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            Verify your identity using AI facial recognition
          </p>
        </div>
      </div>

      {/* Camera card */}
      <div className="rounded-2xl overflow-hidden"
           style={{
             background: "#060C14",
             border: `1px solid ${camState === "ready" ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`,
             boxShadow: camState === "ready" ? "0 0 32px rgba(34,197,94,0.08)" : "none",
             transition: "border-color 400ms, box-shadow 400ms",
           }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3"
             style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm font-bold text-white">Biometric Scanner</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ background: "rgba(34,197,94,0.08)", color: "rgba(34,197,94,0.6)" }}>
              AI Ready
            </span>
            {camState === "ready" && (
              <motion.span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                           style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
                           animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />LIVE
              </motion.span>
            )}
          </div>
        </div>

        {/* Video + mesh */}
        <div className="relative" style={{ aspectRatio: "4/3", background: "#040810" }}>
          <video ref={videoRef} autoPlay muted playsInline
                 className="w-full h-full object-cover"
                 style={{ display: camState === "ready" ? "block" : "none" }} />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face mesh — real AI landmark detection */}
          {camState === "ready" && (
            <FaceMeshOverlay
              videoRef={videoRef as React.RefObject<HTMLVideoElement>}
              faceState={faceState}
              isActive={camState === "ready"}
            />
          )}

          {/* Oval guide */}
          {camState === "ready" && scanState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div className="rounded-full border-2"
                           style={{ width: 200, height: 250, borderColor: "rgba(34,197,94,0.5)" }}
                           animate={{ boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 24px rgba(34,197,94,0.3)", "0 0 0px rgba(34,197,94,0)"] }}
                           transition={{ duration: 2, repeat: Infinity }} />
            </div>
          )}

          {/* Scanning overlay */}
          {scanState === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-white">Verifying…</p>
                <p className="text-xs mt-1" style={{ color: "rgba(34,197,94,0.7)" }}>Matching against registered face</p>
              </div>
            </div>
          )}

          {/* Idle / error states */}
          {camState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Camera className="w-16 h-16" style={{ color: "rgba(255,255,255,0.1)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Camera not started</p>
            </div>
          )}
          {camState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {camState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <Camera className="w-12 h-12" style={{ color: "#EF4444" }} />
              <p className="text-sm font-semibold text-white">Camera Error</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{camError}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="p-4 space-y-2.5">
          {camState === "idle" && (
            <button onClick={startCamera}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "#22C55E", color: "#071A0D", boxShadow: "0 4px 16px rgba(34,197,94,0.35)" }}>
              <Camera className="w-4 h-4" /> Start Camera
            </button>
          )}
          {camState === "ready" && scanState === "idle" && (
            <button onClick={verifyFace}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "#22C55E", color: "#071A0D", boxShadow: "0 4px 16px rgba(34,197,94,0.35)" }}>
              <Scan className="w-4 h-4" /> Start Face Verification
            </button>
          )}
          {camState === "ready" && scanState === "scanning" && (
            <button disabled className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 opacity-60"
                    style={{ background: "#22C55E", color: "#071A0D" }}>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Verifying…
            </button>
          )}
          {camState === "ready" && ["verified", "failed", "review"].includes(scanState) && (
            <div className="flex gap-2.5">
              <button onClick={reset}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RotateCcw className="w-4 h-4" /> Scan Again
              </button>
              <button onClick={stopCamera}
                      className="flex-1 py-3 rounded-xl font-bold text-sm"
                      style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                Stop Camera
              </button>
            </div>
          )}
          {camState === "error" && (
            <button onClick={startCamera}
                    className="w-full py-3 rounded-xl font-bold text-sm"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Retry Camera
            </button>
          )}
        </div>
      </div>

      {/* Result banners */}
      <AnimatePresence mode="wait">
        {scanState === "verified" && result && (
          <motion.div key="verified" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-5 flex items-center gap-4"
                      style={{ background: "#DCFCE7", border: "1px solid #BBF7D0" }}>
            <CheckCircle2 className="w-10 h-10 flex-shrink-0" style={{ color: "#22C55E" }} />
            <div>
              <p className="font-black text-slate-900 text-xl">{result.workerName ?? user?.name}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "#16A34A" }}>✓ Identity Verified</p>
              {result.confidence !== undefined && (
                <p className="text-xs mt-1 font-mono" style={{ color: "#6B7280" }}>
                  Confidence: {result.confidence.toFixed(1)}%  ·  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </motion.div>
        )}
        {scanState === "review" && result && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-5 flex items-center gap-4"
                      style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <CheckCircle2 className="w-10 h-10 flex-shrink-0" style={{ color: "#F59E0B" }} />
            <div>
              <p className="font-black text-slate-900 text-xl">{result.workerName ?? user?.name}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "#D97706" }}>⟳ Sent for Manual Review</p>
              {result.confidence !== undefined && (
                <p className="text-xs mt-1 font-mono" style={{ color: "#6B7280" }}>
                  Confidence: {result.confidence.toFixed(1)}% — Supervisor will verify
                </p>
              )}
            </div>
          </motion.div>
        )}
        {scanState === "failed" && (
          <motion.div key="failed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-2xl p-5 flex items-center gap-4"
                      style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}>
            <XCircle className="w-10 h-10 flex-shrink-0" style={{ color: "#EF4444" }} />
            <div>
              <p className="font-bold text-slate-900 text-lg">Not Recognised</p>
              <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
                {result?.message ?? "Face not matched. Ensure good lighting and look directly at camera."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>How It Works</p>
        <ol className="space-y-2">
          {[
            "Click 'Start Camera'",
            "Position your face inside the oval guide",
            "The AI mesh aligns to your face",
            "Click 'Start Face Verification'",
            "The system matches your face against registered profile",
            "Result: Verified ✓ or Not Recognised ✕",
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: "#4B5563" }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                    style={{ background: "#DCFCE7", color: "#16A34A" }}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
