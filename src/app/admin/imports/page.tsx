import { ExcelUpload } from "@/components/admin/excel-upload";

export default function ImportsPage() {
  return (
    <div className="space-y-6 text-white">
      <div>
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Excel</p>
        <h1 className="text-3xl font-semibold">Data ingestion</h1>
        <p className="text-sm text-white/60">
          Upload tool inventories, map headers, and validate before committing.
        </p>
      </div>

      <ExcelUpload />
    </div>
  );
}
