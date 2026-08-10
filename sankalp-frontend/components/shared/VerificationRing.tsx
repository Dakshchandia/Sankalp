"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VerificationRingProps {
  /** "confirmed" = solid green ring, "pending" = dashed amber ring */
  status: "confirmed" | "pending";
  /** trigger key — change this value to re-fire the animation */
  triggerKey?: string | number;
  /** size of the container the ring wraps around */
  size?: number;
  className?: string;
}

/**
 * The SANKALP Verification Ring.
 * Wrap any element in a relative-positioned container and place this inside.
 * Pass a new `triggerKey` to replay the animation.
 */
export function VerificationRing({ status, triggerKey, size, className }: VerificationRingProps) {
  const [rings, setRings] = useState<number[]>([]);

  useEffect(() => {
    if (triggerKey === undefined) return;
    const id = Date.now();
    setRings((prev) => [...prev, id]);
    const timer = setTimeout(() => {
      setRings((prev) => prev.filter((r) => r !== id));
    }, 700);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  // Also fire on mount if triggerKey provided
  useEffect(() => {
    if (triggerKey === undefined) return;
    const id = Date.now();
    setRings([id]);
    const timer = setTimeout(() => setRings([]), 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {rings.map((id) => (
        <span
          key={id}
          aria-hidden
          className={cn(
            "pointer-events-none absolute rounded-full",
            status === "confirmed" ? "v-ring-confirmed" : "v-ring-pending",
            className
          )}
          style={size ? { inset: -Math.round(size * 0.08) } : undefined}
        />
      ))}
    </>
  );
}

/**
 * Static ring variant — always visible, no animation. Useful for "on file" indicators.
 */
export function VerificationRingStatic({ status }: { status: "confirmed" | "pending" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-[-4px] rounded-full",
        status === "confirmed"
          ? "border-2 border-[var(--sankalp-green)] opacity-60"
          : "border-2 border-dashed border-[var(--alert-amber)] opacity-60"
      )}
    />
  );
}
