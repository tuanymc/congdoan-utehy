import { useState, type ComponentType, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { FolderTree, LayoutDashboard, LogOut, Menu, Newspaper, Users as UsersIcon } from "lucide-react";
import type { AuthUser } from "@congdoan/types";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { cn } from "../ui/utils";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/posts", label: "Bài viết", icon: Newspaper },
  { to: "/categories", label: "Chuyên mục", icon: FolderTree }
];

const USERS_NAV_ITEM: NavItem = { to: "/users", label: "Người dùng", icon: UsersIcon };

function BrandTitle() {
  return <span className="text-lg font-semibold text-primary">Công đoàn UTEHY</span>;
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { data: identity } = useGetIdentity<AuthUser>();
  const { mutate: logout } = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = identity?.roles.includes("ADMIN") ? [...BASE_NAV_ITEMS, USERS_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center px-4">
          <BrandTitle />
        </div>
        <Separator />
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mở menu điều hướng">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center px-4">
                  <BrandTitle />
                </div>
                <Separator />
                <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-primary">Công đoàn UTEHY</span>
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {identity?.fullName ?? "Đang tải..."}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
