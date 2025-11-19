import { MetricCard } from "@/components/admin/metric-card";
import { Card } from "@/components/ui/card";
import { getDashboardSummary, listToolVersions } from "@/server/data/admin";

export default async function AdminDashboardPage() {
  const [summary, versions] = await Promise.all([
    getDashboardSummary(),
    listToolVersions(5),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Totalt"
          value={summary.totalTools}
          helper="Verktyg indexerade"
        />
        <MetricCard
          label="Publicerade"
          value={summary.publishedTools}
          helper="Synliga publikt"
        />
        <MetricCard
          label="Utvalda"
          value={summary.featuredTools}
          helper="Visas på startsidan"
        />
        <MetricCard
          label="Senaste import"
          value={summary.activeVersion ?? "—"}
          helper={
            summary.lastImport
              ? new Date(summary.lastImport).toLocaleDateString("sv-SE")
              : undefined
          }
        />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            Senaste versioner
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Label</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Rader</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Kolumner</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Status</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Importerad</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-4 py-2 font-medium text-[hsl(var(--foreground))]">
                    {version.label}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.rowCount}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.columnCount}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.isActive ? "Aktiv" : version.status}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.importedAt
                      ? new Date(version.importedAt).toLocaleDateString("sv-SE")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
