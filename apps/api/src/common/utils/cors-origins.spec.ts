import { allowedCorsOrigins, isTrustedPublicFormRequest } from "./cors-origins";

describe("isTrustedPublicFormRequest", () => {
  const orig = process.env.CORS_ORIGINS;

  afterEach(() => {
    if (orig === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = orig;
  });

  it("nhận Origin của website", () => {
    expect(isTrustedPublicFormRequest({ origin: "https://congdoan.utehy.edu.vn" })).toBe(true);
    expect(allowedCorsOrigins()).toContain("https://congdoan.utehy.edu.vn");
  });

  it("nhận Referer khi không có Origin", () => {
    expect(
      isTrustedPublicFormRequest({ referer: "https://congdoan.utehy.edu.vn/lien-he" })
    ).toBe(true);
  });

  it("từ chối request không Origin/Referer (sqlmap gọi thẳng API)", () => {
    expect(isTrustedPublicFormRequest({})).toBe(false);
    expect(isTrustedPublicFormRequest({ origin: "https://evil.example" })).toBe(false);
  });
});
