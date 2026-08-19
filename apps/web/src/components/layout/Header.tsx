import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/tin-tuc", label: "Tin tức", end: false },
  { to: "/gioi-thieu", label: "Giới thiệu", end: false },
  { to: "/lien-he", label: "Liên hệ", end: false }
] as const;

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    "text-sm font-medium transition-colors hover:text-primary",
    isActive ? "text-primary" : "text-foreground/80"
  ].join(" ");
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Thanh trên: dòng chữ nhận diện đơn vị chủ quản */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span>Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên</span>
          <span>Đoàn kết – Trách nhiệm – Vì quyền lợi đoàn viên</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            CĐ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-primary sm:text-base">Công đoàn UTEHY</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Trường Đại học Sư phạm Kỹ thuật Hưng Yên
            </span>
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/cong-doan-vien"
                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                {user.fullName}
              </Link>
              <Button variant="outline" size="sm" onClick={() => void logout()}>
                <LogOut />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/dang-nhap">Đăng nhập</Link>
            </Button>
          )}
        </div>

        {/* Menu mobile */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Công đoàn UTEHY</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_ITEMS.map((item) => (
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
