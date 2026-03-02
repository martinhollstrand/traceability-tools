export type ReportKeyFinding = {
  headline: string;
  text: string;
};

type LegacyKeyFinding =
  | string
  | {
      headline?: unknown;
      text?: unknown;
      label?: unknown;
      detail?: unknown;
    };

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseLegacyStringFinding(value: string): ReportKeyFinding | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const separatorIndex = trimmed.indexOf(":");
  if (separatorIndex === -1) {
    return { headline: trimmed, text: "" };
  }

  const headline = trimmed.slice(0, separatorIndex).trim();
  const text = trimmed.slice(separatorIndex + 1).trim();
  if (!headline && !text) return null;

  return {
    headline: headline || text,
    text: headline ? text : "",
  };
}

function parseObjectFinding(
  value: Exclude<LegacyKeyFinding, string>,
): ReportKeyFinding | null {
  const headline = toTrimmedString(value.headline) || toTrimmedString(value.label);
  const text = toTrimmedString(value.text) || toTrimmedString(value.detail);

  if (!headline && !text) return null;

  return {
    headline: headline || text,
    text: headline ? text : "",
  };
}

export function normalizeReportKeyFindings(input: unknown): ReportKeyFinding[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item): ReportKeyFinding | null => {
      if (typeof item === "string") return parseLegacyStringFinding(item);
      if (item && typeof item === "object") {
        return parseObjectFinding(item as Exclude<LegacyKeyFinding, string>);
      }
      return null;
    })
    .filter((item): item is ReportKeyFinding => item !== null);
}
