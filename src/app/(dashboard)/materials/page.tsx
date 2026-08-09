import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialsClient } from "./MaterialsClient";

export default function MaterialsPage() {
  return (
    <div>
      <PageHeader
        title="Materials"
        description="Upload your study material, and I shall file and index it neatly, Master."
      />
      <div className="mt-8">
        <MaterialsClient />
      </div>
    </div>
  );
}
