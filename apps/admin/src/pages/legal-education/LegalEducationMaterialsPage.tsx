import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import type { CreateLegalEducationMaterialRequest, LegalEducationCampaignDetailDto, LegalEducationMaterialDto } from "@congdoan/types";
import { apiFetch, ApiError } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import { FileUploadField } from "../../components/common/FileUploadField";
import { RichTextEditor } from "../../components/common/RichTextEditor";

type FormState = { mode: "create" } | { mode: "edit"; material: LegalEducationMaterialDto };

export function LegalEducationMaterialsPage() {
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
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState<"true" | "false">("true");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LegalEducationMaterialDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (formState?.mode === "edit") {
      const m = formState.material;
      setTitle(m.title);
      setExcerpt(m.excerpt ?? "");
      setContent(m.content);
      setFileUrl(m.fileUrl ?? "");
      setSortOrder(String(m.sortOrder));
      setIsPublished(m.isPublished ? "true" : "false");
    } else if (formState?.mode === "create") {
      setTitle("");
      setExcerpt("");
      setContent("");
      setFileUrl("");
      setSortOrder(String((campaign?.materials.length ?? 0) * 10));
      setIsPublished("true");
    }
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campaignId || !formState) return;
    const payload: CreateLegalEducationMaterialRequest = {
      title,
      excerpt: excerpt.trim() || undefined,
      content,
      fileUrl: fileUrl.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      isPublished: isPublished === "true"
    };
    setIsSaving(true);
    setFormError(null);
    try {
      if (formState.mode === "create") {
        await apiFetch(`/admin/legal-education/campaigns/${campaignId}/materials`, { method: "POST", body: payload });
      } else {
        await apiFetch(`/admin/legal-education/campaigns/${campaignId}/materials/${formState.material.id}`, {
          method: "PATCH",
          body: payload
        });
      }
      setFormState(null);
      await refetch();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không thể lưu tài liệu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!campaignId || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/admin/legal-education/campaigns/${campaignId}/materials/${deleteTarget.id}`, { method: "DELETE" });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/legal-education-campaigns")}>
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-semibold">Tài liệu — {campaign.title}</h1>
          <p className="text-muted-foreground">{campaign.materials.length} tài liệu.</p>
        </div>
        <Button className="w-fit shrink-0" onClick={() => setFormState({ mode: "create" })}>
          <Plus className="size-4" />
          Thêm tài liệu
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {campaign.materials.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-medium">{m.title}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant={m.isPublished ? "default" : "secondary"}>{m.isPublished ? "Công khai" : "Nháp"}</Badge>
                  {m.fileUrl ? <Badge variant="outline">Có file</Badge> : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => setFormState({ mode: "edit", material: m })}>
                  <Pencil className="size-4" />
                  Sửa
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(m)}>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formState?.mode === "create" ? "Thêm tài liệu" : "Sửa tài liệu"}</DialogTitle>
            <DialogDescription>
              Soạn nội dung tóm tắt và tải file PDF/Word đính kèm nếu có.
            </DialogDescription>
          </DialogHeader>
          <form id="legal-material-form" className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-2">
              <Label htmlFor="m-title">Tiêu đề</Label>
              <Input id="m-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-excerpt">Tóm tắt ngắn</Label>
              <Input id="m-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Nội dung</Label>
              <RichTextEditor value={content} onChange={setContent} placeholder="Soạn nội dung tóm tắt..." />
            </div>
            <FileUploadField
              id="m-fileUrl"
              label="File đính kèm"
              value={fileUrl}
              onChange={setFileUrl}
              placeholder="/tai-lieu/phap-luat/tt_53_bgddt.pdf"
            />
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="m-sort">Thứ tự</Label>
                <Input id="m-sort" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Hiển thị</Label>
                <Select value={isPublished} onValueChange={(value) => setIsPublished(value as "true" | "false")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Công khai</SelectItem>
                    <SelectItem value="false">Nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => setFormState(null)}>
              Huỷ
            </Button>
            <Button type="submit" form="legal-material-form" disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu tài liệu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá tài liệu"
        description={`Bạn có chắc chắn muốn xoá tài liệu "${deleteTarget?.title ?? ""}"?`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
