import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORIES, PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS } from "@congdoan/types";
import type { CreatePublicServiceProcedureRequest, PublicServiceProcedureCategory, PublicServiceProcedureDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface PublicServiceProcedureFormProps {
  mode: "create" | "edit";
}

/** 8 trường hướng dẫn (nhóm 2) trình bày dạng textarea theo đúng thứ tự mẫu cố định người quản trị đã
 * chốt: Điều kiện → Hồ sơ cần chuẩn bị → Nơi thực hiện → Các bước thao tác → Phí/lệ phí → Thời hạn →
 * Cách nhận kết quả → Lỗi thường gặp. */
const GUIDE_FIELDS: { key: keyof CreatePublicServiceProcedureRequest; label: string; placeholder: string }[] = [
  { key: "conditions", label: "1. Điều kiện", placeholder: "Ai được làm thủ tục này, cần đáp ứng điều kiện gì..." },
  { key: "requiredDocuments", label: "2. Hồ sơ cần chuẩn bị", placeholder: "Danh sách giấy tờ cần mang theo..." },
  { key: "whereToApply", label: "3. Nơi thực hiện", placeholder: "Cơ quan/cổng dịch vụ công thực hiện thủ tục..." },
  { key: "steps", label: "4. Các bước thao tác", placeholder: "1) ... 2) ... 3) ..." },
  { key: "fee", label: "5. Phí/lệ phí", placeholder: "Mức phí, lệ phí (nếu có)..." },
  { key: "processingTime", label: "6. Thời hạn", placeholder: "Thời gian xử lý hồ sơ..." },
  { key: "resultDelivery", label: "7. Cách nhận kết quả", placeholder: "Nhận trực tiếp/qua bưu điện/online..." },
  { key: "commonMistakes", label: "8. Lỗi thường gặp", placeholder: "Những sai sót người dân hay gặp phải..." }
];

/** Dùng chung cho tạo mới và chỉnh sửa thủ tục dịch vụ công — theo khuôn AiToolForm.tsx, mở rộng thêm
 * 8 trường hướng dẫn nhóm 2. */
export function PublicServiceProcedureForm({ mode }: PublicServiceProcedureFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: itemResult, isLoading: itemLoading } = useOne<PublicServiceProcedureDto>({
    resource: "public-service-procedures",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createItem, isLoading: isCreating } = useCreate();
  const { mutate: updateItem, isLoading: isUpdating } = useUpdate();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PublicServiceProcedureCategory>("KHAC");
  const [summary, setSummary] = useState("");
  const [guideValues, setGuideValues] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState<"true" | "false">("false");

  useEffect(() => {
    if (mode === "edit" && itemResult?.data) {
      const item = itemResult.data;
      setSlug(item.slug);
      setTitle(item.title);
      setCategory(item.category);
      setSummary(item.summary ?? "");
      setGuideValues({
        conditions: item.conditions ?? "",
        requiredDocuments: item.requiredDocuments ?? "",
        whereToApply: item.whereToApply ?? "",
        steps: item.steps ?? "",
        fee: item.fee ?? "",
        processingTime: item.processingTime ?? "",
        resultDelivery: item.resultDelivery ?? "",
        commonMistakes: item.commonMistakes ?? ""
      });
      setSortOrder(String(item.sortOrder));
      setIsActive(item.isActive ? "true" : "false");
    }
  }, [mode, itemResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && itemLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreatePublicServiceProcedureRequest = {
      slug: slug.trim(),
      title,
      category,
      summary: summary.trim() || undefined,
      conditions: guideValues.conditions?.trim() || undefined,
      requiredDocuments: guideValues.requiredDocuments?.trim() || undefined,
      whereToApply: guideValues.whereToApply?.trim() || undefined,
      steps: guideValues.steps?.trim() || undefined,
      fee: guideValues.fee?.trim() || undefined,
      processingTime: guideValues.processingTime?.trim() || undefined,
      resultDelivery: guideValues.resultDelivery?.trim() || undefined,
      commonMistakes: guideValues.commonMistakes?.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      isActive: isActive === "true"
    };

    if (mode === "create") {
      createItem(
        { resource: "public-service-procedures", values: payload },
        { onSuccess: () => navigate("/public-service-procedures") }
      );
    } else if (id) {
      updateItem(
        { resource: "public-service-procedures", id, values: payload },
        { onSuccess: () => navigate("/public-service-procedures") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm thủ tục dịch vụ công" : "Sửa thủ tục dịch vụ công"}</h1>

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tên thủ tục</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (dùng cho đường dẫn trang chi tiết)</Label>
              <Input
                id="slug"
                required
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="vd: cap-doi-the-can-cuoc"
              />
              <p className="text-xs text-muted-foreground">Chỉ gồm chữ thường, số và dấu gạch ngang, không dấu cách.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Nhóm thủ tục (Tra cứu nhanh)</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as PublicServiceProcedureCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PUBLIC_SERVICE_PROCEDURE_CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">Mô tả ngắn (hiện ở thẻ/lưới danh sách)</Label>
              <Textarea id="summary" rows={2} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium">Hướng dẫn từng bước (8 phần)</p>
              <p className="text-xs text-muted-foreground">Bỏ trống phần nào chưa có nội dung — trang công khai chỉ hiện phần có nội dung.</p>
            </div>

            {GUIDE_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Textarea
                  id={field.key}
                  rows={3}
                  value={guideValues[field.key] ?? ""}
                  onChange={(event) => setGuideValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div className="border-t pt-4" />

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select value={isActive} onValueChange={(value) => setIsActive(value as "true" | "false")}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Nháp — chưa rà soát, KHÔNG hiện ở trang công khai</SelectItem>
                  <SelectItem value="true">Đã duyệt — hiện ở trang công khai</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chỉ chuyển sang "Đã duyệt" sau khi đã kiểm tra nội dung còn đúng quy định hiện hành.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/public-service-procedures")}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
