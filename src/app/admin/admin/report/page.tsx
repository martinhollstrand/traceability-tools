import { ReportForm } from "@/components/admin/report-form";
import { getReportMetadata } from "@/server/data/reports";

export default async function AdminReportPage() {
  const metadata = await getReportMetadata();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Rapportinställningar
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Uppdatera titel, ingress och key findings som visas på publika rapportsidan.
        </p>
      </div>
      <ReportForm initial={metadata} />
    </div>
  );
}
