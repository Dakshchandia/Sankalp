"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size    = "sm" | "md" | "lg" | "xl" | "icon";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     LucideIcon;
  iconRight?: LucideIcon;
  children?: ReactNode;
  asChild?:  boolean;
  href?:     string;
}

const variantClasses: Record<Variant, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  outline:   "btn-outline",
  ghost:     "btn-ghost",
  danger:    "btn-danger",
  success:   "btn-success",
};

const sizeClasses: Record<Size, string> = {
  sm:   "btn-sm",
  md:   "",
  lg:   "btn-lg",
  xl:   "btn-xl",
  icon: "btn-icon",
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = "primary", size = "md", loading, icon: Icon, iconRight: IconRight, children, className, disabled, ...props }, ref) => {
    const cls = cn(variantClasses[variant], sizeClasses[size], className);
    const isDisabled = disabled || loading;

    return (
      <button ref={ref} className={cls} disabled={isDisabled} {...props}>
        {loading ? (
          <span
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0"
            style={{ animationDuration: "700ms" }}
          />
        ) : Icon ? (
          <Icon className="w-4 h-4 flex-shrink-0" />
        ) : null}
        {children && <span>{children}</span>}
        {!loading && IconRight && <IconRight className="w-4 h-4 flex-shrink-0" />}
      </button>
    );
  }
);
AppButton.displayName = "AppButton";
