import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from "@/lib/constants";

/** Login form validation schema */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  rememberMe: z.boolean().optional(),
});

/** Worker registration validation schema */
export const workerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  workerId: z
    .string()
    .min(3, "Worker ID must be at least 3 characters")
    .max(20, "Worker ID is too long")
    .regex(/^[A-Z0-9-]+$/i, "Worker ID can only contain letters, numbers, and hyphens"),
  village: z.string().min(2, "Village name is required"),
  department: z.string().min(1, "Department is required"),
  dailyWage: z
    .number()
    .min(1, "Daily wage must be greater than 0")
    .max(10000, "Daily wage seems too high"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  gender: z.enum(["male", "female", "other"]),
  age: z
    .number()
    .min(18, "Worker must be at least 18 years old")
    .max(70, "Age cannot exceed 70"),
});

/** Image file validation */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Image size must be less than ${MAX_FILE_SIZE_MB}MB`;
  }
  return null;
}

/** Change password validation schema */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Manual review form validation */
export const reviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type WorkerFormData = z.infer<typeof workerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
