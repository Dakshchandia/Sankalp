"use client";

import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { workerService } from "@/services/worker.service";
import { attendanceService } from "@/services/attendance.service";
import { formatCurrency } from "@/utils/formatters";
import type { Worker } from "@/types/worker.types";

export default function ExpectedWagePage() {
  const { workerId } = useAuth();
  const [worker,   setWorker]   = useState<Worker | null>(null);
  const [summary,  setSummary]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!workerId) { setLoading(false); return; }
    Promise.all([
      workerService.getWorker(workerId),
      attendanceService.getMyAttendanceSummary(),
    ]).then(([w, s]) => { setWorker(w as Worker); setSummary(s); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [workerId]);

  const workingDaysMonth = 26;
  const presentDays  = summary?.monthPresent ?? worker?.presentDays ?? 0;
  const dailyWage    = worker?.dailyWage ?? 0;
  const earned       = dailyWage * presentDays;
  const fullMonthWage= dailyWage * workingDaysMonth;
  const pct          = fullMonthWage > 0 ? (earned / fullMonthWage) * 100 : 0;

  if (loading) return (
    <div className="max-w-2xl space-y-4 animate-pulse">
      {[0,1,2].map(i => <div key={i} className="h-28 rounded-xl skeleton" />)}
    </div>
  );

  if (!workerId) return (
    <div className="max-w-2xl bg-white rounded-xl p-8 text-center"
         style={{ border: "1px solid #FEF3C7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#F59E0B" }} />
      <p className="font-semibold" style={{ color: "#1A1A2E" }}>Profile Not Linked</p>
      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Contact your supervisor to link your account.</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Expected Wage</h1>
        <p className="page-subtitle">Your estimated earnings for this month</p>
      </div>

      {/* Main earnings card */}
      <div className="bg-white rounded-xl p-6 relative overflow-hidden"
           style={{ border: "1px solid #E8EAED", borderLeft: "4px solid #22C55E", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#9CA3AF" }}>Expected This Month</p>
            <p className="text-4xl font-bold" style={{ color: "#1A1A2E" }}>{formatCurrency(earned)}</p>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Based on {presentDays} present days</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ background: "#F0FDF4" }}>
            <IndianRupee className="w-6 h-6" style={{ color: "#22C55E" }} />
          </div>
        </div>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "#6B7280" }}>
            <span>Progress towards full month</span>
            <span className="font-semibold" style={{ color: "#1A1A2E" }}>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: "#22C55E" }} />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: "#9CA3AF" }}>
            <span>₹0</span>
            <span>{formatCurrency(fullMonthWage)} full month ({workingDaysMonth} days)</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "#1A1A2E" }}>Wage Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Daily Wage Rate",          value: `${formatCurrency(dailyWage)}/day`, icon: IndianRupee, color: "#22C55E", bg: "#F0FDF4" },
            { label: "Present Days This Month",  value: `${presentDays} days`,              icon: CheckCircle, color: "#22C55E", bg: "#F0FDF4" },
            { label: "Working Days in Month",    value: `${workingDaysMonth} days`,          icon: Calendar,    color: "#3B82F6", bg: "#EFF6FF" },
            { label: "Attendance Rate",          value: `${summary?.attendancePercentage ?? 0}%`, icon: TrendingUp, color: "#3B82F6", bg: "#EFF6FF" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center justify-between py-3 px-4 rounded-xl"
                 style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm" style={{ color: "#374151" }}>{label}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl"
               style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <span className="text-sm font-semibold" style={{ color: "#374151" }}>Total Expected Earnings</span>
            <span className="text-xl font-bold" style={{ color: "#16A34A" }}>{formatCurrency(earned)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 flex gap-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <span className="text-sm" style={{ color: "#1D4ED8" }}>ℹ️</span>
        <p className="text-xs" style={{ color: "#1E40AF" }}>
          Expected wages are calculated based on verified attendance only. Final disbursement is subject to supervisor review and government scheme guidelines.
        </p>
      </div>
    </div>
  );
}
