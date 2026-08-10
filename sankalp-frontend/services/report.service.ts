import api from "./api";

export type ReportType =
  | "today"
  | "weekly"
  | "monthly"
  | "department"
  | "village"
  | "worker";

export interface ReportFilters {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  department?: string;
  village?: string;
  workerId?: string;
}

/**
 * Report generation and CSV export service.
 */
export const reportService = {
  /**
   * Generate a report and return metadata.
   */
  async generateReport(filters: ReportFilters) {
    const { data } = await api.post("/reports/generate", filters);
    return data;
  },

  /**
   * Download a CSV report as a Blob.
   */
  async downloadCSV(filters: ReportFilters): Promise<Blob> {
    const response = await api.post("/reports/export-csv", filters, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  /**
   * Get list of previously generated reports.
   */
  async getReports(page: number = 1, pageSize: number = 10) {
    const { data } = await api.get("/reports", { params: { page, pageSize } });
    return data;
  },

  /**
   * Helper: trigger browser download for a CSV Blob.
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
