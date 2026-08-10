"use client";

/**
 * FaceMeshOverlay — Cyan face mesh exactly like the reference image.
 * Teal/cyan lines + white glowing dots, full face coverage.
 * Uses face-api.js 68-point landmarks for accurate tracking.
 */

import { useEffect, useRef, useCallback } from "react";

export interface NormalizedLandmark { x: number; y: number; z?: number; }
export type FaceState = "idle" | "waiting" | "scanning" | "success" | "review" | "failure" | "multi";

interface Props {
  videoRef:        React.RefObject<HTMLVideoElement>;
  faceState:       FaceState;
  isActive:        boolean;
  onFaceDetected?: (lms: NormalizedLandmark[]) => void;
  onNoFace?:       () => void;
  onMultiFace?:    () => void;
}

/**
 * Standard 68-point Delaunay triangulation.
 * Produces the same pattern as the reference image.
 */
const TRIANGLES: [number, number, number][] = [
  // Jawline outer edge
  [0,1,17],[1,2,18],[2,3,19],[3,4,20],[4,5,48],[5,6,48],[6,7,57],
  [7,8,57],[8,9,57],[9,10,57],[10,11,54],[11,12,54],[12,13,35],
  [13,14,35],[14,15,45],[15,16,26],
  // Left eyebrow to eye
  [17,18,36],[18,19,37],[19,20,38],[20,21,39],
  [17,36,0],[21,39,27],
  // Right eyebrow to eye
  [22,23,42],[23,24,43],[24,25,44],[25,26,45],
  [22,42,27],[26,45,16],
  // Forehead
  [0,17,1],[15,16,26],[17,18,19],[19,20,21],
  [22,23,24],[24,25,26],[17,19,27],[19,21,27],
  [22,24,27],[24,26,27],[21,22,27],[20,21,22],
  // Left eye ring
  [36,37,41],[37,40,41],[37,38,40],[38,39,40],
  [36,41,40],[36,37,40],
  // Right eye ring
  [42,43,47],[43,46,47],[43,44,46],[44,45,46],
  [42,47,46],[42,43,46],
  // Nose bridge
  [27,28,39],[27,28,42],[28,29,40],[28,29,47],
  [29,30,31],[29,30,35],[30,31,32],[31,32,50],
  [32,33,50],[33,34,51],[34,35,52],[35,42,46],
  // Nose base
  [30,35,29],[31,32,48],[32,33,49],[33,34,51],[34,35,52],
  // Cheeks
  [1,2,41],[2,3,31],[3,31,48],[2,31,41],[31,41,48],
  [36,41,1],[0,1,36],[17,18,36],[18,36,37],
  [13,14,35],[14,15,35],[14,35,46],[35,45,46],[45,46,15],
  [24,25,26],[25,26,45],[25,46,45],[24,46,25],
  // Mid face
  [39,40,28],[39,40,29],[40,47,29],[28,39,27],[28,47,27],
  [36,40,41],[38,39,40],
  // Mouth outer
  [48,49,60],[49,50,61],[50,51,62],[51,52,63],
  [52,53,63],[53,54,64],[54,55,64],[55,56,65],
  [56,57,66],[57,58,66],[58,59,67],[59,48,60],
  // Mouth inner
  [60,61,67],[61,62,66],[62,63,65],[63,64,65],
  [60,67,59],[66,67,60],
  // Chin fill
  [6,7,8],[5,6,48],[10,11,54],[8,9,57],[7,8,57],
  [5,48,6],[11,54,10],[9,10,57],
  // Upper cheek to brow
  [20,21,29],[21,22,29],[22,29,30],[28,29,30],
  [36,37,40],[38,39,28],[28,30,33],[30,33,50],
  [33,50,51],[50,51,61],[51,52,53],[52,63,64],
  // Extra fill
  [3,4,31],[4,5,48],[10,11,35],[11,12,35],
  [2,3,4],[12,13,35],[13,35,54],
];

export function FaceMeshOverlay({
  videoRef, faceState, isActive,
  onFaceDetected, onNoFace, onMultiFace,
}: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const faceapiRef = useRef<any>(null);
  const loadedRef  = useRef(false);

  useEffect(() => {
    if (!isActive || loadedRef.current) return;
    (async () => {
      try {
        const faceapi = await import("face-api.js");
        faceapiRef.current = faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        loadedRef.current = true;
      } catch (e) { console.warn("face-api load failed:", e); }
    })();
  }, [isActive]);

  useEffect(() => {
    if (!isActive) { cancelAnimationFrame(rafRef.current); clearCanvas(); return; }
    // Always show mesh when camera is active (even in waiting state)
    if (faceState === "idle") { clearCanvas(); return; }

    let last = 0;
    const loop = async (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - last < 80) return;
      last = ts;
      const vid = videoRef.current;
      if (!vid || vid.readyState < 2) return;

      if (faceapiRef.current && loadedRef.current) {
        try {
          const faceapi = faceapiRef.current;
          const dets = await faceapi
            .detectAllFaces(vid, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
            .withFaceLandmarks();

          if (dets.length === 0) { clearCanvas(); onNoFace?.(); return; }
          if (dets.length > 1) onMultiFace?.();

          const pts = dets[0].landmarks.positions;
          // Scale 20% outward from center for FULL face coverage
          const cx = pts.reduce((s: number, p: any) => s + p.x, 0) / pts.length;
          const cy = pts.reduce((s: number, p: any) => s + p.y, 0) / pts.length;
          const expanded = pts.map((p: any) => ({
            x: cx + (p.x - cx) * 1.20,
            y: cy + (p.y - cy) * 1.20,
          }));
          onFaceDetected?.(expanded);
          draw(expanded, vid);
          return;
        } catch { /* fallback */ }
      }
      await fallback(vid);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, faceState]);

  useEffect(() => {
    if (faceState === "idle" || faceState === "waiting") clearCanvas();
  }, [faceState]);

  const clearCanvas = useCallback(() => {
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
  }, []);

  const draw = useCallback((pts: { x: number; y: number }[], vid: HTMLVideoElement) => {
    const cv = canvasRef.current;
    if (!cv || pts.length < 68) return;
    const W = vid.videoWidth || 640;
    const H = vid.videoHeight || 480;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    // Color based on state — always cyan like reference image
    const lineColor =
      faceState === "success" ? "rgba(0,255,128,0.85)"  :
      faceState === "failure" ? "rgba(255,80,80,0.85)"  :
      faceState === "review"  ? "rgba(255,200,0,0.85)"  :
      "rgba(0,220,200,0.82)";  // Cyan — matches reference

    const dotColor =
      faceState === "success" ? "#AAFFD4" :
      faceState === "failure" ? "#FFAAAA" :
      faceState === "review"  ? "#FFE98A" :
      "#FFFFFF";  // White dots — matches reference

    const glowColor =
      faceState === "success" ? "rgba(0,255,128,0.6)"  :
      faceState === "failure" ? "rgba(255,80,80,0.6)"  :
      faceState === "review"  ? "rgba(255,200,0,0.6)"  :
      "rgba(0,220,200,0.5)";

    // 1. Very subtle filled triangles
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = lineColor;
    for (const [a, b, c] of TRIANGLES) {
      if (a >= pts.length || b >= pts.length || c >= pts.length) continue;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.lineTo(pts[c].x, pts[c].y);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Triangle edge lines — thin, glowing cyan
    ctx.globalAlpha = 1;
    ctx.lineWidth   = 1.4;
    ctx.strokeStyle = lineColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur  = 5;
    for (const [a, b, c] of TRIANGLES) {
      if (a >= pts.length || b >= pts.length || c >= pts.length) continue;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.lineTo(pts[c].x, pts[c].y);
      ctx.closePath();
      ctx.stroke();
    }

    // 3. White glowing dots at each landmark
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    for (let i = 0; i < pts.length; i++) {
      // Slightly bigger dots at key landmarks (eyes, nose tip, mouth corners, chin)
      const isKey = [8, 27, 30, 33, 36, 39, 42, 45, 48, 54, 51, 57, 0, 16].includes(i);
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, isKey ? 3.0 : 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  }, [faceState]);

  const fallback = useCallback(async (vid: HTMLVideoElement) => {
    const W = vid.videoWidth || 640;
    const H = vid.videoHeight || 480;
    let box = { x: W * 0.32, y: H * 0.06, w: W * 0.36, h: H * 0.78 };

    // @ts-ignore
    if ("FaceDetector" in window) {
      try {
        // @ts-ignore
        const det = new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true });
        const faces = await det.detect(vid);
        if (faces.length === 0) { clearCanvas(); onNoFace?.(); return; }
        const f = faces[0].boundingBox;
        const ph = f.height * 0.30;
        const pw = f.width  * 0.08;
        box = { x: f.x - pw, y: f.y - ph * 0.6, w: f.width + pw * 2, h: f.height + ph };
        onFaceDetected?.([]);
      } catch { /* use default */ }
    }

    const pts = buildEstimated(box);
    draw(pts, vid);
  }, [draw, clearCanvas, onNoFace, onFaceDetected]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
      aria-hidden
    />
  );
}

/** Build estimated 68-point landmark grid from bounding box */
function buildEstimated(box: { x: number; y: number; w: number; h: number }) {
  const { x, y, w, h } = box;
  const p = (nx: number, ny: number) => ({ x: x + nx * w, y: y + ny * h });
  return [
    // Jawline 0-16
    p(0.07,0.38),p(0.09,0.52),p(0.11,0.66),p(0.16,0.78),p(0.22,0.87),
    p(0.31,0.94),p(0.41,0.97),p(0.50,0.99),p(0.59,0.97),
    p(0.69,0.94),p(0.78,0.87),p(0.84,0.78),p(0.89,0.66),
    p(0.91,0.52),p(0.93,0.38),p(0.91,0.26),p(0.89,0.16),
    // Left brow 17-21
    p(0.18,0.24),p(0.26,0.20),p(0.34,0.19),p(0.42,0.21),p(0.48,0.25),
    // Right brow 22-26
    p(0.52,0.25),p(0.58,0.21),p(0.66,0.19),p(0.74,0.20),p(0.82,0.24),
    // Nose bridge 27-30
    p(0.50,0.30),p(0.50,0.37),p(0.50,0.44),p(0.50,0.51),
    // Nose base 31-35
    p(0.41,0.56),p(0.44,0.60),p(0.50,0.62),p(0.56,0.60),p(0.59,0.56),
    // Left eye 36-41
    p(0.26,0.33),p(0.31,0.30),p(0.37,0.30),p(0.42,0.33),p(0.37,0.37),p(0.31,0.37),
    // Right eye 42-47
    p(0.58,0.33),p(0.63,0.30),p(0.69,0.30),p(0.74,0.33),p(0.69,0.37),p(0.63,0.37),
    // Outer lips 48-59
    p(0.35,0.71),p(0.40,0.68),p(0.45,0.67),p(0.50,0.68),
    p(0.55,0.67),p(0.60,0.68),p(0.65,0.71),
    p(0.60,0.77),p(0.55,0.79),p(0.50,0.80),p(0.45,0.79),p(0.40,0.77),
    // Inner lips 60-67
    p(0.40,0.72),p(0.45,0.70),p(0.50,0.70),p(0.55,0.70),
    p(0.60,0.72),p(0.55,0.77),p(0.50,0.78),p(0.45,0.77),
  ];
}
