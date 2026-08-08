import Link from "next/link";
import { NavLinks } from "@/components/layout/NavLinks";
import { YoruStatusPill } from "@/components/yoru/YoruStatusPill";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3 px-6 py-6">
          <span
            aria-hidden
            className="h-6 w-6 rounded-md bg-[repeating-linear-gradient(45deg,#ff6363_0_2px,transparent_2px_4px)] shadow-[0_0_14px_rgba(255,99,99,0.35)]"
          />
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
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-8">
          <YoruStatusPill />
        </header>
        <main className="flex-1 p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
