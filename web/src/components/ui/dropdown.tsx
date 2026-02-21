"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export interface DropdownProps {
    label: React.ReactNode;
    items: DropdownItem[];
}

const Dropdown = ({ label, items }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
                {label} <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-2 left-0 w-56 glass rounded-2xl p-2 z-50 border border-white/10"
                        >
                            {items.map((item, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 flex items-center gap-3 transition-colors"
                                    onClick={() => {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export { Dropdown };
