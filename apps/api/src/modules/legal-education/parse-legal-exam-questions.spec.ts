import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { extractQuestionBankText, parseLegalExamQuestionsFromText } from "./parse-legal-exam-questions";

const SAMPLE = `Câu hỏi phổ biến Giáo dục pháp luật quý III năm 2026

Câu 1. Theo Thông tư 53, hình thức đào tạo tiến sĩ?

A. Chính quy hoặc thường xuyên
B. Chỉ chính quy
C. Từ xa 100%
D. Vừa làm vừa học

Đáp án đúng: B

Câu 16: Nghiên cứu sinh được tham gia hoạt động nào?

Giảng dạy các lớp đào tạo thạc sĩ
Tham gia Hội đồng khoa học
Trợ giảng
Hướng dẫn khóa luận tốt nghiệp.

Đáp án đúng: C

Câu 26 Theo quy định, dành bao nhiêu tín chỉ cho NCKH?

A. 21 đến 30 tín chỉ
B. 22 đến 30 tín chỉ
C. 23 đến 30 tín chỉ
D. 24 đến 30 tín chỉ

Đáp án đúng: D

Câu hỏi 31 Thời gian đào tạo chuẩn tiến sĩ?

A. 3-4 năm
B. 3-4 năm (hoặc 4 năm)
C. 5 năm
D. 2 năm

Đáp án đúng: B

Câu 29: Khối lượng học tập tối đa?

A. 18 tín chỉ
B. 20 tín chỉ
C. 24 tín chỉ
D. 30 tín chỉ

Đáp án chuẩn: B

Câu hỏi 46: Việc liên kết đào tạo phải đảm bảo?

A. Chuẩn chương trình
B. Công khai điều kiện
C. Chủ trì 50%
D. Tất cả đáp án trên.

Câu 56:: Chuẩn đầu ra thạc sĩ?

A. Năng lực lãnh đạo
B. Năng lực nghiên cứu
C. Năng lực sư phạm
D. Năng lực AI

Đáp án đúng: B

Câu 48: Áp dụng từ thời điểm nào?

A. 30/06/2026
B. 01/09/2026
C. 01/01/2027
D. 31/12/2027

Đáp án đúng: C (Áp dụng từ ngày 01/01/2027).

Câu 67: Điều kiện học bằng kép?

A. Phải kết thúc học kỳ đầu tiên và điểm trung bình tích lũy đạt từ loại Khá trở lênB. Phải kết thúc năm thứ hai và chưa từng thi lại môn nào
C. Điểm trung bình tích lũy đạt từ loại Xuất sắc trở lên
D. Chỉ cần đóng đủ học phí

Đáp án đúng: A

Câu 68: Được nghỉ học tạm thời khi nào?

A. Được điều động tham gia lực lượng vũ trang quốc gia
B. Bị ốm đau, thai sản có giấy xác nhận của cơ sở y tế có thẩm quyền
C. Có nhu cầu cá nhân (đã học ít nhất 01 học kỳ và không thuộc diện bị buộc thôi học)
D. Tất cả các trường hợp trên

Đáp án đúng: D
`;

describe("parseLegalExamQuestionsFromText", () => {
  it("parse các biến thể mẫu Word (nhãn A-D, không nhãn, Câu hỏi N, Đáp án chuẩn, đáp án dính chữ)", () => {
    const result = parseLegalExamQuestionsFromText(SAMPLE);
    expect(result.errors).toEqual([
      { questionNumber: 46, message: 'Câu 46: thiếu dòng "Đáp án đúng: A/B/C/D".' }
    ]);
    expect(result.questions.map((q) => q.number)).toEqual([1, 16, 26, 31, 29, 56, 48, 67, 68]);

    const q1 = result.questions.find((q) => q.number === 1)!;
    expect(q1.text).toContain("hình thức đào tạo tiến sĩ");
    expect(q1.options).toHaveLength(4);
    expect(q1.correctOptionIndex).toBe(1);

    const q16 = result.questions.find((q) => q.number === 16)!;
    expect(q16.options[2]).toBe("Trợ giảng");
    expect(q16.correctOptionIndex).toBe(2);

    const q26 = result.questions.find((q) => q.number === 26)!;
    expect(q26.correctOptionIndex).toBe(3);

    const q29 = result.questions.find((q) => q.number === 29)!;
    expect(q29.correctOptionIndex).toBe(1);

    const q48 = result.questions.find((q) => q.number === 48)!;
    expect(q48.correctOptionIndex).toBe(2);

    const q56 = result.questions.find((q) => q.number === 56)!;
    expect(q56.text).toBe("Chuẩn đầu ra thạc sĩ?");
    expect(q56.correctOptionIndex).toBe(1);

    const q67 = result.questions.find((q) => q.number === 67)!;
    expect(q67.options).toHaveLength(4);
    expect(q67.options[0]).toContain("Khá trở lên");
    expect(q67.options[1]).toContain("năm thứ hai");
    expect(q67.correctOptionIndex).toBe(0);

    const q68 = result.questions.find((q) => q.number === 68)!;
    expect(q68.options).toHaveLength(4);
    expect(q68.options[2]).toContain("thôi học");
    expect(q68.options[3]).toContain("Tất cả");
    expect(q68.correctOptionIndex).toBe(3);
  });

  it("báo lỗi khi không có câu hỏi", () => {
    const result = parseLegalExamQuestionsFromText("Không có ngân hàng câu hỏi.");
    expect(result.questions).toHaveLength(0);
    expect(result.errors[0]?.questionNumber).toBeNull();
  });

  it("đọc file mẫu Word quý III 2026 (74 câu, bỏ 46 và 47 vì thiếu đáp án)", async () => {
    const samplePath = resolve(
      __dirname,
      "../../../../../timhieuphapluat/Câu hỏi phổ biến Giáo dục pháp luật quý III năm 2026.docx"
    );
    if (!existsSync(samplePath)) return;
    const text = await extractQuestionBankText(readFileSync(samplePath), "sample.docx");
    const result = parseLegalExamQuestionsFromText(text);
    expect(result.questions).toHaveLength(72);
    expect(result.errors.map((err) => err.questionNumber).sort()).toEqual([46, 47]);
    const q67 = result.questions.find((q) => q.number === 67);
    expect(q67?.options).toHaveLength(4);
    expect(q67?.correctOptionIndex).toBe(0);
    const q16 = result.questions.find((q) => q.number === 16);
    expect(q16?.options[2]).toMatch(/Trợ giảng/i);
    expect(q16?.correctOptionIndex).toBe(2);
  });
});
