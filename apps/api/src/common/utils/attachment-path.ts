import { existsSync, readdirSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";

/**
 * Tìm file đính kèm trên đĩa từ path tương đối lưu trong CSDL (ETL từ tblAttach.Path).
 *
 * Web cũ hay lưu tên tiếng Việt (Unicode) trong CSDL trong khi file trên NTFS có thể là:
 * - cùng Unicode nhưng khác dạng NFC/NFD,
 * - URL-encode (`%20`, `%C3%A1`, dấu `+` thay khoảng trắng — HttpUtility.UrlEncode),
 * - hoặc ngược lại (CSDL encode, đĩa để nguyên chữ Việt).
 * existsSync() thẳng path CSDL sẽ 404 dù file thật sự có — khớp lại bằng vài biến thể + liệt kê
 * thư mục cha.
 */
export function findAttachmentPhysicalPath(
  baseDir: string,
  relPath: string,
  extraBaseDirs: string[] = []
): string | null {
  const strippedOriginal = stripLeadingSlash(stripDocumentFilesPrefix(relPath));
  const bases = [baseDir, ...extraBaseDirs].filter(Boolean);

  for (const base of bases) {
    const found = findInBase(base, strippedOriginal);
    if (found) return found;
  }
  return null;
}

function findInBase(baseDir: string, strippedOriginal: string): string | null {
  const resolvedBase = resolve(baseDir);

  for (const candidate of pathVariants(strippedOriginal)) {
    const resolvedPath = resolve(join(resolvedBase, candidate));
    if (!isInsideBase(resolvedBase, resolvedPath)) continue;
    if (existsSync(resolvedPath)) return resolvedPath;
  }

  return matchByDirectoryListing(resolvedBase, strippedOriginal);
}

function stripLeadingSlash(relPath: string): string {
  return relPath.replace(/^[/\\]+/, "");
}

function stripDocumentFilesPrefix(relPath: string): string {
  return relPath.replace(/^DocumentFiles[\\/]/i, "");
}

function isInsideBase(resolvedBase: string, resolvedPath: string): boolean {
  const prefix = resolvedBase.endsWith(sep) ? resolvedBase : resolvedBase + sep;
  return resolvedPath === resolvedBase || resolvedPath.startsWith(prefix);
}

function decodeUriLoose(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value;
  }
}

function pathVariants(relPath: string): string[] {
  const variants = new Set<string>();
  const add = (raw: string) => {
    const unified = raw.replace(/\\/g, "/").trim();
    if (!unified) return;
    variants.add(unified);
    variants.add(unified.normalize("NFC"));
    variants.add(unified.normalize("NFD"));
  };

  add(relPath);
  add(relPath.replace(/&amp;/g, "&"));
  add(decodeUriLoose(relPath));
  add(decodeUriLoose(decodeUriLoose(relPath)));

  return [...variants];
}

function nameKeys(name: string): Set<string> {
  const keys = new Set<string>();
  const add = (raw: string) => {
    keys.add(raw);
    keys.add(raw.normalize("NFC"));
    keys.add(raw.normalize("NFD"));
    keys.add(raw.toLowerCase());
    keys.add(raw.normalize("NFC").toLowerCase());
  };
  add(name);
  add(decodeUriLoose(name));
  add(decodeUriLoose(decodeUriLoose(name)));
  try {
    add(encodeURIComponent(name));
  } catch {
    // ignore
  }
  return keys;
}

function namesMatch(a: string, b: string): boolean {
  const kb = nameKeys(b);
  for (const key of nameKeys(a)) {
    if (kb.has(key)) return true;
  }
  return false;
}

/** Đi từng cấp thư mục, chọn entry khớp Unicode/URL-encode — không đoán file khác đuôi/tên. */
function matchByDirectoryListing(resolvedBase: string, strippedRelPath: string): string | null {
  const parts = strippedRelPath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length === 0) return null;

  let current = resolvedBase;
  for (const part of parts) {
    if (!existsSync(current)) return null;
    let entries: string[];
    try {
      entries = readdirSync(current);
    } catch {
      return null;
    }
    const decodedPart = decodeUriLoose(part);
    const match = entries.find((entry) => namesMatch(entry, part) || namesMatch(entry, decodedPart));
    if (!match) return null;
    const next = join(current, match);
    if (!isInsideBase(resolvedBase, resolve(next))) return null;
    current = next;
  }

  return existsSync(current) ? current : null;
}

/** RFC 5987 — filename ASCII dự phòng + filename* UTF-8 để trình duyệt giữ đúng tên tiếng Việt. */
export function contentDispositionHeader(fileName: string, type: "inline" | "attachment"): string {
  const fallback = (basename(fileName).replace(/[^\x20-\x7E]+/g, "_").replace(/["\\]/g, "_") || "file").trim();
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/** Giữ cho chỗ ghi/xoá file upload mới (tên đã sanitize ASCII) — không dùng cho file ETL tiếng Việt. */
export function resolveAttachmentPhysicalPath(baseDir: string, relPath: string): string {
  const stripped = stripDocumentFilesPrefix(relPath);
  const resolvedBase = resolve(baseDir);
  const resolvedPath = resolve(join(resolvedBase, stripped));
  if (!isInsideBase(resolvedBase, resolvedPath)) {
    throw new Error("invalid-attachment-path");
  }
  return resolvedPath;
}

