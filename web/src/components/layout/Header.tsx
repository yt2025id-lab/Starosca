"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Layers className="text-black w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tighter text-white">STAROSCA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pools"
              className="text-sm font-medium text-white/70 hover:text-brand-primary transition-colors"
            >
              Pools
            </Link>
            <Link
              href="/pools/create"
              className="text-sm font-medium text-white/70 hover:text-brand-primary transition-colors"
            >
              Create
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white/70 hover:text-brand-primary transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

