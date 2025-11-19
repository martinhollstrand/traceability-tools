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

      <form
        className="rounded-3xl border border-white/10 bg-white/5 p-8"
        action="/api/excel/upload"
        method="post"
        encType="multipart/form-data"
      >
        <label className="block text-sm font-semibold text-white">Excel workbook</label>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          className="mt-4 w-full rounded-lg border border-white/20 bg-slate-950/40 p-4"
        />
        <p className="mt-2 text-xs text-white/60">
          Max 15MB. We run SheetJS parsing and Zod validation server-side.
        </p>
        <button
          type="submit"
          className="mt-6 rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Upload for preview
        </button>
      </form>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Column mapping</h2>
        <p className="mt-2 text-sm text-white/60">
          We auto-detect common headers (name, vendor, category, summary). Override the
          mapping below to persist in tool_versions columnMapping JSON.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {["Name", "Vendor", "Category", "Summary"].map((field) => (
            <div
              key={field}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <p className="text-sm font-semibold">{field}</p>
              <input
                name={`mapping-${field.toLowerCase()}`}
                placeholder={`Select ${field} column`}
                className="mt-2 w-full rounded-md border border-white/20 bg-transparent p-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
