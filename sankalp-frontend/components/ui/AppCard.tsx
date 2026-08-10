import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "base" | "elevated" | "glass" | "glow";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: boolean;
  hover?:   boolean;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  base:     "sankalp-card",
  elevated: "card-elevated",
  glass:    "card-glass",
  glow:     "card-glow-green",
};

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  ({ variant = "base", padding = true, hover = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          padding && "p-6",
          hover && "transition-all duration-220 hover:-translate-y-1 hover:shadow-lg hover:border-white/[0.14]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppCard.displayName = "AppCard";

/* ── Sub-components ── */
export function AppCardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AppCardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold", className)}
      style={{ color: "var(--text)", letterSpacing: "-0.015em" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function AppCardBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function AppCardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mt-5 pt-4", className)}
      style={{ borderTop: "1px solid var(--border)" }}
      {...props}
    >
      {children}
    </div>
  );
}
