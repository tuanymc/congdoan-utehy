const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://congdoan.utehy.edu.vn",
  "https://congdoan.utehy.edu.vn",
  "http://congdoan.hyute.edu.vn",
  "https://congdoan.hyute.edu.vn"
];

export function allowedCorsOrigins(): string[] {
  const extra = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([...DEFAULT_CORS_ORIGINS, ...extra])];
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Form công khai (Liên hệ): chỉ nhận POST từ origin/referer của website, chặn sqlmap gọi thẳng /api. */
export function isTrustedPublicFormRequest(headers: { origin?: string | string[]; referer?: string | string[] }): boolean {
  const allowed = allowedCorsOrigins();
  const origin = headerValue(headers.origin).replace(/\/$/, "");
  if (origin && allowed.includes(origin)) return true;

  const referer = headerValue(headers.referer);
  if (referer) {
    return allowed.some((item) => referer === item || referer.startsWith(`${item}/`));
  }
  return false;
}
