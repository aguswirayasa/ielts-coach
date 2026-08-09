import { PageHeader } from "@/components/layout/PageHeader";

export default function ProgressPage() {
  return (
    <div>
      <PageHeader
        title="Progress"
        description="Your band history and streaks await, Master. I keep meticulous records."
      />
      <div className="glass-card mt-8 rounded-2xl border border-white/[0.06] p-10 text-center">
        <p className="text-sm font-medium text-[#9c9c9d]">Module under construction. Yoru is polishing it, Master.</p>
      </div>
    </div>
  );
}
