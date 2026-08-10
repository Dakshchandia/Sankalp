import api from "./api";
import type {
  AttendanceRecord,
  AttendanceFilters,
  FaceRecognitionResult,
  ManualReview,
} from "@/types/attendance.types";

/**
 * Attendance service for SANKALP platform.
 * Handles face recognition, attendance recording, and manual reviews.
 */
export const attendanceService = {
  /**
   * Submit a captured face image for recognition and attendance marking.
   */
  async markAttendance(
    capturedImageBlob: Blob,
    sessionId: string
  ): Promise<FaceRecognitionResult> {
    const payload = new FormData();
    payload.append(
      "face_image",
      capturedImageBlob,
      `capture_${Date.now()}.jpg`
    );
    payload.append("session_id", sessionId);

    const { data } = await api.post<FaceRecognitionResult>(
      "/attendance/mark",
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /**
   * Start an attendance session.
   */
  async startSession(): Promise<{ sessionId: string; startedAt: string }> {
    const { data } = await api.post("/attendance/sessions/start");
    return data;
  },

  /**
   * End the current attendance session.
   */
  async endSession(sessionId: string): Promise<void> {
    await api.post(`/attendance/sessions/${sessionId}/end`);
  },

  /**
   * Get attendance records with optional filters.
   */
  async getAttendanceRecords(filters: AttendanceFilters = {}) {
    const { data } = await api.get("/attendance", { params: filters });
    return data;
  },

  /**
   * Get today's attendance feed (for dashboard and attendance page).
   */
  async getTodayFeed(): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>("/attendance/today");
    return data;
  },

  /**
   * Get all pending manual reviews.
   */
  async getPendingReviews(): Promise<ManualReview[]> {
    const { data } = await api.get<ManualReview[]>("/manual-reviews/pending");
    return data;
  },

  /**
   * Approve or reject a manual review.
   */
  async submitReview(
    reviewId: string,
    decision: "approved" | "rejected",
    remarks?: string
  ): Promise<ManualReview> {
    const { data } = await api.post<ManualReview>(
      `/manual-reviews/${reviewId}/decide`,
      { decision, remarks }
    );
    return data;
  },

  /**
   * Get worker's own attendance summary (worker-scoped).
   */
  async getMyAttendanceSummary(): Promise<{
    workerId: string;
    totalPresent: number;
    totalAbsent: number;
    attendancePercentage: number;
    monthPresent: number;
    monthAbsent: number;
    expectedWage: number;
    dailyWage: number;
  }> {
    const { data } = await api.get("/attendance/me/summary");
    return data;
  },

  /**
   * Get worker's own attendance history for graph (worker-scoped).
   */
  async getMyHistory(range: "7d" | "30d" = "30d"): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>("/attendance/me/history", { params: { range } });
    return data;
  },

  /**
   * Get worker's personal attendance history.
   */
  async getWorkerAttendance(
    workerId: string,
    filters: AttendanceFilters = {}
  ): Promise<AttendanceRecord[]> {
    const { data } = await api.get<AttendanceRecord[]>(
      `/attendance/worker/${workerId}`,
      { params: filters }
    );
    return data;
  },

  /**
   * Get current active attendance session.
   */
  async getActiveSession(): Promise<{
    sessionId: string | null;
    isActive: boolean;
  }> {
    const { data } = await api.get("/attendance/sessions/active");
    return data;
  },
};
