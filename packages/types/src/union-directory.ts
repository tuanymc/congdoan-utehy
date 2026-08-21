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

/** Dòng danh sách trên trang quản trị — thêm mã cán bộ và trạng thái tài khoản đăng nhập (không trả
 * các field này qua endpoint công khai). */
export interface UnionMemberAdminListItemDto extends UnionMemberListItemDto {
  /** Mã cán bộ (NHANVIEN.MANV / UnionMember.legacyCode) — dùng làm định danh khi tạo tài khoản. */
  legacyCode: string | null;
  /** true nếu đã gắn User (có thể đăng nhập cổng đoàn viên). */
  hasLogin: boolean;
}

/** Chi tiết công đoàn viên dành cho màn hình quản trị — có thêm hồ sơ nội bộ (null nếu chưa nhập). */
export interface UnionMemberAdminDetailDto extends UnionMemberListItemDto {
  profile: UnionMemberProfileDto | null;
  /** Email tài khoản đăng nhập (User) đang liên kết để công đoàn viên tự sửa thông tin ở
   * "/cong-doan-vien" — null nếu chưa liên kết. Xem UnionMember.userId trong prisma/schema.prisma. */
  linkedUserEmail: string | null;
  legacyCode: string | null;
}

/** Mật khẩu mặc định khi admin tạo tài khoản công đoàn viên (có thể chọn ngẫu nhiên thay thế). */
export const DEFAULT_UNION_MEMBER_PASSWORD = "utehy123";

export type CreateUnionMemberLoginPasswordMode = "default" | "random";

/** Payload tạo tài khoản đăng nhập từ hồ sơ công đoàn viên (theo mã cán bộ / dòng đang chọn). */
export interface CreateUnionMemberLoginsRequest {
  passwordMode: CreateUnionMemberLoginPasswordMode;
  /** Id hồ sơ cụ thể (vd các dòng đang chọn trên bảng). */
  memberIds?: string[];
  /** Danh sách mã cán bộ (legacyCode), mỗi phần tử 1 mã. */
  staffCodes?: string[];
  /** true = mọi hồ sơ chưa có tài khoản, có email hợp lệ và có mã cán bộ. */
  allEligible?: boolean;
}

export interface CreateUnionMemberLoginItemResult {
  memberId: string | null;
  fullName: string | null;
  legacyCode: string | null;
  email: string | null;
  status: "created" | "linked_existing" | "skipped";
  reason?: string;
  emailSent?: boolean;
  /** Chỉ trả khi passwordMode=random và gửi mail thất bại — để admin copy gửi thủ công. */
  temporaryPassword?: string;
}

export interface CreateUnionMemberLoginsResultDto {
  created: number;
  linkedExisting: number;
  skipped: number;
  emailed: number;
  mailConfigured: boolean;
  items: CreateUnionMemberLoginItemResult[];
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
  /** Email tài khoản đăng nhập để liên kết (phải là email User đã tồn tại) — gửi chuỗi rỗng "" để gỡ
   * liên kết hiện có, bỏ qua field này (undefined) để không đụng tới liên kết. */
  linkedUserEmail?: string;
}

export interface UpdateUnionMemberRequest extends Partial<CreateUnionMemberRequest> {}

/** Thông tin công đoàn viên tự xem/sửa ở "/cong-doan-vien" — CHỈ field an toàn tự sửa, không có toàn
 * bộ hồ sơ nội bộ (xem UnionMemberProfileDto, chỉ admin mới đụng tới). */
export interface MyUnionMemberDto {
  id: string;
  fullName: string;
  photoUrl: string | null;
  degreeLabel: string | null;
  positionTitle: string | null;
  phone: string | null;
  email: string | null;
  department: UnionDepartmentDto | null;
}

/** Payload tự cập nhật thông tin cá nhân — công đoàn viên CHỈ được sửa 4 field này, không đụng được
 * tới degreeLabel/positionTitle/department/isPublic/sortOrder (do admin quản lý). */
export interface UpdateMyUnionMemberRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

/** 1 dòng bị lỗi khi import Excel — 1-indexed theo số dòng thật trong file (dòng 1 là header, nên dòng
 * dữ liệu đầu tiên là dòng 2) để admin dễ đối chiếu lại trong Excel. */
export interface UnionMemberImportRowError {
  row: number;
  message: string;
}

/** Kết quả import Excel danh bạ công đoàn viên — xem GET /admin/union-members/export.xlsx (tải mẫu
 * đầy đủ) và POST /admin/union-members/import. Khớp Mã cán bộ (UnionMember.legacyCode): có khớp = cập
 * nhật, không khớp (hoặc để trống) = tạo mới (theo lựa chọn của người dùng khi thiết kế tính năng này). */
export interface UnionMemberImportResultDto {
  totalRows: number;
  created: number;
  updated: number;
  errors: UnionMemberImportRowError[];
}
