import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", className, isLoading, ...props }, ref) => {
    const variants = {
      primary: "bg-brand-primary text-black hover:bg-white",
      default: "bg-brand-primary text-black hover:bg-white",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
      outline: "bg-transparent text-white border border-white/20 hover:border-brand-primary hover:text-brand-primary",
      ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-4 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
          variants[variant as keyof typeof variants] || variants.primary,
          sizes[size as keyof typeof sizes] || sizes.md,
          className
        )}
        {...props}
      >
        {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    );
  }
)
Button.displayName = "Button"

export { Button }
