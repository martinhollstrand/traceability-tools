"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import * as XLSX from "xlsx";
import { uploadExcelAction, type UploadExcelState } from "@/server/actions/tool-versions";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

const initialState: UploadExcelState = { success: false };

export function ExcelUpload() {
  const [state, formAction] = useFormState(uploadExcelAction, initialState);
  const [fileName, setFileName] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [regenerateAi, setRegenerateAi] = useState(false);

  const handleFileChange = async (file: File) => {
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });
    setRowCount(json.length);
    setColumns(Object.keys(json[0] ?? {}));
    setPreviewRows(json.slice(0, 5));
  };

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          Ladda upp Excel
        </h3>
        <Text>
          Förhandsgranska kolumner innan du bekräftar importen. Första bladet används
          automatiskt.
        </Text>
      </div>
      <form action={formAction} className="space-y-4" encType="multipart/form-data">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-10 text-center text-sm text-[hsl(var(--muted))] hover:border-[hsl(var(--foreground))]">
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
          ) : (
            <>
              <span className="font-semibold text-[hsl(var(--foreground))]">
                Släpp fil här
              </span>
              <span>eller klicka för att välja</span>
            </>
          )}
        </label>
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

        <SubmitButton disabled={!fileName} />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-green-600">
            Import sparad. Uppdatera sidan för att se versionen.
          </p>
        )}
      </form>
      {previewRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-[hsl(var(--border))] px-4 py-2"
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
                    <td key={column} className="px-4 py-2 text-[hsl(var(--muted))]">
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

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
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
