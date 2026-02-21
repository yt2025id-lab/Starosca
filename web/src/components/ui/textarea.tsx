import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && <label className="text-xs font-mono uppercase text-white/40 ml-1">{label}</label>}
                <textarea
                    className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all min-h-[120px]",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
