import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateLegalEducationCampaignRequest, LegalEducationCampaignDetailDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface LegalEducationCampaignFormProps {
  mode: "create" | "edit";
}

function isoToLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LegalEducationCampaignForm({ mode }: LegalEducationCampaignFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading } = useOne<LegalEducationCampaignDetailDto>({
    resource: "legal-education-campaigns",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createItem, isLoading: isCreating } = useCreate();
  const { mutate: updateItem, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [isPublished, setIsPublished] = useState<"true" | "false">("false");
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [passingScorePercent, setPassingScorePercent] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [revealAnswers, setRevealAnswers] = useState<"true" | "false">("false");
  const [shuffleQuestions, setShuffleQuestions] = useState<"true" | "false">("true");
  const [shuffleOptions, setShuffleOptions] = useState<"true" | "false">("true");
  const [examIsOpen, setExamIsOpen] = useState<"true" | "false">("false");
  const [examStartAt, setExamStartAt] = useState("");
  const [examEndAt, setExamEndAt] = useState("");

  useEffect(() => {
    if (mode === "edit" && result?.data) {
      const item = result.data;
      setTitle(item.title);
      setPeriodLabel(item.periodLabel ?? "");
      setSummary(item.summary ?? "");
      setIsPublished(item.isPublished ? "true" : "false");
      setExamTitle(item.exam?.title ?? "");
      setExamDescription(item.exam?.description ?? "");
      setDurationMinutes(String(item.exam?.durationMinutes ?? 30));
      setPassingScorePercent(String(item.exam?.passingScorePercent ?? 70));
      setMaxAttempts(String(item.exam?.maxAttempts ?? 1));
      setRevealAnswers(item.exam?.revealAnswers ? "true" : "false");
      setShuffleQuestions(item.exam?.shuffleQuestions !== false ? "true" : "false");
      setShuffleOptions(item.exam?.shuffleOptions !== false ? "true" : "false");
      setExamIsOpen(item.exam?.isOpen ? "true" : "false");
      setExamStartAt(isoToLocalInputValue(item.exam?.startAt));
      setExamEndAt(isoToLocalInputValue(item.exam?.endAt));
    }
  }, [mode, result]);

  const isSaving = isCreating || isUpdating;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: CreateLegalEducationCampaignRequest = {
      title,
      periodLabel: periodLabel.trim() || undefined,
      summary: summary.trim() || undefined,
      isPublished: isPublished === "true",
      examTitle: examTitle.trim() || undefined,
      examDescription: examDescription.trim() || undefined,
      durationMinutes: Number(durationMinutes) || 30,
      passingScorePercent: Number(passingScorePercent) || 70,
      maxAttempts: Number(maxAttempts) || 1,
      revealAnswers: revealAnswers === "true",
      shuffleQuestions: shuffleQuestions === "true",
      shuffleOptions: shuffleOptions === "true",
      examIsOpen: examIsOpen === "true",
      examStartAt: examStartAt ? new Date(examStartAt).toISOString() : undefined,
      examEndAt: examEndAt ? new Date(examEndAt).toISOString() : undefined
    };

    if (mode === "create") {
      createItem(
        { resource: "legal-education-campaigns", values: payload },
        { onSuccess: (created) => navigate(`/legal-education-campaigns/${String(created.data.id)}/materials`) }
      );
    } else if (id) {
      updateItem({ resource: "legal-education-campaigns", id, values: payload }, { onSuccess: () => navigate("/legal-education-campaigns") });
    }
  }

  if (mode === "edit" && isLoading) return <PageLoading />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm đợt phổ biến pháp luật" : "Sửa đợt phổ biến pháp luật"}</h1>
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề đợt</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="periodLabel">Nhãn thời gian (vd Quý III năm 2026)</Label>
              <Input id="periodLabel" value={periodLabel} onChange={(event) => setPeriodLabel(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea id="summary" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Xuất bản tài liệu</Label>
              <Select value={isPublished} onValueChange={(value) => setIsPublished(value as "true" | "false")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Công khai — hiện trên trang tiện ích số</SelectItem>
                  <SelectItem value="false">Nháp — chỉ thấy trong quản trị</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h2 className="pt-2 text-lg font-semibold">Cấu hình bài thi</h2>
            <div className="grid gap-2">
              <Label htmlFor="examTitle">Tiêu đề bài thi</Label>
              <Input id="examTitle" value={examTitle} onChange={(event) => setExamTitle(event.target.value)} placeholder="Để trống sẽ dùng tiêu đề đợt + Trắc nghiệm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="examDescription">Mô tả bài thi</Label>
              <Textarea id="examDescription" rows={3} value={examDescription} onChange={(event) => setExamDescription(event.target.value)} />
            </div>
            <div className="grid gap-2 sm:grid-cols-3 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="durationMinutes">Thời gian (phút)</Label>
                <Input id="durationMinutes" type="number" min={1} value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passingScorePercent">Điểm đạt (%)</Label>
                <Input id="passingScorePercent" type="number" min={0} max={100} value={passingScorePercent} onChange={(event) => setPassingScorePercent(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxAttempts">Số lần thi</Label>
                <Input id="maxAttempts" type="number" min={1} value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label>Hiện đáp án sau khi nộp</Label>
                <Select value={revealAnswers} onValueChange={(value) => setRevealAnswers(value as "true" | "false")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Không — chỉ hiện điểm đạt/không đạt</SelectItem>
                    <SelectItem value="true">Có — hiện đáp án đúng/sai từng câu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Trạng thái thi</Label>
                <Select value={examIsOpen} onValueChange={(value) => setExamIsOpen(value as "true" | "false")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Chưa mở thi</SelectItem>
                    <SelectItem value="true">Đang mở thi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label>Xáo câu hỏi</Label>
                <Select value={shuffleQuestions} onValueChange={(value) => setShuffleQuestions(value as "true" | "false")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Có</SelectItem>
                    <SelectItem value="false">Không</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Xáo lựa chọn</Label>
                <Select value={shuffleOptions} onValueChange={(value) => setShuffleOptions(value as "true" | "false")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Có</SelectItem>
                    <SelectItem value="false">Không</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="examStartAt">Mở thi từ (không bắt buộc)</Label>
                <Input id="examStartAt" type="datetime-local" value={examStartAt} onChange={(event) => setExamStartAt(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="examEndAt">Đóng thi (không bắt buộc)</Label>
                <Input id="examEndAt" type="datetime-local" value={examEndAt} onChange={(event) => setExamEndAt(event.target.value)} />
              </div>
            </div>

            {mode === "create" ? (
              <p className="text-xs text-muted-foreground">Sau khi lưu, bạn sẽ được chuyển sang màn hình thêm tài liệu cho đợt này.</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/legal-education-campaigns")}>
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
