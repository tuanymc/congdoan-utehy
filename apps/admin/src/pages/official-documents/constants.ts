import type { DocumentDirection, DocumentStatus } from "@congdoan/types";

/** Nhãn tiếng Việt cho DocumentDirection — dùng chung giữa List và Form. */
export const DIRECTION_LABEL: Record<DocumentDirection, string> = {
  DRAFT: "Dự thảo",
  OUTGOING: "Công văn đi",
  INCOMING: "Công văn đến"
};

export const DIRECTION_OPTIONS: Array<{ value: DocumentDirection; label: string }> = [
  { value: "DRAFT", label: DIRECTION_LABEL.DRAFT },
  { value: "OUTGOING", label: DIRECTION_LABEL.OUTGOING },
  { value: "INCOMING", label: DIRECTION_LABEL.INCOMING }
];

/** Khớp enum EOFFICE.Common.DocumentStatus ở web cũ — xem packages/types/src/official-document.ts. */
export const STATUS_LABEL: Record<DocumentStatus, string> = {
  SAVE_DRAFT: "Lưu nháp",
  SEND_DRAFT: "Nháp đã gửi",
  WAIT_PUBLISH: "Chờ phát hành",
  PUBLISHED: "Đã phát hành",
  PROCESSED: "Đã xử lý",
  PROCESSING: "Đang xử lý",
  SEND_AGAIN: "Gửi lại"
};

export const STATUS_OPTIONS: Array<{ value: DocumentStatus; label: string }> = [
  { value: "SAVE_DRAFT", label: STATUS_LABEL.SAVE_DRAFT },
  { value: "SEND_DRAFT", label: STATUS_LABEL.SEND_DRAFT },
  { value: "WAIT_PUBLISH", label: STATUS_LABEL.WAIT_PUBLISH },
  { value: "PUBLISHED", label: STATUS_LABEL.PUBLISHED },
  { value: "PROCESSED", label: STATUS_LABEL.PROCESSED },
  { value: "PROCESSING", label: STATUS_LABEL.PROCESSING },
  { value: "SEND_AGAIN", label: STATUS_LABEL.SEND_AGAIN }
];

/** DocumentType.name khớp seed.ts — GET /official-documents/forms và trang /tien-ich-so-cong-doan/bieu-mau. */
export const FORMS_DOCUMENT_TYPE_NAME = "Biểu mẫu Công đoàn";

export type OfficialDocumentPurpose = "documents" | "forms";
