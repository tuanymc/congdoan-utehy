/**
 * Domain UnionDirectory — danh bạ công đoàn viên công khai (thay 1 phần Membership Phase 2), cộng thêm
 * hồ sơ nội bộ đầy đủ dành riêng cho màn hình quản trị.
 *
 * Nguồn: NHANVIEN + CONGDOANBOPHAN ở web cũ. UnionMemberListItemDto CHỈ có 6 field thật sự hiển thị
 * công khai ở modules/GioiThieuCongDoanVien.aspx — xem chú thích đầu domain block UNIONDIRECTORY trong
 * prisma/schema.prisma. UnionMemberProfileDto bổ sung phần CÒN LẠI của NHANVIEN (~90 cột gốc) nhưng
 * CHỈ dùng cho admin (UnionMemberAdminDetailDto) — KHÔNG bao giờ trả qua endpoint công khai.
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

/** Hồ sơ nội bộ đầy đủ — xem UnionMemberProfile trong prisma/schema.prisma cho nguồn cột gốc từng field. */
export interface UnionMemberProfileDto {
  // Thông tin cá nhân
  alias: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  idCardNumber: string | null;
  idCardIssuedDate: string | null;
  idCardIssuedPlace: string | null;
  ethnicity: string | null;
  religion: string | null;
  nationality: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  contactAddress: string | null;
  officePhone: string | null;
  homePhone: string | null;
  maritalStatus: string | null;
  familyBackground: string | null;
  familyPriorityGroup: string | null;
  selfPriorityGroup: string | null;
  talent: string | null;
  healthStatus: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  disability: string | null;

  // Công tác
  facultyOrDepartmentLabel: string | null;
  workUnit: string | null;
  decisionNumber: string | null;
  joinedEducationSectorDate: string | null;
  contractDate: string | null;
  recruitmentDate: string | null;
  joinedAgencyDate: string | null;
  recruitmentMethod: string | null;
  recruitingAgency: string | null;
  assignedJob: string | null;
  currentJob: string | null;

  // Đảng
  partyCandidateDate: string | null;
  partyOfficialDate: string | null;
  partyJoinedPlace: string | null;
  partyPosition: string | null;
  partyLeftDate: string | null;
  partyCardNumber: string | null;
  partyCell: string | null;

  // Đoàn Thanh niên
  youthUnionJoinedDate: string | null;
  youthUnionJoinedPlace: string | null;
  youthUnionPosition: string | null;

  // Công đoàn
  unionJoinedDate: string | null;
  unionJoinedPlace: string | null;
  unionPosition: string | null;
  unionSectionLabel: string | null;

  // Học vấn / Đào tạo
  generalEducationLevel: string | null;
  hasGraduated: boolean | null;
  trainingField: string | null;
  trainingMajor: string | null;
  trainingPlace: string | null;
  trainingMethod: string | null;
  graduationYear: number | null;
  hasPedagogyTraining: boolean | null;
  politicalTheoryLevel: string | null;
  stateManagementLevel: string | null;
  educationManagementLevel: string | null;
  mainForeignLanguage: string | null;
  foreignLanguageLevel: string | null;
  otherForeignLanguage: string | null;
  itLevel: string | null;

  // Lương / BHXH / trạng thái công tác
  salaryNote: string | null;
  seniorityNote: string | null;
  jobTitle: string | null;
  salaryGrade: string | null;
  laborType: string | null;
  socialInsuranceNumber: string | null;
  oldSocialInsuranceNumber: string | null;
  retirementDate: string | null;
  incomingStatus: string | null;
  incomingDate: string | null;
  outgoingStatus: string | null;
  outgoingDate: string | null;

  // Mã tra cứu nội bộ khác
  salaryCode: string | null;
  fileCode: string | null;
  unitLabel: string | null;
}

/** Payload tạo/cập nhật hồ sơ nội bộ — mọi field optional, gửi field nào cập nhật field đó. */
export interface UpsertUnionMemberProfileRequest extends Partial<Omit<UnionMemberProfileDto, "heightCm" | "weightKg" | "graduationYear" | "hasGraduated" | "hasPedagogyTraining">> {
  heightCm?: number;
  weightKg?: number;
  graduationYear?: number;
  hasGraduated?: boolean;
  hasPedagogyTraining?: boolean;
}

/** Chi tiết công đoàn viên dành cho màn hình quản trị — có thêm hồ sơ nội bộ (null nếu chưa nhập). */
export interface UnionMemberAdminDetailDto extends UnionMemberListItemDto {
  profile: UnionMemberProfileDto | null;
}

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
  /** Có gửi kèm object này thì mới upsert hồ sơ nội bộ — bỏ qua nếu không muốn đụng tới hồ sơ. */
  profile?: UpsertUnionMemberProfileRequest;
}

export interface UpdateUnionMemberRequest extends Partial<CreateUnionMemberRequest> {}
