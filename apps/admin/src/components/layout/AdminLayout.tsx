import { useState, type ComponentType, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  BarChart3,
  BellRing,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderTree,
  HandHeart,
  History,
  Images,
  Landmark,
  LayoutDashboard,
  Link2,
  ListTree,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Scale,
  Settings,
  Sparkles,
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

interface NavGroup {
  title: string;
  items: NavItem[];
}

const DASHBOARD_ITEM: NavItem = { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard };

const CONTENT_NAV_ITEMS: NavItem[] = [
  { to: "/posts", label: "Bài viết", icon: Newspaper },
  { to: "/categories", label: "Chuyên mục", icon: FolderTree }
];

// Banner / menu / hộp thư — quyền homeslide:* / menuitem:* / contactmessage:* (ADMIN + UNION_CLERK).
const SITE_CONTENT_NAV_ITEMS: NavItem[] = [
  { to: "/home-slides", label: "Banner trang chủ", icon: Images },
  { to: "/menu-items", label: "Menu điều hướng", icon: ListTree },
  { to: "/contact-messages", label: "Liên hệ", icon: Mail }
];

const UNION_NAV_ITEMS: NavItem[] = [
  { to: "/union-members", label: "Công đoàn viên", icon: UsersRound },
  { to: "/union-departments", label: "Công đoàn bộ phận", icon: FolderTree },
  { to: "/union-terms", label: "Nhiệm kỳ Ban chấp hành", icon: History },
  { to: "/union-committee-members", label: "Ban chấp hành", icon: Landmark }
];

const DOCUMENT_NAV_ITEMS: NavItem[] = [
  { to: "/official-documents", label: "Công văn", icon: FileText },
  { to: "/document-types", label: "Loại công văn", icon: Tags }
];

const DIGITAL_NAV_ITEMS: NavItem[] = [
  { to: "/digital-forms", label: "Kho biểu mẫu", icon: ClipboardList },
  { to: "/events", label: "Đăng ký hoạt động", icon: CalendarDays },
  { to: "/ai-tools", label: "Kho công cụ AI", icon: Sparkles },
  { to: "/surveys", label: "Khảo sát ý kiến", icon: BarChart3 },
  { to: "/public-service-procedures", label: "Thủ tục dịch vụ công", icon: FileText },
  { to: "/public-service-links", label: "Đường dẫn dịch vụ công", icon: Link2 },
  { to: "/public-service-support-requests", label: "Công đoàn hỗ trợ tôi", icon: HandHeart },
  { to: "/public-service-notices", label: "Cảnh báo và nhắc việc", icon: BellRing },
  { to: "/legal-education-campaigns", label: "Phổ biến pháp luật", icon: Scale }
];

// "sitesetting"/"user" chỉ cấp cho ADMIN (không nằm trong clerkManagedModules ở prisma/seed.ts).
const SYSTEM_NAV_ITEMS: NavItem[] = [
  { to: "/users", label: "Người dùng", icon: UsersIcon },
  { to: "/site-settings", label: "Cấu hình chung", icon: Settings }
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

function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
        )
      }
    >
      <item.icon className="size-4 shrink-0" />
      {item.label}
    </NavLink>
  );
}

function SidebarNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </p>
          {group.items.map((item) => (
            <NavLinkItem key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { data: identity } = useGetIdentity<AuthUser>();
  const { mutate: logout } = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = identity?.roles.includes("ADMIN") ?? false;
  // Cùng điều kiện với RequireDocumentAccess bọc route — ẩn hẳn menu cho MEMBER/DEPARTMENT_OFFICER
  // thay vì để họ bấm vào rồi mới bị chặn (xem prisma/seed.ts clerkManagedModules).
  const hasClerkAccess = isAdmin || (identity?.roles.includes("UNION_CLERK") ?? false);

  const navGroups: NavGroup[] = [
    { title: "Tổng quan", items: [DASHBOARD_ITEM] },
    {
      title: "Nội dung website",
      items: [...CONTENT_NAV_ITEMS, ...(hasClerkAccess ? SITE_CONTENT_NAV_ITEMS : [])]
    },
    ...(hasClerkAccess
      ? [
          { title: "Tổ chức Công đoàn", items: UNION_NAV_ITEMS },
          { title: "Công văn", items: DOCUMENT_NAV_ITEMS },
          { title: "Tiện ích số", items: DIGITAL_NAV_ITEMS }
        ]
      : []),
    ...(isAdmin ? [{ title: "Hệ thống", items: SYSTEM_NAV_ITEMS }] : [])
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r bg-card md:flex">
        <div className="flex h-16 items-center px-4">
          <BrandTitle />
        </div>
        <Separator />
        <SidebarNav groups={navGroups} />
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
              <SheetContent side="left" className="flex h-full w-64 flex-col p-0">
                <div className="flex h-16 items-center px-4">
                  <BrandTitle />
                </div>
                <Separator />
                <SidebarNav groups={navGroups} onNavigate={() => setMobileOpen(false)} />
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
