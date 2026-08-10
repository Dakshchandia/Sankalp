export type AttendanceStatus = "present" | "late" | "absent" | "pending_review";
export type ReviewDecision = "approved" | "rejected";

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerImage?: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  confidence: number;
  capturedImage?: string;
  reviewStatus: "auto_approved" | "pending" | "approved" | "rejected";
  supervisorId?: string;
  createdAt: string;
}

export interface ManualReview {
  id: string;
  attendanceId: string;
  attendance: AttendanceRecord;
  worker: {
    workerId: string;
    fullName: string;
    profileImage?: string;
    village: string;
    department: string;
  };
  reviewedBy?: string;
  decision?: ReviewDecision;
  remarks?: string;
  timestamp?: string;
  createdAt: string;
}

export interface AttendanceSession {
  isActive: boolean;
  startedAt?: string;
  supervisorId: string;
}

export interface FaceRecognitionResult {
  success: boolean;
  workerId?: string;
  workerName?: string;
  workerImage?: string;
  confidence?: number;
  status?: AttendanceStatus;
  message?: string;
  requiresReview?: boolean;
  attendanceId?: string;
}

export interface AttendanceFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
  workerId?: string;
  page?: number;
  pageSize?: number;
}
