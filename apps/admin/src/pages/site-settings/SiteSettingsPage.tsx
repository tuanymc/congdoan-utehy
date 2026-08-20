import { useEffect, useState, type FormEvent } from "react";
import { useNotification } from "@refinedev/core";
import type { SiteSettingDto, UpdateSiteSettingRequest } from "@congdoan/types";
import { apiFetch } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { PageLoading } from "../../components/common/PageLoading";

/** Form nhập liệu — mọi field đều là string (kể cả field cho phép null ở DTO), rỗng nghĩa là null khi
 * gửi lên (xem toRequestPayload). Không dùng Refine useOne/useUpdate như các resource khác vì đây là
 * bản ghi DUY NHẤT (không có id để router theo /edit/:id) — gọi thẳng apiFetch tới
 * GET/PATCH /admin/site-settings, đơn giản hơn là gò ép vào khuôn CRUD resource. */
interface FormState {
  siteName: string;
  shortName: string;
  slogan: string;
  description: string;
  logoUrl: string;
  address: string;
  hotline: string;
  officePhone: string;
  email: string;
  facebookUrl: string;
  youtubeUrl: string;
  workingHoursWeekday: string;
  workingHoursLunch: string;
  workingHoursWeekend: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
}

const EMPTY_FORM: FormState = {
  siteName: "",
  shortName: "",
  slogan: "",
  description: "",
  logoUrl: "",
  address: "",
  hotline: "",
  officePhone: "",
  email: "",
  facebookUrl: "",
  youtubeUrl: "",
  workingHoursWeekday: "",
  workingHoursLunch: "",
  workingHoursWeekend: "",
  copyrightText: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImageUrl: ""
};

function toFormState(dto: SiteSettingDto): FormState {
  return {
    siteName: dto.siteName,
    shortName: dto.shortName,
    slogan: dto.slogan ?? "",
    description: dto.description ?? "",
    logoUrl: dto.logoUrl,
    address: dto.address ?? "",
    hotline: dto.hotline ?? "",
    officePhone: dto.officePhone ?? "",
    email: dto.email ?? "",
    facebookUrl: dto.facebookUrl ?? "",
    youtubeUrl: dto.youtubeUrl ?? "",
    workingHoursWeekday: dto.workingHoursWeekday ?? "",
    workingHoursLunch: dto.workingHoursLunch ?? "",
    workingHoursWeekend: dto.workingHoursWeekend ?? "",
    copyrightText: dto.copyrightText ?? "",
    seoTitle: dto.seoTitle ?? "",
    seoDescription: dto.seoDescription ?? "",
    seoKeywords: dto.seoKeywords ?? "",
    ogImageUrl: dto.ogImageUrl ?? ""
  };
}

/** Chuỗi rỗng -> null (xoá giá trị cũ), field bắt buộc (siteName/shortName/logoUrl) giữ chuỗi rỗng
 * nguyên trạng để BE tự áp @default nếu cần — nhưng thực tế input đã required nên không xảy ra. */
function toRequestPayload(form: FormState): UpdateSiteSettingRequest {
  const nullableIfEmpty = (value: string) => (value.trim() === "" ? null : value);
  return {
    siteName: form.siteName,
    shortName: form.shortName,
    slogan: nullableIfEmpty(form.slogan),
    description: nullableIfEmpty(form.description),
    logoUrl: form.logoUrl,
    address: nullableIfEmpty(form.address),
    hotline: nullableIfEmpty(form.hotline),
    officePhone: nullableIfEmpty(form.officePhone),
    email: nullableIfEmpty(form.email),
    facebookUrl: nullableIfEmpty(form.facebookUrl),
    youtubeUrl: nullableIfEmpty(form.youtubeUrl),
    workingHoursWeekday: nullableIfEmpty(form.workingHoursWeekday),
    workingHoursLunch: nullableIfEmpty(form.workingHoursLunch),
    workingHoursWeekend: nullableIfEmpty(form.workingHoursWeekend),
    copyrightText: nullableIfEmpty(form.copyrightText),
    seoTitle: nullableIfEmpty(form.seoTitle),
    seoDescription: nullableIfEmpty(form.seoDescription),
    seoKeywords: nullableIfEmpty(form.seoKeywords),
    ogImageUrl: nullableIfEmpty(form.ogImageUrl)
  };
}

export function SiteSettingsPage() {
  const { open } = useNotification();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<SiteSettingDto>("/admin/site-settings")
      .then((data) => {
        if (!cancelled) setForm(toFormState(data));
      })
      .catch(() => {
        if (!cancelled) {
          open?.({
            type: "error",
            message: "Không tải được cấu hình chung",
            description: "Vui lòng tải lại trang."
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiFetch<SiteSettingDto>("/admin/site-settings", {
        method: "PATCH",
        body: toRequestPayload(form)
      });
      setForm(toFormState(updated));
      open?.({ type: "success", message: "Đã lưu cấu hình chung" });
    } catch {
      open?.({
        type: "error",
        message: "Lưu thất bại",
        description: "Vui lòng kiểm tra lại thông tin và thử lại."
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Cấu hình chung</h1>
        <p className="text-sm text-muted-foreground">
          Logo, slogan, thông tin liên hệ và cấu hình SEO mặc định — hiển thị ở đầu trang/footer và thẻ
          &lt;title&gt; trên trang công khai, không cần sửa code khi thay đổi.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Nhận diện thương hiệu</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Tên đầy đủ</Label>
              <Input
                id="siteName"
                required
                value={form.siteName}
                onChange={(event) => setField("siteName", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortName">Tên viết tắt (hiển thị ở logo/header)</Label>
              <Input
                id="shortName"
                required
                value={form.shortName}
                onChange={(event) => setField("shortName", event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="slogan">Khẩu hiệu (slogan)</Label>
              <Input id="slogan" value={form.slogan} onChange={(event) => setField("slogan", event.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="description">Giới thiệu ngắn (hiển thị ở footer)</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="logoUrl">Đường dẫn ảnh logo</Label>
              <Input
                id="logoUrl"
                required
                placeholder="/logo.png"
                value={form.logoUrl}
                onChange={(event) => setField("logoUrl", event.target.value)}
              />
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Xem trước logo" className="mt-1 size-14 rounded-full border object-contain p-1" />
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" value={form.address} onChange={(event) => setField("address", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hotline">Hotline</Label>
              <Input id="hotline" value={form.hotline} onChange={(event) => setField("hotline", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="officePhone">Điện thoại văn phòng</Label>
              <Input
                id="officePhone"
                value={form.officePhone}
                onChange={(event) => setField("officePhone", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </div>
            <div />
            <div className="grid gap-2">
              <Label htmlFor="facebookUrl">Đường dẫn Facebook</Label>
              <Input
                id="facebookUrl"
                placeholder="https://facebook.com/..."
                value={form.facebookUrl}
                onChange={(event) => setField("facebookUrl", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="youtubeUrl">Đường dẫn Youtube</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://youtube.com/..."
                value={form.youtubeUrl}
                onChange={(event) => setField("youtubeUrl", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giờ hành chính</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="workingHoursWeekday">Ngày thường</Label>
              <Input
                id="workingHoursWeekday"
                value={form.workingHoursWeekday}
                onChange={(event) => setField("workingHoursWeekday", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workingHoursLunch">Nghỉ trưa</Label>
              <Input
                id="workingHoursLunch"
                value={form.workingHoursLunch}
                onChange={(event) => setField("workingHoursLunch", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workingHoursWeekend">Cuối tuần</Label>
              <Input
                id="workingHoursWeekend"
                value={form.workingHoursWeekend}
                onChange={(event) => setField("workingHoursWeekend", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bản quyền</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor="copyrightText">Dòng chữ cuối footer (không cần ghi năm — trang tự thêm năm hiện tại)</Label>
            <Input
              id="copyrightText"
              value={form.copyrightText}
              onChange={(event) => setField("copyrightText", event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình SEO mặc định</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="seoTitle">Tiêu đề trang (thẻ &lt;title&gt;)</Label>
              <Input id="seoTitle" value={form.seoTitle} onChange={(event) => setField("seoTitle", event.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="seoDescription">Mô tả (meta description)</Label>
              <Textarea
                id="seoDescription"
                rows={3}
                value={form.seoDescription}
                onChange={(event) => setField("seoDescription", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoKeywords">Từ khoá (meta keywords, cách nhau bởi dấu phẩy)</Label>
              <Input
                id="seoKeywords"
                value={form.seoKeywords}
                onChange={(event) => setField("seoKeywords", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ogImageUrl">Ảnh chia sẻ mạng xã hội (og:image)</Label>
              <Input
                id="ogImageUrl"
                placeholder="/og-image.jpg"
                value={form.ogImageUrl}
                onChange={(event) => setField("ogImageUrl", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </form>
    </div>
  );
}
