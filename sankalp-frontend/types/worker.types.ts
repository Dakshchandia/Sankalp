export type Gender = "male" | "female" | "other";

export interface Worker {
  id: string;
  workerId: string;
  fullName: string;
  phone: string;
  village: string;
  department: string;
  dailyWage: number;
  gender: Gender;
  age: number;
  profileImage?: string;
  faceEnrolled: boolean;
  createdAt: string;
  updatedAt?: string;
  // Computed fields from backend
  attendancePercentage?: number;
  presentDays?: number;
  lateDays?: number;
  absentDays?: number;
  expectedMonthlyWage?: number;
  status?: "active" | "inactive";
}

export interface WorkerFormData {
  fullName: string;
  workerId: string;
  village: string;
  department: string;
  dailyWage: number;
  phone: string;
  gender: Gender;
  age: number;
  profileImage?: File;
}

export interface WorkerFilters {
  search?: string;
  village?: string;
  department?: string;
  attendanceMin?: number;
  attendanceMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface WorkerListResponse {
  workers: Worker[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
