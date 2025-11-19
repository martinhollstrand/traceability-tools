export default function AdminReportsPage() {
  return (
    <div className="space-y-6 text-white">
      <div>
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Reports</p>
        <h1 className="text-3xl font-semibold">Publishing controls</h1>
        <p className="text-sm text-white/60">
          Manage narratives, upload PDFs, and toggle active versions.
        </p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <form className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Report title</label>
            <input
              className="mt-2 w-full rounded-lg border border-white/20 bg-transparent p-3 text-sm"
              placeholder="TracePilot – Q4 Analyst View"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">PDF URL</label>
            <input
              className="mt-2 w-full rounded-lg border border-white/20 bg-transparent p-3 text-sm"
              placeholder="https://storage/report.pdf"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Key highlights</label>
            <textarea
              className="mt-2 w-full rounded-lg border border-white/20 bg-transparent p-3 text-sm"
              rows={4}
              placeholder="- Strengths..."
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-slate-900"
          >
            Save report
          </button>
        </form>
      </section>
    </div>
  );
}
