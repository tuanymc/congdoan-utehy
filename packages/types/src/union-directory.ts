/**
 * Domain UnionDirectory — danh bạ công đoàn viên công khai (thay 1 phần Membership Phase 2).
 *
 * Nguồn: NHANVIEN + CONGDOANBOPHAN ở web cũ, nhưng CHỈ import 6 field thật sự hiển thị công khai ở
 * modules/GioiThieuCongDoanVien.aspx — xem chú thích đầu domain block UNIONDIRECTORY trong
 * prisma/schema.prisma để biết lý do CHỦ ĐỘNG bỏ qua toàn bộ field nhạy cảm còn lại (~90 cột gốc).
 */

export interface UnionDepartmentDto {
  id: string;
  name: string;
  sortOrder: number;
}

export interface UnionMemberListItemDto {
  id: string;
  fullName: string;
  photoUrl: string | null;
  degreeLabel: string | null;
  positionTitle: string | null;
  phone: string | null;
  email: string | null;
  isPublic: boolean;
  sortOrder: number;
  department: UnionDepartmentDto | null;
}

export interface CreateUnionDepartmentRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateUnionDepartmentRequest extends Partial<CreateUnionDepartmentRequest> {}

export interface CreateUnionMemberRequest {
  fullName: string;
  photoUrl?: string;
  degreeLabel?: string;
  positionTitle?: string;
  phone?: string;
  email?: string;
  isPublic?: boolean;
  sortOrder?: number;
  departmentId?: string;
}

export interface UpdateUnionMemberRequest extends Partial<CreateUnionMemberRequest> {}
