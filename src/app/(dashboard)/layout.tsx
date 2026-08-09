import Link from "next/link";
import { NavLinks, TabBar } from "@/components/layout/NavLinks";
import { YoruStatusPill } from "@/components/yoru/YoruStatusPill";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop: translucent sidebar, content scrolls beneath it */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <span aria-hidden className="flex size-7 items-center justify-center rounded-[9px] bg-primary text-[11px] font-semibold text-primary-foreground">I</span>
          <div>
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              IELTS Coach
            </h1>
            <p className="text-[11px] text-sidebar-foreground">powered by Yoru</p>
          </div>
        </div>
        <NavLinks />
        <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground">
          Yoru v0.1, local and private
        </div>
      </aside>

      {/* Top chrome: brand on mobile, status on both */}
      <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border px-4 lg:ml-64 lg:px-8">
        <Link href="/" className="pressable flex items-center gap-2.5 lg:hidden">
          <span aria-hidden className="flex size-6 items-center justify-center rounded-[8px] bg-primary text-[10px] font-semibold text-primary-foreground">I</span>
          <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">IELTS Coach</span>
        </Link>
        <div className="ml-auto lg:ml-0 lg:w-full lg:justify-end lg:flex">
          <div className="flex items-center gap-2">
            <YoruStatusPill />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 lg:mx-0 lg:ml-64 lg:w-[calc(100%-16rem)] lg:max-w-none lg:px-10 lg:pt-10 lg:pb-10">
        {children}
      </main>

      {/* Mobile: iOS-style translucent tab bar, safe-area aware */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border pb-[env(safe-area-inset-bottom)] lg:hidden">
        <TabBar />
      </nav>
    </div>
  );
}
