"use client";

import { useState, useCallback, useMemo, type DragEvent, type FormEvent } from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

type ImportProgress = {
  stage:
    | "preparing"
    | "questions"
    | "rows"
    | "archiving"
    | "finalizing"
    | "completed"
    | "failed";
  message: string;
  versionId?: string;
  totalRows?: number;
  processedRows?: number;
  createdCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  aiGeneratedCount?: number;
};

type ImportResult = {
  versionId: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  questionsCount: number;
  aiGeneratedCount: number;
};

type ImportStreamEvent =
  | { type: "progress"; progress: ImportProgress }
  | { type: "complete"; result: ImportResult }
  | { type: "error"; message: string };

export function ExcelUpload() {
  const [fileName, setFileName] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [regenerateAi, setRegenerateAi] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [verboseLog, setVerboseLog] = useState<string[]>([]);

  const addVerboseLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString("sv-SE", { hour12: false });
    setVerboseLog((prev) => [...prev, `[${timestamp}] ${message}`].slice(-250));
  }, []);

  const progressPercent = useMemo(() => {
    if (progress?.totalRows && progress.totalRows > 0) {
      const processedRows = Math.min(progress.processedRows ?? 0, progress.totalRows);
      return Math.round((processedRows / progress.totalRows) * 100);
    }

    if (submitSuccess) return 100;
    if (isSubmitting) return 5;
    return 0;
  }, [isSubmitting, progress, submitSuccess]);

  const handleFileChange = useCallback(async (file: File) => {
    setFileName(file.name);
    setDragError("");
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });
    setRowCount(json.length);
    setColumns(Object.keys(json[0] ?? {}));
    setPreviewRows(json.slice(0, 5));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!isAcceptedFile(file)) {
        setDragError("Filtypen stöds inte. Använd .xlsx, .xls eller .csv.");
        return;
      }

      setDragError("");

      // Update the form's file input so it is included in the FormData submission
      const input = e.currentTarget.querySelector<HTMLInputElement>('input[type="file"]');
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
      }

      handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setSubmitError("");
      setSubmitSuccess(false);
      setProgress(null);
      setResult(null);
      setVerboseLog([]);
      setIsSubmitting(true);
      addVerboseLog("Importen skickades. Väntar på status från servern...");

      try {
        const response = await fetch("/api/admin/imports/stream", {
          method: "POST",
          body: new FormData(event.currentTarget),
        });

        if (!response.ok) {
          let errorMessage = "Kunde inte starta importen";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error) {
              errorMessage = payload.error;
            }
          } catch {
            // Ignore malformed error payloads and use fallback message.
          }

          setSubmitError(errorMessage);
          addVerboseLog(`Fel vid start: ${errorMessage}`);
          return;
        }

        if (!response.body) {
          const noStreamError = "Servern returnerade ingen progress-ström";
          setSubmitError(noStreamError);
          addVerboseLog(noStreamError);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let completed = false;
        let hasError = false;

        const applyEvent = (rawLine: string) => {
          const line = rawLine.trim();
          if (!line) return;

          try {
            const eventData = JSON.parse(line) as ImportStreamEvent;

            if (eventData.type === "progress") {
              setProgress(eventData.progress);
              addVerboseLog(eventData.progress.message);
              return;
            }

            if (eventData.type === "complete") {
              completed = true;
              setSubmitSuccess(true);
              setResult(eventData.result);
              addVerboseLog(
                `Import klar: ${eventData.result.updatedCount} uppdaterade, ${eventData.result.createdCount} skapade, ${eventData.result.skippedCount} hoppade.`,
              );
              return;
            }

            if (eventData.type === "error") {
              hasError = true;
              setSubmitError(eventData.message);
              addVerboseLog(`Importfel: ${eventData.message}`);
            }
          } catch {
            addVerboseLog(`Kunde inte tolka servermeddelande: ${line}`);
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            applyEvent(line);
          }
        }

        if (buffer.trim()) {
          applyEvent(buffer);
        }

        if (!completed && !hasError) {
          hasError = true;
          setSubmitError(
            "Importströmmen avslutades innan klart svar mottogs. Kontrollera versionslistan.",
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Kunde inte ansluta till importtjänsten";
        setSubmitError(message);
        addVerboseLog(`Nätverksfel: ${message}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [addVerboseLog],
  );

  return (
    <Card className="w-full max-w-full min-w-0 space-y-4 overflow-hidden">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          Ladda upp Excel
        </h3>
        <Text>
          Förhandsgranska kolumner innan du bekräftar importen. Första bladet används
          automatiskt.
        </Text>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center text-sm transition-colors",
            isDragging
              ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))]/5 text-[hsl(var(--foreground))]"
              : "border-[hsl(var(--border))] text-[hsl(var(--muted))] hover:border-[hsl(var(--foreground))]",
          )}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFileChange(file);
              }
            }}
            required
          />
          {fileName ? (
            <>
              <span className="font-semibold text-[hsl(var(--foreground))]">
                {fileName}
              </span>
              <span>{rowCount} rader identifierade</span>
            </>
          ) : isDragging ? (
            <span className="font-semibold text-[hsl(var(--foreground))]">
              Släpp filen för att ladda upp
            </span>
          ) : (
            <>
              <span className="font-semibold text-[hsl(var(--foreground))]">
                Släpp fil här
              </span>
              <span>eller klicka för att välja</span>
            </>
          )}
        </label>
        {dragError && <p className="text-sm text-red-600">{dragError}</p>}
        <input type="hidden" name="filename" value={fileName} />
        <input type="hidden" name="rowCount" value={rowCount} />
        <input type="hidden" name="columns" value={JSON.stringify(columns)} />
        <input type="hidden" name="regenerateAi" value={String(regenerateAi)} />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="regenerateAi"
            checked={regenerateAi}
            onChange={(e) => setRegenerateAi(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[hsl(var(--foreground))] focus:ring-[hsl(var(--foreground))]"
          />
          <label htmlFor="regenerateAi" className="text-sm text-[hsl(var(--muted))]">
            Regenerate AI summaries for existing tools
          </label>
        </div>
        {regenerateAi && rowCount > 50 && (
          <p className="text-xs text-amber-700">
            AI-generering för {rowCount} rader kan överskrida tidsgränser i serverless. Om
            det blir timeout: kör först import utan AI och regenerera i mindre batchar.
          </p>
        )}

        <SubmitButton disabled={!fileName} pending={isSubmitting} />
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        {submitSuccess && (
          <p className="text-sm text-green-600">
            Import sparad. {result ? `${result.totalRows} rader bearbetade.` : ""}{" "}
            Uppdatera sidan för att se den nya versionen.
          </p>
        )}
      </form>
      {(isSubmitting || verboseLog.length > 0 || submitSuccess || submitError) && (
        <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted))]">
            <span>{progress?.message ?? "Importlogg"}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]/40">
            <div
              className="h-full rounded-full bg-[hsl(var(--foreground))] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[hsl(var(--muted))]">
            <span>
              Rader: {progress?.processedRows ?? result?.totalRows ?? 0} /{" "}
              {progress?.totalRows ?? result?.totalRows ?? rowCount}
            </span>
            <span>Skapade: {progress?.createdCount ?? result?.createdCount ?? 0}</span>
            <span>
              Uppdaterade: {progress?.updatedCount ?? result?.updatedCount ?? 0}
            </span>
            <span>Hoppade: {progress?.skippedCount ?? result?.skippedCount ?? 0}</span>
            <span>
              AI summeringar:{" "}
              {progress?.aiGeneratedCount ?? result?.aiGeneratedCount ?? 0}
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3 font-mono text-xs text-[hsl(var(--foreground))]">
            {verboseLog.length === 0 ? (
              <p className="text-[hsl(var(--muted))]">
                Väntar på första statusmeddelandet...
              </p>
            ) : (
              verboseLog.map((line, idx) => (
                <p key={`${idx}-${line}`} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))
            )}
          </div>
        </div>
      )}
      {previewRows.length > 0 && (
        <div className="w-full max-w-full min-w-0 overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-[hsl(var(--border))] px-4 py-2 whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={index} className="border-b border-[hsl(var(--border))]">
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-2 whitespace-nowrap text-[hsl(var(--muted))]"
                    >
                      {String(row[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SubmitButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    <button
      type="submit"
      className="rounded-xl bg-[hsl(var(--foreground))] px-4 py-2 text-sm font-semibold text-[hsl(var(--surface))] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || pending}
    >
      {pending ? "Bearbetar…" : "Bekräfta import"}
    </button>
  );
}
