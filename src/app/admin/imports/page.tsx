import { ExcelUpload } from "@/components/admin/excel-upload";

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))] uppercase">
          Excel
        </p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Data ingestion
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Upload tool inventories, map headers, and validate before committing.
        </p>
      </div>

      <ExcelUpload />
    </div>
  );
}
