/**
 * Application-wide constants for SANKALP platform.
 * Never hardcode these values in components — always import from here.
 */

export const APP_NAME = "SANKALP";
export const APP_TAGLINE = "Empowering Transparent Rural Workforce Management";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const TOKEN_KEY = "sankalp_token";
export const USER_KEY = "sankalp_user";

/** Attendance confidence thresholds */
export const CONFIDENCE_THRESHOLD = 70; // % above which attendance is auto-approved
export const CONFIDENCE_LOW = 50; // % below which attendance is rejected

/** Attendance statuses */
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  PENDING: "pending_review",
} as const;

/** User roles */
export const ROLES = {
  SUPERVISOR: "supervisor",
  WORKER: "worker",
} as const;

/** Default departments */
export const DEFAULT_DEPARTMENTS = [
  "Construction",
  "Road Works",
  "Water Supply",
  "Sanitation",
  "Agriculture",
  "Horticulture",
  "Forestry",
  "Others",
];

/** Default working hours */
export const DEFAULT_WORKING_HOURS = {
  START: "08:00",
  END: "17:00",
  LATE_AFTER: "09:00",
};

/** Pagination defaults */
export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** File upload constraints */
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Chart colors aligned with brand palette */
export const CHART_COLORS = {
  present: "#16a34a",
  late: "#ca8a04",
  absent: "#dc2626",
  pending: "#94a3b8",
  primary: "#2563eb",
  secondary: "#7c3aed",
};

/** Navigation routes */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SUPERVISOR: {
    DASHBOARD:      "/supervisor/dashboard",
    WORKERS:        "/supervisor/workers",
    WORKER_REGISTER:"/supervisor/workers/register",
    ATTENDANCE:     "/supervisor/attendance",
    MANUAL_REVIEW:  "/supervisor/manual-review",
    LEAVE_REQUESTS:  "/supervisor/leave-requests",
    DOCUMENT_REVIEW: "/supervisor/document-review",
    ANALYTICS:      "/supervisor/analytics",
    REPORTS:        "/supervisor/reports",
    AUDIT_LOGS:     "/supervisor/audit-logs",
    SETTINGS:       "/supervisor/settings",
  },
  WORKER: {
    DASHBOARD:          "/worker/dashboard",
    ATTENDANCE_HISTORY: "/worker/attendance-history",
    FACE_ATTENDANCE:    "/worker/face-attendance",
    LEAVE:              "/worker/leave",
    DOCUMENTS:          "/worker/documents",
    PROFILE:            "/worker/profile",
    EXPECTED_WAGE:      "/worker/expected-wage",
    SETTINGS:           "/worker/settings",
  },
} as const;

/** Status color mapping */
export const STATUS_COLORS = {
  present: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  late: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  absent: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
  pending_review: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
} as const;
