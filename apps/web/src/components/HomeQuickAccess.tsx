import { Link } from "react-router-dom";
import { ArrowRight, FileText, Info, LogIn, Newspaper, Phone, Users } from "lucide-react";
import { cn } from "@/components/ui/utils";

const SHORTCUTS = [
  {
    to: "/tin-tuc",
    icon: Newspaper,
    title: "Tin tức",
    description: "Hoạt động, thông báo và phong trào thi đua của Công đoàn trường.",
    tone: "primary"
  },
  {
    to: "/gioi-thieu",
    icon: Info,
    title: "Giới thiệu",
    description: "Chức năng, nhiệm vụ và cơ cấu tổ chức của Công đoàn UTEHY.",
    tone: "navy"
  },
  {
    to: "/van-ban",
    icon: FileText,
    title: "Văn bản",
    description: "Công văn, thông báo do Công đoàn trường ban hành và công khai.",
    tone: "secondary"
  },
  {
    to: "/danh-ba-cong-doan-vien",
    icon: Users,
    title: "Công đoàn viên",
    description: "Danh bạ công khai cán bộ, giảng viên là đoàn viên Công đoàn trường.",
    tone: "primary"
  },
  {
    to: "/lien-he",
    icon: Phone,
    title: "Liên hệ",
    description: "Thông tin liên hệ Văn phòng Công đoàn trường.",
    tone: "navy"
  },
  {
    to: "/cong-doan-vien",
    icon: LogIn,
    title: "Cổng đoàn viên",
    description: "Đăng nhập để xem thông tin dành riêng cho đoàn viên đã có tài khoản.",
    tone: "secondary"
  }
] as const;

const TONE_CLASS: Record<(typeof SHORTCUTS)[number]["tone"], string> = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  secondary: "bg-secondary/15 text-[#2d8a35] group-hover:bg-secondary group-hover:text-secondary-foreground",
  navy: "bg-[#0f2a6b]/10 text-[#0f2a6b] group-hover:bg-[#0f2a6b] group-hover:text-white"
};

/** Lối tắt 6 mục chính trên trang chủ — card nổi trên mép dưới hero, hover nâng nhẹ. */
export function HomeQuickAccess() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4">
      <div className="rounded-2xl border bg-background/95 p-5 shadow-xl shadow-primary/10 backdrop-blur sm:p-7">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Cổng thông tin</p>
          <h2 className="mt-1 text-2xl font-bold">Truy cập nhanh</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex gap-3.5 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                  TONE_CLASS[item.tone]
                )}
              >
                <item.icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold transition-colors group-hover:text-primary">{item.title}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
