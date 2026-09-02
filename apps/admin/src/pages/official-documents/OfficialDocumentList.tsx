import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDelete, useList, useTable } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import type { DocumentDirection, DocumentStatus, DocumentTypeDto, OfficialDocumentListItemDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";
import { cn } from "../../components/ui/utils";
import {
  DIRECTION_LABEL,
  FORMS_DOCUMENT_TYPE_NAME,
  STATUS_LABEL,
  STATUS_OPTIONS,
  type OfficialDocumentPurpose
} from "./constants";

const DOCUMENT_TABS: Array<{ value: DocumentDirection; label: string }> = [
  { value: "OUTGOING", label: DIRECTION_LABEL.OUTGOING },
  { value: "INCOMING", label: DIRECTION_LABEL.INCOMING }
];

function parseDirectionTab(value: string | null): DocumentDirection {
  return value === "INCOMING" ? "INCOMING" : "OUTGOING";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function OfficialDocumentList({ purpose = "documents" }: { purpose?: OfficialDocumentPurpose }) {
  const isForms = purpose === "forms";
  const listBase = isForms ? "/digital-forms" : "/official-documents";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: deleteDocument, isLoading: isDeleting } = useDelete();
  const { data: typesResult } = useList<DocumentTypeDto>({ resource: "document-types" });
  const documentTypes = typesResult?.data ?? [];
  const formsType = documentTypes.find((type) => type.name === FORMS_DOCUMENT_TYPE_NAME);

  const [direction, setDirection] = useState<DocumentDirection>(() => parseDirectionTab(searchParams.get("direction")));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<DocumentStatus | "ALL">("ALL");
  const [documentTypeId, setDocumentTypeId] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<OfficialDocumentListItemDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtersReady = !isForms || Boolean(formsType?.id);

  const { tableQueryResult, current, setCurrent, pageCount, setFilters } = useTable<OfficialDocumentListItemDto>({
    resource: "official-documents",
    pagination: { current: 1, pageSize: 20 },
    queryOptions: { enabled: filtersReady }
  });

  useEffect(() => {
    if (isForms && !formsType) return;
    const filters: CrudFilter[] = [];
    if (debouncedSearch) filters.push({ field: "search", operator: "contains", value: debouncedSearch });
    if (isForms && formsType) {
      filters.push({ field: "documentTypeId", operator: "eq", value: formsType.id });
    } else {
      filters.push({ field: "direction", operator: "eq", value: direction });
      if (status !== "ALL") filters.push({ field: "status", operator: "eq", value: status });
      if (documentTypeId !== "ALL") filters.push({ field: "documentTypeId", operator: "eq", value: documentTypeId });
    }
    setFilters(filters, "replace");
  }, [debouncedSearch, direction, status, documentTypeId, isForms, formsType?.id, setFilters]);

  const documents = tableQueryResult.data?.data ?? [];
  const total = tableQueryResult.data?.total ?? 0;
  const isLoading = tableQueryResult.isLoading || (isForms && typesResult === undefined);
  const columnCount = isForms ? 5 : 6;

  function setDirectionTab(next: DocumentDirection) {
    if (next === direction) return;
    setDirection(next);
    setCurrent(1);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteDocument(
      { resource: "official-documents", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">{isForms ? "Kho biểu mẫu" : "Công văn"}</h1>
          <p className="text-muted-foreground">
            {isForms
              ? `Tổng cộng ${total} biểu mẫu — mục Công khai hiện ở trang /tien-ich-so-cong-doan/bieu-mau.`
              : `Tổng cộng ${total} ${direction === "INCOMING" ? "công văn đến" : "công văn đi"}.`}
          </p>
        </div>
        <Button
          onClick={() => navigate(isForms ? `${listBase}/create` : `${listBase}/create?direction=${direction}`)}
          disabled={isForms && !formsType}
        >
          {isForms ? "Thêm biểu mẫu" : "Thêm công văn"}
        </Button>
      </div>

      {isForms && typesResult && !formsType ? (
        <p className="text-sm text-destructive">
          Chưa có loại công văn “{FORMS_DOCUMENT_TYPE_NAME}”. Tạo loại này ở mục Loại công văn (hoặc chạy seed) rồi
          quay lại đây.
        </p>
      ) : null}

      {isForms ? null : (
        <div className="flex w-fit gap-1 rounded-lg border bg-muted/50 p-1" role="tablist" aria-label="Hướng công văn">
          {DOCUMENT_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={direction === tab.value}
              onClick={() => setDirectionTab(tab.value)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                direction === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          placeholder={isForms ? "Tìm theo tên biểu mẫu..." : "Tìm theo tiêu đề, số hiệu, nội dung..."}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="lg:max-w-xs"
        />
        {isForms ? null : (
          <>
            <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
              <SelectTrigger className="lg:max-w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại công văn</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setStatus(value as DocumentStatus | "ALL")}>
              <SelectTrigger className="lg:max-w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {isForms ? <TableHead className="w-16">Ảnh</TableHead> : <TableHead>Thời gian</TableHead>}
              {isForms ? null : <TableHead>Loại công văn</TableHead>}
              {isForms ? null : <TableHead>Số công văn</TableHead>}
              <TableHead>Tiêu đề</TableHead>
              {isForms ? null : <TableHead>Trạng thái</TableHead>}
              {isForms ? <TableHead>Ngày cập nhật</TableHead> : null}
              {isForms ? <TableHead>Hiển thị</TableHead> : null}
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={columnCount}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-8 text-center text-muted-foreground">
                  {isForms ? "Chưa có biểu mẫu nào." : "Không có công văn nào phù hợp."}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  {isForms ? (
                    <TableCell>
                      {doc.coverImageUrl ? (
                        <img src={doc.coverImageUrl} alt="" className="h-10 w-14 rounded object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  ) : (
                    <TableCell className="whitespace-nowrap">{formatDate(doc.issuedAt ?? doc.createdAt)}</TableCell>
                  )}
                  {isForms ? null : <TableCell>{doc.documentType.name}</TableCell>}
                  {isForms ? null : (
                    <TableCell className="text-muted-foreground">{doc.documentNumber ?? "—"}</TableCell>
                  )}
                  <TableCell className="max-w-xs truncate font-medium">{doc.title}</TableCell>
                  {isForms ? null : (
                    <TableCell>
                      <Badge variant="secondary">{STATUS_LABEL[doc.status]}</Badge>
                    </TableCell>
                  )}
                  {isForms ? <TableCell>{formatDate(doc.issuedAt)}</TableCell> : null}
                  {isForms ? (
                    <TableCell>
                      <Badge variant={doc.isPublic ? "default" : "secondary"}>
                        {doc.isPublic ? "Công khai" : "Nội bộ"}
                      </Badge>
                    </TableCell>
                  ) : null}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`${listBase}/edit/${doc.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(doc)}>
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setCurrent(current - 1)}>
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {current} / {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setCurrent(current + 1)}>
            Sau
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title={isForms ? "Xoá biểu mẫu" : "Xoá công văn"}
        description={`Bạn có chắc chắn muốn xoá ${isForms ? "biểu mẫu" : "công văn"} "${deleteTarget?.title ?? ""}"? File đính kèm cũng sẽ bị xoá khỏi hệ thống. Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
