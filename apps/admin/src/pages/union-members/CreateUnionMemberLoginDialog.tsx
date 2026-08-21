import { useEffect, useState } from "react";
import {
  DEFAULT_UNION_MEMBER_PASSWORD,
  type CreateUnionMemberLoginPasswordMode,
  type CreateUnionMemberLoginsRequest,
  type CreateUnionMemberLoginsResultDto
} from "@congdoan/types";
import { apiFetch } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";
import { pushToast } from "../../components/common/toast-store";

type Scope = "selected" | "staffCodes" | "allEligible";

interface CreateUnionMemberLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  selectedLabel?: string;
  onSuccess: () => void;
}

export function CreateUnionMemberLoginDialog({
  open,
  onOpenChange,
  selectedIds,
  selectedLabel,
  onSuccess
}: CreateUnionMemberLoginDialogProps) {
  const lockedToSelection = Boolean(selectedLabel);
  const [scope, setScope] = useState<Scope>(selectedIds.length > 0 ? "selected" : "staffCodes");
  const [staffCodesText, setStaffCodesText] = useState("");
  const [passwordMode, setPasswordMode] = useState<CreateUnionMemberLoginPasswordMode>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreateUnionMemberLoginsResultDto | null>(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setStaffCodesText("");
    setPasswordMode("default");
    if (lockedToSelection || selectedIds.length > 0) {
      setScope("selected");
    } else {
      setScope("staffCodes");
    }
  }, [open, lockedToSelection, selectedIds.length]);

  async function handleSubmit() {
    const payload: CreateUnionMemberLoginsRequest = { passwordMode };
    if (scope === "selected") {
      if (selectedIds.length === 0) {
        pushToast({ variant: "error", message: "Chưa chọn công đoàn viên nào." });
        return;
      }
      payload.memberIds = selectedIds;
    } else if (scope === "staffCodes") {
      const staffCodes = staffCodesText
        .split(/[\n,;]+/)
        .map((code) => code.trim())
        .filter(Boolean);
      if (staffCodes.length === 0) {
        pushToast({ variant: "error", message: "Nhập ít nhất một mã cán bộ." });
        return;
      }
      payload.staffCodes = staffCodes;
    } else {
      payload.allEligible = true;
    }

    setIsSubmitting(true);
    try {
      const created = await apiFetch<CreateUnionMemberLoginsResultDto>("/admin/union-members/create-logins", {
        method: "POST",
        body: payload
      });
      setResult(created);
      if (created.created + created.linkedExisting > 0) {
        onSuccess();
      }
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không tạo được tài khoản",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản đăng nhập</DialogTitle>
          <DialogDescription>
            Tạo tài khoản vai trò Đoàn viên từ mã cán bộ, gắn vào hồ sơ công đoàn viên. Đăng nhập bằng email
            hoặc mã cán bộ.
            {selectedLabel ? ` Đang tạo cho: ${selectedLabel}.` : null}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <ResultView result={result} passwordMode={passwordMode} />
        ) : (
          <div className="flex flex-col gap-4">
            {!lockedToSelection ? (
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Đối tượng</legend>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="login-scope"
                    className="mt-1"
                    checked={scope === "selected"}
                    disabled={selectedIds.length === 0}
                    onChange={() => setScope("selected")}
                  />
                  <span>
                    Các dòng đang chọn ({selectedIds.length})
                    {selectedIds.length === 0 ? (
                      <span className="block text-xs text-muted-foreground">Tích chọn trên bảng trước.</span>
                    ) : null}
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="login-scope"
                    className="mt-1"
                    checked={scope === "staffCodes"}
                    onChange={() => setScope("staffCodes")}
                  />
                  <span>Nhập danh sách mã cán bộ</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="login-scope"
                    className="mt-1"
                    checked={scope === "allEligible"}
                    onChange={() => setScope("allEligible")}
                  />
                  <span>
                    Toàn bộ hồ sơ chưa có tài khoản (có mã cán bộ và email)
                    <span className="block text-xs text-muted-foreground">
                      Bỏ qua người đã có tài khoản, thiếu email, hoặc email đã là tài khoản quản trị.
                    </span>
                  </span>
                </label>
              </fieldset>
            ) : null}

            {scope === "staffCodes" && !lockedToSelection ? (
              <div className="grid gap-2">
                <Label htmlFor="staff-codes">Mã cán bộ</Label>
                <Textarea
                  id="staff-codes"
                  rows={6}
                  value={staffCodesText}
                  onChange={(event) => setStaffCodesText(event.target.value)}
                  placeholder={"Mỗi dòng một mã, ví dụ:\nNV001\nNV002"}
                />
              </div>
            ) : null}

            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Mật khẩu</legend>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="login-password-mode"
                  className="mt-1"
                  checked={passwordMode === "default"}
                  onChange={() => setPasswordMode("default")}
                />
                <span>
                  Mặc định <code className="rounded bg-muted px-1">{DEFAULT_UNION_MEMBER_PASSWORD}</code>
                  <span className="block text-xs text-muted-foreground">
                    Vẫn gửi email hướng dẫn nếu đã cấu hình SMTP. Công đoàn viên nên đổi mật khẩu sau lần đăng
                    nhập đầu.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="login-password-mode"
                  className="mt-1"
                  checked={passwordMode === "random"}
                  onChange={() => setPasswordMode("random")}
                />
                <span>
                  Ngẫu nhiên, gửi về email của công đoàn viên
                  <span className="block text-xs text-muted-foreground">
                    Nếu chưa cấu hình SMTP, mật khẩu sẽ hiện ở kết quả để bạn gửi thủ công.
                  </span>
                </span>
              </label>
            </fieldset>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result ? "Đóng" : "Huỷ"}
          </Button>
          {!result ? (
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultView({
  result,
  passwordMode
}: {
  result: CreateUnionMemberLoginsResultDto;
  passwordMode: CreateUnionMemberLoginPasswordMode;
}) {
  const failedMails = result.items.filter((item) => item.temporaryPassword);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p>
        Tạo mới {result.created}, gắn tài khoản sẵn có {result.linkedExisting}, bỏ qua {result.skipped}
        {result.emailed > 0 ? `, đã gửi ${result.emailed} email` : ""}.
      </p>
      {!result.mailConfigured ? (
        <p className="text-muted-foreground">
          SMTP chưa cấu hình nên hệ thống không gửi được email.{" "}
          {passwordMode === "default" ? (
            <>
              Công đoàn viên đăng nhập bằng mật khẩu mặc định{" "}
              <code className="rounded bg-muted px-1">{DEFAULT_UNION_MEMBER_PASSWORD}</code>.
            </>
          ) : (
            "Các mật khẩu ngẫu nhiên chưa gửi được liệt kê bên dưới."
          )}
        </p>
      ) : null}

      {failedMails.length > 0 ? (
        <div className="rounded-md border p-3">
          <p className="mb-2 font-medium">Mật khẩu chưa gửi được email — copy gửi thủ công</p>
          {failedMails.map((item) => (
            <p key={`${item.memberId}-${item.email}`} className="font-mono text-xs">
              {item.legacyCode ?? "—"} · {item.fullName} · {item.email} · {item.temporaryPassword}
            </p>
          ))}
        </div>
      ) : null}

      {result.items.some((item) => item.status === "skipped") ? (
        <div className="max-h-48 overflow-y-auto rounded-md border p-3">
          {result.items
            .filter((item) => item.status === "skipped")
            .map((item, index) => (
              <p key={`${item.memberId ?? item.legacyCode ?? index}-skip`} className="text-destructive">
                {item.legacyCode ?? item.fullName ?? "—"}: {item.reason}
              </p>
            ))}
        </div>
      ) : null}
    </div>
  );
}
