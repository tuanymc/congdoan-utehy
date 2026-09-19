import { describe, expect, it } from "vitest";
import { firstHttpUrl, splitTextWithUrls } from "./split-text-with-urls";

describe("splitTextWithUrls", () => {
  it("tách URL https thành href để gắn thẻ a", () => {
    const parts = splitTextWithUrls(
      "Nguồn: https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001195"
    );
    expect(parts).toEqual([
      { text: "Nguồn: " },
      {
        text: "https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001195",
        href: "https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001195"
      }
    ]);
  });

  it("bỏ dấu câu cuối URL", () => {
    const parts = splitTextWithUrls("Xem https://vneid.gov.vn.");
    expect(parts[1]).toEqual({
      text: "https://vneid.gov.vn",
      href: "https://vneid.gov.vn"
    });
    expect(parts[2]).toEqual({ text: "." });
  });

  it("không biến javascript: thành liên kết", () => {
    const parts = splitTextWithUrls("javascript:alert(1)");
    expect(parts).toEqual([{ text: "javascript:alert(1)" }]);
  });

  it("lấy URL nguồn đầu tiên trong mục Nơi thực hiện", () => {
    expect(
      firstHttpUrl("Công an cấp tỉnh.\n\nNguồn: https://dichvucong.gov.vn/p/home/x?ma_thu_tuc=1")
    ).toBe("https://dichvucong.gov.vn/p/home/x?ma_thu_tuc=1");
  });
});
