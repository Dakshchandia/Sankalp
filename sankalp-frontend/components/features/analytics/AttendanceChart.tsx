"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DayData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface AttendanceChartProps {
  data: DayData[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-900 mb-2">
        {label ? format(parseISO(label), "EEE, MMM d") : ""}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span style={{ color: p.color }} className="font-medium capitalize">{p.name}</span>
          <span className="font-bold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AttendanceChart({ data }: AttendanceChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    displayDate: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Attendance Trend</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 bg-green-500 rounded inline-block" /> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 bg-red-400 rounded inline-block" /> Absent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-1 bg-yellow-400 rounded inline-block" /> Late
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="present"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#presentGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="absent"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#absentGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="late"
            stroke="#eab308"
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            iconType="plainline"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
