import { PageHeader } from "@/components/layout/PageHeader";

export default function MaterialsPage() {
  return (
    <div>
      <PageHeader
        title="Materials"
        description="Upload your study material, and I shall file and index it neatly, Master."
      />
      <div className="glass-card mt-8 rounded-2xl border border-white/[0.06] p-10 text-center">
        <p className="text-sm font-medium text-[#9c9c9d]">Module under construction. Yoru is polishing it, Master.</p>
      </div>
    </div>
  );
}
