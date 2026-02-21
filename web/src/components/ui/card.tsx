import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

function Card({ children, title, description, className, footer, ...props }: CardProps) {
  return (
    <div className={cn("glass rounded-3xl p-6 flex flex-col gap-4", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-xl font-bold uppercase">{title}</h3>}
          {description && <p className="text-sm text-white/40">{description}</p>}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {footer && <div className="pt-4 border-t border-white/5">{footer}</div>}
    </div>
  );
}

// Keeping these for potential compatibility with existing imports, 
// though the user wants to follow the ui-kit style.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1.5 p-0", className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <h3 className={cn("text-xl font-bold uppercase leading-none", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-white/40", className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-0 pt-0", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center p-0 pt-4 border-t border-white/5", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
