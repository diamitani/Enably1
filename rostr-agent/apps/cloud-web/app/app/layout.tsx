"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  MessageSquareIcon,
  PuzzleIcon,
  FolderIcon,
  PlugIcon,
  CreditCardIcon,
  SettingsIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; max-age=0";
    router.push("/");
  };

  const navItems = [
    { label: "Chat", href: "/app/chat", icon: MessageSquareIcon },
    { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboardIcon },
    { label: "Skills", href: "/app/skills", icon: PuzzleIcon },
    { label: "Workspaces", href: "/app/workspaces", icon: FolderIcon },
    { label: "Integrations", href: "/app/integrations", icon: PlugIcon },
    { label: "Billing", href: "/app/billing", icon: CreditCardIcon },
    { label: "Settings", href: "/app/settings", icon: SettingsIcon },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 flex flex-col w-60 h-full border-r border-border bg-sidebar transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full md:w-0 md:overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <Link href="/app/chat" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Enably
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeftCloseIcon className="size-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-primary/15 text-sidebar-primary border border-sidebar-primary/20"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar toggle for collapsed state */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex absolute top-4 left-4 z-50 items-center justify-center size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <PanelLeftIcon className="size-4" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card/50 backdrop-blur-md shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground"
          >
            {sidebarOpen ? (
              <PanelLeftCloseIcon className="size-4" />
            ) : (
              <PanelLeftIcon className="size-4" />
            )}
          </button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground font-mono tracking-wide">
            GTM Architect
          </span>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
