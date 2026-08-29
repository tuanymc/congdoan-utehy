/**
 * Seed đợt phổ biến giáo dục pháp luật Quý III/2026 — an toàn chạy lại (upsert theo slug).
 *
 * Tài liệu nguồn: thư mục timhieuphapluat/ (tóm tắt + 45 câu + 3 PDF TT 53/54/56).
 * Đáp án suy từ bản tóm tắt — exam.isOpen=false để cán bộ rà soát trước khi mở thi
 * (cùng chính sách seed Dịch vụ công).
 *
 *   pnpm prisma:seed
 *   hoặc pnpm seed:legal-education
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const LEGAL_EDUCATION_Q3_2026_SLUG = "quy-iii-2026";

const CAMPAIGN_TITLE = "Phổ biến giáo dục pháp luật quý III năm 2026";
const PERIOD_LABEL = "Quý III năm 2026";
const SUMMARY =
  "Nội dung phổ biến tập trung 3 thông tư của Bộ Giáo dục và Đào tạo năm 2026: Thông tư 53 (quy chế tuyển sinh và đào tạo sau đại học), Thông tư 54 (chương trình đào tạo các trình độ giáo dục đại học) và Thông tư 56 (quy chế đào tạo trình độ đại học). Đoàn viên đọc tài liệu tóm tắt, tải văn bản gốc, sau đó đăng nhập để thi trắc nghiệm.";

function p(text: string): string {
  return `<p>${text}</p>`;
}

function h2(text: string): string {
  return `<h2>${text}</h2>`;
}

function h3(text: string): string {
  return `<h3>${text}</h3>`;
}

function ul(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

const MATERIAL_TT53 = {
  slug: "thong-tu-53-2026-tt-bgddt",
  title: "Thông tư 53/2026/TT-BGDĐT — Quy chế tuyển sinh và đào tạo sau đại học",
  excerpt:
    "Hình thức, thời gian đào tạo thạc sĩ/tiến sĩ; công nhận tín chỉ; phản biện độc lập; hội đồng đánh giá luận án và trách nhiệm các bên.",
  fileUrl: "/tai-lieu/phap-luat/tt_53_bgddt.pdf",
  sortOrder: 10,
  content: [
    h2("Phạm vi điều chỉnh"),
    p("Quy chế áp dụng cho tuyển sinh và đào tạo thạc sĩ, tiến sĩ tại các cơ sở giáo dục đại học, tổ chức, cá nhân liên quan ở Việt Nam. Không áp dụng cho chương trình chuyên sâu khối ngành sức khỏe (bác sĩ nội trú, bác sĩ chuyên khoa). Chương trình do cơ sở giáo dục nước ngoài cấp bằng tại Việt Nam phải tuân thủ chuẩn đầu vào/đầu ra tối thiểu ngang bằng quy chế này."),
    h2("Hình thức và thời gian đào tạo"),
    ul([
      "Tiến sĩ: chỉ đào tạo hình thức chính quy. Nghiên cứu sinh học toàn thời gian hoặc đăng ký đủ 30 tín chỉ/năm học, tham gia giảng dạy chuyên môn và nghiên cứu khoa học.",
      "Thời gian đào tạo tiến sĩ: từ 03 năm đến 04 năm.",
      "Khung thời gian: tối thiểu bằng 2/3 thời gian chuẩn; tối đa không vượt quá 2,5 lần thời gian chuẩn.",
      "Thạc sĩ hệ thường xuyên: thời gian toàn khóa dài hơn từ 25% đến 50% so với hệ chính quy."
    ]),
    h2("Công nhận và chuyển đổi tín chỉ"),
    p("Người học được xem xét công nhận kết quả học tập và chuyển đổi tín chỉ đối với học phần thực hiện tại cơ sở được phép đào tạo trình độ tương ứng. Tổng khối lượng được công nhận và chuyển đổi tối đa không vượt quá 40% tổng khối lượng chương trình đang học."),
    ul([
      "Sinh viên đại học loại Khá trở lên có thể học trước chương trình thạc sĩ (chuyển đổi tối đa 40% chương trình cùng nhóm ngành).",
      "Sinh viên đại học (tích lũy 70% + loại Giỏi) hoặc học viên thạc sĩ (tích lũy 40% + loại Khá) có thể học trước một số học phần tiến sĩ (chuyển đổi tối đa 25% tổng khối lượng chương trình tiến sĩ)."
    ]),
    h2("Đào tạo thạc sĩ"),
    p("Luận văn thạc sĩ bắt buộc đối với định hướng nghiên cứu, thực hiện dưới sự hướng dẫn của ít nhất một người hướng dẫn. Hội đồng đánh giá có số lượng lẻ, từ 03 người trở lên. Hệ ứng dụng/chuyên nghiệp có thể làm đề án, dự án hoặc thi tốt nghiệp thay thế luận văn."),
    p("Được học trực tuyến nhưng không vượt quá 30% khối lượng chương trình (trừ thiên tai, dịch bệnh)."),
    h2("Đào tạo tiến sĩ"),
    p("Đầu vào: đã có bằng thạc sĩ hoặc đủ điều kiện lấy bằng thạc sĩ; hoặc bằng đại học loại giỏi trở lên (nếu loại Khá phải có thêm công trình nghiên cứu hoặc kinh nghiệm theo yêu cầu chương trình)."),
    h3("Phản biện độc lập"),
    ul([
      "Thời hạn hoàn thành tối đa 06 tháng.",
      "Gửi lấy ý kiến 03 phản biện độc lập, trong đó ít nhất 02 người ngoài cơ sở đào tạo.",
      "Đạt khi có ít nhất 02/03 ý kiến đồng ý.",
      "Miễn phản biện độc lập nếu số bài báo quốc tế WoS/Scopus Q1 hoặc Q2 nhiều hơn chuẩn đầu ra ít nhất 02 bài và nghiên cứu sinh là tác giả chính."
    ]),
    h3("Hội đồng đánh giá luận án"),
    ul([
      "Ít nhất 05 thành viên, số lẻ; Chủ tịch tối thiểu Phó Giáo sư; thành viên ngoài cơ sở đào tạo tối thiểu 40%.",
      "Luận án đạt khi có tối thiểu 80% thành viên hội đồng bỏ phiếu thông qua.",
      "Tổ chức bảo vệ trong vòng 03 tháng kể từ khi qua vòng phản biện độc lập."
    ]),
    h2("Buộc thôi học"),
    p("Nghiên cứu sinh bị buộc thôi học nếu không hoàn thành chương trình trong thời gian đào tạo tối đa hoặc vi phạm nghiêm trọng liêm chính học thuật.")
  ].join("")
};

const MATERIAL_TT54 = {
  slug: "thong-tu-54-2026-tt-bgddt",
  title: "Thông tư 54/2026/TT-BGDĐT — Chương trình đào tạo các trình độ giáo dục đại học",
  excerpt:
    "Tín chỉ, khối lượng tối thiểu từng trình độ, chuẩn đầu ra, cấu trúc chương trình, tỷ lệ giảng viên cơ hữu và thẩm định chương trình.",
  fileUrl: "/tai-lieu/phap-luat/TT_54_BGDDT.pdf",
  sortOrder: 20,
  content: [
    h2("Tín chỉ"),
    p("01 tín chỉ tương đương 45–50 giờ học tập. Đối với giảng dạy trực tiếp theo lớp: 01 tín chỉ yêu cầu tối thiểu 15 giờ lý thuyết hoặc 30 giờ thực hành/thí nghiệm (01 giờ học = 50 phút)."),
    h2("Khối lượng học tập tối thiểu"),
    ul([
      "Đại học (bậc 6): tối thiểu 120 tín chỉ; đầu vào tốt nghiệp THPT hoặc tương đương.",
      "Chuyên sâu bậc 7 (kỹ sư, bác sĩ...): từ 150 tín chỉ trở lên, trong đó thực hành/thực tập ít nhất 08 tín chỉ.",
      "Thạc sĩ: từ 45 tín chỉ trở lên; đầu vào tốt nghiệp đại học hoặc văn bằng bậc 6.",
      "Tiến sĩ: 90 tín chỉ; đầu vào tốt nghiệp thạc sĩ hoặc văn bằng bậc 7."
    ]),
    h2("Chuẩn đầu ra"),
    ul([
      "Đại học: bắt buộc năng lực số, nội dung về trí tuệ nhân tạo (AI), năng lực ngoại ngữ, khả năng thích ứng và học tập suốt đời.",
      "Thạc sĩ: năng lực nghiên cứu, đổi mới sáng tạo, ứng dụng thực tiễn.",
      "Tiến sĩ: nghiên cứu độc lập, đề xuất công nghệ hoặc giải pháp mới, có công bố khoa học hoặc ứng dụng nghiên cứu."
    ]),
    h2("Cấu trúc chương trình"),
    ul([
      "Thạc sĩ định hướng nghiên cứu: dành 24–30 tín chỉ cho hoạt động nghiên cứu khoa học.",
      "Thạc sĩ định hướng ứng dụng: dành 6–9 tín chỉ thực tập.",
      "Tiến sĩ: nghiên cứu khoa học và thực hiện luận án chiếm ít nhất 80% tổng khối lượng chương trình."
    ]),
    h2("Đội ngũ giảng viên"),
    ul([
      "Giảng viên cơ hữu đảm nhiệm tối thiểu 75% khối lượng đối với chương trình định hướng nghiên cứu; 65% với định hướng ứng dụng.",
      "Chương trình đại học: giảng viên toàn thời gian có trình độ tiến sĩ phải trực tiếp giảng dạy ít nhất 50% tổng khối lượng thuộc khối kiến thức cơ sở ngành, ngành và chuyên sâu."
    ]),
    h2("Tổ chức thực hiện"),
    p("Cơ sở đào tạo quản lý theo nguyên tắc hậu kiểm, tự đánh giá chuẩn đầu ra và rà soát, cải tiến chương trình định kỳ. Chương trình bị chấm dứt hiệu lực quyết định phê duyệt tổ chức thực hiện nếu cơ sở không tổ chức tuyển sinh hoặc dừng tuyển sinh trong thời hạn 03 năm liên tục.")
  ].join("")
};

const MATERIAL_TT56 = {
  slug: "thong-tu-56-2026-tt-bgddt",
  title: "Thông tư 56/2026/TT-BGDĐT — Quy chế đào tạo trình độ đại học",
  excerpt:
    "Hình thức chính quy/thường xuyên, liên kết đào tạo, kế hoạch học kỳ, đánh giá học phần, cảnh báo học tập, học song bằng và xử lý gian lận công nghệ cao.",
  fileUrl: "/tai-lieu/phap-luat/tt_56_bgddt.pdf",
  sortOrder: 30,
  content: [
    h2("Thời gian đào tạo"),
    ul([
      "Hình thức thường xuyên phải dài hơn hình thức chính quy ít nhất một phần tư thời gian đào tạo chuẩn.",
      "Thời gian tối đa hoàn thành chương trình đại học không vượt quá 2,0 lần thời gian đào tạo chuẩn."
    ]),
    h2("Hình thức chính quy và đánh giá từ xa"),
    ul([
      "Chính quy: thời lượng học trực tiếp tại trường vào ban ngày chiếm trên 50% tổng khối lượng chương trình.",
      "Kiểm tra, đánh giá theo phương thức từ xa chiếm tối đa 50% điểm học phần."
    ]),
    h2("Liên kết đào tạo"),
    p("Cấm liên kết đào tạo trong nước đối với các khối ngành sư phạm, an ninh, quốc phòng. Giảng viên của cơ sở giáo dục đại học nước ngoài trực tiếp tham gia giảng dạy chương trình liên kết phải đảm nhận ít nhất 25% tổng khối lượng chương trình."),
    h2("Kế hoạch và đăng ký học tập"),
    ul([
      "Mỗi năm học có 02 hoặc 03 học kỳ chính, tổng số tuần học tập, giảng dạy tối thiểu trên lớp là 30 tuần.",
      "Kế hoạch học kỳ phải được xây dựng và công bố tối thiểu 04 tuần trước ngày học chính thức.",
      "Khối lượng học tập mỗi học kỳ: không ít hơn 2/3 và không vượt quá 3/2 khối lượng trung bình một học kỳ theo kế hoạch chuẩn."
    ]),
    h2("Đánh giá học phần"),
    p("Mỗi học phần được đánh giá qua tối thiểu 03 điểm thành phần, trong đó điểm thi cuối kỳ có trọng số tối thiểu 50%."),
    h2("Cảnh báo học tập và xếp loại tốt nghiệp"),
    ul([
      "Sinh viên bị buộc thôi học nếu cảnh báo học tập quá 03 lần liên tiếp hoặc hết thời gian đào tạo tối đa.",
      "Sinh viên đạt xếp loại Xuất sắc hoặc Giỏi bị giảm 01 mức xếp loại tốt nghiệp nếu học lại quá 10% khối lượng tín chỉ chuẩn, bị kỷ luật từ mức cảnh cáo trở lên, hoặc vi phạm liêm chính học thuật."
    ]),
    h2("Học cùng lúc hai chương trình"),
    p("Sinh viên được đăng ký học song bằng sớm nhất khi đạt trình độ năm thứ 2 của chương trình thứ nhất."),
    h2("Gian lận công nghệ cao"),
    p("Thông tư xác định nhóm vi phạm gian lận công nghệ cao gồm: sử dụng trái phép trí tuệ nhân tạo (AI), thi hộ, mua bán đồ án/khóa luận, can thiệp hack hệ thống quản lý học tập (LMS).")
  ].join("")
};

const QUESTIONS: Array<{ text: string; options: string[]; correctOptionIndex: number; sortOrder: number }> = [
  {
    sortOrder: 10,
    text: "Theo Thông tư 53/2026/TT-BGDĐT, hình thức đào tạo trình độ tiến sĩ được quy định như thế nào?",
    options: [
      "Đào tạo theo hình thức chính quy hoặc thường xuyên",
      "Chỉ đào tạo theo hình thức chính quy",
      "Đào tạo kết hợp từ xa 100%",
      "Cả chính quy và vừa làm vừa học"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 20,
    text: "Theo Thông tư 53/2026/TT-BGDĐT, sinh viên đại học xếp loại Giỏi (tích lũy 70% tín chỉ) được xem xét chuyển đổi tối đa bao nhiêu khối lượng học tập khi học trước chương trình Tiến sĩ?",
    options: ["15% tổng khối lượng", "20% tổng khối lượng", "25% tổng khối lượng", "40% tổng khối lượng"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 30,
    text: "Theo Thông tư 53/2026/TT-BGDĐT, nghiên cứu sinh được miễn khâu phản biện độc lập luận án tiến sĩ khi đáp ứng điều kiện nào sau đây?",
    options: [
      "Là thủ khoa đầu vào trình độ tiến sĩ",
      "Có số bài báo quốc tế (WoS/Scopus Q1 hoặc Q2) nhiều hơn chuẩn đầu ra ít nhất 02 bài và là tác giả chính",
      "Có trên 05 năm kinh nghiệm công tác chuyên môn",
      "Hoàn thành chương trình nghiên cứu sớm hơn 01 năm"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 40,
    text: "Thời hạn hoàn thành phản biện độc lập luận án tiến sĩ theo Thông tư 53/2026/TT-BGDĐT quy định tối đa là bao lâu?",
    options: ["Tối đa 03 tháng", "Tối đa 06 tháng", "Tối đa 09 tháng", "Tối đa 12 tháng"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 50,
    text: "Theo Thông tư 56/2026/TT-BGDĐT, hình thức đào tạo đại học chính quy yêu cầu thời lượng học trực tiếp tại trường vào ban ngày chiếm tỷ lệ tối thiểu là bao nhiêu?",
    options: ["Trên 30% tổng khối lượng", "Trên 40% tổng khối lượng", "Trên 50% tổng khối lượng", "Trên 70% tổng khối lượng"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 60,
    text: "Theo Thông tư 56/2026/TT-BGDĐT, việc kiểm tra đánh giá theo phương thức từ xa được chiếm tối đa bao nhiêu phần trăm điểm học phần?",
    options: ["Tối đa 30% điểm học phần", "Tối đa 40% điểm học phần", "Tối đa 50% điểm học phần", "Tối đa 60% điểm học phần"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 70,
    text: "Thông tư 56/2026/TT-BGDĐT nghiêm cấm liên kết đào tạo trong nước đối với các khối ngành nào?",
    options: [
      "Sư phạm, An ninh, Quốc phòng",
      "Sư phạm, Y dược, Công nghệ thông tin",
      "Kinh tế, An ninh, Luật",
      "Nghệ thuật, Thể thao, Quốc phòng"
    ],
    correctOptionIndex: 0
  },
  {
    sortOrder: 80,
    text: "Theo Thông tư 56/2026/TT-BGDĐT, sinh viên đại học đạt xếp loại Xuất sắc hoặc Giỏi sẽ bị giảm 1 mức xếp loại tốt nghiệp nếu vi phạm điều nào sau đây?",
    options: [
      "Đăng ký vượt khối lượng học tập chuẩn",
      "Học lại quá 10% khối lượng tín chỉ chuẩn",
      "Xin tạm nghỉ học 01 học kỳ vì lý do cá nhân",
      "Chuyển ngành học sau khi hoàn thành năm thứ nhất"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 90,
    text: "Hành vi nào dưới đây được Thông tư 56/2026/TT-BGDĐT xác định thuộc nhóm vi phạm gian lận công nghệ cao?",
    options: [
      "Vắng thi kết thúc học phần không có lý do",
      "Mang tài liệu giấy không được phép vào phòng thi",
      "Sử dụng trái phép Trí tuệ nhân tạo (AI), thi hộ, can thiệp hack hệ thống LMS",
      "Nộp bài tập muộn so với quy định"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 100,
    text: "Theo Thông tư 56/2026/TT-BGDĐT, sinh viên được phép đăng ký học cùng lúc 2 chương trình (học song bằng) sớm nhất ở thời điểm nào?",
    options: [
      "Ngay từ học kỳ đầu tiên của năm thứ nhất",
      "Khi đạt trình độ năm thứ 2 của chương trình thứ nhất",
      "Khi bắt đầu học kỳ 1 của năm thứ 3",
      "Chỉ khi đã hoàn thành 50% tổng số tín chỉ ngành 1"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 110,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, 01 tín chỉ được quy đổi tương đương với bao nhiêu giờ học tập?",
    options: ["30 - 35 giờ học tập", "40 - 45 giờ học tập", "45 - 50 giờ học tập", "50 - 60 giờ học tập"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 120,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, khối lượng học tập tối thiểu đối với chương trình đào tạo trình độ Đại học (Bậc 6) là bao nhiêu?",
    options: ["100 tín chỉ", "120 tín chỉ", "135 tín chỉ", "150 tín chỉ"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 130,
    text: "Đối với chương trình đào tạo chuyên sâu Bậc 7 (Kỹ sư, Bác sĩ...), khối lượng thực hành, thực tập tối thiểu bắt buộc phải chiếm bao nhiêu tín chỉ theo Thông tư 54/2026/TT-BGDĐT?",
    options: ["Ít nhất 05 tín chỉ", "Ít nhất 08 tín chỉ", "Ít nhất 10 tín chỉ", "Ít nhất 15 tín chỉ"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 140,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, hoạt động nghiên cứu khoa học và thực hiện luận án phải chiếm ít nhất bao nhiêu % tổng khối lượng chương trình đào tạo tiến sĩ?",
    options: ["50%", "65%", "75%", "80%"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 150,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, giảng viên cơ hữu phải đảm nhiệm tối thiểu bao nhiêu % khối lượng giảng dạy đối với chương trình đại học định hướng nghiên cứu?",
    options: ["50%", "60%", "65%", "75%"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 160,
    text: "Theo Thông tư 53/2026/TT-BGDĐT, thời gian đào tạo chuẩn của trình độ tiến sĩ được quy định trong khoảng thời gian nào?",
    options: ["Từ 04 năm đến 05 năm", "Từ 03 năm đến 04 năm", "Từ 02 năm đến 03 năm", "Từ 01 năm đến 02 năm"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 170,
    text: "Theo Khoản 2 Điều 4 Thông tư 53/2026/TT-BGDĐT, tổng khối lượng học tập được công nhận và chuyển đổi tối đa không vượt quá bao nhiêu phần trăm tổng khối lượng học tập của chương trình đào tạo mà người học đang theo học?",
    options: ["Không vượt quá 50%", "Không vượt quá 40%", "Không vượt quá 30%", "Không vượt quá 25%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 180,
    text: "Theo Khoản 2 Điều 11 Thông tư 53/2026/TT-BGDĐT, đối với chương trình đào tạo thạc sĩ định hướng nghiên cứu, luận văn thạc sĩ phải được thực hiện dưới sự hướng dẫn của ít nhất bao nhiêu người hướng dẫn?",
    options: [
      "Ít nhất một (01) người hướng dẫn",
      "Đúng ba (03) người hướng dẫn",
      "Ít nhất hai (02) người hướng dẫn",
      "Không bắt buộc phải có người hướng dẫn"
    ],
    correctOptionIndex: 0
  },
  {
    sortOrder: 190,
    text: "Theo Khoản 3 Điều 22 Thông tư 53/2026/TT-BGDĐT, bản thảo luận án tiến sĩ của nghiên cứu sinh được gửi lấy ý kiến của bao nhiêu phản biện độc lập?",
    options: ["05 phản biện độc lập", "02 phản biện độc lập", "03 phản biện độc lập", "04 phản biện độc lập"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 200,
    text: "Theo Điểm b Khoản 2 Điều 23 Thông tư 53/2026/TT-BGDĐT, Hội đồng đánh giá luận án tiến sĩ phải có số lượng thành viên là số lẻ và có ít nhất bao nhiêu thành viên, trong đó số thành viên ngoài cơ sở đào tạo chiếm tối thiểu bao nhiêu?",
    options: [
      "Ít nhất 07 thành viên, ngoài cơ sở đào tạo tối thiểu 50%",
      "Ít nhất 05 thành viên, ngoài cơ sở đào tạo tối thiểu 50%",
      "Ít nhất 03 thành viên, ngoài cơ sở đào tạo tối thiểu 30%",
      "Ít nhất 05 thành viên, ngoài cơ sở đào tạo tối thiểu 40%"
    ],
    correctOptionIndex: 3
  },
  {
    sortOrder: 210,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, chuẩn đầu ra đối với trình độ đại học bắt buộc phải có các yêu cầu nào sau đây?",
    options: [
      "Chỉ tiêu công bố khoa học quốc tế trong thời gian học tập",
      "Năng lực nghiên cứu độc lập và đề xuất công nghệ hoặc giải pháp mới",
      "Năng lực số, nội dung về trí tuệ nhân tạo (AI), năng lực ngoại ngữ, khả năng thích ứng và học tập suốt đời",
      "Năng lực nghiên cứu, đổi mới sáng tạo, ứng dụng và phát triển tri thức"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 220,
    text: "Theo Thông tư 54/2026/TT-BGDĐT, đối với chương trình đào tạo trình độ thạc sĩ, người học cần đáp ứng yêu cầu đầu vào nào sau đây?",
    options: [
      "Tốt nghiệp đại học hoặc có văn bằng ở trình độ bậc 6 theo Khung trình độ quốc gia",
      "Tốt nghiệp thạc sĩ hoặc có văn bằng bậc 7",
      "Đã hoàn thành chương trình chuyên sâu bậc 7 với 150 tín chỉ",
      "Tốt nghiệp trung học phổ thông hoặc trình độ tương đương"
    ],
    correctOptionIndex: 0
  },
  {
    sortOrder: 230,
    text: "Theo Điều 11 Thông tư 54/2026/TT-BGDĐT, đối với chương trình đào tạo trình độ đại học, giảng viên toàn thời gian có trình độ tiến sĩ phải trực tiếp giảng dạy ít nhất bao nhiêu phần trăm tổng khối lượng học tập thuộc khối kiến thức cơ sở ngành, ngành và chuyên sâu?",
    options: ["Ít nhất 50%", "Ít nhất 75%", "Ít nhất 65%", "Ít nhất 35%"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 240,
    text: "Theo Điều 15 Thông tư 54/2026/TT-BGDĐT, đối với cơ sở giáo dục đại học, cơ quan hoặc tổ chức nào thực hiện việc thẩm định chương trình đào tạo trước khi ban hành?",
    options: ["Hội đồng Khoa học và Đào tạo", "Hiệu trưởng nhà trường", "Bộ trưởng Bộ Giáo dục và Đào tạo", "Hội đồng trường"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 250,
    text: "Theo Điều 19 Thông tư 54/2026/TT-BGDĐT, chương trình đào tạo bị chấm dứt hiệu lực quyết định phê duyệt tổ chức thực hiện trong trường hợp nào dưới đây?",
    options: [
      "Cơ sở đào tạo không tổ chức tuyển sinh hoặc dừng tuyển sinh trong thời hạn 03 năm liên tục",
      "Quy mô đào tạo giảm trên 10% trong 2 năm liên tiếp",
      "Cơ sở đào tạo thay đổi tên gọi của trường đại học",
      "Giảng viên cơ hữu nghỉ hưu theo chế độ quá 5% tổng số lượng"
    ],
    correctOptionIndex: 0
  },
  {
    sortOrder: 260,
    text: "Theo Điều 3 Thông tư 56/2026/TT-BGDĐT, thời gian đào tạo chuẩn của hình thức đào tạo thường xuyên phải dài hơn ít nhất bao nhiêu so với thời gian đào tạo chuẩn của cùng chương trình theo hình thức chính quy?",
    options: ["Một phần tư", "Hai phần ba", "Một nửa", "Một phần ba"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 270,
    text: "Theo Khoản 3 Điều 3 Thông tư 56/2026/TT-BGDĐT, thời gian đào tạo tối đa để hoàn thành chương trình đào tạo đại học không vượt quá bao nhiêu lần thời gian đào tạo chuẩn?",
    options: ["2,0 lần", "0,0 lần", "2,5 lần", "1,5 lần"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 280,
    text: "Theo Khoản 6 Điều 7 Thông tư 56/2026/TT-BGDĐT, giảng viên của cơ sở giáo dục đại học nước ngoài trực tiếp tham gia giảng dạy chương trình liên kết phải đảm nhận ít nhất bao nhiêu phần trăm tổng khối lượng của chương trình?",
    options: ["25%", "20%", "15%", "50%"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 290,
    text: "Theo Khoản 1 Điều 8 Thông tư 56/2026/TT-BGDĐT, một năm học có bao nhiêu học kỳ chính với tổng số tuần học tập, giảng dạy tối thiểu trên lớp là bao nhiêu tuần?",
    options: [
      "03 học kỳ chính với tối thiểu 35 tuần",
      "02 hoặc 03 học kỳ chính với tối thiểu 30 tuần",
      "02 học kỳ chính với tối thiểu 40 tuần",
      "01 học kỳ chính với tối thiểu 30 tuần"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 300,
    text: "Theo Khoản 1 Điều 12 Thông tư 56/2026/TT-BGDĐT, đối với mỗi học phần, sinh viên được đánh giá qua tối thiểu bao nhiêu điểm thành phần, trong đó điểm thi cuối kỳ có trọng số tối thiểu bao nhiêu?",
    options: [
      "Tối thiểu 03 điểm thành phần, trọng số cuối kỳ tối thiểu 60%",
      "Tối thiểu 03 điểm thành phần, trọng số cuối kỳ tối thiểu 50%",
      "Tối thiểu 02 điểm thành phần, trọng số cuối kỳ tối thiểu 40%",
      "Tối thiểu 04 điểm thành phần, trọng số cuối kỳ tối thiểu 50%"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 310,
    text: "Theo Thông tư số 53/2026/TT-BGDĐT, nghiên cứu sinh trong thời gian học tập được tham gia hoạt động chuyên môn nào tại cơ sở đào tạo?",
    options: [
      "A. Giảng dạy các lớp đào tạo thạc sĩ",
      "B. Tham gia Hội đồng khoa học của cơ sở đào tạo",
      "C. Trợ giảng",
      "D. Hướng dẫn khóa luận tốt nghiệp"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 320,
    text: "Theo Thông tư số 53/2026/TT-BGDĐT, thời gian thực hiện nhiệm vụ quốc gia của người học theo quyết định của Bộ trưởng hoặc Thủ trưởng cơ quan ngang bộ là bao lâu thì không tính vào thời gian đào tạo của người học?",
    options: ["A. 1 tháng trở lên", "B. 2 tháng trở lên", "C. 2,5 tháng trở lên", "D. 3 tháng trở lên"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 330,
    text: "Theo Khoản 4 Thông tư số 53/2026/TT-BGDĐT, người đang theo học trình độ thạc sĩ và có điểm trung bình chung tích lũy đạt loại khá thì phải tích lũy tối thiểu bao nhiêu phần trăm khối lượng học tập của chương trình đào tạo để được đăng ký học trước một số học phần ở chương trình đào tạo trình độ tiến sĩ?",
    options: [
      "A. 30% khối lượng học tập của chương trình đào tạo",
      "B. 40% khối lượng học tập của chương trình đào tạo",
      "C. 50% khối lượng học tập của chương trình đào tạo",
      "D. 60% khối lượng học tập của chương trình đào tạo"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 340,
    text: "Theo Khoản 9 Điều 10 Thông tư số 53/2026/TT-BGDĐT, cơ sở đào tạo sau đại học được tổ chức đào tạo học tập trực tuyến không quá bao nhiêu phần trăm tổng khối lượng học tập của chương trình đào tạo?",
    options: ["A. 20%", "B. 30%", "C. 40%", "D. 50%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 350,
    text: "Theo Thông tư số 53/2026/TT-BGDĐT, nghiên cứu sinh bị buộc thôi học trong các trường hợp nào sau đây?",
    options: [
      "A. Thực hiện nhiệm vụ quốc tế theo quyết định của người có thẩm quyền",
      "B. Không hoàn thành chương trình đào tạo trong thời gian tối thiểu theo quy định",
      "C. Không hoàn thành chương trình đào tạo trong thời gian tối đa theo quy định",
      "D. Bị xếp loại hoàn thành nhiệm vụ 2 năm liền ở nơi đang công tác"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 360,
    text: "Theo Thông tư số 54/2026/TT-BGDĐT, đối với hoạt động giảng dạy trực tiếp theo lớp học, một tín chỉ yêu cầu tối thiểu bao nhiêu giờ thực hành?",
    options: ["A. 15 giờ", "B. 20 giờ", "C. 30 giờ", "D. 40 giờ"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 370,
    text: "Theo Thông tư số 54/2026/TT-BGDĐT, chuẩn đầu ra được dùng để:",
    options: [
      "A. Kiểm tra, đánh giá chất lượng đội ngũ giảng viên",
      "B. Kiểm tra, đánh giá, đối sánh chất lượng đầu vào",
      "C. Đối sánh, tham chiếu chương trình đào tạo",
      "D. Cải tiến chương trình đào tạo"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 380,
    text: "Theo Điều 8 Thông tư số 54/2026/TT-BGDĐT, chương trình đào tạo trình độ thạc sĩ phải đảm bảo khối lượng học tập tối thiểu là bao nhiêu tín chỉ?",
    options: ["A. 40 tín chỉ trở lên", "B. 45 tín chỉ trở lên", "C. 50 tín chỉ trở lên", "D. 55 tín chỉ trở lên"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 390,
    text: "Theo Điều 8 Thông tư số 54/2026/TT-BGDĐT, chương trình đào tạo trình độ tiến sĩ phải đảm bảo khối lượng học tập tối thiểu là bao nhiêu tín chỉ?",
    options: ["A. 80 tín chỉ", "B. 85 tín chỉ", "C. 90 tín chỉ", "D. 95 tín chỉ"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 400,
    text: "Theo Thông tư số 54/2026/TT-BGDĐT, đối với chương trình đào tạo trình độ thạc sĩ ở chương trình đào tạo định hướng ứng dụng, chuyên nghiệp phải dành bao nhiêu tín chỉ cho hoạt động thực tập?",
    options: ["A. Từ 6 đến 9 tín chỉ", "B. Từ 7 đến 10 tín chỉ", "C. Từ 8 đến 11 tín chỉ", "D. Từ 9 đến 12 tín chỉ"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 410,
    text: "Theo Thông tư số 54/2026/TT-BGDĐT đối với chương trình đào tạo trình độ thạc sĩ ở chương trình đào tạo định hướng nghiên cứu, học thuật phải dành bao nhiêu tín chỉ cho hoạt động nghiên cứu khoa học?",
    options: ["A. 21 đến 30 tín chỉ", "B. 22 đến 30 tín chỉ", "C. 23 đến 30 tín chỉ", "D. 24 đến 30 tín chỉ"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 420,
    text: "Theo Thông tư số 56/2026/TT-BGDĐT, kế hoạch học kỳ phải được xây dựng và công bố tối thiểu trước khi bắt đầu ngày học chính thức là bao lâu?",
    options: ["A. 03 tuần", "B. 04 tuần", "C. 05 tuần", "D. 06 tuần"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 430,
    text: "Theo Thông tư số 56/2026/TT-BGDĐT, khối lượng học tập tối thiểu của sinh viên trong mỗi học kỳ được quy định cụ thể thế nào?",
    options: [
      "A. Không ít hơn 1/2 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "B. Không ít hơn 1/3 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "C. Không ít hơn 2/3 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "D. Không ít hơn 1/4 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn"
    ],
    correctOptionIndex: 2
  },
  {
    sortOrder: 440,
    text: "Theo Thông tư số 56/2026/TT-BGDĐT, khối lượng học tập tối đa của sinh viên trong mỗi học kỳ được quy định cụ thể thế nào?",
    options: [
      "A. Không vượt quá 1/2 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "B. Không vượt quá 3/2 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "C. Không vượt quá 1/3 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn",
      "D. Không vượt quá 2/3 khối lượng trung bình một học kỳ theo kế hoạch học tập chuẩn"
    ],
    correctOptionIndex: 1
  },
  {
    sortOrder: 450,
    text: "Theo Thông tư số 56/2026/TT-BGDĐT, giới hạn số lần cảnh báo học tập đối với sinh viên được quy định như thế nào?",
    options: ["A. Không quá 2 lần liên tiếp", "B. Không quá 3 lần liên tiếp", "C. Không quá 4 lần liên tiếp", "D. Không quá 5 lần liên tiếp"],
    correctOptionIndex: 1
  }
];

export async function seedLegalEducationQ3_2026(prisma: PrismaClient): Promise<void> {
  const campaign = await prisma.legalEducationCampaign.upsert({
    where: { slug: LEGAL_EDUCATION_Q3_2026_SLUG },
    update: {
      title: CAMPAIGN_TITLE,
      summary: SUMMARY,
      periodLabel: PERIOD_LABEL,
      isPublished: true
    },
    create: {
      slug: LEGAL_EDUCATION_Q3_2026_SLUG,
      title: CAMPAIGN_TITLE,
      summary: SUMMARY,
      periodLabel: PERIOD_LABEL,
      isPublished: true
    }
  });

  for (const material of [MATERIAL_TT53, MATERIAL_TT54, MATERIAL_TT56]) {
    await prisma.legalEducationMaterial.upsert({
      where: { campaignId_slug: { campaignId: campaign.id, slug: material.slug } },
      update: {
        title: material.title,
        excerpt: material.excerpt,
        content: material.content,
        fileUrl: material.fileUrl,
        sortOrder: material.sortOrder,
        isPublished: true
      },
      create: {
        campaignId: campaign.id,
        slug: material.slug,
        title: material.title,
        excerpt: material.excerpt,
        content: material.content,
        fileUrl: material.fileUrl,
        sortOrder: material.sortOrder,
        isPublished: true
      }
    });
  }

  const exam = await prisma.legalExam.upsert({
    where: { campaignId: campaign.id },
    update: {
      title: `${CAMPAIGN_TITLE} — Trắc nghiệm`,
      description:
        "45 câu trắc nghiệm kiến thức pháp luật dựa trên Thông tư 53, 54 và 56/2026/TT-BGDĐT. Thời gian 30 phút, 01 lần thi, đạt từ 70%. Bài thi chỉ mở sau khi cán bộ Công đoàn rà soát đáp án.",
      durationMinutes: 30,
      passingScorePercent: 70,
      maxAttempts: 1,
      revealAnswers: false,
      shuffleQuestions: true,
      shuffleOptions: true
    },
    create: {
      campaignId: campaign.id,
      title: `${CAMPAIGN_TITLE} — Trắc nghiệm`,
      description:
        "45 câu trắc nghiệm kiến thức pháp luật dựa trên Thông tư 53, 54 và 56/2026/TT-BGDĐT. Thời gian 30 phút, 01 lần thi, đạt từ 70%. Bài thi chỉ mở sau khi cán bộ Công đoàn rà soát đáp án.",
      durationMinutes: 30,
      passingScorePercent: 70,
      maxAttempts: 1,
      revealAnswers: false,
      shuffleQuestions: true,
      shuffleOptions: true,
      isOpen: false
    }
  });

  const attemptCount = await prisma.legalExamAttempt.count({ where: { examId: exam.id } });
  if (attemptCount > 0) {
    console.log("  Bỏ qua ghi đè 45 câu hỏi vì đợt đã có lượt thi.");
    return;
  }

  await prisma.legalExamQuestion.deleteMany({ where: { examId: exam.id } });
  await prisma.legalExamQuestion.createMany({
    data: QUESTIONS.map((q) => ({
      examId: exam.id,
      text: q.text,
      optionsJson: JSON.stringify(q.options),
      correctOptionIndex: q.correctOptionIndex,
      sortOrder: q.sortOrder
    }))
  });
}

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Seeding phổ biến pháp luật Quý III/2026...");
    await seedLegalEducationQ3_2026(prisma);
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = process.argv[1]?.includes("seed-legal-education-q3-2026");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
