import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BellRing, HandHeart, Link2 } from "lucide-react";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORIES, PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceNoticePublicDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_SERVICE_CATEGORY_ICONS } from "./category-icons";

const HUB_BASE = "/tien-ich-so-cong-doan/dich-vu-cong";

/** Trang tổng "Dịch vụ công" (Tiện ích số, Phase 4e) — đồng hành cùng viên chức, người lao động trong sử
 * dụng dịch vụ công trực tuyến. Gom 5 nhóm chức năng đã thống nhất với người quản trị: 1) Tra cứu nhanh
 * (lưới danh mục cố định ngay trên trang này), 2) Hướng dẫn từng bước (trang chi tiết từng thủ tục), 3)
 * Kho biểu mẫu/đường dẫn chính thống, 4) "Công đoàn hỗ trợ tôi" (đặt NỔI BẬT NHẤT theo đúng yêu cầu), 5)
 * Cảnh báo và nhắc việc (xem trước 3 thông báo mới nhất ngay tại đây). */
export function PublicServiceHubPage() {
  const [notices, setNotices] = useState<PublicServiceNoticePublicDto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PublicServiceNoticePublicDto[]>("/public-service-notices")
      .then((data) => {
        if (!cancelled) setNotices(data.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setNotices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dịch vụ công</h1>
      <p className="mt-2 text-muted-foreground">
        Đồng hành cùng viên chức, người lao động trong sử dụng dịch vụ công trực tuyến — tra cứu thủ tục, xem
        hướng dẫn từng bước, kho liên kết tới các cổng dịch vụ công chính thống, và gửi yêu cầu Công đoàn hỗ trợ
        khi vướng mắc ở bất kỳ bước nào.
      </p>

      {/* Nhóm 4 — "Công đoàn hỗ trợ tôi", đặt ngay đầu trang vì đây là phần nổi bật nhất theo yêu cầu. */}
      <Link to={`${HUB_BASE}/ho-tro`} className="mt-8 block">
        <Card className="border-primary/40 bg-primary/5 transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HandHeart className="size-6" />
              </span>
              <div>
                <p className="text-lg font-semibold">Công đoàn hỗ trợ tôi</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Đang vướng thủ tục dịch vụ công nào đó? Cho Công đoàn biết bạn cần làm gì, đang vướng ở bước
                  nào — cán bộ Công đoàn sẽ liên hệ hướng dẫn trực tiếp.
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              Gửi yêu cầu hỗ trợ <ArrowRight className="size-4" />
            </span>
          </CardContent>
        </Card>
      </Link>

      {/* Nhóm 1 — Tra cứu nhanh dịch vụ công. */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Tra cứu nhanh dịch vụ công</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chọn nhóm thủ tục để xem hướng dẫn từng bước chi tiết.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PUBLIC_SERVICE_PROCEDURE_CATEGORIES.map((category) => {
            const Icon = PUBLIC_SERVICE_CATEGORY_ICONS[category];
            return (
              <Link key={category} to={`${HUB_BASE}/thu-tuc?category=${category}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col items-center gap-2 py-5 text-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <p className="text-sm font-medium">{PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS[category]}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Nhóm 3 + Nhóm 5 — 2 lối vào còn lại, trình bày ngang hàng. */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link to={`${HUB_BASE}/lien-ket`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-3 py-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Link2 className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-medium hover:text-primary">Kho biểu mẫu và đường dẫn chính thống</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Liên kết trực tiếp tới Cổng Dịch vụ công Quốc gia, VNeID, BHXH Việt Nam, Cơ quan thuế — kèm mã
                  QR để quét truy cập ngay.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={`${HUB_BASE}/thong-bao`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-3 py-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BellRing className="size-5" />
                </span>
                {notices && notices.length > 0 ? <Badge variant="secondary">{notices.length} thông báo mới</Badge> : null}
              </div>
              <div className="flex-1">
                <p className="font-medium hover:text-primary">Cảnh báo và nhắc việc</p>
                {notices === null ? (
                  <p className="mt-1 text-sm text-muted-foreground">Đang tải...</p>
                ) : notices.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">Chưa có thông báo nào.</p>
                ) : (
                  <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                    {notices.map((notice) => (
                      <li key={notice.id} className="line-clamp-1">
                        • {notice.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
