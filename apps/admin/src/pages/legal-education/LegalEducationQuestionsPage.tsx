import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Download, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import type {
  CreateLegalExamQuestionRequest,
  LegalEducationCampaignDetailDto,
  LegalExamQuestionDto,
  LegalExamQuestionImportResultDto
} from "@congdoan/types";
import { apiFetch, apiFetchUpload, ApiError } from "../../lib/api-client";
import { pushToast } from "../../components/common/toast-store";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<LegalExamQuestionImportResultDto | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refetch();
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmBulkDelete() {
    if (!campaignId || selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/admin/legal-education/campaigns/${campaignId}/exam/questions/bulk-delete`, {
        method: "POST",
        body: { ids: selectedIds }
      });
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      await refetch();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDownloadTemplate() {
    const content = [
      "Câu 1. Nội dung câu hỏi thứ nhất?",
      "",
      "A. Lựa chọn A",
      "B. Lựa chọn B",
      "C. Lựa chọn C",
      "D. Lựa chọn D",
      "",
      "Đáp án đúng: B",
      "",
      "Câu 2. Nội dung câu hỏi thứ hai?",
      "",
      "A. Lựa chọn A",
      "B. Lựa chọn B",
      "C. Lựa chọn C",
      "D. Lựa chọn D",
      "",
      "Đáp án đúng: A",
      ""
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "mau-ngan-hang-cau-hoi-phap-luat.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !campaignId) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiFetchUpload<LegalExamQuestionImportResultDto>(
        `/admin/legal-education/campaigns/${campaignId}/exam/questions/import`,
        formData
      );
      setImportResult(result);
      pushToast({
        variant: result.skipped > 0 ? "info" : "success",
        message: `Đã nhập ${result.created} câu hỏi`,
        description: result.skipped > 0 ? `Bỏ qua ${result.skipped} câu không đủ đáp án hoặc lựa chọn.` : undefined
      });
      await refetch();
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Nhập câu hỏi thất bại",
        description: error instanceof ApiError ? error.message : "Vui lòng dùng file .docx hoặc .txt theo mẫu."
      });
    } finally {
      setIsImporting(false);
    }
  }

  if (isLoading) return <PageLoading />;
  if (!campaign) {
    return <p className="text-sm text-destructive">Không tìm thấy đợt phổ biến này.</p>;
  }

  const questionIds = campaign.questions.map((q) => q.id);
  const allSelected = questionIds.length > 0 && questionIds.every((id) => selectedIds.includes(id));

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? questionIds : []);
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/legal-education-campaigns")}>
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-semibold">Câu hỏi — {campaign.title}</h1>
          <p className="text-muted-foreground">
            Ngân hàng {campaign.questions.length} câu
            {campaign.exam?.questionsPerAttempt
              ? ` · mỗi đề lấy ngẫu nhiên ${campaign.exam.questionsPerAttempt} câu`
              : " · mỗi đề dùng toàn bộ ngân hàng"}
            . Đáp án đánh dấu chỉ hiện ở trang quản trị. Nhập hàng loạt từ file Word/txt theo mẫu: mỗi câu bắt đầu
            bằng &quot;Câu 1.&quot;, các lựa chọn A–D, kết thúc bằng &quot;Đáp án đúng: B&quot;.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" className="w-fit" onClick={handleDownloadTemplate}>
            <Download className="size-4" />
            Tải file mẫu
          </Button>
          <Button
            variant="outline"
            className="w-fit"
            disabled={isImporting}
            onClick={() => importInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            {isImporting ? "Đang nhập..." : "Nhập từ Word"}
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(event) => void handleImportFileSelected(event)}
          />
          <Button className="w-fit" onClick={() => setFormState({ mode: "create" })}>
            <Plus className="size-4" />
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {campaign.questions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              aria-label="Chọn tất cả câu hỏi"
              checked={allSelected}
              onChange={(event) => toggleSelectAll(event.target.checked)}
            />
            Chọn tất cả
          </label>
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedIds.length === 0}
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Xoá đã chọn{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {campaign.questions.map((q, index) => (
          <Card key={q.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <label className="mt-1 flex shrink-0 items-center">
                <input
                  type="checkbox"
                  aria-label={`Chọn câu hỏi ${index + 1}`}
                  checked={selectedIds.includes(q.id)}
                  onChange={(event) => toggleSelect(q.id, event.target.checked)}
                />
              </label>
              <div className="min-w-0 flex-1">
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

      <Dialog
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) setFormState(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formState?.mode === "create" ? "Thêm câu hỏi" : "Sửa câu hỏi"}</DialogTitle>
            <DialogDescription>Mỗi lựa chọn một dòng. Chọn đáp án đúng từ danh sách.</DialogDescription>
          </DialogHeader>
          <form id="legal-question-form" className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
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
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setFormState(null)}>
              Huỷ
            </Button>
            <Button type="submit" form="legal-question-form" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu câu hỏi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá câu hỏi"
        description={`Bạn có chắc chắn muốn xoá câu hỏi này? Các câu trả lời đã ghi nhận cũng sẽ bị xoá.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        title="Xoá nhiều câu hỏi"
        description={`Bạn có chắc chắn muốn xoá ${selectedIds.length} câu hỏi đã chọn? Các câu trả lời đã ghi nhận cũng sẽ bị xoá.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
        onConfirm={() => void handleConfirmBulkDelete()}
      />

      <Dialog open={importResult !== null} onOpenChange={(open) => !open && setImportResult(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kết quả nhập câu hỏi</DialogTitle>
            <DialogDescription>
              Đã đọc {importResult?.parsed ?? 0} câu — nhập {importResult?.created ?? 0} câu
              {importResult && importResult.skipped > 0 ? `, bỏ qua ${importResult.skipped} câu` : ""}.
            </DialogDescription>
          </DialogHeader>
          {importResult && importResult.errors.length > 0 ? (
            <div className="flex flex-col gap-1 rounded-md border p-3 text-sm">
              {importResult.errors.map((err, index) => (
                <p key={`${err.questionNumber ?? "x"}-${index}`} className="text-destructive">
                  {err.message}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Mọi câu hỏi hợp lệ đã được thêm vào ngân hàng.</p>
          )}
          <DialogFooter>
            <Button onClick={() => setImportResult(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
