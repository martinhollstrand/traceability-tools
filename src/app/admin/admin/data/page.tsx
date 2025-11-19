import { ExcelUpload } from "@/components/admin/excel-upload";
import { Card } from "@/components/ui/card";
import { listToolVersions } from "@/server/data/admin";

export default async function AdminDataPage() {
  const versions = await listToolVersions(10);

  return (
    <div className="space-y-8">
      <ExcelUpload />
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          Tidigare importer
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Label</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Status</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Rader</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Kolumner</th>
                <th className="px-4 py-2 text-[hsl(var(--muted))]">Aktiv</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-4 py-2 font-medium text-[hsl(var(--foreground))]">
                    {version.label}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">{version.status}</td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.rowCount}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.columnCount}
                  </td>
                  <td className="px-4 py-2 text-[hsl(var(--muted))]">
                    {version.isActive ? "Ja" : "Nej"}
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
