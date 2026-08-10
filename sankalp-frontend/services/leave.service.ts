import api from "./api";

export interface LeaveRequest {
  id: string;
  workerId: string;
  workerName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  decidedBy?: string;
  decidedAt?: string;
  rejectReason?: string;
  createdAt: string;
}

export interface LeaveFormData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export const leaveService = {
  /** Worker: submit leave application */
  async submitLeave(data: LeaveFormData): Promise<LeaveRequest> {
    const { data: res } = await api.post<LeaveRequest>("/leaves", data);
    return res;
  },

  /** Worker: get own leave history */
  async getMyLeaves(): Promise<LeaveRequest[]> {
    const { data } = await api.get<LeaveRequest[]>("/leaves/me");
    return data;
  },

  /** Manager: get all pending leave requests */
  async getPendingLeaves(): Promise<LeaveRequest[]> {
    const { data } = await api.get<LeaveRequest[]>("/leaves/pending");
    return data;
  },

  /** Manager: get all leave requests */
  async getAllLeaves(status?: string): Promise<LeaveRequest[]> {
    const { data } = await api.get<LeaveRequest[]>("/leaves", { params: status ? { status } : {} });
    return data;
  },

  /** Manager: approve or reject a leave request */
  async decideLeave(leaveId: string, decision: "approved" | "rejected", rejectReason?: string): Promise<LeaveRequest> {
    const { data } = await api.post<LeaveRequest>(`/leaves/${leaveId}/decide`, { decision, rejectReason });
    return data;
  },
};
