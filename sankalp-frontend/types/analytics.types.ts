export interface AttendanceSummary {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface DepartmentStats {
  department: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface VillageStats {
  village: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalWorkers: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendancePercentage: number;
  expectedPayrollToday: number;
  expectedPayrollMonth: number;
  avgArrivalTime: string;
  pendingReviews: number;
}

export interface SmartInsight {
  type: "success" | "warning" | "info" | "danger";
  title: string;
  description: string;
  icon?: string;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyTrend: AttendanceSummary[];
  weeklyTrend: AttendanceSummary[];
  monthlyTrend: AttendanceSummary[];
  departmentStats: DepartmentStats[];
  villageStats: VillageStats[];
  insights: SmartInsight[];
  topWorkers: {
    workerId: string;
    fullName: string;
    attendancePercentage: number;
    department: string;
  }[];
  lowAttendanceWorkers: {
    workerId: string;
    fullName: string;
    attendancePercentage: number;
    department: string;
    village: string;
  }[];
}
