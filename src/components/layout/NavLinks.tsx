"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  TrendingUp,
  FolderOpen,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { spring, springSnappy } from "@/lib/motion";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/diagnostic", label: "Diagnostic", icon: ClipboardList },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/materials", label: "Materials", icon: FolderOpen },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Desktop sidebar navigation: active state is a material pill that glides. */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "pressable relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
              active
                ? "text-accent-foreground"
                : "text-sidebar-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill-desktop"
                transition={spring}
                className="absolute inset-0 rounded-xl bg-accent ring-1 ring-white/[0.06]"
              />
            )}
            <Icon className="relative h-4 w-4" aria-hidden />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile tab bar (apple-design: familiar bottom chrome, ≥44px targets).
 * Active item carries a small indicator pill that springs between tabs.
 */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-stretch justify-around px-1" aria-label="Primary">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              active ? "text-[#ff6363]" : "text-muted-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill-mobile"
                transition={springSnappy}
                className="absolute top-0.5 h-1 w-8 rounded-full bg-[#ff6363]"
              />
            )}
            <Icon className="h-5 w-5" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
