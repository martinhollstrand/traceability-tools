import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/validators/tool";

type ComparisonGridProps = {
  tools: Tool[];
  summary?: string;
};

export function ComparisonGrid({ tools, summary }: ComparisonGridProps) {
  return (
    <div className="space-y-6">
      {summary && (
        <Card className="bg-secondary/20">
          <CardHeader>
            <CardTitle>AI Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <article className="prose prose-sm text-muted-foreground max-w-none">
              {summary}
            </article>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>{tool.name}</span>
                <Badge variant="secondary">{tool.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              <p>{tool.summary}</p>
              <div>
                <p className="text-foreground font-semibold">Stats</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>Customers: {tool.stats.customers}</li>
                  <li>Coverage: {(tool.stats.coverage * 100).toFixed(0)}%</li>
                  <li>Integrations: {tool.stats.contracts}</li>
                </ul>
              </div>
              <div>
                <p className="text-foreground font-semibold">Focus</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(tool.tags ?? tool.features ?? []).slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
