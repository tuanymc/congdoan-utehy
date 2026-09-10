import { useEffect, useState } from "react";
import type { ResetUserPasswordResponse, UserListItemDto } from "@congdoan/types";
import { apiFetch, ApiError } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
import { pushToast } from "../../components/common/toast-store";

interface ResetUserPasswordDialogProps {
  open: boolean;
  user: Pick<UserListItemDto, "id" | "email" | "fullName"> | null;
  onOpenChange: (open: boolean) => void;
}

export function ResetUserPasswordDialog({ open, user, onOpenChange }: ResetUserPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResetUserPasswordResponse | null>(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
  }, [open, user?.id]);

  async function handleReset() {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const created = await apiFetch<ResetUserPasswordResponse>(`/users/${user.id}/reset-password`, {
        method: "POST"
      });
      setResult(created);
      if (created.emailSent) {
        pushToast({ variant: "success", message: `Đã gửi mật khẩu mới tới ${user.email}.` });
      } else {
        pushToast({
          variant: "info",
          message: "Đã cấp mật khẩu mới nhưng chưa gửi được email.",
          description: "Hãy copy mật khẩu bên dưới và gửi thủ công."
        });
      }
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không reset được mật khẩu",
        description: error instanceof ApiError ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyPassword() {
    if (!result?.temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      pushToast({ variant: "success", message: "Đã copy mật khẩu." });
    } catch {
      pushToast({ variant: "error", message: "Không copy được mật khẩu." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset mật khẩu</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tạo mật khẩu mới, thu hồi phiên đăng nhập cũ và gửi email tới {user?.email}.
            {user ? ` Tài khoản: ${user.fullName}.` : null}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3 text-sm">
            {result.emailSent ? (
              <p>Đã gửi mật khẩu mới tới {user?.email}. Người dùng cần đăng nhập lại.</p>
            ) : (
              <div className="rounded-md border p-3">
                <p className="mb-2 font-medium">
                  {result.mailConfigured
                    ? "Gửi email thất bại — copy mật khẩu gửi thủ công"
                    : "SMTP chưa cấu hình nên không gửi được email."}
                </p>
                <p className="font-mono text-xs break-all">{user?.email} · {result.temporaryPassword}</p>
                <Button className="mt-3" size="sm" variant="outline" onClick={() => void copyPassword()}>
                  Copy mật khẩu
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Người dùng sẽ không đăng nhập được bằng mật khẩu cũ. Hành động này không thể hoàn tác.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {result ? "Đóng" : "Huỷ"}
          </Button>
          {!result ? (
            <Button onClick={() => void handleReset()} disabled={isSubmitting || !user}>
              {isSubmitting ? "Đang cấp lại..." : "Reset mật khẩu"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
