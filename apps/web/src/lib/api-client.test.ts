import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiErrorBody } from "@congdoan/types";
import { apiFetch, ApiError, setAccessToken } from "./api-client";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    setAccessToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ném ApiError với message tiếng Việt lấy từ ApiErrorBody khi response lỗi", async () => {
    const errorBody: ApiErrorBody = {
      statusCode: 401,
      errorCode: "AUTH_INVALID_CREDENTIALS",
      message: "Email hoặc mật khẩu không đúng.",
      timestamp: new Date().toISOString(),
      path: "/auth/login"
    };
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, errorBody));

    await expect(apiFetch("/auth/login", { method: "POST", body: {} })).rejects.toMatchObject({
      message: "Email hoặc mật khẩu không đúng.",
      errorCode: "AUTH_INVALID_CREDENTIALS"
    });
  });

  it("ném đúng thực thể ApiError (không chỉ Error thường)", async () => {
    const errorBody: ApiErrorBody = {
      statusCode: 404,
      errorCode: "POST_NOT_FOUND",
      message: "Không tìm thấy bài viết.",
      timestamp: new Date().toISOString(),
      path: "/posts/khong-ton-tai"
    };
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(404, errorBody));

    await expect(apiFetch("/posts/khong-ton-tai")).rejects.toBeInstanceOf(ApiError);
  });

  it("trả về dữ liệu JSON đã parse khi response thành công", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { hello: "world" }));

    const result = await apiFetch<{ hello: string }>("/health");

    expect(result).toEqual({ hello: "world" });
  });

  it("trả về undefined khi response 201 Created không có body (gửi khảo sát)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 201 }));

    const result = await apiFetch("/surveys/abc/responses", { method: "POST", body: { answers: [] } });

    expect(result).toBeUndefined();
  });

  it("trả về undefined khi POST 200 không có body (IIS ARR đổi 204 thành 200 rỗng)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 200 }));

    const result = await apiFetch("/surveys/abc/responses", { method: "POST", body: { answers: [] } });

    expect(result).toBeUndefined();
  });

  it("nhận JSON { ok: true } khi gửi khảo sát thành công", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(201, { ok: true }));

    const result = await apiFetch<{ ok: true }>("/surveys/abc/responses", {
      method: "POST",
      body: { answers: [] }
    });

    expect(result).toEqual({ ok: true });
  });

  it("ném lỗi rõ ràng khi response 200 nhưng body rỗng bất thường (không âm thầm trả về null)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 200 }));

    await expect(apiFetch("/posts")).rejects.toThrow(/dữ liệu không hợp lệ/);
  });

  it("ném lỗi thân thiện tiếng Việt khi mất kết nối mạng", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(apiFetch("/posts")).rejects.toThrow(
      "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
    );
  });

  it("gắn header Authorization khi đã có access token qua setAccessToken", async () => {
    setAccessToken("token-abc");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await apiFetch("/auth/me");

    const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    const headers = new Headers((init as RequestInit | undefined)?.headers);
    expect(headers.get("Authorization")).toBe("Bearer token-abc");
  });
});
