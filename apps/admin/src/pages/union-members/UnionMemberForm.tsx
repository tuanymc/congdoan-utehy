import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type {
  CreateUnionMemberRequest,
  UnionDepartmentDto,
  UnionMemberAdminDetailDto,
  UpsertUnionMemberProfileRequest
} from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";
import { ImageUploadField } from "../../components/common/ImageUploadField";
import { CreateUnionMemberLoginDialog } from "./CreateUnionMemberLoginDialog";

interface UnionMemberFormProps {
  mode: "create" | "edit";
}

const NO_DEPARTMENT_VALUE = "__none__";

type ProfileFieldType = "text" | "date" | "number" | "boolean";

interface ProfileFieldDef {
  key: string;
  label: string;
  type: ProfileFieldType;
}

interface ProfileGroupDef {
  title: string;
  fields: ProfileFieldDef[];
}

/** Toàn bộ field "hồ sơ nội bộ" còn thiếu so với web cũ (NHANVIEN, ~90 cột gốc) — xem
 * UnionMemberProfile trong prisma/schema.prisma cho nguồn cột gốc từng field. CHỈ hiển thị ở màn hình
 * quản trị này, KHÔNG bao giờ lộ ra trang công khai (xem findOneForAdmin ở BE). */
const PROFILE_GROUPS: ProfileGroupDef[] = [
  {
    title: "Thông tin cá nhân",
    fields: [
      { key: "alias", label: "Bí danh", type: "text" },
      { key: "gender", label: "Giới tính", type: "text" },
      { key: "dateOfBirth", label: "Ngày sinh", type: "date" },
      { key: "placeOfBirth", label: "Nơi sinh", type: "text" },
      { key: "idCardNumber", label: "Số CMND/CCCD", type: "text" },
      { key: "idCardIssuedDate", label: "Ngày cấp CMND/CCCD", type: "date" },
      { key: "idCardIssuedPlace", label: "Nơi cấp CMND/CCCD", type: "text" },
      { key: "ethnicity", label: "Dân tộc", type: "text" },
      { key: "religion", label: "Tôn giáo", type: "text" },
      { key: "nationality", label: "Quốc tịch", type: "text" },
      { key: "hometown", label: "Quê quán", type: "text" },
      { key: "permanentAddress", label: "Địa chỉ thường trú", type: "text" },
      { key: "currentAddress", label: "Nơi ở hiện nay", type: "text" },
      { key: "contactAddress", label: "Địa chỉ liên lạc", type: "text" },
      { key: "officePhone", label: "Điện thoại cơ quan", type: "text" },
      { key: "homePhone", label: "Điện thoại nhà riêng", type: "text" },
      { key: "maritalStatus", label: "Tình trạng hôn nhân", type: "text" },
      { key: "familyBackground", label: "Thành phần xuất thân", type: "text" },
      { key: "familyPriorityGroup", label: "Diện ưu tiên gia đình", type: "text" },
      { key: "selfPriorityGroup", label: "Diện ưu tiên bản thân", type: "text" },
      { key: "talent", label: "Năng khiếu", type: "text" },
      { key: "healthStatus", label: "Tình trạng sức khoẻ", type: "text" },
      { key: "bloodType", label: "Nhóm máu", type: "text" },
      { key: "heightCm", label: "Chiều cao (cm)", type: "number" },
      { key: "weightKg", label: "Cân nặng (kg)", type: "number" },
      { key: "disability", label: "Khuyết tật", type: "text" }
    ]
  },
  {
    title: "Công tác",
    fields: [
      { key: "facultyOrDepartmentLabel", label: "Phòng/Ban/Khoa công tác", type: "text" },
      { key: "workUnit", label: "Bộ phận công tác", type: "text" },
      { key: "decisionNumber", label: "Số quyết định", type: "text" },
      { key: "joinedEducationSectorDate", label: "Ngày vào ngành giáo dục", type: "date" },
      { key: "contractDate", label: "Ngày hợp đồng", type: "date" },
      { key: "recruitmentDate", label: "Ngày tuyển dụng", type: "date" },
      { key: "joinedAgencyDate", label: "Ngày vào cơ quan", type: "date" },
      { key: "recruitmentMethod", label: "Hình thức tuyển dụng", type: "text" },
      { key: "recruitingAgency", label: "Cơ quan tuyển dụng", type: "text" },
      { key: "assignedJob", label: "Công việc được giao", type: "text" },
      { key: "currentJob", label: "Công việc hiện nay", type: "text" }
    ]
  },
  {
    title: "Đảng",
    fields: [
      { key: "partyCandidateDate", label: "Ngày vào Đảng (dự bị)", type: "date" },
      { key: "partyOfficialDate", label: "Ngày chính thức vào Đảng", type: "date" },
      { key: "partyJoinedPlace", label: "Nơi vào Đảng", type: "text" },
      { key: "partyPosition", label: "Chức vụ Đảng", type: "text" },
      { key: "partyLeftDate", label: "Ngày ra Đảng", type: "date" },
      { key: "partyCardNumber", label: "Số thẻ Đảng", type: "text" },
      { key: "partyCell", label: "Chi bộ", type: "text" }
    ]
  },
  {
    title: "Đoàn Thanh niên",
    fields: [
      { key: "youthUnionJoinedDate", label: "Ngày vào Đoàn", type: "date" },
      { key: "youthUnionJoinedPlace", label: "Nơi vào Đoàn", type: "text" },
      { key: "youthUnionPosition", label: "Chức vụ Đoàn", type: "text" }
    ]
  },
  {
    title: "Công đoàn",
    fields: [
      { key: "unionJoinedDate", label: "Ngày vào Công đoàn", type: "date" },
      { key: "unionJoinedPlace", label: "Nơi vào Công đoàn", type: "text" },
      { key: "unionPosition", label: "Chức vụ Công đoàn", type: "text" },
      { key: "unionSectionLabel", label: "Công đoàn bộ phận (nhãn gốc web cũ)", type: "text" }
    ]
  },
  {
    title: "Học vấn / Đào tạo",
    fields: [
      { key: "generalEducationLevel", label: "Trình độ học vấn", type: "text" },
      { key: "hasGraduated", label: "Đã tốt nghiệp", type: "boolean" },
      { key: "trainingField", label: "Ngành đào tạo", type: "text" },
      { key: "trainingMajor", label: "Chuyên ngành đào tạo", type: "text" },
      { key: "trainingPlace", label: "Nơi đào tạo", type: "text" },
      { key: "trainingMethod", label: "Hình thức đào tạo", type: "text" },
      { key: "graduationYear", label: "Năm tốt nghiệp", type: "number" },
      { key: "hasPedagogyTraining", label: "Đã bồi dưỡng nghiệp vụ sư phạm", type: "boolean" },
      { key: "politicalTheoryLevel", label: "Trình độ lý luận chính trị", type: "text" },
      { key: "stateManagementLevel", label: "Trình độ quản lý nhà nước", type: "text" },
      { key: "educationManagementLevel", label: "Trình độ quản lý giáo dục", type: "text" },
      { key: "mainForeignLanguage", label: "Ngoại ngữ chính", type: "text" },
      { key: "foreignLanguageLevel", label: "Trình độ ngoại ngữ", type: "text" },
      { key: "otherForeignLanguage", label: "Ngoại ngữ khác", type: "text" },
      { key: "itLevel", label: "Trình độ tin học", type: "text" }
    ]
  },
  {
    title: "Lương / BHXH / trạng thái công tác",
    fields: [
      { key: "salaryNote", label: "Ghi chú lương", type: "text" },
      { key: "seniorityNote", label: "Ghi chú thâm niên", type: "text" },
      { key: "jobTitle", label: "Chức danh nghề nghiệp", type: "text" },
      { key: "salaryGrade", label: "Ngạch lương", type: "text" },
      { key: "laborType", label: "Hình thức lao động", type: "text" },
      { key: "socialInsuranceNumber", label: "Số BHXH", type: "text" },
      { key: "oldSocialInsuranceNumber", label: "Số BHXH cũ", type: "text" },
      { key: "retirementDate", label: "Ngày nghỉ hưu", type: "date" },
      { key: "incomingStatus", label: "Trạng thái đến (đơn vị)", type: "text" },
      { key: "incomingDate", label: "Ngày chuyển đến", type: "date" },
      { key: "outgoingStatus", label: "Trạng thái đi (đơn vị)", type: "text" },
      { key: "outgoingDate", label: "Ngày chuyển đi", type: "date" }
    ]
  },
  {
    title: "Mã tra cứu nội bộ khác",
    fields: [
      { key: "salaryCode", label: "Mã lương nhân viên", type: "text" },
      { key: "fileCode", label: "Mã hồ sơ nhân viên", type: "text" },
      { key: "unitLabel", label: "Đơn vị (donvi, web cũ)", type: "text" }
    ]
  }
];

/** ISO string ("2000-12-29T00:00:00.000Z") -> "2000-12-29" cho input[type=date], "" nếu null. */
function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

function buildInitialProfileState(profile: UnionMemberAdminDetailDto["profile"]): Record<string, string> {
  const state: Record<string, string> = {};
  for (const group of PROFILE_GROUPS) {
    for (const field of group.fields) {
      const raw = profile ? (profile as unknown as Record<string, unknown>)[field.key] : null;
      if (field.type === "date") {
        state[field.key] = toDateInputValue(raw as string | null);
      } else if (field.type === "boolean") {
        state[field.key] = raw === true ? "true" : raw === false ? "false" : "";
      } else {
        state[field.key] = raw === null || raw === undefined ? "" : String(raw);
      }
    }
  }
  return state;
}

/** Field text/date rỗng ("") gửi thẳng lên (BE hiểu là "xoá về null"). Field number/boolean rỗng thì
 * BỎ QUA (không gửi key) vì DTO validate kiểu số/bool nghiêm ngặt — muốn xoá thì phải sửa trực tiếp ở
 * bảng union_member_profiles, UI này chỉ hỗ trợ ghi đè giá trị khác. */
function buildProfilePayload(state: Record<string, string>): UpsertUnionMemberProfileRequest {
  const payload: Record<string, unknown> = {};
  for (const group of PROFILE_GROUPS) {
    for (const field of group.fields) {
      const raw = state[field.key] ?? "";
      if (field.type === "number") {
        if (raw.trim() !== "") payload[field.key] = Number(raw);
      } else if (field.type === "boolean") {
        if (raw === "true" || raw === "false") payload[field.key] = raw === "true";
      } else {
        payload[field.key] = raw;
      }
    }
  }
  return payload as UpsertUnionMemberProfileRequest;
}

export function UnionMemberForm({ mode }: UnionMemberFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: deptsResult, isLoading: deptsLoading } = useList<UnionDepartmentDto>({ resource: "union-departments" });
  const { data: memberResult, isLoading: memberLoading, refetch } = useOne<UnionMemberAdminDetailDto>({
    resource: "union-members",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createMember, isLoading: isCreating } = useCreate();
  const { mutate: updateMember, isLoading: isUpdating } = useUpdate();

  const [fullName, setFullName] = useState("");
  const [legacyCode, setLegacyCode] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [degreeLabel, setDegreeLabel] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<string>(NO_DEPARTMENT_VALUE);
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublic, setIsPublic] = useState<"true" | "false">("true");
  const [linkedUserEmail, setLinkedUserEmail] = useState("");
  const [profile, setProfile] = useState<Record<string, string>>(() => buildInitialProfileState(null));
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    if (mode === "edit" && memberResult?.data) {
      const member = memberResult.data;
      setFullName(member.fullName);
      setLegacyCode(member.legacyCode ?? "");
      setPhotoUrl(member.photoUrl ?? "");
      setDegreeLabel(member.degreeLabel ?? "");
      setPositionTitle(member.positionTitle ?? "");
      setPhone(member.phone ?? "");
      setEmail(member.email ?? "");
      setDepartmentId(member.department?.id ?? NO_DEPARTMENT_VALUE);
      setSortOrder(String(member.sortOrder));
      setIsPublic(member.isPublic ? "true" : "false");
      setLinkedUserEmail(member.linkedUserEmail ?? "");
      setProfile(buildInitialProfileState(member.profile));
    }
  }, [mode, memberResult]);

  const departments = deptsResult?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && memberLoading;

  function setProfileField(key: string, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateUnionMemberRequest = {
      fullName,
      legacyCode: legacyCode.trim(),
      photoUrl: photoUrl.trim() || undefined,
      degreeLabel: degreeLabel.trim() || undefined,
      positionTitle: positionTitle.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      departmentId: departmentId === NO_DEPARTMENT_VALUE ? undefined : departmentId,
      sortOrder: Number(sortOrder) || 0,
      isPublic: isPublic === "true",
      profile: buildProfilePayload(profile),
      // Luôn gửi (kể cả "") — "" nghĩa là gỡ liên kết tài khoản hiện có, xem
      // UnionMembersService.resolveLinkedUserId. Gửi lại email không đổi cũng an toàn (no-op ở BE).
      linkedUserEmail: linkedUserEmail.trim()
    };

    if (mode === "create") {
      createMember({ resource: "union-members", values: payload }, { onSuccess: () => navigate("/union-members") });
    } else if (id) {
      updateMember({ resource: "union-members", id, values: payload }, { onSuccess: () => navigate("/union-members") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm công đoàn viên" : "Sửa công đoàn viên"}</h1>

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ tên</Label>
                <Input id="fullName" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="legacyCode">Mã cán bộ</Label>
                <Input
                  id="legacyCode"
                  placeholder="VD: NV001"
                  value={legacyCode}
                  onChange={(event) => setLegacyCode(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Dùng để đăng nhập cổng đoàn viên và đối chiếu khi nhập Excel. Để trống nếu chưa có mã.
                </p>
              </div>
            </div>

            <ImageUploadField
              id="photoUrl"
              label="Ảnh đại diện"
              value={photoUrl}
              onChange={setPhotoUrl}
              placeholder="/upload/images/AnhCDV/xxx.jpg"
              previewClassName="h-40 w-32 max-w-none"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="degreeLabel">Trình độ chuyên môn cao nhất</Label>
                <Input id="degreeLabel" value={degreeLabel} onChange={(event) => setDegreeLabel(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="positionTitle">Chức vụ</Label>
                <Input id="positionTitle" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Điện thoại</Label>
                <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="linkedUserEmail">Email tài khoản đăng nhập liên kết (không bắt buộc)</Label>
              <Input
                id="linkedUserEmail"
                type="email"
                placeholder="Để trống nếu công đoàn viên chưa có tài khoản đăng nhập"
                value={linkedUserEmail}
                onChange={(event) => setLinkedUserEmail(event.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Nhập đúng email của một tài khoản đăng nhập đã tồn tại để liên kết thủ công, hoặc bấm "Tạo tài
                khoản" để tạo mới từ mã cán bộ với mật khẩu mặc định/ngẫu nhiên gửi email. Xoá trắng để gỡ liên
                kết hiện có.
              </p>
              {mode === "edit" && id && !linkedUserEmail ? (
                <div>
                  <Button type="button" variant="outline" onClick={() => setLoginDialogOpen(true)}>
                    Tạo tài khoản từ hồ sơ này
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="departmentId">Công đoàn bộ phận</Label>
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={deptsLoading}>
                <SelectTrigger id="departmentId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEPARTMENT_VALUE}>Không thuộc bộ phận nào</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isPublic">Trạng thái</Label>
                <Select value={isPublic} onValueChange={(value) => setIsPublic(value as "true" | "false")}>
                  <SelectTrigger id="isPublic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Đang hiển thị</SelectItem>
                    <SelectItem value="false">Đang ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t pt-5">
              <div>
                <h2 className="text-lg font-semibold">Hồ sơ nội bộ chi tiết</h2>
                <p className="text-sm text-muted-foreground">
                  Bổ sung các trường còn thiếu so với web cũ (CMND, ngày sinh, đảng tịch, lương, BHXH...). Các
                  trường này CHỈ hiển thị ở màn hình quản trị, không lộ ra trang công khai.
                </p>
              </div>

              {PROFILE_GROUPS.map((group) => (
                <details key={group.title} className="rounded-md border px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium">{group.title}</summary>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <div className="grid gap-2" key={field.key}>
                        <Label htmlFor={`profile-${field.key}`}>{field.label}</Label>
                        {field.type === "boolean" ? (
                          <Select
                            value={profile[field.key] || "__unset__"}
                            onValueChange={(value) => setProfileField(field.key, value === "__unset__" ? "" : value)}
                          >
                            <SelectTrigger id={`profile-${field.key}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__unset__">Chưa rõ</SelectItem>
                              <SelectItem value="true">Có</SelectItem>
                              <SelectItem value="false">Không</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`profile-${field.key}`}
                            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                            value={profile[field.key] ?? ""}
                            onChange={(event) => setProfileField(field.key, event.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/union-members")}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mode === "edit" && id ? (
        <CreateUnionMemberLoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          selectedIds={[id]}
          selectedLabel={fullName}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}
    </div>
  );
}
