import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";

interface AppAvatarProps {
  name?:      string;
  src?:       string;
  size?:      AvatarSize;
  className?: string;
  gradient?:  boolean;
}

const sizeMap: Record<AvatarSize, { cls: string; font: string }> = {
  sm:   { cls: "avatar-sm",  font: "11px" },
  md:   { cls: "avatar-md",  font: "13px" },
  lg:   { cls: "avatar-lg",  font: "16px" },
  xl:   { cls: "avatar-xl",  font: "20px" },
  "2xl":{ cls: "avatar-2xl", font: "26px" },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const GRADIENTS = [
  "linear-gradient(135deg,#22C55E,#06B6D4)",
  "linear-gradient(135deg,#3B82F6,#8B5CF6)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#06B6D4,#3B82F6)",
  "linear-gradient(135deg,#8B5CF6,#EC4899)",
];

function pickGradient(name?: string): string {
  if (!name) return GRADIENTS[0];
  const idx = name.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export function AppAvatar({ name, src, size = "md", className, gradient = true }: AppAvatarProps) {
  const { cls } = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? "avatar"}
        className={cn("avatar", cls, "object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn("avatar", cls, className)}
      style={gradient ? { background: pickGradient(name), color: "#fff", border: "1px solid rgba(255,255,255,0.12)" } : undefined}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
