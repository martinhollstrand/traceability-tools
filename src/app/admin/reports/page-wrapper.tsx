import { listAllReports, getReportMetadata } from "@/server/data/reports";
import AdminReportsPage from "./page";

export default async function AdminReportsPageWrapper() {
  const allReports = await listAllReports();
  const latestReport = await getReportMetadata();
  const initialSelectedReport = latestReport.id ? latestReport : null;

  return (
    <AdminReportsPage
      initialReports={allReports}
      initialSelectedReport={initialSelectedReport}
    />
  );
}
