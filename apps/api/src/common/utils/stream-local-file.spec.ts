import { parseSingleByteRange } from "./stream-local-file";

describe("parseSingleByteRange", () => {
  it("đọc khoảng đầu file", () => {
    expect(parseSingleByteRange("bytes=0-99", 1000)).toEqual({ start: 0, end: 99 });
  });

  it("đọc từ một offset đến hết file", () => {
    expect(parseSingleByteRange("bytes=100-", 1000)).toEqual({ start: 100, end: 999 });
  });

  it("đọc N byte cuối", () => {
    expect(parseSingleByteRange("bytes=-500", 1000)).toEqual({ start: 500, end: 999 });
  });

  it("cắt end vượt quá kích thước file", () => {
    expect(parseSingleByteRange("bytes=0-5000", 1000)).toEqual({ start: 0, end: 999 });
  });

  it("từ chối khoảng không hợp lệ", () => {
    expect(parseSingleByteRange("bytes=1000-1001", 1000)).toBeNull();
    expect(parseSingleByteRange("bytes=5-1", 1000)).toBeNull();
    expect(parseSingleByteRange("bytes=0-1,2-3", 1000)).toBeNull();
  });
});
