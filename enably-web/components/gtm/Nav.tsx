"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wizard", label: "Wizard" },
  { href: "/playbook", label: "Playbook" },
  { href: "/messaging", label: "Messaging" },
  { href: "/research", label: "Research" },
  { href: "/assistant", label: "Assistant" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B1020]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Enably</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-[#635BFF]/20 text-[#635BFF]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/wizard"
          className="rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#5046e5] hover:-translate-y-0.5 shadow-lg shadow-[#635BFF]/25"
        >
          Start the GTM Wizard
        </Link>
      </div>
    </header>
  );
}
