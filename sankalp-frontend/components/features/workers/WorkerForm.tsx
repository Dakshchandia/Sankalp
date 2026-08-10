"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { WorkerFormData } from "@/types/worker.types";

const workerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  aadhaarNumber: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  village: z.string().min(2, "Village name is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  department: z.string().optional(),
  jobType: z.string().optional(),
  dailyWage: z.coerce.number().min(100, "Daily wage must be at least ₹100").optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  joiningDate: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

interface WorkerFormProps {
  onSubmit: (data: WorkerFormData) => Promise<void>;
  defaultValues?: Partial<WorkerFormData>;
  isLoading?: boolean;
}

type WorkerSchemaData = z.infer<typeof workerSchema>;

export function WorkerForm({ onSubmit, defaultValues, isLoading = false }: WorkerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkerSchemaData>({
    resolver: zodResolver(workerSchema),
    defaultValues: defaultValues as any,
  });

  const onSubmitWrapper = (data: WorkerSchemaData) => {
    return onSubmit(data as any as WorkerFormData);
  };

  const FieldGroup = ({ title }: { title: string }) => (
    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-5 first:mt-0">
      {title}
    </div>
  );

  const Field = ({
    label,
    error,
    required,
    children,
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmitWrapper)} className="space-y-4">
      <FieldGroup title="Personal Information" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name?.message}>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g., Ramesh Kumar"
            className={`input-field text-sm py-2 ${errors.name ? "border-red-300" : ""}`}
          />
        </Field>

        <Field label="Phone Number" required error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            className={`input-field text-sm py-2 ${errors.phone ? "border-red-300" : ""}`}
          />
        </Field>

        <Field label="Date of Birth" error={errors.dob?.message}>
          <input
            {...register("dob")}
            type="date"
            className="input-field text-sm py-2"
          />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <select {...register("gender")} className="input-field text-sm py-2">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Aadhaar Number" error={errors.aadhaarNumber?.message}>
          <input
            {...register("aadhaarNumber")}
            type="text"
            placeholder="12-digit Aadhaar"
            maxLength={12}
            className="input-field text-sm py-2"
          />
        </Field>
      </div>

      <FieldGroup title="Address" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Village / Town" required error={errors.village?.message}>
          <input
            {...register("village")}
            type="text"
            placeholder="Village name"
            className={`input-field text-sm py-2 ${errors.village ? "border-red-300" : ""}`}
          />
        </Field>

        <Field label="District" required error={errors.district?.message}>
          <input
            {...register("district")}
            type="text"
            placeholder="District"
            className={`input-field text-sm py-2 ${errors.district ? "border-red-300" : ""}`}
          />
        </Field>

        <Field label="State" required error={errors.state?.message}>
          <input
            {...register("state")}
            type="text"
            placeholder="State"
            className={`input-field text-sm py-2 ${errors.state ? "border-red-300" : ""}`}
          />
        </Field>
      </div>

      <FieldGroup title="Employment Details" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Department">
          <select {...register("department")} className="input-field text-sm py-2">
            <option value="">Select department</option>
            <option value="construction">Construction</option>
            <option value="agriculture">Agriculture</option>
            <option value="maintenance">Maintenance</option>
            <option value="horticulture">Horticulture</option>
            <option value="sanitation">Sanitation</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Job Type">
          <select {...register("jobType")} className="input-field text-sm py-2">
            <option value="">Select job type</option>
            <option value="skilled">Skilled Labour</option>
            <option value="unskilled">Unskilled Labour</option>
            <option value="semi-skilled">Semi-skilled</option>
            <option value="supervisor">Site Supervisor</option>
          </select>
        </Field>

        <Field label="Daily Wage (₹)" error={errors.dailyWage?.message}>
          <input
            {...register("dailyWage")}
            type="number"
            placeholder="300"
            min={0}
            className={`input-field text-sm py-2 ${errors.dailyWage ? "border-red-300" : ""}`}
          />
        </Field>

        <Field label="Joining Date">
          <input
            {...register("joiningDate")}
            type="date"
            className="input-field text-sm py-2"
          />
        </Field>

        <Field label="Status">
          <select {...register("status")} className="input-field text-sm py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>

      <FieldGroup title="Bank Details (Optional)" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Bank Account Number">
          <input
            {...register("bankAccount")}
            type="text"
            placeholder="Account number"
            className="input-field text-sm py-2"
          />
        </Field>

        <Field label="IFSC Code">
          <input
            {...register("ifscCode")}
            type="text"
            placeholder="e.g., SBIN0001234"
            className="input-field text-sm py-2"
          />
        </Field>
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {(isSubmitting || isLoading) && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting || isLoading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );
}
