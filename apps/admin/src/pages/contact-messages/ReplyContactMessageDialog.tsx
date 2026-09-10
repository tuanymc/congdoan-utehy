import { useEffect, useState } from "react";
import type { ContactMessageDto, ReplyContactMessageRequest, ReplyContactMessageResultDto } from "@congdoan/types";
import { apiFetch, ApiError } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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

interface ReplyContactMessageDialogProps {
  open: boolean;
  message: ContactMessageDto | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function defaultBody(name: string): string {
  return [
    `Kính gửi ${name},`,
    "",
    "Công đoàn Trường Đại học Công nghệ Kỹ thuật Hưng Yên đã nhận được tin nhắn của bạn.",
    "",
    "",
    "Trân trọng,",
    "Công đoàn HYUTE"
  ].join("\n");
}

export function ReplyContactMessageDialog({
  open,
  message,
  onOpenChange,
  onSuccess
}: ReplyContactMessageDialogProps) {
  const [subject, setSubject] = useState("Phản hồi liên hệ — Công đoàn HYUTE");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !message) return;
    setSubject("Phản hồi liên hệ — Công đoàn HYUTE");
    setBody(defaultBody(message.name));
  }, [open, message]);

  async function handleSend() {
    if (!message) return;
    const payload: ReplyContactMessageRequest = { subject: subject.trim(), body: body.trim() };
    if (payload.subject.length < 3) {
      pushToast({ variant: "error", message: "Tiêu đề tối thiểu 3 ký tự." });
      return;
    }
    if (payload.body.length < 5) {
      pushToast({ variant: "error", message: "Nội dung phản hồi tối thiểu 5 ký tự." });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch<ReplyContactMessageResultDto>(`/admin/contact-messages/${message.id}/reply`, {
        method: "POST",
        body: payload
      });
      pushToast({ variant: "success", message: `Đã gửi phản hồi tới ${message.email}.` });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không gửi được email phản hồi",
        description: error instanceof ApiError ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gửi email phản hồi</DialogTitle>
          <DialogDescription>
            Gửi tới {message?.email}
            {message ? ` (${message.name})` : ""}. Hệ thống sẽ đính kèm tin nhắn gốc ở cuối thư.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="mb-1 font-medium">Tin nhắn gốc</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{message.message}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reply-subject">Tiêu đề</Label>
              <Input id="reply-subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reply-body">Nội dung</Label>
              <Textarea id="reply-body" rows={10} value={body} onChange={(event) => setBody(event.target.value)} />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button onClick={() => void handleSend()} disabled={isSubmitting || !message}>
            {isSubmitting ? "Đang gửi..." : "Gửi email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
