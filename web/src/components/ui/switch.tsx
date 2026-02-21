"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const Switch = ({ checked, onChange, className }: SwitchProps) => {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex items-center",
                checked ? "bg-brand-primary" : "bg-white/10",
                className
            )}
        >
            <motion.div
                animate={{ x: checked ? 26 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn("w-4 h-4 rounded-full absolute", checked ? "bg-black" : "bg-white/40")}
            />
        </button>
    );
};

export { Switch };
