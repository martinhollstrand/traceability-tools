import {
  parseUploadFormData,
  runToolVersionImport,
  type ToolImportProgress,
  type ToolImportResult,
} from "@/server/import/tool-version-import";
import { requireAdminSession } from "@/server/auth/session";

export const runtime = "nodejs";
export const maxDuration = 300;

type ImportStreamEvent =
  | {
      type: "progress";
      progress: ToolImportProgress;
    }
  | {
      type: "complete";
      result: ToolImportResult;
    }
  | {
      type: "error";
      message: string;
    };

export async function POST(request: Request): Promise<Response> {
  await requireAdminSession();

  const formData = await request.formData();
  const parsed = parseUploadFormData(formData);
  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: ImportStreamEvent) => {
        if (closed) return;

        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };

      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      void (async () => {
        try {
          send({
            type: "progress",
            progress: {
              stage: "preparing",
              message: "Importstart mottagen. Startar bearbetning...",
            },
          });

          const result = await runToolVersionImport(parsed.data, {
            onProgress: (progress) => {
              send({
                type: "progress",
                progress,
              });
            },
          });

          send({
            type: "complete",
            result,
          });

          close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Importen kunde inte slutföras";
          send({
            type: "error",
            message,
          });
          close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
