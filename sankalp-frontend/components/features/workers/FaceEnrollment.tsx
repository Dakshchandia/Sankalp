"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, CheckCircle2, RefreshCw, SkipForward, Brain, Scan } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { workerService } from "@/services/worker.service";
import { toast }         from "sonner";

interface FaceEnrollmentProps {
  workerId:   string;
  onComplete: () => void;
  onSkip:     () => void;
}

type CaptureStep = "front" | "left";

const STEPS: { key: CaptureStep; label: string; instruction: string; angle: string }[] = [
  { key:"front", label:"Front View",    instruction:"Look directly at the camera — eyes forward",     angle:"0°" },
  { key:"left",  label:"Slight Left",   instruction:"Turn your head slightly to the left — 15–20°",  angle:"15°" },
];

export function FaceEnrollment({ workerId, onComplete, onSkip }: FaceEnrollmentProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [captures,    setCaptures]    = useState<(Blob | null)[]>([null, null]);
  const [previews,    setPreviews]    = useState<(string | null)[]>([null, null]);
  const [cameraReady, setCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode:"user", width:{ ideal:640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setCameraReady(true); };
      }
    } catch { setCameraError("Cannot access camera. Please allow camera permissions."); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current, canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const nc = [...captures]; nc[currentStep] = blob; setCaptures(nc);
      const np = [...previews]; np[currentStep] = URL.createObjectURL(blob); setPreviews(np);
      if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
      else stopCamera();
    }, "image/jpeg", 0.9);
  }, [captures, previews, currentStep, stopCamera]);

  const handleEnroll = async () => {
    const valid = captures.filter((c): c is Blob => c !== null);
    if (valid.length < STEPS.length) { toast.error("Please capture all required photos first"); return; }
    setIsUploading(true);
    try {
      await workerService.enrollFace(workerId, valid.map((b, i) => new File([b], `face_${STEPS[i].key}.jpg`, { type:"image/jpeg" })));
      toast.success("Face enrollment successful!");
      onComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Face enrollment failed");
    } finally { setIsUploading(false); }
  };

  const allCaptured = captures.every(c => c !== null);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl overflow-hidden relative"
           style={{ background:"linear-gradient(135deg,#071A0D 0%,#0C2518 60%,#081525 100%)", border:"1px solid rgba(34,197,94,0.15)" }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
             style={{ background:"radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)" }} />
        <div className="relative px-6 py-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className="w-4 h-4" style={{ color:"#22C55E" }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color:"rgba(34,197,94,0.7)" }}>
              Biometric Enrollment
            </span>
          </div>
          <h2 className="font-black text-white text-xl tracking-tight" style={{ letterSpacing:"-0.03em" }}>
            Face Enrollment
          </h2>
          <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>
            Capture face photos for AI-powered attendance verification
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all"
                 style={captures[idx]
                   ? { background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.25)" }
                   : idx === currentStep
                   ? { background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)" }
                   : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
              {captures[idx]
                ? <CheckCircle2 className="w-4 h-4" style={{ color:"#22C55E" }} />
                : <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black"
                         style={idx === currentStep
                           ? { background:"#3B82F6", color:"#fff" }
                           : { background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                    {idx+1}
                  </span>}
              <span className="text-xs font-semibold"
                    style={{ color: captures[idx] ? "#22C55E" : idx === currentStep ? "#60A5FA" : "rgba(255,255,255,0.35)" }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-6 h-px" style={{ background:"rgba(255,255,255,0.12)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="rounded-3xl overflow-hidden"
           style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" }}>
        <div className="h-0.5" style={{ background:`linear-gradient(90deg,transparent,${allCaptured ? "#22C55E" : "#3B82F6"},transparent)` }} />

        <div className="p-6 space-y-5">
          {/* Instruction */}
          <AnimatePresence mode="wait">
            {!allCaptured && (
              <motion.div key={currentStep}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)" }}>
                <Scan className="w-4 h-4 flex-shrink-0" style={{ color:"#60A5FA" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color:"#60A5FA" }}>
                    Step {currentStep+1}: {STEPS[currentStep].label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.45)" }}>
                    {STEPS[currentStep].instruction}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera feed */}
          {!allCaptured && (
            <div className="relative aspect-video rounded-2xl overflow-hidden"
                 style={{ background:"#060C14", border:"1px solid rgba(255,255,255,0.08)" }}>
              <video ref={videoRef} autoPlay muted playsInline
                     className="w-full h-full object-cover"
                     style={{ opacity: cameraReady ? 1 : 0, transition:"opacity 300ms" }} />
              <canvas ref={canvasRef} className="hidden" />

              {/* Idle */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                     style={{ color:"rgba(255,255,255,0.3)" }}>
                  <Camera className="w-12 h-12" />
                  <p className="text-sm font-medium">Click "Open Camera" to begin</p>
                </div>
              )}

              {/* Error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <Camera className="w-10 h-10" style={{ color:"var(--danger)" }} />
                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.5)" }}>{cameraError}</p>
                  <button onClick={startCamera}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                          style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.8)" }}>
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              )}

              {/* Face guide overlay */}
              {cameraReady && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-48 rounded-full border-2 border-dashed opacity-60"
                         style={{ borderColor:"#22C55E" }} />
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
                       style={{ background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.1)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-xs font-semibold text-white">Camera Active</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Previews */}
          {(previews[0] || previews[1]) && (
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color:"rgba(255,255,255,0.4)" }}>Captured Photos</p>
              <div className="flex gap-4">
                {STEPS.map((step, idx) => (
                  <div key={step.key} className="flex-1">
                    <div className="rounded-2xl overflow-hidden aspect-square"
                         style={{
                           background:"rgba(255,255,255,0.04)",
                           border: previews[idx]
                             ? "2px solid rgba(34,197,94,0.4)"
                             : "2px dashed rgba(255,255,255,0.1)",
                           boxShadow: previews[idx] ? "0 0 12px rgba(34,197,94,0.2)" : "none",
                         }}>
                      {previews[idx] ? (
                        <img src={previews[idx]!} alt={step.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>Pending</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs font-semibold" style={{ color:"rgba(255,255,255,0.5)" }}>{step.label}</p>
                      {captures[idx] && (
                        <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color:"#22C55E" }}>
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All captured — success state */}
          {allCaptured && (
            <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl"
                        style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color:"#22C55E" }} />
              <div>
                <p className="text-sm font-bold" style={{ color:"#22C55E" }}>Both photos captured</p>
                <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                  Click "Complete Enrollment" to register the biometric data.
                </p>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {!allCaptured && (
              !cameraReady ? (
                <button onClick={startCamera}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                        style={{ background:"#22C55E", color:"#080E18", boxShadow:"0 4px 16px rgba(34,197,94,0.35)" }}>
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
              ) : (
                <button onClick={captureFrame}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                        style={{ background:"#3B82F6", color:"#fff", boxShadow:"0 4px 16px rgba(59,130,246,0.35)" }}>
                  <Camera className="w-4 h-4" /> Capture Photo {currentStep+1} of {STEPS.length}
                </button>
              )
            )}

            {allCaptured && (
              <button onClick={handleEnroll} disabled={isUploading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40"
                      style={{ background:"#22C55E", color:"#080E18", boxShadow:"0 4px 16px rgba(34,197,94,0.35)" }}>
                {isUploading
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enrolling…</>
                  : <><CheckCircle2 className="w-4 h-4" />Complete Enrollment</>}
              </button>
            )}

            <button onClick={onSkip}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"}>
              <SkipForward className="w-4 h-4" /> Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
