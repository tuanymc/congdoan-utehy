import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { FileUp, Loader2 } from "lucide-react";
import type { UploadFileResponseDto } from "@congdoan/types";
import { apiFetchUpload, ApiError } from "../../lib/api-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { pushToast } from "./toast-store";

interface FileUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

/**
 * Ô file tài liệu (PDF/Word): vừa nhập URL thủ công, vừa chọn file upload qua POST /admin/uploads/files.
 * URL trả về root-relative (/upload/legal-education/...) — IIS phục vụ tĩnh giống ảnh.
 */
export function FileUploadField({ id, label, value, onChange, placeholder }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await apiFetchUpload<UploadFileResponseDto>("/admin/uploads/files", formData);
        onChange(result.url);
        pushToast({ variant: "success", message: `Đã tải lên: ${result.fileName}` });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Tải file lên thất bại.";
        pushToast({ variant: "error", message });
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          type="text"
          placeholder={placeholder ?? "/upload/legal-education/..."}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <Button type="button" variant="outline" disabled={isUploading} onClick={() => inputRef.current?.click()}>
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          {isUploading ? "Đang tải..." : "Tải file lên"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">PDF, DOC hoặc DOCX — tối đa 25MB.</p>
      {value ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-4 hover:underline">
          Mở file hiện tại
        </a>
      ) : null}
    </div>
  );
}
