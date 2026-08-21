/**
 * Domain UnionLeadership — Ban chấp hành công đoàn + Nhiệm kỳ (thay màn hình "quản lý lãnh đạo công
 * đoàn và nhiệm kỳ, ban chấp hành" ở web cũ).
 *
 * Nguồn: NHIEMKY, NHANVIEN_NHIEMKY, tblPhongBan_NV_NK ở web cũ (đọc trực tiếp docs/script.sql) — xem
 * chú thích đầu đoạn model UnionTerm/UnionCommitteeMember trong prisma/schema.prisma cho lý do KHÔNG
 * lặp lại antipattern "copy toàn bộ hồ sơ NHANVIEN mỗi nhiệm kỳ" của web cũ.
 *
 * Có 2 cấp: Ban chấp hành công đoàn TRƯỜNG (departmentId null) và Ban chấp hành/tổ công đoàn BỘ PHẬN
 * (departmentId khớp 1 UnionDepartment cụ thể).
 */

import type { UnionDepartmentDto } from "./union-directory";

export interface UnionTermDto {
  id: string;
  name: string;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
  /** Nhiệm kỳ đang đương nhiệm — trang công khai mặc định hiển thị nhiệm kỳ này. */
  isCurrent: boolean;
  sortOrder: number;
}

export interface CreateUnionTermRequest {
  name: string;
  startYear?: number;
  endYear?: number;
  description?: string;
  isCurrent?: boolean;
  sortOrder?: number;
}

export interface UpdateUnionTermRequest extends Partial<CreateUnionTermRequest> {}

/** Tóm tắt công đoàn viên hiển thị kèm mỗi thành viên Ban chấp hành — subset an toàn công khai, KHÔNG
 * bao giờ có field nội bộ (xem UnionMemberProfileDto, không liên quan ở đây). */
export interface UnionCommitteeMemberSummaryDto {
  id: string;
  fullName: string;
  photoUrl: string | null;
  degreeLabel: string | null;
}

export interface UnionCommitteeMemberDto {
  id: string;
  termId: string;
  memberId: string;
  member: UnionCommitteeMemberSummaryDto;
  /** Null = Ban chấp hành công đoàn TRƯỜNG. */
  departmentId: string | null;
  department: UnionDepartmentDto | null;
  /** Chức vụ trong Ban chấp hành (vd "Chủ tịch", "Uỷ viên Ban Thường vụ") — khác
   * UnionMemberListItemDto.positionTitle (chức vụ chuyên môn tại trường). */
  positionTitle: string;
  sortOrder: number;
  note: string | null;
}

export interface CreateUnionCommitteeMemberRequest {
  termId: string;
  memberId: string;
  /** Bỏ qua hoặc gửi undefined = cấp trường. */
  departmentId?: string;
  positionTitle: string;
  sortOrder?: number;
  note?: string;
}

export interface UpdateUnionCommitteeMemberRequest extends Partial<CreateUnionCommitteeMemberRequest> {}
