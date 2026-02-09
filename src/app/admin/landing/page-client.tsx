"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  updateLandingSettingsAction,
  setToolFeaturedAction,
  type UpdateLandingState,
} from "@/server/actions/landing";
import type { LandingContent } from "@/server/db/schema/landing-settings";
import type { Tool } from "@/lib/validators/tool";

type LandingPageClientProps = {
  initialSettings: LandingContent;
  tools: Tool[];
};

const initialState: UpdateLandingState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save landing content"}
    </Button>
  );
}

export function LandingPageClient({ initialSettings, tools }: LandingPageClientProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateLandingSettingsAction, initialState);

  const handleToggleFeatured = async (toolId: string, current: boolean) => {
    await setToolFeaturedAction(toolId, !current);
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Landing content</CardTitle>
          <p className="text-muted-foreground text-sm">
            Hero badge, headline, subtext, featured section label/title/description, and
            the three insight bullets (title, copy, icon emoji).
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-xs tracking-wider uppercase">Hero</Label>
              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <Label htmlFor="heroBadge">Badge text</Label>
                  <Input
                    id="heroBadge"
                    name="heroBadge"
                    defaultValue={initialSettings.hero.badge}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="heroHeadline">Headline</Label>
                  <Input
                    id="heroHeadline"
                    name="heroHeadline"
                    defaultValue={initialSettings.hero.headline}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtext">Subtext</Label>
                  <Input
                    id="heroSubtext"
                    name="heroSubtext"
                    defaultValue={initialSettings.hero.subtext}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs tracking-wider uppercase">Featured section</Label>
              <div className="grid gap-4 sm:grid-cols-1">
                <div>
                  <Label htmlFor="featuredLabel">Label (small uppercase)</Label>
                  <Input
                    id="featuredLabel"
                    name="featuredLabel"
                    defaultValue={initialSettings.featuredSection.label}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="featuredTitle">Title</Label>
                  <Input
                    id="featuredTitle"
                    name="featuredTitle"
                    defaultValue={initialSettings.featuredSection.title}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="featuredDescription">Description</Label>
                  <Input
                    id="featuredDescription"
                    name="featuredDescription"
                    defaultValue={initialSettings.featuredSection.description}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs tracking-wider uppercase">
                Insight bullets (3)
              </Label>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor={`bullet${i}Title`}>Title</Label>
                    <Input
                      id={`bullet${i}Title`}
                      name={`bullet${i}Title`}
                      defaultValue={initialSettings.insightBullets[i]?.title}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bullet${i}Copy`}>Copy</Label>
                    <Input
                      id={`bullet${i}Copy`}
                      name={`bullet${i}Copy`}
                      defaultValue={initialSettings.insightBullets[i]?.copy}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bullet${i}Icon`}>Icon (emoji)</Label>
                    <Input
                      id={`bullet${i}Icon`}
                      name={`bullet${i}Icon`}
                      defaultValue={initialSettings.insightBullets[i]?.icon}
                      className="mt-1"
                      placeholder="🛰️"
                    />
                  </div>
                </div>
              ))}
            </div>

            {state.error && <p className="text-destructive text-sm">{state.error}</p>}
            {state.success && <p className="text-muted-foreground text-sm">Saved.</p>}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curated shortlist (featured tools)</CardTitle>
          <p className="text-muted-foreground text-sm">
            Toggle which tools appear in the &quot;Curated shortlist&quot; block on the
            homepage. Only published tools are listed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="pr-4 pb-2 font-medium text-[hsl(var(--muted))]">Tool</th>
                  <th className="pr-4 pb-2 font-medium text-[hsl(var(--muted))]">
                    Category
                  </th>
                  <th className="pb-2 font-medium text-[hsl(var(--muted))]">
                    On landing
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-[hsl(var(--border))] last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{tool.name}</td>
                    <td className="py-3 pr-4 text-[hsl(var(--muted))]">
                      {tool.category || "—"}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(tool.id, !!tool.isFeatured)}
                        className={`inline-flex h-6 w-10 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                          tool.isFeatured
                            ? "bg-[hsl(var(--foreground))]"
                            : "bg-[hsl(var(--border))]"
                        }`}
                        aria-label={
                          tool.isFeatured ? "Remove from landing" : "Add to landing"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            tool.isFeatured ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tools.length === 0 && (
            <Text className="text-muted-foreground py-4">
              No published tools. Import data first.
            </Text>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
