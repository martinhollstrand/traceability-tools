import type { ReactNode } from "react";

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)"'\]])/;
const EMAIL_PATTERN = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;

/**
 * Renders text with auto-detected URLs and emails as clickable links.
 * URLs open in a new tab; emails use mailto:.
 */
export function AutoLinkedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  // Build a fresh regex each call to avoid shared mutable lastIndex state
  const combined = new RegExp(`(${URL_PATTERN.source}|${EMAIL_PATTERN.source})`, "g");
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const value = match[0];
    const isUrl = URL_PATTERN.test(value);

    if (isUrl) {
      parts.push(
        <a
          key={match.index}
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {value}
        </a>,
      );
    } else {
      parts.push(
        <a
          key={match.index}
          href={`mailto:${value}`}
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {value}
        </a>,
      );
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) return <span className={className}>{text}</span>;

  return <span className={className}>{parts}</span>;
}
