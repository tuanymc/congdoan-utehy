import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findAttachmentPhysicalPath, contentDispositionHeader } from "./attachment-path";

describe("findAttachmentPhysicalPath", () => {
  const base = join(tmpdir(), `congdoan-attach-${Date.now()}`);

  beforeAll(() => {
    mkdirSync(join(base, "admin"), { recursive: true });
    writeFileSync(join(base, "admin", "Kế hoạch hoạt động.pdf"), "ok");
    writeFileSync(join(base, "admin", "Quyết định 123.docx"), "ok");
    writeFileSync(join(base, "admin", encodeURIComponent("Thông báo nội bộ.pdf")), "ok");
  });

  afterAll(() => {
    rmSync(base, { recursive: true, force: true });
  });

  it("tìm file khi path CSDL trùng Unicode trên đĩa", () => {
    const found = findAttachmentPhysicalPath(base, "DocumentFiles/admin/Kế hoạch hoạt động.pdf");
    expect(found).toBe(join(base, "admin", "Kế hoạch hoạt động.pdf"));
  });

  it("tìm file khi path CSDL URL-encode UTF-8 (tên tiếng Việt)", () => {
    const encoded = `DocumentFiles/admin/${encodeURIComponent("Kế hoạch hoạt động.pdf")}`;
    const found = findAttachmentPhysicalPath(base, encoded);
    expect(found).toBe(join(base, "admin", "Kế hoạch hoạt động.pdf"));
  });

  it("tìm file khi khoảng trắng bị encode thành +", () => {
    const found = findAttachmentPhysicalPath(base, "DocumentFiles/admin/Quyết+định+123.docx");
    expect(found).toBe(join(base, "admin", "Quyết định 123.docx"));
  });

  it("tìm file khi đĩa lưu tên URL-encode còn CSDL giữ chữ Việt", () => {
    const found = findAttachmentPhysicalPath(base, "DocumentFiles/admin/Thông báo nội bộ.pdf");
    expect(found).toBe(join(base, "admin", encodeURIComponent("Thông báo nội bộ.pdf")));
  });
});

describe("contentDispositionHeader", () => {
  it("kèm filename* UTF-8 cho tên tiếng Việt", () => {
    const header = contentDispositionHeader("Kế hoạch.pdf", "attachment");
    expect(header).toContain("filename*=UTF-8''");
    expect(header).toContain(encodeURIComponent("Kế hoạch.pdf"));
  });
});
