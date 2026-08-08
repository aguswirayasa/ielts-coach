import { PageHeader } from "@/components/layout/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Target band, test date, and preferences. I shall keep them safe, Master."
      />
      <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#101111] p-10 text-center shadow-[rgb(27,28,30)_0px_0px_0px_1px,rgb(7,8,10)_0px_0px_0px_1px_inset]">
        <p className="text-sm font-medium text-[#9c9c9d]">Module under construction. Yoru is polishing it, Master.</p>
      </div>
    </div>
  );
}
