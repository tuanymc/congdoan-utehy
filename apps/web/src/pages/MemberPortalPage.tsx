import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
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

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
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
