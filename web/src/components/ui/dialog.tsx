"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass rounded-[2.5rem] p-10 overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
              <X size={24} />
            </button>
            {title && <h2 className="text-3xl font-bold uppercase mb-6">{title}</h2>}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Sub-components for compatibility
const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);
const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("mb-6", className)}>{children}</div>
);
const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h2 className={cn("text-3xl font-bold uppercase", className)}>{children}</h2>
);
const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("text-white/60", className)}>{children}</div>
);
const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("mt-8 flex gap-4", className)}>{children}</div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
