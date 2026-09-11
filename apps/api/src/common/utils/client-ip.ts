import type { Request } from "express";

/**
 * IP thật của trình duyệt khi Nest chạy sau IIS ARR (mọi kết nối tới Node là 127.0.0.1).
 * Không có header thì dùng req.ip (đã trust proxy) hoặc socket.
 */
export function clientIp(req: Request | Record<string, unknown>): string {
  const headers = (req as Request).headers ?? {};
  const forwarded = headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof forwardedValue === "string" && forwardedValue.length > 0) {
    const first = forwardedValue.split(",")[0]?.trim();
    if (first) return first;
  }
  const expressReq = req as Request;
  return expressReq.ip ?? expressReq.socket?.remoteAddress ?? "unknown";
}
