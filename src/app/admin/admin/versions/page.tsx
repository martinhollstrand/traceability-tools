import { Card } from "@/components/ui/card";
import { activateVersionAction } from "@/server/actions/tool-versions";
import { listToolVersions } from "@/server/data/admin";

export default async function AdminVersionsPage() {
  const versions = await listToolVersions(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Versioner
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Aktivera en import för att göra den publik. Diff-vy planerad för M4.
        </p>
      </div>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Label</th>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Status</th>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Rader</th>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Kolumner</th>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Importerad</th>
              <th className="px-4 py-2 text-[hsl(var(--muted))]">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id} className="border-t border-[hsl(var(--border))]">
                <td className="px-4 py-2 font-medium text-[hsl(var(--foreground))]">
                  {version.label}
                </td>
                <td className="px-4 py-2 text-[hsl(var(--muted))]">{version.status}</td>
                <td className="px-4 py-2 text-[hsl(var(--muted))]">{version.rowCount}</td>
                <td className="px-4 py-2 text-[hsl(var(--muted))]">
                  {version.columnCount}
                </td>
                <td className="px-4 py-2 text-[hsl(var(--muted))]">
                  {version.importedAt
                    ? new Date(version.importedAt).toLocaleDateString("sv-SE")
                    : "—"}
                </td>
                <td className="px-4 py-2 text-[hsl(var(--muted))]">
                  {version.isActive ? (
                    <span className="text-[hsl(var(--foreground))]">Aktiv</span>
                  ) : (
                    <form action={activateVersionAction}>
                      <input type="hidden" name="versionId" value={version.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs font-semibold text-[hsl(var(--foreground))]"
                      >
                        Aktivera
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
