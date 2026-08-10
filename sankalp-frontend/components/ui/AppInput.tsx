"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  icon?:      LucideIcon;
  iconRight?: LucideIcon;
  loading?:   boolean;
  containerClassName?: string;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, hint, icon: Icon, iconRight: IconRight, loading, type, className, containerClassName, id, ...props }, ref) => {
    const [showPwd, setShowPwd] = useState(false);
    const inputId    = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const actualType = isPassword ? (showPwd ? "text" : "password") : type;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold"
            style={{ color: "var(--text)" }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className="w-4 h-4" style={{ color: "var(--text-3)" }} />
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={cn(
              "input-field",
              Icon && "pl-11",
              (IconRight || isPassword) && "pr-11",
              error && "input-error",
              className
            )}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded transition-colors"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Right icon */}
          {IconRight && !isPassword && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconRight className="w-4 h-4" style={{ color: "var(--text-3)" }} />
            </span>
          )}

          {/* Loading spinner */}
          {loading && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block"
                    style={{ color: "var(--text-3)", animationDuration: "700ms" }} />
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{hint}</p>
        )}
      </div>
    );
  }
);
AppInput.displayName = "AppInput";
