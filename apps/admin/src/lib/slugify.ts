/**
 * Sinh slug xem trước ở phía client (chỉ để hiển thị placeholder khi người dùng chưa nhập slug).
 * apps/api mới là nơi sinh slug thật khi lưu (xem apps/api/src/common/utils/slugify.ts) — nếu để
 * trống trường slug, backend sẽ tự tính lại nên hàm này không cần khớp tuyệt đối với backend.
 */
const COMBINING_DIACRITICS_REGEX = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS_REGEX, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
