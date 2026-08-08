"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/diagnostic", label: "Diagnostic", icon: ClipboardList },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/materials", label: "Materials", icon: FolderOpen },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity ${
              active
                ? "bg-accent text-accent-foreground shadow-[rgb(27,28,30)_0px_0px_0px_1px_inset]"
                : "text-sidebar-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
