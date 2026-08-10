import api from "./api";
import type {
  Worker,
  WorkerFilters,
  WorkerFormData,
  WorkerListResponse,
} from "@/types/worker.types";

/**
 * Worker management service for SANKALP platform.
 */
export const workerService = {
  /**
   * Fetch paginated list of workers with filters.
   */
  async getWorkers(filters: WorkerFilters = {}): Promise<WorkerListResponse> {
    const { data } = await api.get<WorkerListResponse>("/workers", {
      params: filters,
    });
    return data;
  },

  /**
   * Fetch a single worker by their ID.
   */
  async getWorker(workerId: string): Promise<Worker> {
    const { data } = await api.get<Worker>(`/workers/${workerId}`);
    return data;
  },

  /**
   * Register a new worker with optional profile image.
   */
  async registerWorker(formData: WorkerFormData & { profileImage?: File }): Promise<Worker> {
    const payload = new FormData();
    payload.append("fullName", formData.fullName);
    payload.append("workerId", formData.workerId);
    payload.append("village", formData.village);
    payload.append("department", formData.department);
    payload.append("dailyWage", String(formData.dailyWage));
    payload.append("phone", formData.phone);
    payload.append("gender", formData.gender);
    payload.append("age", String(formData.age));
    if (formData.profileImage) {
      payload.append("profileImage", formData.profileImage);
    }

    const { data } = await api.post<Worker>("/workers", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * Update an existing worker's details.
   */
  async updateWorker(
    workerId: string,
    formData: Partial<WorkerFormData> & { profileImage?: File }
  ): Promise<Worker> {
    const payload = new FormData();
    if (formData.fullName) payload.append("fullName", formData.fullName);
    if (formData.village) payload.append("village", formData.village);
    if (formData.department) payload.append("department", formData.department);
    if (formData.dailyWage !== undefined)
      payload.append("dailyWage", String(formData.dailyWage));
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.gender) payload.append("gender", formData.gender);
    if (formData.age !== undefined) payload.append("age", String(formData.age));
    if (formData.profileImage) {
      payload.append("profileImage", formData.profileImage);
    }

    const { data } = await api.put<Worker>(`/workers/${workerId}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * Delete a worker by their ID.
   */
  async deleteWorker(workerId: string): Promise<void> {
    await api.delete(`/workers/${workerId}`);
  },

  /**
   * Enroll a worker's face by uploading face images.
   */
  async enrollFace(
    workerId: string,
    images: File[]
  ): Promise<{ success: boolean; message: string }> {
    const payload = new FormData();
    images.forEach((img, idx) => {
      payload.append(`face_image_${idx}`, img);
    });

    const { data } = await api.post(
      `/workers/${workerId}/enroll-face`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /**
   * Get attendance summary for a specific worker.
   */
  async getWorkerAttendanceSummary(workerId: string) {
    const { data } = await api.get(`/workers/${workerId}/attendance-summary`);
    return data;
  },

  /**
   * Check if a worker ID is already taken.
   */
  async checkWorkerIdAvailable(
    workerId: string
  ): Promise<{ available: boolean }> {
    const { data } = await api.get(`/workers/check-id/${workerId}`);
    return data;
  },
};
