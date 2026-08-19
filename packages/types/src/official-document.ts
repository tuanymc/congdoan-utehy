/**
 * Domain OfficialDocument — "Công văn" (Phase 3), nguồn dữ liệu thật là tblDocument (2.494 dòng,
 * hệ "quản lý công văn" riêng trong web_cu/MyWeb/CV2/) — xem chú thích chi tiết đầu domain block
 * trong prisma/schema.prisma để biết ý nghĩa từng field được xác nhận từ code-behind gốc thế nào.
 *
 * Khác với Content (Post/Category — công khai), toàn bộ domain này CHỈ dành cho người dùng đã đăng
 * nhập có quyền "document:*"/"documenttype:*" (mặc định: ADMIN và UNION_CLERK — xem prisma/seed.ts),
 * KHÔNG có endpoint công khai nào (field `isPublic` chỉ giữ lại giá trị ShowWeb gốc để tham khảo).
 */

/** "DRAFT" = dự thảo, "OUTGOING" = công văn đi, "INCOMING" = công văn đến. */
export type DocumentDirection = "DRAFT" | "OUTGOING" | "INCOMING";

/** Khớp enum EOFFICE.Common.DocumentStatus ở web cũ (giữ nguyên tên hằng số gốc, dịch sang tiếng Anh). */
export type DocumentStatus =
  | "SAVE_DRAFT"
  | "SEND_DRAFT"
  | "WAIT_PUBLISH"
  | "PUBLISHED"
  | "PROCESSED"
  | "PROCESSING"
  | "SEND_AGAIN";

export interface DocumentTypeDto {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
}

export interface DocumentAttachmentDto {
  id: string;
  fileName: string;
  description: string | null;
  path: string;
  uploadedAt: string | null;
}

export interface OfficialDocumentListItemDto {
  id: string;
  title: string;
  documentNumber: string | null;
  direction: DocumentDirection;
  status: DocumentStatus;
  documentType: DocumentTypeDto;
  issuingOfficeName: string | null;
  isPublic: boolean;
  issuedAt: string | null;
  createdAt: string;
}

export interface OfficialDocumentDetailDto extends OfficialDocumentListItemDto {
  content: string | null;
  summary: string | null;
  priority: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  processStartAt: string | null;
  processEndAt: string | null;
  createdByName: string | null;
  processedByNames: string | null;
  sentToRaw: string | null;
  updatedAt: string;
  attachments: DocumentAttachmentDto[];
}

export interface CreateDocumentTypeRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateDocumentTypeRequest extends Partial<CreateDocumentTypeRequest> {}

export interface CreateOfficialDocumentRequest {
  title: string;
  documentNumber?: string;
  content?: string;
  summary?: string;
  direction?: DocumentDirection;
  status?: DocumentStatus;
  priority?: string;
  isPublic?: boolean;
  documentTypeId: string;
  issuingOfficeName?: string;
  /** ISO date string. */
  issuedAt?: string;
  /** ISO date string. */
  sentAt?: string;
  /** ISO date string. */
  receivedAt?: string;
}

export interface UpdateOfficialDocumentRequest extends Partial<CreateOfficialDocumentRequest> {}
