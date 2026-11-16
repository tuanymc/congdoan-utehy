/** Nhận diện chức vụ Chủ tịch công đoàn bộ phận (không gồm Phó Chủ tịch). */
export function isDepartmentChairTitle(positionTitle: string | null | undefined): boolean {
  if (!positionTitle) return false;
  const folded = positionTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!folded.includes("chu tich")) return false;
  if (folded.includes("pho chu tich")) return false;
  return true;
}
