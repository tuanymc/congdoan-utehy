import { envDirOrProduction, PRODUCTION_DIRS } from "./env-dir";

describe("envDirOrProduction", () => {
  const origNode = process.env.NODE_ENV;
  const origDoc = process.env.DOCUMENT_FILES_DIR;

  afterEach(() => {
    process.env.NODE_ENV = origNode;
    if (origDoc === undefined) delete process.env.DOCUMENT_FILES_DIR;
    else process.env.DOCUMENT_FILES_DIR = origDoc;
  });

  it("dùng path inetpub khi production thiếu DOCUMENT_FILES_DIR", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DOCUMENT_FILES_DIR;
    expect(envDirOrProduction("DOCUMENT_FILES_DIR", "./document-files")).toBe(PRODUCTION_DIRS.DOCUMENT_FILES_DIR);
  });

  it("dùng path inetpub khi production còn đường dẫn tương đối kiểu .env.example", () => {
    process.env.NODE_ENV = "production";
    process.env.DOCUMENT_FILES_DIR = "./document-files";
    expect(envDirOrProduction("DOCUMENT_FILES_DIR", "./document-files")).toBe(PRODUCTION_DIRS.DOCUMENT_FILES_DIR);
  });

  it("giữ path tuyệt đối đã đặt trong .env production", () => {
    process.env.NODE_ENV = "production";
    process.env.DOCUMENT_FILES_DIR = "D:\\data\\files";
    expect(envDirOrProduction("DOCUMENT_FILES_DIR", "./document-files")).toBe("D:\\data\\files");
  });
});
