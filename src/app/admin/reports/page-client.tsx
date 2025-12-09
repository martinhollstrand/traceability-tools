"use client";

import { useState } from "react";
import { ReportForm } from "@/components/admin/report-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ReportMetadataPayload } from "@/server/data/types";
import { useRouter } from "next/navigation";

type AdminReportsPageProps = {
  initialReports: ReportMetadataPayload[];
  initialSelectedReport: ReportMetadataPayload | null;
};

export default function AdminReportsPageClient({
  initialReports,
  initialSelectedReport,
}: AdminReportsPageProps) {
  const router = useRouter();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    initialSelectedReport?.id || null,
  );
  const [reports] = useState(initialReports);

  const selectedReport =
    selectedReportId === null
      ? null
      : reports.find((r) => r.id === selectedReportId) || null;

  const handleReportSaved = () => {
    // Refresh the page to reload reports after a short delay
    setTimeout(() => {
      router.refresh();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.4em] text-[hsl(var(--muted))] uppercase">
          Reports
        </p>
        <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
          Publishing controls
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          Manage narratives, upload PDFs, and toggle active versions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              All Reports
            </h2>
            <Button
              size="sm"
              onClick={() => setSelectedReportId(null)}
              variant={selectedReportId === null ? "default" : "outline"}
            >
              + New Report
            </Button>
          </div>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <Card className="p-6 text-center text-sm text-[hsl(var(--muted))]">
                No reports yet. Create your first report.
              </Card>
            ) : (
              reports.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer p-4 transition-colors ${
                    selectedReportId === report.id
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "hover:bg-[hsl(var(--surface))]"
                  }`}
                  onClick={() => setSelectedReportId(report.id || null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">
                          {report.title}
                        </h3>
                        {report.isPublished && (
                          <Badge variant="success" className="text-xs">
                            Published
                          </Badge>
                        )}
                        {!report.isPublished && (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>
                      {report.ingress && (
                        <p className="line-clamp-2 text-sm text-[hsl(var(--muted))]">
                          {report.ingress}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted))]">
                        {report.updatedAt && (
                          <span>
                            Updated: {new Date(report.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                        {report.pdfUrl && (
                          <span className="text-[hsl(var(--primary))]">
                            PDF available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            {selectedReportId === null ? "Create New Report" : "Edit Report"}
          </h2>
          <ReportForm
            initial={
              selectedReport || {
                title: "",
                ingress: null,
                keyFindings: [],
                pdfUrl: null,
                pdfFilename: null,
                pdfSize: null,
                pdfUploadedAt: null,
                isPublished: false,
              }
            }
            onSaved={handleReportSaved}
          />
        </div>
      </div>
    </div>
  );
}
