import { ReportSections } from "@/components/report/report-sections";
import { Button } from "@/components/ui/button";
import { getPublishedReport } from "@/server/data/reports";
import type { ReportMetadata } from "@/lib/validators/report";

export default async function ReportPage() {
  const reportData = await getPublishedReport();

  if (!reportData) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
        No published report available. Please check back later or contact the
        administrator.
      </div>
    );
  }

  // Convert ReportMetadataPayload to ReportMetadata format
  const highlights: ReportMetadata["highlights"] = reportData.keyFindings.map(
    (finding) => {
      const parts = finding.split(": ");
      return parts.length === 2
        ? { label: parts[0]!, detail: parts[1]! }
        : { label: finding, detail: finding };
    },
  );

  const report: ReportMetadata = {
    id: reportData.id || "report-singleton",
    toolId: "",
    title: reportData.title,
    pdfUrl: reportData.pdfUrl ?? undefined,
    highlights,
    metadata: {
      pdfFilename: reportData.pdfFilename ?? undefined,
      pdfSize: reportData.pdfSize ?? undefined,
      pdfUploadedAt: reportData.pdfUploadedAt ?? undefined,
    },
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Briefings
        </p>
        <h1 className="text-3xl font-semibold">{report.title}</h1>
        {reportData.ingress && (
          <p className="text-muted-foreground text-sm">{reportData.ingress}</p>
        )}
      </div>

      <ReportSections report={report} />

      <div className="border-border/80 bg-background/80 rounded-3xl border p-8">
        <h2 className="text-2xl font-semibold">Download full PDF</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Access the latest analyst notes, implementation checklist, and procurement
          references.
        </p>
        {report.pdfUrl ? (
          <div className="mt-4 space-y-2">
            <Button variant="secondary" asChild>
              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </Button>
            {report.metadata && (
              <div className="text-muted-foreground text-xs">
                {report.metadata.pdfFilename && (
                  <p>File: {report.metadata.pdfFilename}</p>
                )}
                {report.metadata.pdfSize && (
                  <p>Size: {(report.metadata.pdfSize / 1024 / 1024).toFixed(2)} MB</p>
                )}
                {report.metadata.pdfUploadedAt && (
                  <p>
                    Uploaded:{" "}
                    {new Date(report.metadata.pdfUploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <Button className="mt-4" disabled>
            Upload pending
          </Button>
        )}
      </div>
    </div>
  );
}
