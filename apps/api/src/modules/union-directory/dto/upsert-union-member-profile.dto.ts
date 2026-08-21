import { applyDecorators } from "@nestjs/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, ValidateIf } from "class-validator";
import type { UpsertUnionMemberProfileRequest } from "@congdoan/types";

/** Field ngày optional theo 2 nghĩa từ form admin (xem UnionMemberForm.tsx buildProfilePayload):
 * KHÔNG gửi field = giữ nguyên giá trị cũ (bỏ qua validate, giống @IsOptional), gửi "" = admin chủ
 * động xoá về null (cũng bỏ qua @IsDateString, service sẽ hiểu "" -> null) — CHỈ validate ISO 8601
 * thật khi có gửi giá trị non-empty. Dùng @ValidateIf thay @IsOptional đơn thuần vì @IsOptional chỉ bỏ
 * qua khi giá trị là null/undefined, KHÔNG bỏ qua chuỗi rỗng. */
function IsOptionalDateString() {
  return applyDecorators(
    ValidateIf((_object: unknown, value: unknown) => value !== undefined && value !== ""),
    IsDateString()
  );
}

/** Hồ sơ nội bộ đầy đủ công đoàn viên (~90 cột gốc NHANVIEN) — CHỈ dùng ở admin, xem UnionMemberProfile
 * trong prisma/schema.prisma. Toàn bộ field optional, gửi field nào cập nhật field đó (xem service). */
export class UpsertUnionMemberProfileDto implements UpsertUnionMemberProfileRequest {
  // --- Thông tin cá nhân ---
  @ApiPropertyOptional() @IsOptional() @IsString() alias?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptionalDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() placeOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idCardNumber?: string;
  @ApiPropertyOptional() @IsOptionalDateString() idCardIssuedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idCardIssuedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ethnicity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() religion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nationality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hometown?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() permanentAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currentAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() officePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() homePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() maritalStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() familyBackground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() familyPriorityGroup?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() selfPriorityGroup?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() talent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() healthStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bloodType?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() heightCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() disability?: string;

  // --- Công tác ---
  @ApiPropertyOptional() @IsOptional() @IsString() facultyOrDepartmentLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() decisionNumber?: string;
  @ApiPropertyOptional() @IsOptionalDateString() joinedEducationSectorDate?: string;
  @ApiPropertyOptional() @IsOptionalDateString() contractDate?: string;
  @ApiPropertyOptional() @IsOptionalDateString() recruitmentDate?: string;
  @ApiPropertyOptional() @IsOptionalDateString() joinedAgencyDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recruitmentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recruitingAgency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedJob?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currentJob?: string;

  // --- Đảng ---
  @ApiPropertyOptional() @IsOptionalDateString() partyCandidateDate?: string;
  @ApiPropertyOptional() @IsOptionalDateString() partyOfficialDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyJoinedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyPosition?: string;
  @ApiPropertyOptional() @IsOptionalDateString() partyLeftDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyCardNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyCell?: string;

  // --- Đoàn Thanh niên ---
  @ApiPropertyOptional() @IsOptionalDateString() youthUnionJoinedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() youthUnionJoinedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() youthUnionPosition?: string;

  // --- Công đoàn ---
  @ApiPropertyOptional() @IsOptionalDateString() unionJoinedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unionJoinedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unionPosition?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unionSectionLabel?: string;

  // --- Học vấn / Đào tạo ---
  @ApiPropertyOptional() @IsOptional() @IsString() generalEducationLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasGraduated?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() trainingField?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() trainingMajor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() trainingPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() trainingMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() graduationYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasPedagogyTraining?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() politicalTheoryLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() stateManagementLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() educationManagementLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mainForeignLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() foreignLanguageLevel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() otherForeignLanguage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() itLevel?: string;

  // --- Lương / BHXH / trạng thái công tác ---
  @ApiPropertyOptional() @IsOptional() @IsString() salaryNote?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seniorityNote?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salaryGrade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() laborType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() socialInsuranceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() oldSocialInsuranceNumber?: string;
  @ApiPropertyOptional() @IsOptionalDateString() retirementDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() incomingStatus?: string;
  @ApiPropertyOptional() @IsOptionalDateString() incomingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() outgoingStatus?: string;
  @ApiPropertyOptional() @IsOptionalDateString() outgoingDate?: string;

  // --- Mã tra cứu nội bộ khác ---
  @ApiPropertyOptional() @IsOptional() @IsString() salaryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unitLabel?: string;
}
