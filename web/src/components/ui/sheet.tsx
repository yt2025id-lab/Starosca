"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    side?: 'right' | 'left';
}

const Sheet = ({ isOpen, onClose, title, children, side = 'right' }: SheetProps) => {
    const variants = {
        right: { x: '100%' },
        left: { x: '-100%' }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={variants[side]}
                        animate={{ x: 0 }}
                        exit={variants[side]}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "absolute top-0 bottom-0 w-full max-w-md bg-black border-white/10 p-10 flex flex-col",
                            side === 'right' ? "right-0 border-l" : "left-0 border-r"
                        )}
                    >
                        <div className="flex items-center justify-between mb-10">
                            {title && <h2 className="text-3xl font-bold uppercase">{title}</h2>}
                            <button onClick={onClose} className="text-white/40 hover:text-white ml-auto">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export { Sheet };
