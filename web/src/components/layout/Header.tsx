"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              Starosca
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/pools"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Pools
              </Link>
              <Link
                href="/pools/create"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Create Pool
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
