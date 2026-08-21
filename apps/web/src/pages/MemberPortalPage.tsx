import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangePasswordRequest, MyUnionMemberDto, UpdateMyUnionMemberRequest } from "@congdoan/types";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, FileText, Bell, LogOut } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  UNION_CLERK: "Cán bộ Văn phòng Công đoàn",
  DEPARTMENT_OFFICER: "Cán bộ Công đoàn bộ phận",
  MEMBER: "Đoàn viên"
};

const UPCOMING_FEATURES = [
  {
    icon: Wallet,
    title: "Ví đoàn phí điện tử",
    description: "Theo dõi lịch sử đóng đoàn phí, số dư và nhắc hạn đóng."
  },
  {
    icon: FileText,
    title: "Biểu mẫu điện tử",
    description: "Nộp đơn, kê khai và tra cứu trạng thái xử lý trực tuyến."
  },
  {
    icon: Bell,
    title: "Thông báo cá nhân hoá",
    description: "Nhận thông báo hoạt động, quyền lợi theo đơn vị công tác."
  }
] as const;

const inputClassName =
  "w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

/** Thẻ "Thông tin công đoàn viên" — tự sửa fullName/phone/email của bản ghi UnionMember liên kết với
 * tài khoản đang đăng nhập (xem MeUnionMemberController). Nếu tài khoản chưa được admin liên kết với
 * hồ sơ công đoàn viên nào (404), hiển thị thông báo hướng dẫn thay vì crash. */
function UnionMemberInfoCard() {
  const [member, setMember] = useState<MyUnionMemberDto | null>(null);
  const [notLinked, setNotLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiFetch<MyUnionMemberDto>("/me/union-member")
      .then((data) => {
        if (cancelled) return;
        setMember(data);
        setFullName(data.fullName);
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setNotLinked(true);
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải thông tin công đoàn viên.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      const payload: UpdateMyUnionMemberRequest = { fullName, phone, email };
      const updated = await apiFetch<MyUnionMemberDto>("/me/union-member", { method: "PATCH", body: payload });
      setMember(updated);
      setSuccessMessage("Đã lưu thông tin công đoàn viên.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="py-6 text-sm text-muted-foreground">Đang tải thông tin công đoàn viên...</CardContent>
      </Card>
    );
  }

  if (notLinked) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin công đoàn viên</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tài khoản của bạn chưa được liên kết với hồ sơ công đoàn viên nào. Vui lòng liên hệ Văn phòng Công
            đoàn trường để được hỗ trợ liên kết tài khoản.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Thông tin công đoàn viên</CardTitle>
        <CardDescription>
          {member?.department?.name ? `Công đoàn bộ phận: ${member.department.name}` : "Cập nhật thông tin liên hệ cá nhân của bạn."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-1.5">
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
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="member-email" className="text-sm font-medium">
              Email liên hệ
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          ) : null}
          {successMessage ? <p className="text-sm text-emerald-600 sm:col-span-2">{successMessage}</p> : null}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thông tin"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Thẻ "Đổi mật khẩu" — gọi lại POST /auth/change-password đã có sẵn (xem AuthController). */
function ChangePasswordCard() {
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
        <CardDescription>Đặt lại mật khẩu đăng nhập cổng đoàn viên.</CardDescription>
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

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

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

export function MemberPortalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // ProtectedRoute đảm bảo không lọt vào đây khi chưa đăng nhập, nhưng giữ guard để tránh crash.
    return null;
  }

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cổng đoàn viên</h1>
      <p className="mt-2 text-muted-foreground">
        Khu vực dành riêng cho đoàn viên Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.fullName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Vai trò:</span>
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {ROLE_LABELS[role] ?? role}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => void handleLogout()}
          >
            <LogOut />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>

      <UnionMemberInfoCard />
      <ChangePasswordCard />

      <div className="mt-10">
        <h2 className="text-xl font-bold">Tiện ích số Công đoàn</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khung sẵn cho các tiện ích số sẽ được bổ sung ở Phase 4 — hiện chưa có API nên các mục
          dưới đây chỉ mang tính giới thiệu, chưa thao tác được.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {UPCOMING_FEATURES.map((feature) => (
            <Card key={feature.title} className="opacity-90">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <Badge variant="outline" className="w-fit">
                  Sắp ra mắt — Phase 4
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
