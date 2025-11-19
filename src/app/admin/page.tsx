import { getAdminSummary } from "@/server/data/admin";

export default async function AdminDashboard() {
  const summary = await getAdminSummary();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.4em] text-white/50 uppercase">Overview</p>
        <h1 className="text-3xl font-semibold text-white">Operations console</h1>
        <p className="text-sm text-white/60">
          Monitor incoming Excel imports, AI summary usage, and active datasets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Tools in catalog" value={summary.toolCount} />
        <Stat label="Version snapshots" value={summary.versionCount} />
        <Stat label="Reports published" value={summary.reportCount} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <p className="font-semibold text-white">Latest import</p>
        {summary.latestVersion ? (
          <p className="mt-2">
            {summary.latestVersion.updatedAt?.toLocaleString()}:{" "}
            {summary.latestVersion.toolName} ({summary.latestVersion.versionTag})
          </p>
        ) : (
          <p className="mt-2">No imports yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs tracking-[0.3em] text-white/60 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
