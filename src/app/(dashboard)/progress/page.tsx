import { PageHeader } from "@/components/layout/PageHeader";

export default function ProgressPage() {
  return (
    <div>
      <PageHeader
        title="Progress"
        description="Your band history and streaks await, Master. I keep meticulous records."
      />
      <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#101111] p-10 text-center shadow-[rgb(27,28,30)_0px_0px_0px_1px,rgb(7,8,10)_0px_0px_0px_1px_inset]">
        <p className="text-sm font-medium text-[#9c9c9d]">Module under construction. Yoru is polishing it, Master.</p>
      </div>
    </div>
  );
}
