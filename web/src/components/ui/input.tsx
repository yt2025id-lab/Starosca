import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className, type, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-xs font-mono uppercase text-white/40 ml-1">{label}</label>}
        <div className="relative group">
          {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-primary transition-colors" />}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all",
              Icon && "pl-11",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-500 ml-1 uppercase font-mono">{error}</p>}
      </div>
    );
  }
)
Input.displayName = "Input"

export { Input }
