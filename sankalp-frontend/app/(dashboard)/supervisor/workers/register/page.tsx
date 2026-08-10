"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, User, ArrowLeft, CheckCircle2, Camera, UserPlus, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { workerService }   from "@/services/worker.service";
import { workerSchema, type WorkerFormData } from "@/utils/validators";
import { validateImageFile } from "@/utils/validators";
import { InlineError }     from "@/components/shared/ErrorState";
import { DEFAULT_DEPARTMENTS, ROUTES } from "@/lib/constants";
import { toast }           from "sonner";
import Link                from "next/link";
import { FaceEnrollment }  from "@/components/features/workers/FaceEnrollment";
import api                 from "@/services/api";

type Step = "details" | "face" | "account" | "done";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold mb-2" style={{ color:"var(--text)" }}>{children}</label>;
}
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs mt-1.5 font-medium" style={{ color:"var(--danger)" }}>{msg}</p>;
}

export default function RegisterWorkerPage() {
  const router = useRouter();
  const [step,              setStep]              = useState<Step>("details");
  const [profilePreview,    setProfilePreview]    = useState<string | null>(null);
  const [profileFile,       setProfileFile]       = useState<File | null>(null);
  const [profileError,      setProfileError]      = useState<string | null>(null);
  const [serverError,       setServerError]       = useState<string | null>(null);
  const [registeredWorkerId,setRegisteredWorkerId]= useState<string | null>(null);
  const [registeredName,    setRegisteredName]    = useState("");

  // Account creation state
  const [acctEmail,    setAcctEmail]    = useState("");
  const [acctPassword, setAcctPassword] = useState("");
  const [acctError,    setAcctError]    = useState("");
  const [acctCreating, setAcctCreating] = useState(false);
  const [acctCreated,  setAcctCreated]  = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setProfileError(err); return; }
    setProfileError(null); setProfileFile(file);
    const reader = new FileReader();
    reader.onload = ev => setProfilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: WorkerFormData) => {
    setServerError(null);
    try {
      const worker = await workerService.registerWorker({ ...data, profileImage: profileFile ?? undefined });
      setRegisteredWorkerId(worker.workerId);
      setRegisteredName(worker.fullName);
      toast.success(`${worker.fullName} registered successfully`);
      setStep("face");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const createAccount = async () => {
    if (!acctEmail || !acctPassword) { setAcctError("Email and password are required."); return; }
    if (acctPassword.length < 8) { setAcctError("Password must be at least 8 characters."); return; }
    setAcctCreating(true); setAcctError("");
    try {
      await api.post("/auth/register-worker-account", {
        name: registeredName,
        email: acctEmail,
        password: acctPassword,
        workerId: registeredWorkerId,
      });
      toast.success("Worker login account created!");
      setAcctCreated(true);
    } catch (e: any) {
      setAcctError(e?.response?.data?.detail || "Failed to create account.");
    } finally {
      setAcctCreating(false);
    }
  };

  /* â”€â”€ Done â”€â”€ */
  if (step === "done") {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                  className="max-w-lg mx-auto py-10 space-y-5">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.25)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color:"#22C55E" }} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Worker Registered!</h2>
          <p className="text-sm mt-2" style={{ color:"rgba(255,255,255,0.45)" }}>
            {registeredName} ({registeredWorkerId}) is ready for AI-verified attendance.
          </p>
        </div>

        {/* Create login account section */}
        <div className="rounded-2xl p-5" style={{ background:"#0C1623", border:"1px solid rgba(34,197,94,0.15)" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <UserPlus className="w-5 h-5" style={{ color:"#06B6D4" }} />
            <div>
              <p className="font-bold text-white text-sm">Create Worker Login Account</p>
              <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                Optional â€” allows worker to log in and view their own data
              </p>
            </div>
          </div>

          {acctCreated ? (
            <div className="flex items-center gap-2 text-sm" style={{ color:"#22C55E" }}>
              <CheckCircle2 className="w-4 h-4" /> Login account created successfully
            </div>
          ) : (
            <div className="space-y-3">
              {acctError && <p className="text-xs" style={{ color:"#F87171" }}>{acctError}</p>}
              <input value={acctEmail} onChange={e => setAcctEmail(e.target.value)}
                     type="email" placeholder="worker@example.com"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-all" />
              <div className="flex gap-3">
                <input value={acctPassword} onChange={e => setAcctPassword(e.target.value)}
                       type="password" placeholder="Password (min 8 chars)"
                       className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-all" />
                <button onClick={createAccount} disabled={acctCreating}
                        className="px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        style={{ background:"rgba(6,182,212,0.12)", color:"#06B6D4", border:"1px solid rgba(6,182,212,0.25)" }}>
                  {acctCreating ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Link href={ROUTES.SUPERVISOR.WORKERS} className="btn-secondary text-sm">View All Workers</Link>
          <button onClick={() => { setStep("details"); setRegisteredWorkerId(null); setProfilePreview(null); setProfileFile(null); setAcctEmail(""); setAcctPassword(""); setAcctCreated(false); }}
                  className="btn-primary text-sm">
            Register Another
          </button>
        </div>
      </motion.div>
    );
  }

  /* â”€â”€ Face enrollment â”€â”€ */
  if (step === "face" && registeredWorkerId) {
    return <FaceEnrollment workerId={registeredWorkerId} onComplete={() => setStep("done")} onSkip={() => setStep("done")} />;
  }

  const STEPS = ["details","face"] as const;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={ROUTES.SUPERVISOR.WORKERS}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"}>
          <ArrowLeft className="w-4 h-4" style={{ color:"var(--text-2)" }} />
        </Link>
        <div>
          <h1 className="font-black text-white text-2xl tracking-tight" style={{ letterSpacing:"-0.03em" }}>Register Worker</h1>
          <p className="text-sm mt-0.5" style={{ color:"var(--text-2)" }}>Add a new worker to the AI workforce system</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                 style={step === s
                   ? { background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.25)" }
                   : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={step === s ? { background:"#22C55E", color:"#080E18" } : { background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                {i + 1}
              </span>
              <span className="text-xs font-semibold" style={{ color: step === s ? "var(--success)" : "var(--text-2)" }}>
                {s === "details" ? "Worker Details" : "Face Enrollment"}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px" style={{ background:"var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-3xl overflow-hidden"
           style={{ background:"#0C1623", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" }}>
        <div className="h-0.5" style={{ background:"linear-gradient(90deg,transparent,#22C55E,transparent)" }} />
        <div className="p-7 space-y-6">
          {serverError && <InlineError message={serverError} />}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Profile image */}
            <div className="flex items-start gap-5 mb-7 pb-6" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                   style={{ background:"rgba(255,255,255,0.04)", border:"2px dashed rgba(255,255,255,0.12)" }}>
                {profilePreview
                  ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8" style={{ color:"rgba(255,255,255,0.2)" }} />}
              </div>
              <div>
                <label htmlFor="profileImage"
                       className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                       style={{ background:"rgba(255,255,255,0.06)", color:"var(--text)", border:"1px solid rgba(255,255,255,0.1)" }}
                       onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.background = "rgba(255,255,255,0.09)"}
                       onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.background = "rgba(255,255,255,0.06)"}>
                  <Upload className="w-4 h-4" /> Upload Photo
                </label>
                <input id="profileImage" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                <p className="text-xs mt-2" style={{ color:"var(--text-2)" }}>JPG, PNG or WEBP Â· Max 5MB</p>
                {profileError && <p className="text-xs mt-1 font-medium" style={{ color:"var(--danger)" }}>{profileError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FieldLabel>Full Name *</FieldLabel>
                <input type="text" placeholder="Ramesh Kumar Singh" className="input-field" {...register("fullName")} />
                <FieldError msg={errors.fullName?.message} />
              </div>
              <div>
                <FieldLabel>Worker ID *</FieldLabel>
                <input type="text" placeholder="WRK-001" className="input-field uppercase" {...register("workerId")} />
                <FieldError msg={errors.workerId?.message} />
              </div>
              <div>
                <FieldLabel>Phone Number *</FieldLabel>
                <input type="tel" placeholder="9876543210" maxLength={10} className="input-field" {...register("phone")} />
                <FieldError msg={errors.phone?.message} />
              </div>
              <div>
                <FieldLabel>Village *</FieldLabel>
                <input type="text" placeholder="Rampur" className="input-field" {...register("village")} />
                <FieldError msg={errors.village?.message} />
              </div>
              <div>
                <FieldLabel>Department *</FieldLabel>
                <select className="input-field" {...register("department")}>
                  <option value="">Select Department</option>
                  {DEFAULT_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <FieldError msg={errors.department?.message} />
              </div>
              <div>
                <FieldLabel>Daily Wage (â‚¹) *</FieldLabel>
                <input type="number" placeholder="350" min={1} className="input-field" {...register("dailyWage", { valueAsNumber:true })} />
                <FieldError msg={errors.dailyWage?.message} />
              </div>
              <div>
                <FieldLabel>Gender *</FieldLabel>
                <select className="input-field" {...register("gender")}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <FieldError msg={errors.gender?.message} />
              </div>
              <div>
                <FieldLabel>Age *</FieldLabel>
                <input type="number" placeholder="28" min={18} max={70} className="input-field" {...register("age", { valueAsNumber:true })} />
                <FieldError msg={errors.age?.message} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7 pt-6" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <Link href={ROUTES.SUPERVISOR.WORKERS} className="btn-secondary text-sm">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {isSubmitting
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Savingâ€¦</>
                  : <><Camera className="w-4 h-4" />Save & Enroll Face</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
