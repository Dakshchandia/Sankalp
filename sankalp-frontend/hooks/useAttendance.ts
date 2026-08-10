"use client";

import { useState, useCallback, useEffect } from "react";
import { attendanceService } from "@/services/attendance.service";
import { useAppStore } from "@/store/useAppStore";
import type { ManualReview } from "@/types/attendance.types";
import { toast } from "sonner";

/**
 * Hook for managing the live attendance session (camera, recognition, feed).
 */
export function useAttendanceSession() {
  const { sessionId, isSessionActive, setSession, addAttendanceRecord } =
    useAppStore();
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const startSession = useCallback(async () => {
    setIsStarting(true);
    try {
      const result = await attendanceService.startSession();
      setSession(result.sessionId, true);
      toast.success("Attendance session started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setIsStarting(false);
    }
  }, [setSession]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setIsEnding(true);
    try {
      await attendanceService.endSession(sessionId);
      setSession(null, false);
      toast.success("Attendance session ended");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to end session");
    } finally {
      setIsEnding(false);
    }
  }, [sessionId, setSession]);

  const processFrame = useCallback(
    async (imageBlob: Blob) => {
      if (!sessionId || !isSessionActive) return null;
      try {
        const result = await attendanceService.markAttendance(
          imageBlob,
          sessionId
        );
        if (result.success && result.workerId) {
          // Add to live feed
          addAttendanceRecord({
            id: result.attendanceId ?? Date.now().toString(),
            workerId: result.workerId,
            workerName: result.workerName ?? "Unknown",
            workerImage: result.workerImage,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().split(" ")[0],
            status: result.status ?? "present",
            confidence: result.confidence ?? 0,
            reviewStatus: result.requiresReview ? "pending" : "auto_approved",
            createdAt: new Date().toISOString(),
          });
        }
        return result;
      } catch {
        return null;
      }
    },
    [sessionId, isSessionActive, addAttendanceRecord]
  );

  return {
    sessionId,
    isSessionActive,
    isStarting,
    isEnding,
    startSession,
    endSession,
    processFrame,
  };
}

/**
 * Hook for managing manual reviews.
 */
export function useManualReviews() {
  const [reviews, setReviews] = useState<ManualReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setPendingReviewCount } = useAppStore();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getPendingReviews();
      setReviews(data);
      setPendingReviewCount(data.length);
    } catch {
      // silently fail — component will show error state
    } finally {
      setIsLoading(false);
    }
  }, [setPendingReviewCount]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = useCallback(
    async (
      reviewId: string,
      decision: "approved" | "rejected",
      remarks?: string
    ) => {
      try {
        await attendanceService.submitReview(reviewId, decision, remarks);
        toast.success(
          decision === "approved"
            ? "Attendance approved successfully"
            : "Attendance rejected"
        );
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setPendingReviewCount(reviews.length - 1);
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Review failed");
        return false;
      }
    },
    [reviews.length, setPendingReviewCount]
  );

  return { reviews, isLoading, submitReview, refresh: fetchReviews };
}
