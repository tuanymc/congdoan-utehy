import { useState, type ComponentType, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Tags,
  Users as UsersIcon,
  UsersRound
} from "lucide-react";
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

// Chỉ ADMIN/UNION_CLERK có quyền "document:*"/"documenttype:*"/"homeslide:*"/"uniondepartment:*"/
// "unionmember:*"/"contactmessage:*" (xem prisma/seed.ts) — cùng điều kiện với RequireDocumentAccess
// bọc route, ẩn hẳn menu cho MEMBER/DEPARTMENT_OFFICER thay vì để họ bấm vào rồi mới bị chặn.
const DOCUMENT_NAV_ITEMS: NavItem[] = [
  { to: "/official-documents", label: "Công văn", icon: FileText },
  { to: "/document-types", label: "Loại công văn", icon: Tags },
  { to: "/home-slides", label: "Banner trang chủ", icon: Images },
  { to: "/union-members", label: "Công đoàn viên", icon: UsersRound },
  { to: "/union-departments", label: "Công đoàn bộ phận", icon: FolderTree },
  { to: "/contact-messages", label: "Liên hệ", icon: Mail }
];

function BrandTitle() {
  return (
    <span className="flex items-center gap-2">
      {/* Logo trường/công đoàn — file tĩnh tại apps/admin/public/logo.png, xem ghi chú ở
       * apps/web/src/components/layout/Header.tsx (cùng file logo dùng chung cho cả 2 app). */}
      <img src="/logo.png" alt="Công đoàn UTEHY" className="h-8 w-auto shrink-0" />
      <span className="text-lg font-semibold text-primary">Công đoàn UTEHY</span>
    </span>
  );
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

  const isAdmin = identity?.roles.includes("ADMIN") ?? false;
  const hasDocumentAccess = isAdmin || (identity?.roles.includes("UNION_CLERK") ?? false);

  const navItems: NavItem[] = [
    ...BASE_NAV_ITEMS,
    ...(hasDocumentAccess ? DOCUMENT_NAV_ITEMS : []),
    ...(isAdmin ? [USERS_NAV_ITEM] : [])
  ];

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
