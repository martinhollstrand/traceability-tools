"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveReportAction, type ReportState } from "@/server/actions/report";
import { type ReportMetadataPayload } from "@/server/data/types";
import { Card } from "@/components/ui/card";

const initialState: ReportState = { success: false };

type Props = {
  initial: ReportMetadataPayload;
};

export function ReportForm({ initial }: Props) {
  const [state, formAction] = useFormState(saveReportAction, initialState);
  const defaultFindings = initial.keyFindings.join("\n");

  return (
    <Card className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Titel
          </label>
          <input
            name="title"
            defaultValue={initial.title}
            required
            className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Ingress
          </label>
          <textarea
            name="ingress"
            defaultValue={initial.ingress ?? ""}
            rows={3}
            className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Key findings (en per rad)
          </label>
          <textarea
            name="keyFindings"
            defaultValue={defaultFindings}
            rows={5}
            className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            PDF-länk
          </label>
          <input
            name="pdfUrl"
            defaultValue={initial.pdfUrl ?? ""}
            className="w-full rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
        </div>
        <SubmitButton />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-green-600">Rapporten uppdaterades.</p>
        )}
      </form>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-xl bg-[hsl(var(--foreground))] px-4 py-2 text-sm font-semibold text-[hsl(var(--surface))] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Sparar…" : "Spara ändringar"}
    </button>
  );
}
