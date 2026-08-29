import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AuthUser, ChangePasswordRequest, MyUnionMemberDto, UpdateMyUnionMemberRequest } from "@congdoan/types";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  HandHeart,
  Lock,
  Mail,
  Phone,
  Scale,
  Sparkles,
  UserRound
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  UNION_CLERK: "Cán bộ Văn phòng Công đoàn",
  DEPARTMENT_OFFICER: "Cán bộ Công đoàn bộ phận",
  MEMBER: "Đoàn viên"
};

const QUICK_UTILITIES = [
  {
    icon: BookOpen,
    title: "Cẩm nang - Kiến thức số",
    description: "Hướng dẫn và kiến thức chuyển đổi số dành cho đoàn viên.",
    to: "/tien-ich-so-cong-doan/cam-nang-kien-thuc-so"
  },
  {
    icon: CalendarCheck,
    title: "Đăng ký hoạt động",
    description: "Tham gia phong trào, hoạt động do Công đoàn tổ chức.",
    to: "/tien-ich-so-cong-doan/dang-ky-hoat-dong"
  },
  {
    icon: ClipboardList,
    title: "Khảo sát ý kiến",
    description: "Góp ý về chủ trương và hoạt động của Công đoàn trường.",
    to: "/tien-ich-so-cong-doan/khao-sat"
  },
  {
    icon: FileText,
    title: "Kho biểu mẫu",
    description: "Xem và tải biểu mẫu, đơn từ dùng chung.",
    to: "/tien-ich-so-cong-doan/bieu-mau"
  },
  {
    icon: HandHeart,
    title: "Dịch vụ công",
    description: "Tra cứu thủ tục và gửi yêu cầu Công đoàn hỗ trợ.",
    to: "/tien-ich-so-cong-doan/dich-vu-cong"
  },
  {
    icon: Scale,
    title: "Phổ biến pháp luật",
    description: "Đọc tài liệu và thi trắc nghiệm kiến thức pháp luật.",
    to: "/tien-ich-so-cong-doan/pho-bien-phap-luat"
  },
  {
    icon: Sparkles,
    title: "Công cụ AI",
    description: "Kho công cụ AI phục vụ giảng dạy và nghiên cứu.",
    to: "/tien-ich-so-cong-doan/cong-cu-ai"
  }
] as const;

const inputClassName =
  "w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

function FieldMessage({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        {success}
      </p>
    );
  }
  return null;
}

/** Hồ sơ công đoàn viên liên kết với tài khoản — tự sửa họ tên/SĐT/email; bộ phận, chức vụ, trình độ
 * chỉ xem (admin quản lý). 404 = chưa liên kết, hiện hướng dẫn thay vì lỗi trắng. */
function ProfilePanel({
  member,
  notLinked,
  isLoading,
  loadError,
  onUpdated
}: {
  member: MyUnionMemberDto | null;
  notLinked: boolean;
  isLoading: boolean;
  loadError: string | null;
  onUpdated: (member: MyUnionMemberDto) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    setFullName(member.fullName);
    setPhone(member.phone ?? "");
    setEmail(member.email ?? "");
  }, [member]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      const payload: UpdateMyUnionMemberRequest = { fullName, phone, email };
      const updated = await apiFetch<MyUnionMemberDto>("/me/union-member", { method: "PATCH", body: payload });
      onUpdated(updated);
      setSuccessMessage("Đã lưu thông tin liên hệ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="py-6">
          <FieldMessage error={loadError} success={null} />
        </CardContent>
      </Card>
    );
  }

  if (notLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chưa liên kết hồ sơ công đoàn viên</CardTitle>
          <CardDescription>
            Tài khoản đăng nhập chưa được gắn với hồ sơ trong danh bạ Công đoàn. Liên hệ Văn phòng Công đoàn
            trường để được hỗ trợ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/lien-he">Liên hệ Văn phòng Công đoàn</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hồ sơ công đoàn viên</CardTitle>
        <CardDescription>
          Bạn có thể cập nhật họ tên và thông tin liên hệ. Chức vụ, trình độ và công đoàn bộ phận do Văn phòng
          Công đoàn quản lý.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/40 px-3 py-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5" /> Công đoàn bộ phận
            </dt>
            <dd className="mt-1 text-sm font-medium">{member?.department?.name ?? "Chưa phân bộ phận"}</dd>
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserRound className="size-3.5" /> Chức vụ
            </dt>
            <dd className="mt-1 text-sm font-medium">{member?.positionTitle ?? "—"}</dd>
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5" /> Trình độ
            </dt>
            <dd className="mt-1 text-sm font-medium">{member?.degreeLabel ?? "—"}</dd>
          </div>
        </dl>

        <Separator />

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="member-fullName" className="text-sm font-medium">
              Họ và tên
            </label>
            <input
              id="member-fullName"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="member-phone" className="text-sm font-medium">
              Số điện thoại
            </label>
            <input
              id="member-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              placeholder="Số di động liên hệ"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="member-email" className="text-sm font-medium">
              Email liên hệ
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              placeholder="email@utehy.edu.vn"
            />
          </div>

          <div className="sm:col-span-2">
            <FieldMessage error={error} success={successMessage} />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thông tin liên hệ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Đổi mật khẩu — gọi lại POST /auth/change-password đã có sẵn (xem AuthController). */
function SecurityPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setError("Mật khẩu mới tối thiểu 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: ChangePasswordRequest = { currentPassword, newPassword };
      await apiFetch<void>("/auth/change-password", { method: "POST", body: payload });
      setSuccessMessage("Đã đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
        <CardDescription>Mật khẩu mới tối thiểu 8 ký tự. Sau khi đổi, lần đăng nhập tiếp theo dùng mật khẩu mới.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid max-w-md gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="text-sm font-medium">
              Mật khẩu hiện tại
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-sm font-medium">
              Mật khẩu mới
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
            />
          </div>

          <FieldMessage error={error} success={successMessage} />

          <div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function WelcomeBanner({ user, member }: { user: AuthUser; member: MyUnionMemberDto | null }) {
  const displayName = member?.fullName || user.fullName;
  const photoUrl = member?.photoUrl;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 shrink-0 sm:size-20">
            {photoUrl ? <AvatarImage src={photoUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-lg text-primary-foreground sm:text-xl">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))}
            </div>
            {member && (member.department?.name || member.positionTitle || member.phone || member.email) ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {member.department?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {member.department.name}
                  </span>
                ) : null}
                {member.positionTitle ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    {member.positionTitle}
                  </span>
                ) : null}
                {member.phone ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {member.phone}
                  </span>
                ) : null}
                {member.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {member.email}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Cổng đoàn viên — khu vực sau đăng nhập: hồ sơ cá nhân, đổi mật khẩu, lối tắt sang tiện ích số
 * đang hoạt động (không còn placeholder "sắp ra mắt"). */
export function MemberPortalPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [member, setMember] = useState<MyUnionMemberDto | null>(null);
  const [notLinked, setNotLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiFetch<MyUnionMemberDto>("/me/union-member")
      .then((data) => {
        if (cancelled) return;
        setMember(data);
        setNotLinked(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setNotLinked(true);
        } else {
          setLoadError(err instanceof Error ? err.message : "Không thể tải thông tin công đoàn viên.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium text-primary">Cổng đoàn viên</p>
      <p className="mt-1 max-w-2xl text-muted-foreground">
        Quản lý thông tin cá nhân và sử dụng các tiện ích số của Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng
        Yên.
      </p>

      <div className="mt-6">
        {isLoading ? <Skeleton className="h-40 w-full rounded-xl" /> : <WelcomeBanner user={user} member={member} />}
      </div>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold">Tiện ích dành cho đoàn viên</h2>
            <p className="mt-1 text-sm text-muted-foreground">Các dịch vụ đang mở, dùng ngay không cần đăng ký thêm.</p>
          </div>
          <Link to="/tien-ich-so-cong-doan" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Xem tất cả tiện ích số <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_UTILITIES.map((utility) => (
            <Link key={utility.to} to={utility.to} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-2 py-5">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <utility.icon className="size-5" />
                  </span>
                  <p className="font-medium group-hover:text-primary">{utility.title}</p>
                  <p className="text-sm text-muted-foreground">{utility.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex gap-1 rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              tab === "profile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserRound className="size-4" />
            Hồ sơ
          </button>
          <button
            type="button"
            onClick={() => setTab("security")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              tab === "security" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="size-4" />
            Bảo mật
          </button>
        </div>

        {tab === "profile" ? (
          <ProfilePanel
            member={member}
            notLinked={notLinked}
            isLoading={isLoading}
            loadError={loadError}
            onUpdated={setMember}
          />
        ) : (
          <SecurityPanel />
        )}
      </section>
    </div>
  );
}
