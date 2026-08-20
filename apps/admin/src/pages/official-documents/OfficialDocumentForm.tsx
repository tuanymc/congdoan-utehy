import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import { Download, Trash2, Upload } from "lucide-react";
import type {
  CreateOfficialDocumentRequest,
  DocumentDirection,
  DocumentStatus,
  DocumentTypeDto,
  OfficialDocumentDetailDto
} from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";
import { apiFetch, apiFetchBlob, apiFetchUpload } from "../../lib/api-client";
import { pushToast } from "../../components/common/toast-store";
import { DIRECTION_OPTIONS, STATUS_OPTIONS } from "./constants";

/** vd "2.4 MB" — chỉ dùng để hiển thị cho người chọn file xem trước khi tải lên. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface OfficialDocumentFormProps {
  mode: "create" | "edit";
}

/** Chuyển ISO datetime -> "YYYY-MM-DD" cho <input type="date">; input type=date đọc/ghi ngược lại được ngay. */
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}

/** Dùng chung cho tạo mới và chỉnh sửa công văn — điều khiển bởi prop `mode`. */
export function OfficialDocumentForm({ mode }: OfficialDocumentFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: typesResult, isLoading: typesLoading } = useList<DocumentTypeDto>({ resource: "document-types" });
  const {
    data: docResult,
    isLoading: docLoading,
    refetch: refetchDocument
  } = useOne<OfficialDocumentDetailDto>({
    resource: "official-documents",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createDocument, isLoading: isCreating } = useCreate<OfficialDocumentDetailDto>();
  const { mutate: updateDocument, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [direction, setDirection] = useState<DocumentDirection>("DRAFT");
  const [status, setStatus] = useState<DocumentStatus>("SAVE_DRAFT");
  const [priority, setPriority] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [issuingOfficeName, setIssuingOfficeName] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && docResult?.data) {
      const doc = docResult.data;
      setTitle(doc.title);
      setDocumentNumber(doc.documentNumber ?? "");
      setDocumentTypeId(doc.documentType.id);
      setDirection(doc.direction);
      setStatus(doc.status);
      setPriority(doc.priority ?? "");
      setIsPublic(doc.isPublic);
      setIssuingOfficeName(doc.issuingOfficeName ?? "");
      setIssuedAt(toDateInputValue(doc.issuedAt));
      setSentAt(toDateInputValue(doc.sentAt));
      setReceivedAt(toDateInputValue(doc.receivedAt));
      setSummary(doc.summary ?? "");
      setContent(doc.content ?? "");
    }
  }, [mode, docResult]);

  const documentTypes = typesResult?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && docLoading;
  const document = mode === "edit" ? docResult?.data : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateOfficialDocumentRequest = {
      title,
      documentNumber: documentNumber.trim() || undefined,
      content: content.trim() || undefined,
      summary: summary.trim() || undefined,
      direction,
      status,
      priority: priority.trim() || undefined,
      isPublic,
      documentTypeId,
      issuingOfficeName: issuingOfficeName.trim() || undefined,
      issuedAt: issuedAt || undefined,
      sentAt: sentAt || undefined,
      receivedAt: receivedAt || undefined
    };

    if (mode === "create") {
      createDocument(
        { resource: "official-documents", values: payload },
        {
          onSuccess: async (response) => {
            const newId = response.data?.id;
            // Đã chọn sẵn file trước khi bấm Lưu (xem card "File đính kèm" ở dưới) — công văn phải có id
            // thật (vừa tạo xong) mới upload được vì DocumentAttachment.documentId bắt buộc, không thể
            // upload trước khi có công văn. Lỗi upload ở đây KHÔNG chặn điều hướng — công văn đã lưu
            // thành công, chỉ báo lỗi để người dùng biết cần vào Sửa để thử tải lại file.
            if (newId && pendingFiles.length > 0) {
              await uploadFilesToDocument(newId, pendingFiles);
            }
            navigate("/official-documents");
          }
        }
      );
    } else if (id) {
      updateDocument(
        { resource: "official-documents", id, values: payload },
        { onSuccess: () => navigate("/official-documents") }
      );
    }
  }

  /** Dùng chung cho cả 2 luồng: upload ngay sau khi vừa tạo công văn (mode=create) và bấm nút "Tải lên"
   * trong card File đính kèm khi đang sửa (mode=edit). Field "files" lặp lại nhiều lần trong FormData
   * — khớp FilesInterceptor("files", 10) phía API, cho phép chọn 1 hoặc nhiều file cùng lúc. */
  async function uploadFilesToDocument(documentId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      await apiFetchUpload(`/admin/official-documents/${documentId}/attachments`, formData);
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Tải file lên thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    }
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const list = event.target.files;
    if (!list || list.length === 0) return;
    setPendingFiles((prev) => [...prev, ...Array.from(list)]);
    // Reset value để chọn lại đúng file vừa gỡ (bấm Xoá) vẫn kích hoạt lại được sự kiện change.
    event.target.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUploadPendingFiles() {
    if (!id || pendingFiles.length === 0) return;
    setIsUploading(true);
    try {
      await uploadFilesToDocument(id, pendingFiles);
      setPendingFiles([]);
      await refetchDocument();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!id) return;
    setDeletingAttachmentId(attachmentId);
    try {
      await apiFetch(`/admin/official-documents/${id}/attachments/${attachmentId}`, { method: "DELETE" });
      await refetchDocument();
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không xoá được file đính kèm",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setDeletingAttachmentId(null);
    }
  }

  async function handleDownload(attachmentId: string) {
    if (!id) return;
    setDownloadingId(attachmentId);
    try {
      const { blob, fileName } = await apiFetchBlob(`/admin/official-documents/${id}/attachments/${attachmentId}/download`);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không tải được file đính kèm",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setDownloadingId(null);
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm công văn" : "Sửa công văn"}</h1>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="documentNumber">Số hiệu</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(event) => setDocumentNumber(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documentTypeId">Loại công văn</Label>
                <Select value={documentTypeId} onValueChange={setDocumentTypeId} disabled={typesLoading}>
                  <SelectTrigger id="documentTypeId">
                    <SelectValue placeholder="Chọn loại công văn" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="direction">Hướng</Label>
                <Select value={direction} onValueChange={(value) => setDirection(value as DocumentDirection)}>
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as DocumentStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="isPublic">Phạm vi hiển thị</Label>
                <Select value={isPublic ? "public" : "internal"} onValueChange={(value) => setIsPublic(value === "public")}>
                  <SelectTrigger id="isPublic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Nội bộ</SelectItem>
                    <SelectItem value="public">Công khai</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Chỉ mang tính lưu trữ — hệ thống hiện chưa có trang công khai hiển thị công văn.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Input id="priority" value={priority} onChange={(event) => setPriority(event.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="issuingOfficeName">Đơn vị phát hành</Label>
                <Input
                  id="issuingOfficeName"
                  value={issuingOfficeName}
                  onChange={(event) => setIssuingOfficeName(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="issuedAt">Ngày ban hành</Label>
                <Input id="issuedAt" type="date" value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sentAt">Ngày gửi</Label>
                <Input id="sentAt" type="date" value={sentAt} onChange={(event) => setSentAt(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="receivedAt">Ngày nhận</Label>
                <Input id="receivedAt" type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea id="summary" rows={2} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea id="content" rows={8} value={content} onChange={(event) => setContent(event.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/official-documents")}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving || !documentTypeId}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mode === "edit" && document && (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div>
              <h2 className="text-lg font-semibold">Thông tin từ web cũ</h2>
              <p className="text-sm text-muted-foreground">Chỉ mang tính tham khảo, nhập từ dữ liệu ETL — không chỉnh sửa được ở đây.</p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Người tạo: </span>
                {document.createdByName ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Người xử lý: </span>
                {document.processedByNames ?? "—"}
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Nơi nhận: </span>
                {document.sentToRaw ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Tạo lúc: </span>
                {formatDateTime(document.createdAt)}
              </div>
              <div>
                <span className="text-muted-foreground">Cập nhật lúc: </span>
                {formatDateTime(document.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <div>
            <h2 className="text-lg font-semibold">
              File đính kèm{document ? ` (${document.attachments.length})` : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Chọn 1 hoặc nhiều file — sẽ tự động tải lên ngay sau khi lưu công văn ở trên."
                : 'Chọn thêm file rồi bấm "Tải lên", hoặc tải xuống/xoá file đã có bên dưới.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input type="file" multiple onChange={handleFilesSelected} className="sm:max-w-sm" />
            {mode === "edit" && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pendingFiles.length === 0 || isUploading}
                onClick={() => void handleUploadPendingFiles()}
              >
                <Upload className="size-4" />
                {isUploading ? "Đang tải lên..." : `Tải lên${pendingFiles.length ? ` (${pendingFiles.length})` : ""}`}
              </Button>
            )}
          </div>

          {pendingFiles.length > 0 && (
            <ul className="flex flex-col divide-y rounded-md border">
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}-${file.size}`} className="flex items-center justify-between gap-3 px-4 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePendingFile(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {mode === "edit" && document && (
            document.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có file đính kèm nào.</p>
            ) : (
              <ul className="flex flex-col divide-y rounded-md border">
                {document.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{attachment.fileName}</p>
                      {attachment.description && (
                        <p className="truncate text-sm text-muted-foreground">{attachment.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === attachment.id}
                        onClick={() => handleDownload(attachment.id)}
                      >
                        <Download className="size-4" />
                        {downloadingId === attachment.id ? "Đang tải..." : "Tải xuống"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deletingAttachmentId === attachment.id}
                        onClick={() => void handleDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
