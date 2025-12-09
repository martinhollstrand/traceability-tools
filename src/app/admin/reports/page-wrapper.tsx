import { listAllReports, getReportMetadata } from "@/server/data/reports";
import AdminReportsPageClient from "./page-client";
import type { ReportMetadataPayload } from "@/server/data/types";

export default async function AdminReportsPageWrapper() {
  const allReports: ReportMetadataPayload[] = await listAllReports();
  const latestReport = await getReportMetadata();
  const initialSelectedReport: ReportMetadataPayload | null = latestReport.id
    ? latestReport
    : null;

  return (
    <AdminReportsPageClient
      initialReports={allReports}
      initialSelectedReport={initialSelectedReport}
    />
  );
}
