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
    localStorage.clear();
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

  it("không gọi /auth/refresh khi đăng nhập sai mật khẩu (401)", async () => {
    localStorage.setItem("congdoan_refresh_token", "refresh-old");
    const errorBody: ApiErrorBody = {
      statusCode: 401,
      errorCode: "AUTH_INVALID_CREDENTIALS",
      message: "Email hoặc mật khẩu không đúng.",
      timestamp: new Date().toISOString(),
      path: "/auth/login"
    };
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, errorBody));

    await expect(apiFetch("/auth/login", { method: "POST", body: {} })).rejects.toMatchObject({
      message: "Email hoặc mật khẩu không đúng."
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("tự refresh rồi retry khi access token hết hạn giữa bài thi", async () => {
    localStorage.setItem("congdoan_refresh_token", "refresh-old");
    setAccessToken("expired-access");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(401, { statusCode: 401, errorCode: "UNAUTHORIZED", message: "Unauthorized" })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { accessToken: "new-access", refreshToken: "refresh-new", expiresIn: 900 })
      )
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await apiFetch<{ ok: true }>("/legal-education/exams/1/attempts/2/submit", {
      method: "POST",
      body: { answers: [] }
    });

    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem("congdoan_refresh_token")).toBe("refresh-new");
    expect(fetch).toHaveBeenCalledTimes(3);
    const submitRetry = vi.mocked(fetch).mock.calls[2] ?? [];
    const headers = new Headers((submitRetry[1] as RequestInit | undefined)?.headers);
    expect(headers.get("Authorization")).toBe("Bearer new-access");
  });
});
