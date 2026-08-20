import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateSurveyRequest, SurveyDetailDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface SurveyFormProps {
  mode: "create" | "edit";
}

/** Chuyển ISO datetime sang "YYYY-MM-DDTHH:mm" cho input[type=datetime-local] — giống EventForm.tsx. */
function isoToLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Dùng chung cho tạo mới và chỉnh sửa THÔNG TIN khảo sát (tiêu đề/mô tả/thời gian/trạng thái) — quản
 * lý câu hỏi tách riêng ở SurveyQuestionsPage.tsx (mở sau khi đã tạo khảo sát). Không có field
 * "isAnonymous" trên form — MVP luôn ẩn danh (xem ghi chú model Survey, prisma/schema.prisma), hiện
 * chưa có nghĩa nếu cho sửa vì SurveyResponse chưa từng lưu userId trong mọi trường hợp. */
export function SurveyForm({ mode }: SurveyFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: surveyResult, isLoading: surveyLoading } = useOne<SurveyDetailDto>({
    resource: "surveys",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createSurvey, isLoading: isCreating } = useCreate();
  const { mutate: updateSurvey, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isOpen, setIsOpen] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && surveyResult?.data) {
      const survey = surveyResult.data;
      setTitle(survey.title);
      setDescription(survey.description ?? "");
      setStartAt(isoToLocalInputValue(survey.startAt));
      setEndAt(isoToLocalInputValue(survey.endAt));
      setIsOpen(survey.isOpen ? "true" : "false");
    }
  }, [mode, surveyResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && surveyLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateSurveyRequest = {
      title,
      description: description.trim() || undefined,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      isOpen: isOpen === "true"
    };

    if (mode === "create") {
      createSurvey(
        { resource: "surveys", values: payload },
        { onSuccess: (result) => navigate(`/surveys/${String(result.data.id)}/questions`) }
      );
    } else if (id) {
      updateSurvey({ resource: "surveys", id, values: payload }, { onSuccess: () => navigate("/surveys") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm khảo sát" : "Sửa khảo sát"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề khảo sát</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Mục đích khảo sát, đối tượng tham gia..."
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startAt">Bắt đầu (không bắt buộc)</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endAt">Hết hạn (không bắt buộc)</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={(event) => setEndAt(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isOpen">Trạng thái</Label>
              <Select value={isOpen} onValueChange={(value) => setIsOpen(value as "true" | "false")}>
                <SelectTrigger id="isOpen">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang mở — hiện ở trang công khai, nhận câu trả lời</SelectItem>
                  <SelectItem value="false">Đã đóng — ẩn khỏi trang công khai, vẫn xem được kết quả</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "create" ? (
              <p className="text-xs text-muted-foreground">
                Sau khi lưu, bạn sẽ được chuyển sang màn hình thêm câu hỏi cho khảo sát này.
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/surveys")}>
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
