import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "frost" | "featured" | "tag" | "available";
  className?: string;
}

export default function Badge({ children, variant = "frost", className = "" }: BadgeProps) {
  const variantClasses = {
    frost: "bg-frost/10 text-frost border border-frost/20",
    featured: "bg-aurora-yellow/10 text-aurora-yellow border border-aurora-yellow/20",
    tag: "bg-bg-elevated text-text-muted border border-nord-border/40 hover:border-frost/30 hover:text-text-secondary transition-colors",
    available: "bg-frost/10 text-frost border border-frost/20",
  };

  if (variant === "available") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${variantClasses.available} ${className}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-frost animate-pulse-slow"
          aria-hidden="true"
        />
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
