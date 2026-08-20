import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, LogOut, LogIn, User as UserIcon, ChevronDown } from "lucide-react";
import type { PublicMenuItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useSiteSettings } from "@/lib/site-settings-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { NavDropdown } from "@/components/layout/NavDropdown";

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    "text-sm font-medium transition-colors hover:text-primary",
    isActive ? "text-primary" : "text-foreground/80"
  ].join(" ");
}

/**
 * Menu chính lấy động từ GET /menu (quản lý qua trang admin "Menu điều hướng", xem
 * apps/api/src/modules/menu-item) thay vì hard-code trong component như trước — admin tự thêm/sửa/
 * xoá/sắp xếp mục menu mà không cần sửa code + build lại. Mục nào có `children` (đã tính sẵn ở BE,
 * kể cả phần tự động chèn theo Category khi autoCategoryChildren=true) hiển thị dạng dropdown
 * (NavDropdown), mục không có children hiển thị dạng link phẳng như cũ.
 */
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<PublicMenuItemDto[]>([]);
  const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiFetch<PublicMenuItemDto[]>("/menu")
      // "?? []" phòng apiFetch trả về null bất thường — menu.map bên dưới không tự chống null.
      .then((data) => setMenu(data ?? []))
      .catch(() => {
        // Lỗi tải menu không nên chặn cả trang — chỉ còn logo + không có thanh điều hướng.
      });
  }, []);

  function toggleMobileGroup(id: string) {
    setOpenMobileGroups((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Thanh trên: dòng chữ nhận diện đơn vị chủ quản + đăng nhập/tài khoản — chuyển đăng nhập lên
       * đây (theo yêu cầu) để menu chính bên dưới chỉ còn các mục điều hướng nội dung. Thanh này ẩn
       * dưới md nên nút đăng nhập/đăng xuất trên di động vẫn giữ ở cuối Sheet menu như cũ. */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <div className="flex items-center gap-4">
            <span>{settings.siteName}</span>
            {settings.slogan ? <span className="hidden lg:inline">{settings.slogan}</span> : null}
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
          {/* Logo trường/công đoàn — đường dẫn lấy từ cấu hình chung (settings.logoUrl, quản lý qua
           * admin "Cấu hình chung"), mặc định trỏ file tĩnh /logo.png. Fallback "CĐ" bằng CSS
           * (onError) nếu logoUrl trỏ tới ảnh không tồn tại — tránh vỡ layout thành icon ảnh lỗi mặc
           * định của trình duyệt. */}
          <img
            src={settings.logoUrl}
            alt={settings.shortName}
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
            <span className="text-sm font-bold text-primary sm:text-base">{settings.shortName}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Trường Đại học Sư phạm Kỹ thuật Hưng Yên
            </span>
          </span>
        </Link>

        {/* Menu desktop — dựng từ /menu (xem chú thích đầu file). Mục có children -> dropdown. */}
        <nav className="hidden items-center gap-4 lg:flex lg:gap-6">
          {menu.map((item) =>
            item.children.length > 0 ? (
              <NavDropdown
                key={item.id}
                label={item.label}
                homeTo={item.url}
                items={item.children.map((child) => ({ to: child.url, label: child.label }))}
              />
            ) : (
              <NavLink key={item.id} to={item.url} end={item.url === "/"} className={navLinkClassName}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Menu mobile — cùng dữ liệu /menu, mục có children hiển thị dạng nhóm thu gọn (bấm mũi tên
         * để mở/đóng danh sách con thụt lề) thay vì luôn hiện hết, vì danh sách con giờ có thể dài
         * bất kỳ (vd "Tin hoạt động" tự thêm chuyên mục) chứ không còn cố định ngắn như trước. */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{settings.shortName}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 overflow-y-auto px-4">
              {menu.map((item) =>
                item.children.length === 0 ? (
                  <NavLink
                    key={item.id}
                    to={item.url}
                    end={item.url === "/"}
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
                ) : (
                  <div key={item.id} className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <Link
                        to={item.url}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium text-foreground/80 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Mở danh sách ${item.label}`}
                        aria-expanded={Boolean(openMobileGroups[item.id])}
                        onClick={() => toggleMobileGroup(item.id)}
                        className="rounded p-0.5 text-foreground/60 hover:text-primary"
                      >
                        <ChevronDown
                          className={openMobileGroups[item.id] ? "size-3.5 rotate-180" : "size-3.5"}
                        />
                      </button>
                    </div>
                    {openMobileGroups[item.id] ? (
                      <div className="mt-1 flex flex-col gap-1 border-l pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            to={child.url}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              )}
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
