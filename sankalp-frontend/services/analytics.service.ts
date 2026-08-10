import api from "./api";
import type { AnalyticsData } from "@/types/analytics.types";

/**
 * Analytics service — fetches rule-based insights and chart data.
 */
export const analyticsService = {
  /**
   * Get complete analytics data for the dashboard.
   */
  async getAnalytics(
    period: "today" | "week" | "month" = "today"
  ): Promise<AnalyticsData> {
    const { data } = await api.get<AnalyticsData>("/analytics", {
      params: { period },
    });
    return data;
  },

  /**
   * Get daily attendance trend for charts.
   */
  async getDailyTrend(days: number = 30) {
    const { data } = await api.get("/analytics/daily-trend", {
      params: { days },
    });
    return data;
  },

  /**
   * Get department-wise attendance breakdown.
   */
  async getDepartmentStats() {
    const { data } = await api.get("/analytics/department-stats");
    return data;
  },

  /**
   * Get village-wise attendance breakdown.
   */
  async getVillageStats() {
    const { data } = await api.get("/analytics/village-stats");
    return data;
  },

  /**
   * Get smart rule-based insights.
   */
  async getInsights() {
    const { data } = await api.get("/analytics/insights");
    return data;
  },

  /**
   * Get combined pending counts (leaves + documents + manual reviews).
   */
  async getPendingCounts(): Promise<{ pendingLeaves: number; pendingDocuments: number; pendingReviews: number; total: number }> {
    const { data } = await api.get("/analytics/pending-reviews-count");
    return data;
  },
};
