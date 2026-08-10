"use client";

import { useState } from "react";
import { Settings, Clock, Building2, KeyRound, Save, PlusCircle, X, Shield } from "lucide-react";
import { DEFAULT_DEPARTMENTS } from "@/lib/constants";
import { changePasswordSchema, type ChangePasswordFormData } from "@/utils/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { InlineError } from "@/components/shared/ErrorState";

const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"system" | "password">("system");
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [newDept, setNewDept] = useState("");
  const [attendanceThreshold, setAttendanceThreshold] = useState(70);
  const [lateAfterTime, setLateAfterTime] = useState("09:00");
  const [workStart, setWorkStart] = useState("08:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const addDepartment = () => {
    const t = newDept.trim();
    if (!t || departments.includes(t)) return;
    setDepartments((p) => [...p, t]);
    setNewDept("");
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Settings saved");
    setIsSaving(false);
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setServerError(null);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const tabs = [
    { id: "system",   label: "System Settings", icon: Settings },
    { id: "password", label: "Change Password",  icon: Shield },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-bold text-2xl tracking-tight" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Configure system behaviour and account preferences</p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
              style={
                activeTab === tab.id
                  ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow-xs)" }
                  : { color: "var(--text-2)" }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "system" && (
        <div className="space-y-4">
          {/* Attendance Settings */}
          <div className="rounded-2xl p-6 space-y-5" style={cardStyle}>
            <div className="flex items-center gap-2.5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(15,118,110,0.08)" }}>
                <Settings className="w-4 h-4" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Attendance Settings</h2>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>Configure recognition thresholds and work hours</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>
                  Confidence Threshold — <span style={{ color: "var(--primary)" }}>{attendanceThreshold}%</span>
                </label>
                <input
                  type="range" min={50} max={95} value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "var(--primary)" }}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>Faces below this go to Manual Review</p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>Mark Late After</label>
                <input type="time" value={lateAfterTime} onChange={(e) => setLateAfterTime(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--text)" }}>
                  <Clock className="w-3 h-3" /> Work Start Time
                </label>
                <input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--text)" }}>
                  <Clock className="w-3 h-3" /> Work End Time
                </label>
                <input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
            <div className="flex items-center gap-2.5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(29,78,216,0.08)" }}>
                <Building2 className="w-4 h-4" style={{ color: "var(--secondary)" }} />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Departments</h2>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>Manage available departments for worker assignment</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new department…"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDepartment()}
                className="input-field flex-1"
              />
              <button onClick={addDepartment} className="btn-secondary flex items-center gap-1.5 text-sm rounded-xl px-4">
                <PlusCircle className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <span
                  key={dept}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                >
                  {dept}
                  <button
                    onClick={() => setDepartments((p) => p.filter((d) => d !== dept))}
                    style={{ color: "var(--text-2)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--danger)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 text-sm rounded-xl px-6 py-2.5 disabled:opacity-60"
            >
              {isSaving
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                : <><Save className="w-4 h-4" />Save Settings</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="rounded-2xl p-6 space-y-5" style={cardStyle}>
          <div className="flex items-center gap-2.5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(220,38,38,0.08)" }}>
              <KeyRound className="w-4 h-4" style={{ color: "var(--danger)" }} />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Change Password</h2>
              <p className="text-xs" style={{ color: "var(--text-2)" }}>Update your account password</p>
            </div>
          </div>

          {serverError && <InlineError message={serverError} />}

          <form onSubmit={handleSubmit(onChangePassword)} noValidate className="space-y-4">
            {[
              { field: "currentPassword", label: "Current Password" },
              { field: "newPassword",     label: "New Password" },
              { field: "confirmPassword", label: "Confirm New Password" },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>{label}</label>
                <input
                  type="password"
                  className="input-field"
                  {...register(field as keyof ChangePasswordFormData)}
                />
                {errors[field as keyof ChangePasswordFormData] && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--danger)" }}>
                    {errors[field as keyof ChangePasswordFormData]?.message}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-sm flex items-center gap-2 rounded-xl px-6 py-2.5 disabled:opacity-60"
              >
                {isSubmitting ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
