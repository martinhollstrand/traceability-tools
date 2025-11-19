import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportMetadata } from "@/lib/validators/report";

type ReportSectionsProps = {
  report: ReportMetadata;
};

export function ReportSections({ report }: ReportSectionsProps) {
  if (!report.highlights?.length) {
    return <p className="text-muted-foreground text-sm">No highlights yet.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {report.highlights.map((highlight) => (
        <Card key={highlight.label}>
          <CardHeader>
            <CardTitle className="text-base">{highlight.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{highlight.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
