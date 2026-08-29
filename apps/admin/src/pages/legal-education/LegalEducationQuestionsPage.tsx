import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type { CreateLegalExamQuestionRequest, LegalEducationCampaignDetailDto, LegalExamQuestionDto } from "@congdoan/types";
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

type FormState = { mode: "create" } | { mode: "edit"; question: LegalExamQuestionDto };

export function LegalEducationQuestionsPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: result,
    isLoading,
    refetch
  } = useOne<LegalEducationCampaignDetailDto>({
    resource: "legal-education-campaigns",
    id: campaignId,
    queryOptions: { enabled: Boolean(campaignId) }
  });
  const campaign = result?.data;

  const [formState, setFormState] = useState<FormState | null>(null);
  const [text, setText] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [correctOptionIndex, setCorrectOptionIndex] = useState("0");
  const [sortOrder, setSortOrder] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LegalExamQuestionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (formState?.mode === "edit") {
      const q = formState.question;
      setText(q.text);
      setOptionsText(q.options.join("\n"));
      setCorrectOptionIndex(String(q.correctOptionIndex));
      setSortOrder(String(q.sortOrder));
    } else if (formState?.mode === "create") {
      setText("");
      setOptionsText("");
      setCorrectOptionIndex("0");
      setSortOrder(String((campaign?.questions.length ?? 0) * 10));
    }
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignId || !formState) return;
    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (options.length < 2) {
      setFormError("Cần ít nhất 2 lựa chọn (mỗi lựa chọn 1 dòng).");
      return;
    }
    const correct = Number(correctOptionIndex);
    if (Number.isNaN(correct) || correct < 0 || correct >= options.length) {
      setFormError("Đáp án đúng phải là chỉ số 0-based khớp một lựa chọn.");
      return;
    }
    const payload: CreateLegalExamQuestionRequest = {
      text,
      options,
      correctOptionIndex: correct,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined
    };
    setIsSaving(true);
    setFormError(null);
    try {
      if (formState.mode === "create") {
        await apiFetch(`/admin/legal-education/campaigns/${campaignId}/exam/questions`, { method: "POST", body: payload });
      } else {
        await apiFetch(`/admin/legal-education/campaigns/${campaignId}/exam/questions/${formState.question.id}`, {
          method: "PATCH",
          body: payload
        });
      }
      setFormState(null);
      await refetch();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không thể lưu câu hỏi.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!campaignId || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/admin/legal-education/campaigns/${campaignId}/exam/questions/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await refetch();
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <PageLoading />;
  if (!campaign) {
    return <p className="text-sm text-destructive">Không tìm thấy đợt phổ biến này.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/legal-education-campaigns")}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-semibold">Câu hỏi — {campaign.title}</h1>
        <p className="text-muted-foreground">{campaign.questions.length} câu hỏi. Đáp án đánh dấu (*) chỉ hiện ở trang quản trị.</p>
      </div>

      <div className="flex flex-col gap-3">
        {campaign.questions.map((q, index) => (
          <Card key={q.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {index + 1}. {q.text}
                </p>
                <ul className="mt-2 list-inside text-sm text-muted-foreground">
                  {q.options.map((opt, i) => (
                    <li key={opt}>
                      {i === q.correctOptionIndex ? <Badge variant="outline">Đúng</Badge> : null} {opt}
                    </li>
                  ))}
                </ul>
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
            </CardContent>
          </Card>
        ))}
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
                <Label htmlFor="q-text">Nội dung</Label>
                <Textarea id="q-text" required rows={3} value={text} onChange={(event) => setText(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="q-options">Các lựa chọn (mỗi dòng 1 lựa chọn)</Label>
                <Textarea id="q-options" rows={5} value={optionsText} onChange={(event) => setOptionsText(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Đáp án đúng</Label>
                <Select value={correctOptionIndex} onValueChange={setCorrectOptionIndex}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {optionsText
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((opt, i) => (
                        <SelectItem key={`${i}-${opt}`} value={String(i)}>
                          Lựa chọn {i + 1}: {opt.slice(0, 80)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="q-sort">Thứ tự</Label>
                <Input id="q-sort" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
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
        description={`Bạn có chắc chắn muốn xoá câu hỏi này? Các câu trả lời đã ghi nhận cũng sẽ bị xoá.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
