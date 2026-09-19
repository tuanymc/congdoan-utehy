export interface TextPart {
  text: string;
  href?: string;
}

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'[\]{}]+/gi;
const TRAILING_PUNCTUATION = /[),.;:!?]+$/;

function sanitizeHttpUrl(raw: string): string | null {
  const trimmed = raw.replace(TRAILING_PUNCTUATION, "");
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

/** Tách văn bản thành đoạn thường + URL http(s) để render thành thẻ <a> (không dùng HTML thô). */
export function splitTextWithUrls(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const matcher = new RegExp(URL_PATTERN.source, URL_PATTERN.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text)) !== null) {
    const raw = match[0] ?? "";
    const href = sanitizeHttpUrl(raw);
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }
    if (href) {
      const consumed = raw.replace(TRAILING_PUNCTUATION, "");
      parts.push({ text: consumed, href });
      lastIndex = match.index + consumed.length;
    } else {
      parts.push({ text: raw });
      lastIndex = match.index + raw.length;
    }
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ text }];
}

export function firstHttpUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  for (const part of splitTextWithUrls(text)) {
    if (part.href) return part.href;
  }
  return null;
}
