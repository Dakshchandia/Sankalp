"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Mail, Lock, Sparkles, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validators";
import { InlineError } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLang } from "@/context/LanguageContext";

export default function LoginPage() {
  const { loginAndRedirect, isLoading } = useAuth();
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [redirecting,  setRedirecting]  = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setRedirecting(true);
    try {
      await loginAndRedirect(data);
      toast.success("Welcome back!");
    } catch (err) {
      setRedirecting(false);
      setServerError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    }
  };

  const busy = isLoading || isSubmitting || redirecting;

  if (redirecting) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
         style={{ background: "#F5F6FA" }}>
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#22C55E", opacity: 0.2 }} />
        <div className="absolute inset-2 rounded-full border-4 animate-spin" style={{ borderColor: "#22C55E", borderTopColor: "transparent" }} />
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center relative z-10">
            <img src="/logo.png" alt="SANKALP Logo" className="w-full h-full object-cover p-1" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold" style={{ color: "#1A1A2E" }}>Authenticating...</p>
          <p className="text-sm font-medium" style={{ color: "#6B7280" }}>Preparing your secure dashboard</p>
          <div className="flex gap-1.5 mt-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                   style={{ background: "#22C55E", animationDelay: `${i*150}ms` }} />
            ))}
          </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header with language switcher */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>{t("welcome_back")}</h1>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Sign in to SANKALP AI Workforce Platform</p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Card */}
      <div className="rounded-2xl overflow-hidden"
           style={{ background: "#FFFFFF", border: "1px solid #E8EAED", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#22C55E,#16A34A)" }} />
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <InlineError message={serverError} />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                <input
                  suppressHydrationWarning
                  id="email" type="email" autoComplete="email"
                  placeholder="admin@sankalp.gov.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl outline-none transition-all text-sm"
                  style={{
                    border: errors.email ? "1.5px solid #EF4444" : "1.5px solid #E8EAED",
                    background: "#FAFAFA",
                    color: "#1A1A2E",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={e => { if (!errors.email) { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)"; } }}
                  {...(() => {
                    const { onBlur, ...rest } = register("email");
                    return {
                      ...rest,
                      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                        onBlur(e);
                        e.currentTarget.style.borderColor = errors.email ? "#EF4444" : "#E8EAED"; 
                        e.currentTarget.style.boxShadow = "";
                      }
                    };
                  })()}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                <input
                  suppressHydrationWarning
                  id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl outline-none transition-all text-sm"
                  style={{
                    border: errors.password ? "1.5px solid #EF4444" : "1.5px solid #E8EAED",
                    background: "#FAFAFA",
                    color: "#1A1A2E",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={e => { if (!errors.password) { e.currentTarget.style.borderColor = "#22C55E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.1)"; } }}
                  {...(() => {
                    const { onBlur, ...rest } = register("password");
                    return {
                      ...rest,
                      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                        onBlur(e);
                        e.currentTarget.style.borderColor = errors.password ? "#EF4444" : "#E8EAED"; 
                        e.currentTarget.style.boxShadow = "";
                      }
                    };
                  })()}
                  aria-invalid={!!errors.password}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-colors"
                        style={{ color: "#9CA3AF" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#22C55E"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF"; }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.password.message}</p>}
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium transition-colors"
                      style={{ color: "#22C55E" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#16A34A"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#22C55E"; }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={busy}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#22C55E", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" }}>
              {busy
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
                : <><LogIn className="w-4 h-4" />{t("sign_in")}</>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-center gap-4"
             style={{ borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}>
          {[
            { label: "JWT Secured" },
            { label: "AES-256" },
            { label: "TLS Encrypted" },
          ].map(({ label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo credentials */}
      <div className="rounded-xl p-3.5 flex items-start gap-2.5"
           style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: "#15803D" }}>Demo Credentials</p>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            admin@sankalp.gov.in · Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}
