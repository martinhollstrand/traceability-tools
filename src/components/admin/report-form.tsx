"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import { saveReportAction, type ReportState } from "@/server/actions/report";
import { type ReportMetadataPayload } from "@/server/data/types";
import { Card } from "@/components/ui/card";

const initialState: ReportState = { success: false };

type Props = {
  initial: ReportMetadataPayload;
  onSaved?: () => void;
};

export function ReportForm({ initial, onSaved }: Props) {
  const [state, formAction] = useActionState(saveReportAction, initialState);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initial.pdfUrl ?? null);
  const [pdfMetadata, setPdfMetadata] = useState<{
    filename?: string;
    size?: number;
  } | null>(
    initial.pdfUrl
      ? {
          filename: initial.pdfFilename ?? undefined,
          size: initial.pdfSize ?? undefined,
        }
      : null,
  );
  const defaultFindings = initial.keyFindings?.join("\n") || "";
  const isNewReport = !initial.id;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadError("File must be a PDF");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }
      setPdfFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch("/api/reports/pdf/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      setPdfMetadata({
        filename: data.originalFilename || pdfFile.name,
        size: data.size || pdfFile.size,
      });
      setPdfFile(null);
    } catch (error) {
      setUploadError((error as Error).message || "Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  // Reset form when switching between reports
  useEffect(() => {
    setUploadedUrl(initial.pdfUrl ?? null);
    setPdfMetadata(
      initial.pdfUrl
        ? {
            filename: initial.pdfFilename ?? undefined,
            size: initial.pdfSize ?? undefined,
          }
        : null,
    );
  }, [initial.id, initial.pdfUrl, initial.pdfFilename, initial.pdfSize]);

  // Call onSaved when report is successfully saved
  useEffect(() => {
    if (state.success && onSaved) {
      onSaved();
    }
  }, [state.success, onSaved]);

  return (
    <Card className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            Titel
          </label>
          <input
            name="title"
            defaultValue={initial.title || ""}
            required
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted))] focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
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
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted))] focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
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
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted))] focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">
            PDF-fil
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-4 text-center text-sm text-[hsl(var(--muted))] hover:border-[hsl(var(--foreground))]">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {pdfFile ? (
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {pdfFile.name}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      Välj PDF-fil
                    </span>
                    <span className="text-xs">eller dra och släpp här</span>
                  </>
                )}
              </label>
              {pdfFile && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Laddar upp..." : "Ladda upp"}
                </button>
              )}
            </div>
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            {uploadedUrl && (
              <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {pdfMetadata?.filename ||
                        uploadedUrl.split("/").pop()?.split("?")[0] ||
                        "PDF"}
                    </span>
                    {pdfMetadata?.size && (
                      <p className="text-xs text-[hsl(var(--muted))]">
                        {(pdfMetadata.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      Öppna
                    </a>
                    <a
                      href={`/api/reports/pdf/${encodeURIComponent(uploadedUrl.split("/").pop()?.split("?")[0] || "")}?url=${encodeURIComponent(uploadedUrl)}`}
                      download
                      className="text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      Ladda ner
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="pdfUrl" value={uploadedUrl || ""} />
          <input type="hidden" name="pdfFilename" value={pdfMetadata?.filename || ""} />
          <input
            type="hidden"
            name="pdfSize"
            value={pdfMetadata?.size?.toString() || ""}
          />
        </div>
        {!isNewReport && initial.id && (
          <input type="hidden" name="id" value={initial.id} />
        )}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            defaultChecked={initial.isPublished}
            className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
          />
          <label
            htmlFor="isPublished"
            className="text-sm font-medium text-[hsl(var(--foreground))]"
          >
            Publish report (make it visible on the public page)
          </label>
        </div>
        <SubmitButton />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-green-600">
            {isNewReport ? "Rapporten skapades." : "Rapporten uppdaterades."}
          </p>
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
