import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type {
  CreateSurveyQuestionRequest,
  SurveyDetailDto,
  SurveyQuestionDto,
  SurveyQuestionType
} from "@congdoan/types";
import { apiFetch, ApiError } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

type FormState = { mode: "create" } | { mode: "edit"; question: SurveyQuestionDto };

/** Trình thêm/sửa câu hỏi cho 1 khảo sát — tách khỏi SurveyForm.tsx (chỉ sửa metadata) vì đây là CRUD
 * trên tài nguyên con (SurveyQuestion), không có trong data-provider.ts nên gọi thẳng apiFetch thay vì
 * qua useCreate/useUpdate/useDelete của Refine (giống cách OfficialDocumentForm.tsx quản lý file đính
 * kèm). Không có kéo-thả sắp xếp — dùng field "sortOrder" dạng số, đúng khuôn Category/HomeSlide đã
 * dùng trong toàn dự án thay vì tự xây UI kéo-thả riêng cho mỗi module. */
export function SurveyQuestionsPage() {
  const { id: surveyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: surveyResult,
    isLoading: surveyLoading,
    refetch
  } = useOne<SurveyDetailDto>({ resource: "surveys", id: surveyId, queryOptions: { enabled: Boolean(surveyId) } });
  const survey = surveyResult?.data;

  const [formState, setFormState] = useState<FormState | null>(null);
  const [text, setText] = useState("");
  const [type, setType] = useState<SurveyQuestionType>("SINGLE_CHOICE");
  const [optionsText, setOptionsText] = useState("");
  const [isRequired, setIsRequired] = useState<"true" | "false">("true");
  const [sortOrder, setSortOrder] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SurveyQuestionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (formState?.mode === "edit") {
      const q = formState.question;
      setText(q.text);
      setType(q.type);
      setOptionsText((q.options ?? []).join("\n"));
      setIsRequired(q.isRequired ? "true" : "false");
      setSortOrder(String(q.sortOrder));
    } else if (formState?.mode === "create") {
      setText("");
      setType("SINGLE_CHOICE");
      setOptionsText("");
      setIsRequired("true");
      setSortOrder(String((survey?.questions.length ?? 0) * 10));
    }
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ cần chạy lại khi đổi formState, không phụ thuộc survey (chỉ đọc lúc mở form "create").
  }, [formState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!surveyId || !formState) return;
    setFormError(null);

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (type === "SINGLE_CHOICE" && options.length < 2) {
      setFormError("Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn (mỗi lựa chọn 1 dòng).");
      return;
    }

    const payload: CreateSurveyQuestionRequest = {
      text,
      type,
      options: type === "SINGLE_CHOICE" ? options : undefined,
      isRequired: isRequired === "true",
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined
    };

    setIsSaving(true);
    try {
      if (formState.mode === "create") {
        await apiFetch(`/admin/surveys/${surveyId}/questions`, { method: "POST", body: payload });
      } else {
        await apiFetch(`/admin/surveys/${surveyId}/questions/${formState.question.id}`, {
          method: "PATCH",
          body: payload
        });
      }
      setFormState(null);
      await refetch();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không thể lưu câu hỏi, vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!surveyId || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/admin/surveys/${surveyId}/questions/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await refetch();
    } finally {
      setIsDeleting(false);
    }
  }

  if (surveyLoading) {
    return <PageLoading />;
  }

  if (!survey) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">Không tìm thấy khảo sát này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/surveys")}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách khảo sát
        </Button>
        <h1 className="text-2xl font-semibold">Câu hỏi — {survey.title}</h1>
        <p className="text-muted-foreground">{survey.questions.length} câu hỏi.</p>
      </div>

      <div className="flex flex-col gap-3">
        {survey.questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="flex flex-col gap-2 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{q.text}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{q.type === "SINGLE_CHOICE" ? "Trắc nghiệm 1 đáp án" : "Tự luận"}</Badge>
                    {q.isRequired ? <Badge variant="secondary">Bắt buộc</Badge> : null}
                  </div>
                  {q.options && q.options.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {q.options.map((opt) => (
                        <li key={opt}>{opt}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFormState({ mode: "edit", question: q })}>
                    <Pencil className="size-4" />
                    Sửa
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(q)}>
                    <Trash2 className="size-4" />
                    Xoá
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {survey.questions.length === 0 && formState === null ? (
          <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào — bấm "Thêm câu hỏi" bên dưới để bắt đầu.</p>
        ) : null}
      </div>

      {formState === null ? (
        <Button variant="outline" className="w-fit" onClick={() => setFormState({ mode: "create" })}>
          <Plus className="size-4" />
          Thêm câu hỏi
        </Button>
      ) : (
        <Card className="max-w-xl">
          <CardContent className="pt-6">
            <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
              <h2 className="font-semibold">{formState.mode === "create" ? "Thêm câu hỏi" : "Sửa câu hỏi"}</h2>

              <div className="grid gap-2">
                <Label htmlFor="q-text">Nội dung câu hỏi</Label>
                <Textarea id="q-text" required rows={2} value={text} onChange={(event) => setText(event.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="q-type">Loại câu hỏi</Label>
                <Select value={type} onValueChange={(value) => setType(value as SurveyQuestionType)}>
                  <SelectTrigger id="q-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</SelectItem>
                    <SelectItem value="TEXT">Tự luận (nhập chữ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "SINGLE_CHOICE" ? (
                <div className="grid gap-2">
                  <Label htmlFor="q-options">Các lựa chọn (mỗi lựa chọn 1 dòng)</Label>
                  <Textarea
                    id="q-options"
                    rows={4}
                    value={optionsText}
                    onChange={(event) => setOptionsText(event.target.value)}
                    placeholder={"Rất hài lòng\nHài lòng\nKhông hài lòng"}
                  />
                  <p className="text-xs text-muted-foreground">Cần ít nhất 2 lựa chọn.</p>
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="q-required">Bắt buộc trả lời</Label>
                <Select value={isRequired} onValueChange={(value) => setIsRequired(value as "true" | "false")}>
                  <SelectTrigger id="q-required">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Có — bắt buộc</SelectItem>
                    <SelectItem value="false">Không — có thể bỏ qua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="q-sortOrder">Thứ tự hiển thị</Label>
                <Input
                  id="q-sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                />
              </div>

              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormState(null)}>
                  Huỷ
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : "Lưu câu hỏi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá câu hỏi"
        description={`Bạn có chắc chắn muốn xoá câu hỏi "${deleteTarget?.text ?? ""}"? Các câu trả lời đã ghi nhận cho câu hỏi này cũng sẽ bị xoá theo.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
