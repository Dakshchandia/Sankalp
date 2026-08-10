import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { AnalyticsData } from "@/types/analytics.types";

interface SmartInsightsProps {
  data: AnalyticsData;
}

interface Insight {
  type: "success" | "warning" | "info" | "trend-up" | "trend-down";
  text: string;
}

function generateInsights(data: AnalyticsData): Insight[] {
  const insights: Insight[] = [];
  const avg = data.summary?.attendancePercentage ?? 0;

  if (avg >= 85) {
    insights.push({
      type: "success",
      text: `Excellent attendance rate of ${avg.toFixed(1)}% — above the 85% benchmark.`,
    });
  } else if (avg >= 75) {
    insights.push({
      type: "warning",
      text: `Attendance at ${avg.toFixed(1)}% — slightly below target. Focus on high-absence workers.`,
    });
  } else {
    insights.push({
      type: "trend-down",
      text: `Critical: Attendance at ${avg.toFixed(1)}%. Immediate intervention recommended.`,
    });
  }

  const sortedDepts = [...(data.departmentStats || [])].sort((a, b) => b.percentage - a.percentage);
  const topDept = sortedDepts[0];
  if (topDept) {
    insights.push({
      type: "trend-up",
      text: `${topDept.department} leads with ${topDept.percentage}% attendance rate this period.`,
    });
  }

  const lowestDept = sortedDepts[sortedDepts.length - 1];
  if (lowestDept && lowestDept.percentage < 80) {
    insights.push({
      type: "warning",
      text: `${lowestDept.department} has the lowest attendance (${lowestDept.percentage}%). Consider follow-up.`,
    });
  }

  const weekendData = data.weeklyTrend?.find((d) => d.date.includes("Sat"));
  if (weekendData && weekendData.percentage < 75) {
    insights.push({
      type: "info",
      text: `Saturday attendance drops to ${weekendData.percentage}% — plan work allocation accordingly.`,
    });
  }

  return insights;
}

const iconMap = {
  success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  info: { icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-50" },
  "trend-up": { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  "trend-down": { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
};

export function SmartInsights({ data }: SmartInsightsProps) {
  const insights = generateInsights(data);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-semibold text-gray-900">Smart Insights</h3>
        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
          AI Generated
        </span>
      </div>
      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const { icon: Icon, color, bg } = iconMap[insight.type];
          return (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
              <p className="text-xs text-gray-700 leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
        {insights.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            Insufficient data for insights
          </p>
        )}
      </div>
    </div>
  );
}
