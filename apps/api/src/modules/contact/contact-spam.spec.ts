import { isContactSpam } from "./contact-spam";

describe("isContactSpam", () => {
  it("cho qua tin liên hệ bình thường", () => {
    expect(
      isContactSpam({
        name: "Nguyễn Văn An",
        email: "an.nguyen@hyute.edu.vn",
        phone: "0962490411",
        message: "Xin hỏi lịch sinh hoạt công đoàn tháng này."
      })
    ).toBe(false);
  });

  it("chặn honeypot", () => {
    expect(
      isContactSpam({
        name: "Nguyễn Văn An",
        email: "an@hyute.edu.vn",
        message: "Xin chào",
        website: "https://spam.test"
      })
    ).toBe(true);
  });

  it("chặn email/máy quét giả", () => {
    expect(
      isContactSpam({
        name: "aYINlfdX",
        email: "testing@example.com",
        phone: "555-666-0606",
        message: "hello"
      })
    ).toBe(true);
  });

  it("chặn payload SQL điển hình", () => {
    expect(
      isContactSpam({
        name: "aYINlfdX",
        email: "test@school.edu.vn",
        message: "(select 198/66/66/891 from DUAL)"
      })
    ).toBe(true);
    expect(
      isContactSpam({
        name: "aYINlfdX",
        email: "test@school.edu.vn",
        message: "20) OR 340=(SELECT 340 FROM PG_SLEEP(15))--"
      })
    ).toBe(true);
    expect(
      isContactSpam({
        name: "aYINlfdX",
        email: "test@school.edu.vn",
        message: "DBMS_PIPE.RECEIVE_MESSAGE(CHR(99)||CHR(99),15)"
      })
    ).toBe(true);
  });
});
