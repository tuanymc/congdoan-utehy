import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import type { UploadImageResponseDto } from "@congdoan/types";
import { apiFetchUpload, ApiError } from "../../lib/api-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { pushToast } from "../common/toast-store";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Gợi ý placeholder khi chưa có URL. */
  placeholder?: string;
}

/**
 * Ô ảnh bìa: vừa nhập URL thủ công, vừa chọn file upload qua POST /admin/uploads/images.
 * URL trả về root-relative (/upload/images/...) — khớp ảnh web cũ và IIS static.
 */
export function ImageUploadField({ id, label, value, onChange, placeholder }: ImageUploadFieldProps) {
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
        const result = await apiFetchUpload<UploadImageResponseDto>("/admin/uploads/images", formData);
        onChange(result.url);
        pushToast({ variant: "success", message: "Đã tải ảnh lên." });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Tải ảnh lên thất bại.";
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
          placeholder={placeholder ?? "/upload/images/..."}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {isUploading ? "Đang tải..." : "Tải ảnh lên"}
        </Button>
      </div>
      {value ? (
        <img src={value} alt="Xem trước" className="mt-1 h-32 max-w-md rounded-md border object-cover" />
      ) : null}
    </div>
  );
}
