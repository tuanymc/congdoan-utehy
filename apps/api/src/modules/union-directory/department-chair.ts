export function foldTitle(positionTitle: string): string {
  return positionTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[./_,-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Nhận diện chủ tịch / tổ trưởng công đoàn bộ phận (không gồm phó). */
export function isDepartmentChairTitle(positionTitle: string | null | undefined): boolean {
  if (!positionTitle) return false;
  const folded = foldTitle(positionTitle);
  if (!folded) return false;

  const isVice =
    folded.includes("pho chu tich") ||
    folded.includes("pho ct") ||
    folded.includes("pho to truong") ||
    folded.includes("to pho") ||
    /\bpct\b/.test(folded) ||
    folded.startsWith("p ct");
  if (isVice) return false;

  if (folded.includes("chu tich")) return true;
  if (folded.includes("to truong")) return true;
  if (/\bct\b/.test(folded) && (folded.includes("cd") || folded.includes("bo phan") || folded.includes("cdbp") || folded === "ct")) {
    return true;
  }
  return false;
}

/** Ghép chức vụ (vd "Chủ tịch CĐBP Khoa Điện - Điện tử") với tên công đoàn bộ phận. */
export function matchDepartmentFromTitles<T extends { name: string }>(
  departments: T[],
  titles: Array<string | null | undefined>
): T | undefined {
  const haystacks = titles.filter((value): value is string => Boolean(value?.trim())).map((value) => foldTitle(value));
  if (haystacks.length === 0) return undefined;

  let best: T | undefined;
  let bestLength = 0;
  for (const department of departments) {
    const needle = foldTitle(department.name);
    if (needle.length < 8) continue;
    if (haystacks.some((haystack) => haystack.includes(needle)) && needle.length > bestLength) {
      best = department;
      bestLength = needle.length;
    }
  }
  return best;
}
