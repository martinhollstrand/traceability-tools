import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { getToolBySlug } from "@/server/data/tools";

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const capabilityEntries = Object.entries(tool.capabilities ?? {});
  const comparisonEntries = Object.entries(tool.comparisonData ?? {});

  return (
    <div className="py-12">
      <Container className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.3em] text-[hsl(var(--muted))] uppercase">
            {tool.category ?? "Okategoriserad"}
          </p>
          <h1 className="text-4xl font-semibold text-[hsl(var(--foreground))]">
            {tool.name}
          </h1>
          {tool.summary && <Text variant="lead">{tool.summary}</Text>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Kapabiliteter</h2>
            {capabilityEntries.length === 0 ? (
              <Text>Inga kapabiliteter dokumenterade ännu.</Text>
            ) : (
              <dl className="space-y-3">
                {capabilityEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm tracking-[0.2em] text-[hsl(var(--muted))] uppercase">
                      {key}
                    </dt>
                    <dd className="text-[hsl(var(--foreground))]">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold">Jämförelsedata</h2>
            {comparisonEntries.length === 0 ? (
              <Text>Inga datapunkter ännu.</Text>
            ) : (
              <dl className="space-y-3">
                {comparisonEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm tracking-[0.2em] text-[hsl(var(--muted))] uppercase">
                      {key}
                    </dt>
                    <dd className="text-[hsl(var(--foreground))]">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>
      </Container>
    </div>
  );
}
