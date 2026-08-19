import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, LogOut, LogIn, User as UserIcon, ChevronDown } from "lucide-react";
import type { CategoryDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { NavDropdown, type NavDropdownItem } from "@/components/layout/NavDropdown";

/** Mục con "Giới thiệu" — trỏ tới các #id neo đã thêm trong AboutPage.tsx (xem GROUPS ở đó), phải
 * giữ khớp id khi đổi 1 trong 2 nơi. */
const ABOUT_ITEMS: NavDropdownItem[] = [
  { to: "/gioi-thieu#gioi-thieu-chung", label: "Giới thiệu chung" },
  { to: "/gioi-thieu#ban-chap-hanh-cong-doan", label: "Ban Chấp hành Công đoàn" },
  { to: "/gioi-thieu#cac-ban-chuyen-mon", label: "Các ban chuyên môn" },
  { to: "/lien-he", label: "Liên hệ" }
];

/** Mục con "Văn bản" — khớp query param `direction` mà DocumentsPage.tsx đọc (xem
 * packages/types/src/official-document.ts: DocumentDirection). */
const DOCUMENT_ITEMS: NavDropdownItem[] = [
  { to: "/van-ban", label: "Tất cả văn bản" },
  { to: "/van-ban?direction=OUTGOING", label: "Công văn đi" },
  { to: "/van-ban?direction=INCOMING", label: "Công văn đến" }
];

/** Category slug không thuộc "Tin hoạt động" — hoặc vì đã có mục menu riêng (Giới thiệu, Văn bản,
 * Ý kiến Công đoàn viên, Văn hoá đọc), hoặc vì là category mặc định lúc seed không thuộc web cũ
 * ("tin-chung"). Category có isAboutSection=true cũng bị loại (đã hiển thị dưới "Giới thiệu"). */
const ACTIVITY_EXCLUDED_SLUGS = new Set(["gioi-thieu", "van-ban", "tin-chung", "tin-tuc-khac", "van-hoa-doc"]);

const STANDALONE_ITEMS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/danh-ba-cong-doan-vien", label: "Công đoàn viên", end: false },
  { to: "/tin-tuc?category=tin-tuc-khac", label: "Ý kiến Công đoàn viên", end: false },
  { to: "/tin-tuc?category=van-hoa-doc", label: "Văn hóa đọc", end: false }
] as const;

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    "text-sm font-medium transition-colors hover:text-primary",
    isActive ? "text-primary" : "text-foreground/80"
  ].join(" ");
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activityItems, setActivityItems] = useState<NavDropdownItem[]>([]);
  const [mobileActivityOpen, setMobileActivityOpen] = useState(false);

  useEffect(() => {
    // "Tin hoạt động" lấy động theo Category thật (loại các category thuộc "Giới thiệu" +
    // các category đã có mục menu riêng) — khớp cấu trúc menu web cũ, không hard-code danh sách
    // chuyên mục vì admin có thể thêm/sửa category qua trang quản trị.
    apiFetch<CategoryDto[]>("/categories")
      .then((data) => {
        const items = (data ?? [])
          .filter((category) => !category.isAboutSection && !ACTIVITY_EXCLUDED_SLUGS.has(category.slug))
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => ({ to: `/tin-tuc?category=${category.slug}`, label: category.name }));
        setActivityItems(items);
      })
      .catch(() => {
        // Không chặn header khi lỗi tải chuyên mục — dropdown "Tin hoạt động" chỉ còn link "Tất cả tin tức".
      });
  }, []);

  const activityDropdownItems: NavDropdownItem[] = [
    { to: "/tin-tuc", label: "Tất cả tin tức" },
    ...activityItems
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Thanh trên: dòng chữ nhận diện đơn vị chủ quản + đăng nhập/tài khoản — chuyển đăng nhập lên
       * đây (theo yêu cầu) để menu chính bên dưới chỉ còn các mục điều hướng nội dung. Thanh này ẩn
       * dưới md nên nút đăng nhập/đăng xuất trên di động vẫn giữ ở cuối Sheet menu như cũ. */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <div className="flex items-center gap-4">
            <span>Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên</span>
            <span className="hidden lg:inline">Đoàn kết – Trách nhiệm – Vì quyền lợi đoàn viên</span>
          </div>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to="/cong-doan-vien" className="flex items-center gap-1.5 hover:underline">
                <UserIcon className="size-3.5" />
                {user.fullName}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-1 hover:underline"
              >
                <LogOut className="size-3.5" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/dang-nhap" className="flex items-center gap-1.5 font-medium hover:underline">
              <LogIn className="size-3.5" />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          {/* Logo trường/công đoàn — file tĩnh tại apps/web/public/logo.png (giữ nguyên tên file
           * dùng chung cho cả apps/web và apps/admin). Fallback "CĐ" bằng CSS (onError) nếu chưa
           * có file logo.png trên server — tránh vỡ layout thành icon ảnh lỗi mặc định của trình duyệt. */}
          <img
            src="/logo.png"
            alt="Công đoàn UTEHY"
            className="size-10 shrink-0 object-contain"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            CĐ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary sm:text-base">Công đoàn UTEHY</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Trường Đại học Sư phạm Kỹ thuật Hưng Yên
            </span>
          </span>
        </Link>

        {/* Menu desktop — cấu trúc phân cấp giống web cũ (congdoan.utehy.edu.vn): "Giới thiệu",
         * "Tin hoạt động", "Văn bản" là dropdown; các mục còn lại là link phẳng như cũ. */}
        <nav className="hidden items-center gap-4 lg:flex lg:gap-6">
          <NavLink to="/" end className={navLinkClassName}>
            Trang chủ
          </NavLink>
          <NavDropdown label="Giới thiệu" homeTo="/gioi-thieu" items={ABOUT_ITEMS} />
          <NavDropdown label="Tin hoạt động" homeTo="/tin-tuc" items={activityDropdownItems} />
          <NavDropdown label="Văn bản" homeTo="/van-ban" items={DOCUMENT_ITEMS} />
          <NavLink to="/danh-ba-cong-doan-vien" className={navLinkClassName}>
            Công đoàn viên
          </NavLink>
          <NavLink to="/tin-tuc?category=tin-tuc-khac" className={navLinkClassName}>
            Ý kiến Công đoàn viên
          </NavLink>
          <NavLink to="/tin-tuc?category=van-hoa-doc" className={navLinkClassName}>
            Văn hóa đọc
          </NavLink>
        </nav>

        {/* Menu mobile — Sheet đã cuộn được sẵn nên hiển thị luôn danh sách con thụt lề dưới mỗi mục
         * cha thay vì làm accordion riêng, trừ "Tin hoạt động" (danh sách động, có thể dài) vẫn thu
         * gọn được bằng nút bấm để đỡ dài trang khi có nhiều chuyên mục. */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Công đoàn UTEHY</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 overflow-y-auto px-4">
              {STANDALONE_ITEMS.slice(0, 1).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                      isActive ? "bg-accent text-primary" : "text-foreground/80"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Giới thiệu (luôn hiện đủ 4 mục con — danh sách cố định, ngắn) */}
              <div className="px-3 py-2">
                <Link
                  to="/gioi-thieu"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary"
                >
                  Giới thiệu
                </Link>
                <div className="mt-1 flex flex-col gap-1 border-l pl-3">
                  {ABOUT_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tin hoạt động (danh sách động, có thể dài — thu gọn mặc định) */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    to="/tin-tuc"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-foreground/80 hover:text-primary"
                  >
                    Tin hoạt động
                  </Link>
                  {activityItems.length > 0 ? (
                    <button
                      type="button"
                      aria-label="Mở danh sách chuyên mục Tin hoạt động"
                      aria-expanded={mobileActivityOpen}
                      onClick={() => setMobileActivityOpen((current) => !current)}
                      className="rounded p-0.5 text-foreground/60 hover:text-primary"
                    >
                      <ChevronDown className={mobileActivityOpen ? "size-3.5 rotate-180" : "size-3.5"} />
                    </button>
                  ) : null}
                </div>
                {mobileActivityOpen && activityItems.length > 0 ? (
                  <div className="mt-1 flex flex-col gap-1 border-l pl-3">
                    {activityItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Văn bản (luôn hiện đủ 3 mục con — danh sách cố định, ngắn) */}
              <div className="px-3 py-2">
                <Link
                  to="/van-ban"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary"
                >
                  Văn bản
                </Link>
                <div className="mt-1 flex flex-col gap-1 border-l pl-3">
                  {DOCUMENT_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {STANDALONE_ITEMS.slice(1).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                      isActive ? "bg-accent text-primary" : "text-foreground/80"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t px-4 py-4">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/cong-doan-vien"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <UserIcon className="size-4" />
                    {user.fullName}
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" onClick={() => setMobileOpen(false)}>
                  <Link to="/dang-nhap">Đăng nhập</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
