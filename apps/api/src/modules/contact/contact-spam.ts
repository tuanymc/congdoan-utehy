/**
 * Bộ lọc probe tự động (sqlmap/scanner) trên form Liên hệ công khai.
 * Prisma parameterized nên payload không thực thi SQL — chỉ làm đầy hộp thư admin.
 */

const ATTACK_PATTERNS: RegExp[] = [
  /\b(union\s+select|select\s+.+\s+from|insert\s+into|drop\s+table|update\s+\w+\s+set|delete\s+from)\b/i,
  /\b(sleep|pg_sleep|benchmark)\s*\(/i,
  /\bwaitfor\s+delay\b/i,
  /\bfrom\s+dual\b/i,
  /\binformation_schema\b/i,
  /\b(xp_cmdshell|dbms_pipe|receive_message)\b/i,
  /\bchr\s*\(\s*\d+/i,
  /\b(or|and)\s+\d+\s*=\s*\d+/i,
  /<\s*script\b/i,
  /javascript\s*:/i,
  /\bon(?:error|load|click)\s*=/i,
  /(?:\.\.\/){2,}/,
  /(?:%2[57]|%5c|%22|%27){2,}/i
];

const FAKE_EMAIL = /@(?:example\.com|mailinator\.com|guerrillamail\.com|tempmail|10minutemail)/i;
const SCANNER_PHONE = /^555[-.\s]?666/;

export function isContactSpam(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  website?: string | null;
}): boolean {
  if (input.website?.trim()) return true;

  const email = (input.email ?? "").trim();
  if (email && FAKE_EMAIL.test(email)) return true;

  const phone = (input.phone ?? "").trim();
  if (phone && SCANNER_PHONE.test(phone)) return true;

  const haystack = [input.name, email, phone, input.message].filter(Boolean).join("\n");
  return ATTACK_PATTERNS.some((pattern) => pattern.test(haystack));
}
