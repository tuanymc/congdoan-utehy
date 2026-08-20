import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  PaginatedResult,
  PaginationQuery,
  UnionMemberAdminDetailDto,
  UnionMemberListItemDto,
  UnionMemberProfileDto,
  UpsertUnionMemberProfileRequest
} from "@congdoan/types";
import { Prisma, type UnionMemberProfile } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUnionMemberDto } from "./dto/create-union-member.dto";
import { UpdateUnionMemberDto } from "./dto/update-union-member.dto";

const memberWithRelations = Prisma.validator<Prisma.UnionMemberDefaultArgs>()({
  include: { department: true }
});
type MemberWithRelations = Prisma.UnionMemberGetPayload<typeof memberWithRelations>;

const memberWithProfile = Prisma.validator<Prisma.UnionMemberDefaultArgs>()({
  include: { department: true, profile: true }
});
type MemberWithProfile = Prisma.UnionMemberGetPayload<typeof memberWithProfile>;

function toDto(m: MemberWithRelations): UnionMemberListItemDto {
  return {
    id: m.id,
    fullName: m.fullName,
    photoUrl: m.photoUrl,
    degreeLabel: m.degreeLabel,
    positionTitle: m.positionTitle,
    phone: m.phone,
    email: m.email,
    isPublic: m.isPublic,
    sortOrder: m.sortOrder,
    department: m.department ? { id: m.department.id, name: m.department.name, sortOrder: m.department.sortOrder } : null
  };
}

/** ISO string hoặc null — dùng cho mọi field DateTime? của UnionMemberProfile khi map ra DTO. */
function toIso(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

function toProfileDto(p: UnionMemberProfile): UnionMemberProfileDto {
  return {
    alias: p.alias,
    gender: p.gender,
    dateOfBirth: toIso(p.dateOfBirth),
    placeOfBirth: p.placeOfBirth,
    idCardNumber: p.idCardNumber,
    idCardIssuedDate: toIso(p.idCardIssuedDate),
    idCardIssuedPlace: p.idCardIssuedPlace,
    ethnicity: p.ethnicity,
    religion: p.religion,
    nationality: p.nationality,
    hometown: p.hometown,
    permanentAddress: p.permanentAddress,
    currentAddress: p.currentAddress,
    contactAddress: p.contactAddress,
    officePhone: p.officePhone,
    homePhone: p.homePhone,
    maritalStatus: p.maritalStatus,
    familyBackground: p.familyBackground,
    familyPriorityGroup: p.familyPriorityGroup,
    selfPriorityGroup: p.selfPriorityGroup,
    talent: p.talent,
    healthStatus: p.healthStatus,
    bloodType: p.bloodType,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    disability: p.disability,

    facultyOrDepartmentLabel: p.facultyOrDepartmentLabel,
    workUnit: p.workUnit,
    decisionNumber: p.decisionNumber,
    joinedEducationSectorDate: toIso(p.joinedEducationSectorDate),
    contractDate: toIso(p.contractDate),
    recruitmentDate: toIso(p.recruitmentDate),
    joinedAgencyDate: toIso(p.joinedAgencyDate),
    recruitmentMethod: p.recruitmentMethod,
    recruitingAgency: p.recruitingAgency,
    assignedJob: p.assignedJob,
    currentJob: p.currentJob,

    partyCandidateDate: toIso(p.partyCandidateDate),
    partyOfficialDate: toIso(p.partyOfficialDate),
    partyJoinedPlace: p.partyJoinedPlace,
    partyPosition: p.partyPosition,
    partyLeftDate: toIso(p.partyLeftDate),
    partyCardNumber: p.partyCardNumber,
    partyCell: p.partyCell,

    youthUnionJoinedDate: toIso(p.youthUnionJoinedDate),
    youthUnionJoinedPlace: p.youthUnionJoinedPlace,
    youthUnionPosition: p.youthUnionPosition,

    unionJoinedDate: toIso(p.unionJoinedDate),
    unionJoinedPlace: p.unionJoinedPlace,
    unionPosition: p.unionPosition,
    unionSectionLabel: p.unionSectionLabel,

    generalEducationLevel: p.generalEducationLevel,
    hasGraduated: p.hasGraduated,
    trainingField: p.trainingField,
    trainingMajor: p.trainingMajor,
    trainingPlace: p.trainingPlace,
    trainingMethod: p.trainingMethod,
    graduationYear: p.graduationYear,
    hasPedagogyTraining: p.hasPedagogyTraining,
    politicalTheoryLevel: p.politicalTheoryLevel,
    stateManagementLevel: p.stateManagementLevel,
    educationManagementLevel: p.educationManagementLevel,
    mainForeignLanguage: p.mainForeignLanguage,
    foreignLanguageLevel: p.foreignLanguageLevel,
    otherForeignLanguage: p.otherForeignLanguage,
    itLevel: p.itLevel,

    salaryNote: p.salaryNote,
    seniorityNote: p.seniorityNote,
    jobTitle: p.jobTitle,
    salaryGrade: p.salaryGrade,
    laborType: p.laborType,
    socialInsuranceNumber: p.socialInsuranceNumber,
    oldSocialInsuranceNumber: p.oldSocialInsuranceNumber,
    retirementDate: toIso(p.retirementDate),
    incomingStatus: p.incomingStatus,
    incomingDate: toIso(p.incomingDate),
    outgoingStatus: p.outgoingStatus,
    outgoingDate: toIso(p.outgoingDate),

    salaryCode: p.salaryCode,
    fileCode: p.fileCode,
    unitLabel: p.unitLabel
  };
}

function toAdminDetailDto(m: MemberWithProfile): UnionMemberAdminDetailDto {
  return { ...toDto(m), profile: m.profile ? toProfileDto(m.profile) : null };
}

/** Chuyển payload profile (string ISO date từ FE) sang object field-value thô cho Prisma nested write
 * (profile.create / profile.upsert.create / profile.upsert.update) — field nào không có trong payload
 * thì giữ nguyên (undefined, bỏ qua), field nào gửi "" (rỗng) coi như null. Trả về Record lỏng, ép kiểu
 * cụ thể ở từng chỗ gọi (xem toProfileCreateData/toProfileUpdateData) vì create/update input của Prisma
 * là 2 type khác nhau dù cùng field. */
function toProfileWriteData(profile: UpsertUnionMemberProfileRequest): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") {
      data[key] = null;
      continue;
    }
    if (
      (key.toLowerCase().includes("date") || key === "dateOfBirth") &&
      typeof value === "string"
    ) {
      data[key] = new Date(value);
      continue;
    }
    data[key] = value;
  }
  return data;
}

function toProfileCreateData(
  profile: UpsertUnionMemberProfileRequest
): Prisma.UnionMemberProfileCreateWithoutMemberInput {
  return toProfileWriteData(profile) as unknown as Prisma.UnionMemberProfileCreateWithoutMemberInput;
}

function toProfileUpdateData(
  profile: UpsertUnionMemberProfileRequest
): Prisma.UnionMemberProfileUpdateWithoutMemberInput {
  return toProfileWriteData(profile) as unknown as Prisma.UnionMemberProfileUpdateWithoutMemberInput;
}

/**
 * Danh bạ công đoàn viên — nguồn NHANVIEN (xem chú thích domain block UNIONDIRECTORY trong
 * prisma/schema.prisma). Thứ tự sắp xếp mặc định khớp web cũ (PHONGBAN, CHUCVU rồi tới NGAYSINH —
 * đơn giản hoá thành department rồi sortOrder ở bản mới vì không giữ lại field NGAYSINH/PHONGBAN).
 */
@Injectable()
export class UnionMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Công khai — CHỈ trả công đoàn viên isPublic=true (khớp NHANVIEN.STATUS=1 ở web cũ). */
  async listPublic(query: PaginationQuery & { departmentId?: string }): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.queryList({ ...query, isPublic: true });
  }

  /** Quản trị — trả toàn bộ, không lọc isPublic, để admin có thể bật lại người đang bị ẩn. */
  async listForAdmin(query: PaginationQuery & { departmentId?: string }): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.queryList(query);
  }

  private async queryList(
    query: PaginationQuery & { departmentId?: string; isPublic?: boolean }
  ): Promise<PaginatedResult<UnionMemberListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const where: Prisma.UnionMemberWhereInput = {
      ...(query.isPublic !== undefined ? { isPublic: query.isPublic } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.search ? { fullName: { contains: query.search } } : {})
    };

    const [total, members] = await this.prisma.$transaction([
      this.prisma.unionMember.count({ where }),
      this.prisma.unionMember.findMany({
        where,
        ...memberWithRelations,
        orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items: members.map(toDto), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /** Dùng chung cho endpoint công khai VÀ endpoint admin trước đây — CHỈ trả field an toàn công khai,
   * KHÔNG bao giờ include profile (xem findOneForAdmin bên dưới cho màn hình quản trị). */
  async findOne(id: string): Promise<UnionMemberListItemDto> {
    const member = await this.prisma.unionMember.findUnique({ where: { id }, ...memberWithRelations });
    if (!member) throw new NotFoundException("Không tìm thấy công đoàn viên.");
    return toDto(member);
  }

  /** CHỈ dùng cho AdminUnionMembersController — có kèm hồ sơ nội bộ (profile, có thể null nếu chưa
   * nhập). KHÔNG dùng hàm này cho bất kỳ endpoint công khai nào. */
  async findOneForAdmin(id: string): Promise<UnionMemberAdminDetailDto> {
    const member = await this.prisma.unionMember.findUnique({ where: { id }, ...memberWithProfile });
    if (!member) throw new NotFoundException("Không tìm thấy công đoàn viên.");
    return toAdminDetailDto(member);
  }

  async create(dto: CreateUnionMemberDto, actorUserId: string): Promise<UnionMemberAdminDetailDto> {
    const member = await this.prisma.unionMember.create({
      data: {
        fullName: dto.fullName,
        photoUrl: dto.photoUrl,
        degreeLabel: dto.degreeLabel,
        positionTitle: dto.positionTitle,
        phone: dto.phone,
        email: dto.email,
        isPublic: dto.isPublic ?? true,
        sortOrder: dto.sortOrder ?? 0,
        departmentId: dto.departmentId,
        ...(dto.profile
          ? { profile: { create: toProfileCreateData(dto.profile) } }
          : {})
      },
      ...memberWithProfile
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "UnionMember", entityId: member.id });
    return toAdminDetailDto(member);
  }

  async update(id: string, dto: UpdateUnionMemberDto, actorUserId: string): Promise<UnionMemberAdminDetailDto> {
    await this.findOne(id);
    const member = await this.prisma.unionMember.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        photoUrl: dto.photoUrl,
        degreeLabel: dto.degreeLabel,
        positionTitle: dto.positionTitle,
        phone: dto.phone,
        email: dto.email,
        isPublic: dto.isPublic,
        sortOrder: dto.sortOrder,
        departmentId: dto.departmentId,
        // dto.profile không có (undefined) => không đụng gì tới profile hiện có. Có gửi thì upsert:
        // tạo mới nếu chưa có, cập nhật (chỉ field nào gửi) nếu đã có.
        ...(dto.profile
          ? {
              profile: {
                upsert: {
                  create: toProfileCreateData(dto.profile),
                  update: toProfileUpdateData(dto.profile)
                }
              }
            }
          : {})
      },
      ...memberWithProfile
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "UnionMember", entityId: id });
    return toAdminDetailDto(member);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.unionMember.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "UnionMember", entityId: id });
  }
}
