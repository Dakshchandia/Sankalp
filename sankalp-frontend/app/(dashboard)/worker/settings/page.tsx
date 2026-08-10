"use client";

import { useState } from "react";
import { Settings, KeyRound, Save, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormData } from "@/utils/validators";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { InlineError } from "@/components/shared/ErrorState";

export default function WorkerSettingsPage() {
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setServerError(null);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success("Password updated successfully!");
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to change password.");
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all";

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-black text-white text-2xl tracking-tight" style={{ letterSpacing: "-0.03em" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Manage your account settings</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl p-5" style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <User className="w-5 h-5" style={{ color: "#06B6D4" }} />
          <p className="font-bold text-white text-sm">Account Information</p>
        </div>
        <div className="space-y-3">
          {[
            { label: "Name",     value: user?.name  ?? "—" },
            { label: "Email",    value: user?.email ?? "—" },
            { label: "Role",     value: "Worker" },
            { label: "Worker ID",value: user?.workerId ?? "Not linked" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2"
                 style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{row.label}</span>
              <span className="text-sm font-semibold text-white font-mono">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl p-5" style={{ background: "#0C1623", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <KeyRound className="w-5 h-5" style={{ color: "#22C55E" }} />
          <p className="font-bold text-white text-sm">Change Password</p>
        </div>

        {serverError && <InlineError message={serverError} />}

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Password
            </label>
            <input {...register("currentPassword")} type="password" placeholder="••••••••"
                   className={inputCls} autoComplete="current-password" />
            {errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              New Password
            </label>
            <input {...register("newPassword")} type="password" placeholder="••••••••"
                   className={inputCls} autoComplete="new-password" />
            {errors.newPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Confirm New Password
            </label>
            <input {...register("confirmPassword")} type="password" placeholder="••••••••"
                   className={inputCls} autoComplete="new-password" />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  style={{ background: "#22C55E", color: "#071A0D" }}>
            {isSubmitting
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {isSubmitting ? "Saving…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Security note */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
           style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)" }}>
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(34,197,94,0.6)" }} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your data is protected with AES-256 encryption. Contact your supervisor to update 
          your worker profile information such as department, wage, or village.
        </p>
      </div>
    </div>
  );
}
