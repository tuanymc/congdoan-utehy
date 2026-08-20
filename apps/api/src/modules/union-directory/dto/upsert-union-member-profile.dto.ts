import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString } from "class-validator";
import type { UpsertUnionMemberProfileRequest } from "@congdoan/types";

/** Hồ sơ nội bộ đầy đủ công đoàn viên (~90 cột gốc NHANVIEN) — CHỈ dùng ở admin, xem UnionMemberProfile
 * trong prisma/schema.prisma. Toàn bộ field optional, gửi field nào cập nhật field đó (xem service). */
export class UpsertUnionMemberProfileDto implements UpsertUnionMemberProfileRequest {
  // --- Thông tin cá nhân ---
  @ApiPropertyOptional() @IsOptional() @IsString() alias?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() placeOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idCardNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() idCardIssuedDate?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsDateString() joinedEducationSectorDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() contractDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() recruitmentDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() joinedAgencyDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recruitmentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recruitingAgency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedJob?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currentJob?: string;

  // --- Đảng ---
  @ApiPropertyOptional() @IsOptional() @IsDateString() partyCandidateDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() partyOfficialDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyJoinedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyPosition?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() partyLeftDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyCardNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyCell?: string;

  // --- Đoàn Thanh niên ---
  @ApiPropertyOptional() @IsOptional() @IsDateString() youthUnionJoinedDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() youthUnionJoinedPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() youthUnionPosition?: string;

  // --- Công đoàn ---
  @ApiPropertyOptional() @IsOptional() @IsDateString() unionJoinedDate?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsDateString() retirementDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() incomingStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() incomingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() outgoingStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() outgoingDate?: string;

  // --- Mã tra cứu nội bộ khác ---
  @ApiPropertyOptional() @IsOptional() @IsString() salaryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unitLabel?: string;
}
