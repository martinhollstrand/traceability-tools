import { ReportSections } from "@/components/report/report-sections";
import { Button } from "@/components/ui/button";
import { getReportByTool, listTools } from "@/server/data/tools";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const tools = await listTools();
  const tool = params.tool
    ? tools.find((entry) => entry.slug === params.tool || entry.id === params.tool)
    : tools[0];

  if (!tool) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
        No tools available yet. Seed the database to generate report metadata.
      </div>
    );
  }

  const report = await getReportByTool(tool.id);

  if (!report) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
        No report metadata found for {tool.name}. Import Excel data from the admin
        console.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Briefings
        </p>
        <h1 className="text-3xl font-semibold">{tool.name} report</h1>
        <p className="text-muted-foreground text-sm">{report.metadata?.author}</p>
      </div>

      <ReportSections report={report} />

      <div className="border-border/80 bg-background/80 rounded-3xl border p-8">
        <h2 className="text-2xl font-semibold">Download full PDF</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Access the latest analyst notes, implementation checklist, and procurement
          references.
        </p>
        <Button className="mt-4" disabled={!report.pdfUrl}>
          {report.pdfUrl ? <a href={report.pdfUrl}>Download</a> : "Upload pending"}
        </Button>
      </div>
    </div>
  );
}
