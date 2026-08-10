"use client";

import { useEffect, useState } from "react";
import { User, Phone, MapPin, Building2, IndianRupee, Calendar, Camera, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { workerService } from "@/services/worker.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, formatPhone, getInitials } from "@/utils/formatters";
import { API_BASE_URL } from "@/lib/constants";
import type { Worker } from "@/types/worker.types";

export default function WorkerProfilePage() {
  const { user, workerId } = useAuth();
  const [worker,   setWorker]   = useState<Worker | null>(null);
  const [isLoading,setIsLoading]= useState(true);

  useEffect(() => {
    if (!workerId) { setIsLoading(false); return; }
    workerService.getWorker(workerId)
      .then(setWorker)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [workerId]);

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      {[0,1,2].map(i => <div key={i} className="rounded-2xl h-32" style={{ background:"#0C1623" }} />)}
    </div>
  );

  if (!workerId) return (
    <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center"
         style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)" }}>
      <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color:"#F59E0B" }} />
      <p className="font-bold text-white">Profile Not Linked</p>
      <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.5)" }}>
        Your account is not linked to a worker profile. Please contact your supervisor.
      </p>
    </div>
  );

  if (!worker) return (
    <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center"
         style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>Worker profile not found.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-black text-white text-2xl tracking-tight" style={{ letterSpacing:"-0.03em" }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>Your worker profile information</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-6" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
               style={{ background:"rgba(255,255,255,0.04)", border:"2px solid rgba(255,255,255,0.08)" }}>
            {worker.profileImage ? (
              <img src={`${API_BASE_URL}/uploads/${worker.profileImage}`} alt={worker.fullName}
                   className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold" style={{ color:"rgba(255,255,255,0.3)" }}>
                {getInitials(worker.fullName)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{worker.fullName}</h2>
            <code className="text-xs px-2 py-0.5 rounded-lg mt-1 inline-block font-mono"
                  style={{ background:"rgba(34,197,94,0.1)", color:"#22C55E", border:"1px solid rgba(34,197,94,0.2)" }}>
              {worker.workerId.toUpperCase()}
            </code>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={worker.faceEnrolled ? "active" : "inactive"} />
              <span className="text-xs" style={{ color: worker.faceEnrolled ? "#22C55E" : "#F59E0B" }}>
                {worker.faceEnrolled ? "Face Enrolled" : "Face Not Enrolled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-bold text-sm text-white mb-4 pb-3"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Phone,       label:"Phone",       value: formatPhone(worker.phone) },
            { icon: MapPin,      label:"Village",     value: worker.village },
            { icon: Building2,   label:"Department",  value: worker.department },
            { icon: IndianRupee, label:"Daily Wage",  value:`${formatCurrency(worker.dailyWage)}/day` },
            { icon: Calendar,    label:"Registered",  value: formatDate(worker.createdAt) },
            { icon: User,        label:"Gender",      value: worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background:"rgba(255,255,255,0.04)" }}>
                <Icon className="w-4 h-4" style={{ color:"rgba(255,255,255,0.3)" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biometric status */}
      <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-bold text-sm text-white mb-4 pb-3"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>Biometric Status</h3>
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5" style={{ color: worker.faceEnrolled ? "#22C55E" : "#F59E0B" }} />
          <div>
            <p className="text-sm font-semibold text-white">Face Recognition</p>
            <p className="text-xs mt-0.5" style={{ color: worker.faceEnrolled ? "#22C55E" : "#F59E0B" }}>
              {worker.faceEnrolled
                ? "✓ Face enrolled — attendance can be verified automatically"
                : "⚠ Not enrolled — contact supervisor to enroll your face"}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-bold text-sm text-white mb-4 pb-3"
            style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>Attendance Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          {[
            { label:"Present", value: worker.presentDays ?? 0,  color:"#22C55E" },
            { label:"Late",    value: worker.lateDays    ?? 0,  color:"#F59E0B" },
            { label:"Absent",  value: worker.absentDays  ?? 0,  color:"#EF4444" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="pt-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>Overall Attendance</span>
            <span className="font-black text-lg" style={{ color:"#22C55E" }}>
              {(worker.attendancePercentage ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full"
                 style={{ width:`${worker.attendancePercentage ?? 0}%`, background:"#22C55E" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
