import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../ui/utils";
import { dismissToast, subscribeToasts, type ToastItem } from "./toast-store";

/** Hiển thị toàn bộ toast đang mở, đặt cố định ở góc dưới bên phải màn hình. Đặt một lần ở App.tsx. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="alert"
          className={cn(
            "pointer-events-auto rounded-lg border p-3 text-sm shadow-lg",
            item.variant === "error" && "border-destructive bg-destructive text-destructive-foreground",
            item.variant === "success" && "border-primary bg-primary text-primary-foreground",
            item.variant === "info" && "bg-card text-card-foreground"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{item.message}</p>
              {item.description && <p className="mt-1 opacity-90">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Đóng thông báo"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
