import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

function Badge({ children, variant = 'primary', className, ...props }: BadgeProps) {
  const variants = {
    primary: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    default: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    secondary: "bg-white/5 text-white/60 border-white/10",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider",
        variants[variant as keyof typeof variants] || variants.primary,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge }
