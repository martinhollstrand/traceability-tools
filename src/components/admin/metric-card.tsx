import { Card } from "@/components/ui/card";

type Props = {
  label: string;
  value: string | number;
  helper?: string;
};

export function MetricCard({ label, value, helper }: Props) {
  return (
    <Card className="space-y-1 bg-[hsl(var(--surface))]">
      <p className="text-sm font-medium tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
        {label}
      </p>
      <p className="text-3xl font-semibold text-[hsl(var(--foreground))]">{value}</p>
      {helper && <p className="text-sm text-[hsl(var(--muted))]">{helper}</p>}
    </Card>
  );
}
