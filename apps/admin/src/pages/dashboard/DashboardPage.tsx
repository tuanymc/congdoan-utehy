import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import {
  PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS,
  type AuthUser,
  type DashboardOverviewDto,
  type SystemRoleCode
} from "@congdoan/types";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderTree,
  HandHeart,
  Images,
  Landmark,
  Link2,
  Mail,
  Newspaper,
  Settings,
  Sparkles,
  Users as UsersIcon,
  UsersRound
} from "lucide-react";
import { apiFetch } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../components/ui/utils";

const ROLE_LABEL: Record<SystemRoleCode, string> = {
  ADMIN: "Quản trị hệ thống",
  UNION_CLERK: "Văn thư công đoàn",
  DEPARTMENT_OFFICER: "Cán bộ công đoàn bộ phận",
  MEMBER: "Đoàn viên"
};

const POST_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  ARCHIVED: "Lưu trữ"
};

interface KpiCardProps {
  to: string;
  label: string;
  value: number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "alert" | "accent";
}

function KpiCard({ to, label, value, hint, icon: Icon, tone = "default" }: KpiCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/60",
        tone === "alert" && value > 0 && "border-destructive/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value.toLocaleString("vi-VN")}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone === "alert" && value > 0
              ? "bg-destructive/10 text-destructive"
              : tone === "accent"
                ? "bg-secondary/15 text-secondary"
                : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </Link>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

interface QuickLink {
  to: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  clerkOnly?: boolean;
  adminOnly?: boolean;
}

const QUICK_LINKS: QuickLink[] = [
  { to: "/posts/create", label: "Viết bài mới", description: "Tin hoạt động, thông báo", icon: Newspaper },
  { to: "/union-members", label: "Công đoàn viên", description: "Danh bạ, tạo tài khoản", icon: UsersRound, clerkOnly: true },
  { to: "/official-documents/create", label: "Nhập công văn", description: "Công văn đến / đi", icon: FileText, clerkOnly: true },
  { to: "/contact-messages", label: "Hộp thư liên hệ", description: "Phản ánh từ website", icon: Mail, clerkOnly: true },
  { to: "/public-service-support-requests", label: "Yêu cầu hỗ trợ", description: "Công đoàn hỗ trợ tôi", icon: HandHeart, clerkOnly: true },
  { to: "/events/create", label: "Tạo hoạt động", description: "Mở đăng ký tham gia", icon: CalendarDays, clerkOnly: true },
  { to: "/surveys/create", label: "Tạo khảo sát", description: "Thu thập ý kiến đoàn viên", icon: BarChart3, clerkOnly: true },
  { to: "/home-slides", label: "Banner trang chủ", description: "Ảnh trượt trang công khai", icon: Images, clerkOnly: true },
  { to: "/union-committee-members", label: "Ban chấp hành", description: "Theo nhiệm kỳ", icon: Landmark, clerkOnly: true },
  { to: "/ai-tools", label: "Kho công cụ AI", description: "Tiện ích số cho đoàn viên", icon: Sparkles, clerkOnly: true },
  { to: "/digital-forms", label: "Kho biểu mẫu", description: "Biểu mẫu đoàn viên trên website", icon: ClipboardList, clerkOnly: true },
  { to: "/public-service-links", label: "Đường dẫn dịch vụ công", description: "Liên kết kèm mã QR", icon: Link2, clerkOnly: true },
  { to: "/users", label: "Người dùng", description: "Tài khoản đăng nhập hệ thống", icon: UsersIcon, adminOnly: true },
  { to: "/site-settings", label: "Cấu hình chung", description: "Tên site, SEO, liên hệ", icon: Settings, adminOnly: true }
];

export function DashboardPage() {
  const { data: identity } = useGetIdentity<AuthUser>();
  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const isAdmin = identity?.roles.includes("ADMIN") ?? false;
  const hasClerkAccess = isAdmin || (identity?.roles.includes("UNION_CLERK") ?? false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await apiFetch<DashboardOverviewDto>("/admin/dashboard");
        if (!cancelled) setOverview(result);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = overview?.kpis;
  const attentionCount = (kpis?.unreadContacts ?? 0) + (kpis?.supportNew ?? 0) + (kpis?.supportInProgress ?? 0);
  const visibleQuickLinks = QUICK_LINKS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.clerkOnly) return hasClerkAccess;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-primary px-5 py-6 text-primary-foreground sm:px-6">
        <p className="text-sm text-primary-foreground/80 capitalize">{formatDate(new Date().toISOString())}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {greetingForNow()}, {identity?.fullName ?? "bạn"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85">
          Tổng quan vận hành website Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tin bài, danh bạ,
          công văn và tiện ích số.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(identity?.roles ?? []).map((role) => (
            <Badge key={role} variant="secondary" className="bg-white/15 text-primary-foreground hover:bg-white/20">
              {ROLE_LABEL[role] ?? role}
            </Badge>
          ))}
          {identity?.email ? <span className="text-xs text-primary-foreground/70">{identity.email}</span> : null}
        </div>
      </section>

      {loadError ? (
        <p className="text-sm text-destructive">Không tải được số liệu tổng quan. Tải lại trang để thử lại.</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !kpis ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`kpi-skeleton-${index}`} className="rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-9 w-16" />
            </div>
          ))
        ) : (
          <>
            <KpiCard
              to="/posts"
              label="Bài viết"
              value={kpis.posts}
              hint={`${kpis.publishedPosts} đã đăng · ${kpis.draftPosts} nháp`}
              icon={Newspaper}
            />
            <KpiCard
              to="/union-members"
              label="Công đoàn viên"
              value={kpis.unionMembers}
              hint={`${kpis.unionMembersWithLogin} đã có tài khoản đăng nhập`}
              icon={UsersRound}
              tone="accent"
            />
            <KpiCard
              to="/official-documents"
              label="Công văn"
              value={kpis.officialDocuments}
              hint={`${kpis.categories} chuyên mục tin · ${kpis.homeSlides} banner`}
              icon={FileText}
            />
            <KpiCard
              to="/contact-messages"
              label="Liên hệ chưa đọc"
              value={kpis.unreadContacts}
              hint={`${kpis.contacts} tin nhắn trên website`}
              icon={Mail}
              tone="alert"
            />
            <KpiCard
              to="/public-service-support-requests"
              label="Hỗ trợ mới"
              value={kpis.supportNew}
              hint={`${kpis.supportInProgress} đang xử lý`}
              icon={HandHeart}
              tone="alert"
            />
            <KpiCard
              to="/events"
              label="Hoạt động"
              value={kpis.events}
              hint="Đăng ký tham gia trên trang công khai"
              icon={CalendarDays}
            />
            <KpiCard
              to="/surveys"
              label="Khảo sát"
              value={kpis.surveys}
              hint={`${kpis.openSurveys} đang mở`}
              icon={BarChart3}
            />
            {isAdmin ? (
              <KpiCard
                to="/users"
                label="Tài khoản hệ thống"
                value={kpis.users}
                hint={`${kpis.unionDepartments} công đoàn bộ phận`}
                icon={UsersIcon}
              />
            ) : (
              <KpiCard
                to="/union-departments"
                label="Công đoàn bộ phận"
                value={kpis.unionDepartments}
                hint="Danh mục tổ chức Công đoàn"
                icon={FolderTree}
              />
            )}
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Cần xử lý</CardTitle>
              <CardDescription>
                {isLoading ? "Đang tải..." : attentionCount > 0 ? `${attentionCount} việc đang chờ` : "Không có việc tồn"}
              </CardDescription>
            </div>
            {attentionCount > 0 ? <Badge variant="destructive">{attentionCount}</Badge> : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-5">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                {(overview?.recentContacts.filter((item) => !item.isRead) ?? []).length === 0 &&
                (overview?.recentSupportRequests.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">Hộp thư và yêu cầu hỗ trợ đều đã được xử lý.</p>
                ) : null}
                {(overview?.recentContacts.filter((item) => !item.isRead) ?? []).slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to="/contact-messages"
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline">Chưa đọc</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.email}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </Link>
                ))}
                {(overview?.recentSupportRequests ?? []).map((item) => (
                  <Link
                    key={item.id}
                    to="/public-service-support-requests"
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{item.fullName}</span>
                      <Badge variant={item.status === "NEW" ? "destructive" : "secondary"}>
                        {PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </Link>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Hoạt động sắp diễn ra</CardTitle>
              <CardDescription>Sự kiện đã có ngày bắt đầu từ hôm nay</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">
                Xem tất cả <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-5">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (overview?.upcomingEvents.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có hoạt động nào được lên lịch.</p>
            ) : (
              overview?.upcomingEvents.map((item) => (
                <Link key={item.id} to="/events" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted/60">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.startAt ? formatDateTime(item.startAt) : "Chưa có ngày"}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Thao tác nhanh</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleQuickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <RecentList
          title="Bài viết mới"
          allHref="/posts"
          isLoading={isLoading}
          empty="Chưa có bài viết."
          items={(overview?.recentPosts ?? []).map((item) => ({
            id: item.id,
            href: `/posts/edit/${item.id}`,
            title: item.title,
            meta: `${POST_STATUS_LABEL[item.status] ?? item.status} · ${formatDateTime(item.createdAt)}`
          }))}
        />
        <RecentList
          title="Công văn mới"
          allHref="/official-documents"
          isLoading={isLoading}
          empty="Chưa có công văn."
          items={(overview?.recentDocuments ?? []).map((item) => ({
            id: item.id,
            href: `/official-documents/edit/${item.id}`,
            title: item.title,
            meta: `${item.documentNumber ?? "Chưa có số"} · ${formatDateTime(item.createdAt)}`
          }))}
        />
        <RecentList
          title="Liên hệ gần đây"
          allHref="/contact-messages"
          isLoading={isLoading}
          empty="Chưa có tin nhắn liên hệ."
          items={(overview?.recentContacts ?? []).map((item) => ({
            id: item.id,
            href: "/contact-messages",
            title: item.name,
            meta: `${item.isRead ? "Đã đọc" : "Chưa đọc"} · ${formatDateTime(item.createdAt)}`
          }))}
        />
      </section>
    </div>
  );
}

function RecentList({
  title,
  allHref,
  isLoading,
  empty,
  items
}: {
  title: string;
  allHref: string;
  isLoading: boolean;
  empty: string;
  items: Array<{ id: string; href: string; title: string; meta: string }>;
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to={allHref}>
            Tất cả <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pb-5">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link to={item.href} className="block rounded-md px-1 py-1.5 hover:bg-muted/60">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
