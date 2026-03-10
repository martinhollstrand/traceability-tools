"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAboutSettingsAction, type UpdateAboutState } from "@/server/actions/about";
import type { AboutContent } from "@/server/db/schema/landing-settings";

type AboutPageClientProps = {
  initialSettings: AboutContent;
};

const initialState: UpdateAboutState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[hsl(var(--foreground))] px-4 py-2 text-sm font-semibold text-[hsl(var(--surface))] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save about content"}
    </button>
  );
}

function FieldTextarea({
  id,
  name,
  label,
  defaultValue,
  rows = 4,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted))] focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
      />
    </div>
  );
}

export function AboutPageClient({ initialSettings }: AboutPageClientProps) {
  const [state, formAction] = useActionState(updateAboutSettingsAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>About page content</CardTitle>
        <p className="text-muted-foreground text-sm">
          Control the texts shown on the public about page. Partner logos are reused
          automatically from the shared branding component.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-xs tracking-wider">Header</Label>
            <div>
              <Label htmlFor="eyebrow">Eyebrow</Label>
              <Input
                id="eyebrow"
                name="eyebrow"
                defaultValue={initialSettings.eyebrow}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="title">Headline</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialSettings.title}
                className="mt-1"
              />
            </div>
            <FieldTextarea
              id="intro"
              name="intro"
              label="Intro paragraph"
              defaultValue={initialSettings.intro}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs tracking-wider">Section one</Label>
            <div>
              <Label htmlFor="missionTitle">Title</Label>
              <Input
                id="missionTitle"
                name="missionTitle"
                defaultValue={initialSettings.missionTitle}
                className="mt-1"
              />
            </div>
            <FieldTextarea
              id="missionBody"
              name="missionBody"
              label="Body"
              defaultValue={initialSettings.missionBody}
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs tracking-wider">Section two</Label>
            <div>
              <Label htmlFor="methodologyTitle">Title</Label>
              <Input
                id="methodologyTitle"
                name="methodologyTitle"
                defaultValue={initialSettings.methodologyTitle}
                className="mt-1"
              />
            </div>
            <FieldTextarea
              id="methodologyBody"
              name="methodologyBody"
              label="Body"
              defaultValue={initialSettings.methodologyBody}
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs tracking-wider">Section three</Label>
            <div>
              <Label htmlFor="audienceTitle">Title</Label>
              <Input
                id="audienceTitle"
                name="audienceTitle"
                defaultValue={initialSettings.audienceTitle}
                className="mt-1"
              />
            </div>
            <FieldTextarea
              id="audienceBody"
              name="audienceBody"
              label="Body"
              defaultValue={initialSettings.audienceBody}
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-xs tracking-wider">Contact</Label>
            <div>
              <Label htmlFor="contactLabel">Label</Label>
              <Input
                id="contactLabel"
                name="contactLabel"
                defaultValue={initialSettings.contactLabel}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                defaultValue={initialSettings.contactEmail}
                className="mt-1"
              />
            </div>
          </div>

          {state.error && <p className="text-destructive text-sm">{state.error}</p>}
          {state.success && <p className="text-muted-foreground text-sm">Saved.</p>}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
