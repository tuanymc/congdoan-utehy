/**
 * Toast store tối giản, không phụ thuộc thư viện ngoài — dùng cho notificationProvider của Refine
 * để hiển thị message tiếng Việt lấy từ ApiErrorBody (xem lib/api-client.ts) cho người quản trị.
 */
export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
}

type Listener = (items: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];

function emit(): void {
  for (const listener of listeners) {
    listener(toasts);
  }
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.push(listener);
  listener(toasts);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function pushToast(item: Omit<ToastItem, "id"> & { id?: string }): string {
  const id = item.id ?? crypto.randomUUID();
  toasts = [...toasts.filter((t) => t.id !== id), { id, message: item.message, description: item.description, variant: item.variant }];
  emit();
  setTimeout(() => dismissToast(id), 5000);
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}
