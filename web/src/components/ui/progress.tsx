"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

function Progress({ className, value, ...props }: ProgressProps) {
  return (
    <div
      className={cn(
        "w-full h-2 bg-white/5 rounded-full overflow-hidden",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value || 0}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-brand-primary"
      />
    </div>
  )
}

export { Progress }
