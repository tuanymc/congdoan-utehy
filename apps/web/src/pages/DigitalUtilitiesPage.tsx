import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardList, FileText, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface UtilityCard {
  icon: typeof FileText;
  title: string;
  description: string;
  to?: string;
  status: "available" | "soon";
  /** Chỉ hiện khi status="soon" — cho biết đợt triển khai dự kiến, khớp roadmap Phase 4 đã thống nhất. */
  comingSoonNote?: string;
}

const UTILITIES: UtilityCard[] = [
  {
    icon: FileText,
    title: "Kho biểu mẫu",
    description: "Biểu mẫu, đơn từ dùng chung cho đoàn viên — xem và tải xuống trực tiếp.",
    to: "/tien-ich-so-cong-doan/bieu-mau",
    status: "available"
  },
  {
    icon: Users,
    title: "Tra cứu đoàn viên",
    description: "Danh bạ công khai — tìm theo tên hoặc lọc theo đơn vị công tác.",
    to: "/danh-ba-cong-doan-vien",
    status: "available"
  },
  {
    icon: CalendarCheck,
    title: "Đăng ký hoạt động",
    description: "Đăng ký tham gia các hoạt động, phong trào do Công đoàn trường tổ chức.",
    to: "/tien-ich-so-cong-doan/dang-ky-hoat-dong",
    status: "available"
  },
  {
    icon: ClipboardList,
    title: "Khảo sát ý kiến",
    description: "Góp ý, khảo sát ý kiến đoàn viên về các chủ trương, hoạt động của Công đoàn.",
    to: "/tien-ich-so-cong-doan/khao-sat",
    status: "available"
  },
  {
    icon: Sparkles,
    title: "Công cụ AI",
    description: "Kho công cụ AI hữu ích phục vụ giảng dạy, nghiên cứu — dành riêng cho đoàn viên đã đăng nhập.",
    to: "/tien-ich-so-cong-doan/cong-cu-ai",
    status: "available"
  }
];

function UtilityCardView({ utility }: { utility: UtilityCard }) {
  const content = (
    <Card className={utility.status === "available" ? "h-full transition-shadow hover:shadow-md" : "h-full opacity-90"}>
      <CardContent className="flex h-full flex-col gap-3 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <utility.icon className="size-5" />
        </span>
        <div className="flex-1">
          <p className={utility.status === "available" ? "font-medium hover:text-primary" : "font-medium"}>{utility.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{utility.description}</p>
        </div>
        {utility.status === "soon" ? (
          <Badge variant="outline" className="w-fit">
            {utility.comingSoonNote}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );

  return utility.to ? <Link to={utility.to}>{content}</Link> : content;
}

/** Trang hub "Tiện ích số Công đoàn" — mục menu cấp 1 "Tiện ích số" trỏ thẳng vào route này (xem
 * MenuItemsService/admin đã tạo sẵn mục menu). Đóng vai trò "menu con" bằng card grid thay vì dựng
 * thêm submenu 2 cấp trong hệ MenuItem, vì các tiện ích ở đây đa dạng loại trang (link nội bộ, trang
 * yêu cầu đăng nhập, trang chưa xây) hơn là danh sách link đơn thuần. Xem thiết kế đầy đủ Phase 4 đã
 * thống nhất với người quản trị (roadmap 4a/4b/4c/4d). */
export function DigitalUtilitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Tiện ích số Công đoàn</h1>
      <p className="mt-2 text-muted-foreground">
        Các tiện ích số dành cho đoàn viên và cán bộ, giảng viên, người lao động Trường Đại học Sư phạm Kỹ thuật Hưng Yên.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {UTILITIES.map((utility) => (
          <UtilityCardView key={utility.title} utility={utility} />
        ))}
      </div>
    </div>
  );
}
