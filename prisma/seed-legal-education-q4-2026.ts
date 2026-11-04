/**
 * Seed đợt phổ biến giáo dục pháp luật Quý IV/2026 — an toàn chạy lại (upsert theo slug).
 *
 * Tài liệu nguồn: Tim_Hieu_Phap_Luat_Quy_IV/ và bản PDF Công báo của Bộ luật Lao động, Luật Công đoàn, Luật Bảo hiểm xã hội, Luật Bình đẳng giới, Luật Mặt trận Tổ quốc Việt Nam, Nghị định 105/2026/NĐ-CP, Nghị định 283/2026/NĐ-CP.
 * Ngân hàng câu hỏi lấy từ Bộ câu hỏi thi Quý 4; đáp án là phương án chữ đỏ.
 * Chạy lại không xóa câu hỏi nếu đợt đã có lượt thi, và không đóng bài thi nếu cán bộ đã mở.
 * Thi chính thức yêu cầu mã dự thi gửi vào email (requireEntryCode).
 *
 *   pnpm prisma:seed
 *   hoặc pnpm seed:legal-education-q4
 */
import { existsSync } from "fs";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Q4_QUESTIONS } from "./seed-legal-education-q4-2026-questions";

loadEnv();
if (!process.env.DATABASE_URL) {
  const sharedEnv = ["C:\\inetpub\\congdoan2026\\shared\\.env", "C:\\inetpub\\congdoan\\shared\\.env"].find((path) =>
    existsSync(path)
  );
  if (sharedEnv) {
    console.log(`Nạp cấu hình cơ sở dữ liệu từ ${sharedEnv}`);
    loadEnv({ path: sharedEnv });
  }
}

export const LEGAL_EDUCATION_Q4_2026_SLUG = "quy-iv-2026";

const CAMPAIGN_TITLE = "Phổ biến giáo dục pháp luật quý IV năm 2026";
const PERIOD_LABEL = "Quý IV năm 2026";
const SUMMARY =
  "Nội dung phổ biến gồm Nghị định 328/2026/NĐ-CP (phòng, chống tin giả, tin sai sự thật), Thông tư 49/2026/TT-BGDĐT (ứng dụng công nghệ trong giáo dục đại học và giáo dục nghề nghiệp), Thông tư 83/2026/TT-BGDĐT (Chuẩn cơ sở giáo dục đại học), Luật số 93/2025/QH15 (khoa học, công nghệ và đổi mới sáng tạo) và Nghị quyết số 66-NQ/TW ngày 30/4/2025 của Bộ Chính trị (đổi mới công tác xây dựng và thi hành pháp luật). Đợt này bổ sung Bộ luật Lao động, Luật Công đoàn, Luật Bảo hiểm xã hội, Luật Bình đẳng giới, Luật Mặt trận Tổ quốc Việt Nam, Nghị định 105/2026/NĐ-CP về tài chính công đoàn và Nghị định 283/2026/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội. Theo Thông báo số 1005 ngày 12/10/2026, các đơn vị phổ biến từ ngày 12/10/2026 đến ngày 30/11/2026. Đoàn viên đọc tài liệu tóm tắt và tải văn bản gốc; Bài thi chính thức yêu cầu mã dự thi được gửi vào email.";

/** Theo Thông báo 1005: thời gian các đơn vị thực hiện. */
const CAMPAIGN_START = new Date("2026-10-12T00:00:00.000+07:00");
const CAMPAIGN_END = new Date("2026-11-30T23:59:59.000+07:00");

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

function ol(items: string[]): string {
  return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

const MATERIAL_ND328 = {
  slug: "nghi-dinh-328-2026-nd-cp",
  title: "Nghị định 328/2026/NĐ-CP — Phòng, chống tin giả, tin sai sự thật",
  excerpt:
    "Phân loại tin giả, quy trình xử lý 6 bước, thời hạn gắn nhãn và công bố, trách nhiệm bộ ngành, địa phương và doanh nghiệp nền tảng.",
  fileUrl: "/tai-lieu/phap-luat/nd_328_2026.pdf",
  sortOrder: 10,
  content: [
    h2("Phạm vi và đối tượng áp dụng"),
    p("Nghị định quy định phân loại tin giả, tin sai sự thật; nguyên tắc, quản lý nhà nước và hợp tác quốc tế; quy trình xử lý và các biện pháp phòng, chống; thẩm quyền, trách nhiệm của bộ, ngành, địa phương và tổ chức, cá nhân liên quan. Văn bản ban hành ngày 19/8/2026, có hiệu lực từ ngày 05/10/2026."),
    p("Áp dụng với cơ quan, tổ chức, cá nhân Việt Nam; người gốc Việt Nam chưa xác định quốc tịch cư trú tại Việt Nam; tổ chức quốc tế, tổ chức và cá nhân nước ngoài tại Việt Nam; doanh nghiệp viễn thông, Internet, mạng xã hội, dịch vụ thông tin xuyên biên giới hoạt động tại Việt Nam hoặc cung cấp dịch vụ cho tổ chức, cá nhân Việt Nam; tổ chức, cá nhân nước ngoài có vi phạm ảnh hưởng đến quyền, lợi ích hợp pháp của Việt Nam."),
    h2("Khái niệm"),
    ul([
      "Tin giả, tin sai sự thật: thông tin không có thật hoặc chỉ có một phần sự thật, xâm hại an ninh, uy tín, hình ảnh quốc gia, trật tự an toàn xã hội, quyền và lợi ích hợp pháp của cá nhân, tổ chức (gồm thông tin giả, sai lệch, giả mạo, bịa đặt, vu khống, xuyên tạc).",
      "Gắn nhãn: cơ quan có thẩm quyền đánh dấu, hiển thị cảnh báo bằng ký hiệu, biểu tượng hoặc dòng chữ “TIN GIẢ, TIN SAI SỰ THẬT”.",
      "Công bố: công khai thông tin đã được xác nhận là tin giả, tin sai sự thật, cùng danh tính cá nhân, tổ chức phát ngôn, sáng tạo, lưu trữ, đăng tải, phát tán, chia sẻ, bình luận thông tin vi phạm."
    ]),
    h2("Phân loại theo mức độ nguy hại"),
    ul([
      "Hậu quả hoặc nguy cơ gây hậu quả đặc biệt nghiêm trọng: tác động tiêu cực quy mô lớn đến an ninh quốc gia, quốc phòng, đối ngoại, trật tự an toàn xã hội; xâm hại uy tín của Đảng, Nhà nước, lãnh đạo cấp cao; gây khủng hoảng truyền thông, kích động bạo loạn, gây hoang mang sâu sắc trong dư luận.",
      "Tin giả nguy hại: tác động phạm vi hẹp, xâm hại trực tiếp uy tín, danh dự, nhân phẩm, quyền lợi của cơ quan, tổ chức, cá nhân cụ thể."
    ]),
    h2("Nguyên tắc và trường hợp không áp dụng quy trình"),
    p("Việc phòng, chống phải tuân thủ pháp luật, chủ động phòng ngừa, xử lý nghiêm minh, công khai, minh bạch và bảo đảm lợi ích quốc gia, dân tộc."),
    p("Không áp dụng quy trình của Nghị định này đối với tin giả đang trong quá trình điều tra, xét xử; tin giả đã có kết luận của cơ quan có thẩm quyền hoặc đã được công bố trước đó; tin giả đang được xử lý theo pháp luật khác."),
    h2("Quy trình xử lý 6 bước"),
    ol([
      "Phát hiện thông tin có dấu hiệu giả, sai sự thật (qua tố giác, rà soát của cơ quan chức năng, nền tảng mạng hoặc yêu cầu của nạn nhân).",
      "Kiểm chứng, xác minh, làm rõ.",
      "Gắn nhãn tin giả, tin sai sự thật.",
      "Công bố, cảnh báo.",
      "Ngăn chặn, gỡ bỏ thông tin.",
      "Áp dụng các hình thức xử lý."
    ]),
    h3("Kiểm chứng và trạng thái xử lý"),
    p("Các bộ, cơ quan ngang bộ, UBND các cấp xác minh theo phạm vi quản lý; ưu tiên tin giả có nguy cơ gây hậu quả đặc biệt nghiêm trọng. Phải xác định danh tính đối tượng phát tán; nếu không xác định được thì phối hợp Bộ Công an. Có dấu hiệu tội phạm thì chuyển ngay cho cơ quan tiến hành tố tụng. Trên cổng thông tin điện tử, trạng thái thể hiện “Đang xử lý” trong quá trình kiểm chứng và đổi thành “Đã hoàn thành xử lý” khi xong."),
    h3("Gắn nhãn"),
    ul([
      "Thực hiện trong vòng 24 giờ kể từ khi cơ quan có thẩm quyền kết luận là tin giả, tin sai sự thật.",
      "Hiển thị cảnh báo bằng biểu tượng hoặc dòng chữ “TIN GIẢ, TIN SAI SỰ THẬT”; yêu cầu doanh nghiệp dịch vụ mạng rà soát, xử lý nội dung tương tự.",
      "Tin giả chứa thông tin công dân không được tiếp cận thì không gắn nhãn; yêu cầu doanh nghiệp mạng gỡ bỏ, ngăn chặn ngay."
    ]),
    h3("Công bố, cảnh báo và gỡ bỏ"),
    ul([
      "Tin giả có hậu quả đặc biệt nghiêm trọng: công bố ngay sau khi gắn nhãn.",
      "Tin giả nguy hại: công bố, cảnh báo trong vòng 12 giờ làm việc kể từ khi gắn nhãn.",
      "Hình thức công bố: khu dân cư, cơ quan làm việc của đối tượng hoặc nạn nhân; trang, cổng thông tin điện tử; báo chí, truyền thông đại chúng; hoặc công bố chính thức cấp nhà nước.",
      "Doanh nghiệp mạng, cơ quan truyền thông ngăn chặn, gỡ bỏ ngay sau khi nhận thông báo hoặc yêu cầu.",
      "Tiếp nhận phản ánh, tố giác qua đường dây nóng, cổng thông tin điện tử, ứng dụng VNeID, trực tiếp hoặc bằng văn bản."
    ]),
    h2("Trách nhiệm của cơ quan và doanh nghiệp"),
    ul([
      "Bộ Công an giúp Chính phủ thống nhất quản lý nhà nước; điều phối, liên thông dữ liệu; trực tiếp kiểm chứng vụ việc liên quan an ninh quốc gia, trật tự an toàn xã hội, hoặc liên quan từ 02 bộ, ngành hoặc 02 tỉnh, thành phố trở lên; thanh tra, kiểm tra và chủ trì hợp tác quốc tế.",
      "Bộ Văn hóa, Thể thao và Du lịch chủ trì lĩnh vực được giao; phối hợp Bộ Công an công bố rộng rãi trên báo chí đối với tin giả có nguy cơ gây khủng hoảng truyền thông.",
      "Bộ Quốc phòng chủ trì lĩnh vực quân sự, quốc phòng. Bộ Ngoại giao chủ trì lĩnh vực đối ngoại và công bố chính thức cấp nhà nước đối với tin giả ảnh hưởng chủ trương, chính sách đối ngoại, quan hệ quốc tế.",
      "Bộ, cơ quan ngang bộ khác và UBND các cấp chủ trì rà soát, kiểm chứng, gắn nhãn, công bố, xử lý trong phạm vi, địa bàn quản lý; chuyển hồ sơ cho Bộ Công an nếu không thuộc thẩm quyền xử lý hành chính.",
      "Doanh nghiệp viễn thông, Internet, mạng xã hội và dịch vụ xuyên biên giới có trách nhiệm ngăn chặn, gỡ bỏ và phối hợp xử lý theo yêu cầu của cơ quan có thẩm quyền."
    ]),
    p("Các bộ, địa phương bảo quản hồ sơ xác minh và gửi kết quả về Bộ Công an để tập hợp, theo dõi. Thủ trưởng các bộ, cơ quan ngang bộ, Chủ tịch UBND các cấp và tổ chức, cá nhân liên quan chịu trách nhiệm thi hành.")
  ].join("")
};

const MATERIAL_TT49 = {
  slug: "thong-tu-49-2026-tt-bgddt",
  title: "Thông tư 49/2026/TT-BGDĐT — Ứng dụng công nghệ trong giáo dục đại học và giáo dục nghề nghiệp",
  excerpt:
    "Ứng dụng công nghệ số và trí tuệ nhân tạo trong đào tạo, đánh giá, nghiên cứu, học liệu số, quản trị nhà trường và liêm chính học thuật.",
  fileUrl: "/tai-lieu/phap-luat/tt_49_2026_bgddt.pdf",
  sortOrder: 20,
  content: [
    h2("Phạm vi, đối tượng và nguyên tắc"),
    p("Thông tư do Bộ trưởng Bộ Giáo dục và Đào tạo ban hành ngày 30/6/2026, có hiệu lực từ ngày 15/8/2026. Thông tư thay thế Thông tư số 15/2018/TT-BGDĐT (thư, trang điện tử của cơ sở giáo dục) và Thông tư số 30/2023/TT-BGDĐT (đào tạo trực tuyến)."),
    p("Áp dụng đối với cơ sở giáo dục đại học, cao đẳng, trung cấp trong việc ứng dụng công nghệ số và trí tuệ nhân tạo vào đào tạo, nghiên cứu, quản trị và hỗ trợ người học; tổ chức, cá nhân tham gia đào tạo, nghiên cứu, quản lý, phục vụ; tổ chức, doanh nghiệp cung cấp nền tảng và giải pháp công nghệ số, trí tuệ nhân tạo cho giáo dục đại học và giáo dục nghề nghiệp."),
    ul([
      "Lấy người học làm trung tâm.",
      "Công nghệ và trí tuệ nhân tạo là công cụ hỗ trợ, không thay thế trách nhiệm chuyên môn của giảng viên và người học.",
      "Bảo đảm tự chủ, minh bạch, an toàn thông tin, bảo vệ dữ liệu cá nhân và tuân thủ đạo đức, liêm chính học thuật."
    ]),
    h2("Ứng dụng trong đào tạo"),
    p("Cơ sở giáo dục được tổ chức linh hoạt: đào tạo trực tiếp có hỗ trợ công nghệ, đào tạo trực tuyến toàn phần, đào tạo kết hợp và đào tạo cá thể hóa bằng trí tuệ nhân tạo."),
    p("Hệ thống quản lý học tập phải có xác thực danh tính, lưu vết toàn bộ quá trình, phòng ngừa gian lận, truy xuất dữ liệu để giải trình và bảo mật thông tin. Thủ trưởng cơ sở giáo dục nghiệm thu hệ thống trước khi đưa vào sử dụng. Trí tuệ nhân tạo chỉ hỗ trợ, phân tích và tư vấn; không thay thế giảng viên và không được làm sai lệch kết quả đào tạo."),
    h2("Kiểm tra, đánh giá và nghiên cứu khoa học"),
    ul([
      "Công nghệ được dùng xuyên suốt từ xây dựng ngân hàng đề, tổ chức thi, chấm điểm, giám sát đến phân tích năng lực người học.",
      "Các hình thức đánh giá (thi trực tiếp và thi trực tuyến) phải tương đương về chất lượng và độ khó.",
      "Kết quả trên môi trường số được lưu trữ an toàn, trích xuất được để thanh tra, kiểm tra và có cơ chế phúc khảo minh bạch. Trí tuệ nhân tạo tham gia chấm điểm, đánh giá phải có sự kiểm soát của con người.",
      "Trong nghiên cứu, công nghệ hỗ trợ thu thập, xử lý dữ liệu, mô phỏng và chia sẻ kết quả. Cơ sở giáo dục phải có cơ chế phát hiện, xử lý việc làm giả, làm sai lệch số liệu hoặc gian lận nghiên cứu.",
      "Dùng trí tuệ nhân tạo trong nghiên cứu phải kiểm chứng được, minh bạch, không làm thay đổi bản chất khoa học của công trình và tuân thủ Luật Sở hữu trí tuệ."
    ]),
    h2("Học liệu số"),
    ul([
      "Bài giảng, giáo trình điện tử và học liệu mở phải khoa học, cập nhật, bám sát chuẩn đầu ra và được cơ sở giáo dục thẩm định trước khi dùng.",
      "Hệ thống lưu trữ phải an toàn, dễ truy cập và liên thông kỹ thuật.",
      "Dùng công nghệ hoặc trí tuệ nhân tạo để tạo lập, cập nhật học liệu phải minh bạch nguồn gốc; khi chia sẻ, tái sử dụng phải phân định quyền sở hữu, quyền sử dụng và bảo vệ lợi ích hợp pháp của tác giả."
    ]),
    h2("Liêm chính học thuật"),
    p("Công nghệ và trí tuệ nhân tạo chỉ là công cụ. Người học và nhà nghiên cứu tự chịu trách nhiệm về năng lực và sản phẩm học thuật của mình. Nhà trường ban hành quy định nội bộ về chế tài. Giảng viên, sinh viên phải khai báo trung thực việc sử dụng trí tuệ nhân tạo trong báo cáo, bài tập và công trình nghiên cứu khi quy định yêu cầu."),
    p("Các hành vi bị nghiêm cấm:"),
    ul([
      "Dùng trí tuệ nhân tạo hoặc công nghệ để gian lận trong học tập, thi cử, nghiên cứu.",
      "Đạo văn, sao chép trái phép dữ liệu, học liệu số.",
      "Giả mạo hoặc cố tình làm sai lệch hồ sơ, số liệu, kết quả học tập, nghiên cứu.",
      "Nhờ người khác học hộ, thi hộ, làm hộ nghiên cứu.",
      "Cố tình che giấu, không công bố việc sử dụng trí tuệ nhân tạo khi quy định bắt buộc phải khai báo."
    ]),
    h2("Quản trị nhà trường và hỗ trợ người học"),
    ul([
      "Chuyển đổi quản trị dựa trên dữ liệu về nhân sự, tài chính, cơ sở vật chất.",
      "Triển khai 100% dịch vụ hành chính và thanh toán không dùng tiền mặt trên môi trường trực tuyến; không yêu cầu người học cung cấp lại thông tin đã có trên hệ thống liên thông.",
      "Xây dựng hồ sơ người học điện tử; dùng trí tuệ nhân tạo và phân tích dữ liệu để dự báo rủi ro, tư vấn học tập, hướng nghiệp và tâm lý.",
      "Dữ liệu được chuẩn hóa, quản lý tập trung và kết nối với cơ sở dữ liệu quốc gia, cơ sở dữ liệu ngành giáo dục."
    ]),
    h2("Điều kiện bảo đảm"),
    ul([
      "Đào tạo, bồi dưỡng năng lực số và năng lực trí tuệ nhân tạo thường xuyên cho giảng viên, người học.",
      "Hạ tầng kỹ thuật đồng bộ; ưu tiên nền tảng dùng chung và điện toán đám mây.",
      "Phân quyền truy cập, sao lưu dự phòng, bảo vệ dữ liệu cá nhân và an ninh mạng.",
      "Ban hành quy chế nội bộ, trong đó có bộ quy tắc ứng xử khi sử dụng trí tuệ nhân tạo.",
      "Có kế hoạch ứng dụng công nghệ trung hạn 5 năm và kế hoạch hằng năm; huy động nguồn lực từ ngân sách, quỹ tự cân đối, xã hội hóa và hợp tác doanh nghiệp."
    ])
  ].join("")
};

const MATERIAL_TT83 = {
  slug: "thong-tu-83-2026-tt-bgddt",
  title: "Thông tư 83/2026/TT-BGDĐT — Chuẩn cơ sở giáo dục đại học",
  excerpt:
    "Sáu tiêu chuẩn về quản trị, giảng viên, cơ sở vật chất, tài chính, tuyển sinh — đào tạo, khoa học công nghệ; cách đánh giá và thời hạn công bố.",
  fileUrl: "/tai-lieu/phap-luat/tt_83_2026_bgddt.pdf",
  sortOrder: 30,
  content: [
    h2("Mục đích và nguyên tắc"),
    p("Thông tư (ban hành ngày 30/9/2026) quy định Chuẩn cơ sở giáo dục đại học để phục vụ quản lý nhà nước, nâng cao chất lượng và làm căn cứ tự đánh giá, giải trình. Áp dụng với cơ sở giáo dục đại học và cơ sở giáo dục khác có hoạt động giáo dục đại học. Thông tư thay thế Thông tư số 01/2024/TT-BGDĐT ngày 05/02/2024. Kỳ đánh giá đầu tiên theo chuẩn mới dựa trên dữ liệu năm 2026."),
    ul([
      "Chuẩn là tập hợp yêu cầu tối thiểu về điều kiện bảo đảm chất lượng, được rà soát, cập nhật định kỳ 05 năm một lần để tiệm cận chuẩn khu vực và quốc tế.",
      "Đánh giá dựa trên dữ liệu, minh chứng và cam kết của cơ sở đào tạo; dữ liệu phải hệ thống, chính xác, khách quan và kết nối qua HEMIS.",
      "Chỉ số phải xác định rõ đối tượng, phương pháp, thời điểm và nguồn dữ liệu; truy xuất, kiểm chứng độc lập được và không tính trùng trong cùng kỳ đánh giá."
    ]),
    h2("Tiêu chuẩn 1: Tổ chức và quản trị"),
    ul([
      "100% văn bản quy chế, quy định nội bộ được ban hành đầy đủ, đúng thẩm quyền và còn hiệu lực.",
      "Chiến lược phát triển được cụ thể hóa thành chỉ số hoạt động; ít nhất 50% số chỉ số hoạt động chính đạt hoặc vượt mục tiêu hằng năm.",
      "Dữ liệu về người học, giảng viên, chương trình đào tạo, cơ sở vật chất và kết quả hoạt động được cập nhật đầy đủ, chính xác, đúng hạn và nhất quán trên HEMIS."
    ]),
    h2("Tiêu chuẩn 2: Giảng viên"),
    ul([
      "Số người học quy đổi trên giảng viên quy đổi không lớn hơn 40.",
      "Giảng viên cơ hữu trong độ tuổi lao động chiếm không thấp hơn 70% tổng số giảng viên.",
      "Tỷ lệ giảng viên có trình độ tiến sĩ: cơ sở không đào tạo tiến sĩ không thấp hơn 20% (từ năm 2030 không thấp hơn 30%); ngành đặc thù không đào tạo tiến sĩ không thấp hơn 5% (từ năm 2030 không thấp hơn 10%).",
      "Cơ sở có đào tạo tiến sĩ không thấp hơn 40% (từ năm 2030 không thấp hơn 50%); ngành đặc thù có đào tạo tiến sĩ không thấp hơn 10% (từ năm 2030 không thấp hơn 15%)."
    ]),
    h2("Tiêu chuẩn 3: Cơ sở vật chất, học liệu và hạ tầng số"),
    ul([
      "Từ năm 2030, diện tích đất bình quân trên một người học chính quy quy đổi không nhỏ hơn 25 m2.",
      "Diện tích sàn xây dựng phục vụ đào tạo không nhỏ hơn 2,8 m2/người học chính quy quy đổi; ít nhất 70% giảng viên cơ hữu có chỗ làm việc riêng biệt.",
      "Bình quân mỗi giảng viên và người học có tối thiểu 10 lượt sử dụng học liệu thư viện hợp lệ trong năm học.",
      "Hệ thống quản lý học tập trực tuyến đáp ứng 100% chức năng và yêu cầu tối thiểu theo quy định ứng dụng công nghệ trong giáo dục đại học."
    ]),
    h2("Tiêu chuẩn 4: Tài chính"),
    ul([
      "Biên độ hoạt động (chênh lệch thu chi trên tổng thu), tính trung bình 03 năm gần nhất, không âm.",
      "Tăng trưởng bền vững — trung bình cộng tốc độ tăng tổng thu và tốc độ tăng phần thu ngoài học phí, ngoài ngân sách nhà nước hoặc nhà đầu tư hỗ trợ chi thường xuyên trong 03 năm gần nhất — không âm."
    ]),
    h2("Tiêu chuẩn 5: Tuyển sinh và đào tạo"),
    ul([
      "Tỷ lệ nhập học trung bình 03 năm gần nhất không thấp hơn 50% so với chỉ tiêu trong kế hoạch tuyển sinh; quy mô đào tạo không sụt giảm quá 30% so với 03 năm trước, trừ trường hợp giảm quy mô đã được phê duyệt hoặc công bố trước ít nhất 02 năm.",
      "Tỷ lệ thôi học trong năm không cao hơn 10%; riêng năm học đầu tiên không cao hơn 15% (đã trừ các trường hợp được loại trừ như nghỉ học tạm thời, chuyển chương trình, chuyển cơ sở).",
      "Tỷ lệ tốt nghiệp trong thời gian không quá 1,5 lần thời gian chuẩn không thấp hơn 60%; tốt nghiệp đúng hạn không thấp hơn 40%.",
      "Ít nhất 70% người học hài lòng với giảng viên (số người có ít nhất một phản hồi hợp lệ đạt tối thiểu 60% phạm vi khảo sát) và ít nhất 70% người tốt nghiệp hài lòng tổng thể (phản hồi hợp lệ đạt tối thiểu 70% số người tốt nghiệp được khảo sát).",
      "Trong 12 tháng sau tốt nghiệp, tỷ lệ có việc làm phù hợp, tự tạo việc làm, học tiếp hoặc đang thực hành bắt buộc để hành nghề không thấp hơn 70%."
    ]),
    h2("Tiêu chuẩn 6: Khoa học, công nghệ và đổi mới sáng tạo"),
    ul([
      "Với cơ sở có đào tạo tiến sĩ: thu từ khoa học, công nghệ và đổi mới sáng tạo trung bình 03 năm gần nhất không thấp hơn 5% tổng thu (có trọng số theo lĩnh vực).",
      "Sản phẩm khoa học, công nghệ quy đổi bình quân không thấp hơn 0,3 sản phẩm/giảng viên quy đổi/năm.",
      "Cơ sở có đào tạo tiến sĩ và không phải trường ngành đặc thù: không thấp hơn 0,6 sản phẩm quy đổi/năm, trong đó bài thuộc Web of Science hoặc Scopus không thấp hơn 0,3 sản phẩm quy đổi/năm.",
      "Cơ sở thuộc Bộ Quốc phòng, Bộ Công an được dùng danh mục tạp chí thay thế theo quy định, thay cho Web of Science hoặc Scopus."
    ]),
    h2("Nguồn dữ liệu"),
    p("Dữ liệu đưa lên HEMIS phải chính xác, khách quan, kiểm chứng được và lấy từ năm nguồn: hệ thống quản trị số tập trung (nhân sự, tài chính, đào tạo); hệ thống quản lý học tập và hỗ trợ đào tạo trực tuyến; phần mềm thư viện; kết quả khảo sát, báo cáo kiểm toán, báo cáo công khai đã được phê duyệt; dữ liệu do cơ sở thực hành, đơn vị phối hợp đào tạo xác nhận."),
    h2("Đối tượng áp dụng một phần"),
    ul([
      "Cơ sở mới thành lập, chưa tuyển sinh: chỉ áp dụng tiêu chuẩn 1, 2 và 3, trừ tiêu chí 3.3; số liệu quy mô là số dự kiến.",
      "Cơ sở chưa có khóa tốt nghiệp: chưa áp dụng tiêu chí 5.3, tiêu chí 5.5 và chỉ số hài lòng của người tốt nghiệp. Tiêu chuẩn 4 và chỉ số cần dữ liệu 03 năm được áp dụng khi đủ dữ liệu.",
      "Cơ sở thuộc Bộ Quốc phòng, Bộ Công an: không áp dụng tiêu chuẩn 4, tiêu chí 1.1 và tiêu chí 6.1.",
      "Lĩnh vực nghệ thuật và nhóm ngành thể dục, thể thao: không bắt buộc tiêu chí 6.2."
    ]),
    h2("Xác định kết quả và thời hạn báo cáo"),
    ul([
      "Mỗi chỉ số có một trong ba trạng thái: Đạt, Không đạt, Chưa đủ dữ liệu đánh giá.",
      "Thiếu dữ liệu: cơ sở được giải trình, bổ sung trong thời hạn không quá 30 ngày. Quá hạn mà không giải trình được thì xác định là không đạt, trừ bất khả kháng được cơ quan có thẩm quyền xác nhận.",
      "Đáp ứng Chuẩn khi mọi tiêu chuẩn, tiêu chí, chỉ số thuộc phạm vi áp dụng đều đạt. Chỉ số chưa đến lộ trình áp dụng không bị tính là không đạt.",
      "Kê khai không trung thực hoặc giả mạo dữ liệu thì bị đánh giá là không đáp ứng Chuẩn và xử lý theo pháp luật.",
      "Biện pháp quản lý nhà nước căn cứ vào từng chỉ số chưa đạt, nguyên nhân và mức độ; không chỉ dựa vào kết luận tổng hợp."
    ]),
    p("Số liệu không thuộc tài chính chốt tại ngày 31/12 của năm báo cáo. Số liệu tài chính hoàn thiện chậm nhất ngày 31/3 năm sau. Báo cáo tự đánh giá hoàn thành chậm nhất ngày 30/4. Cơ sở đào tạo công bố kết quả trước ngày 31/5; Bộ Giáo dục và Đào tạo thông báo kết quả trước ngày 30/6 hằng năm.")
  ].join("")
};

const MATERIAL_LUAT93 = {
  slug: "luat-93-2025-qh15",
  title: "Luật số 93/2025/QH15 — Khoa học, công nghệ và đổi mới sáng tạo",
  excerpt:
    "Nguyên tắc phát triển khoa học và đổi mới sáng tạo, chấp nhận rủi ro, thử nghiệm có kiểm soát, doanh nghiệp, nhân tài và hợp tác quốc tế.",
  fileUrl: "/tai-lieu/phap-luat/luat_93_2025_qh15.pdf",
  sortOrder: 40,
  content: [
    h2("Phạm vi và hiệu lực"),
    p("Quốc hội khóa XV thông qua Luật ngày 27/6/2025. Luật quy định hoạt động khoa học, công nghệ và đổi mới sáng tạo; chính sách, biện pháp bảo đảm phát triển các hoạt động này. Áp dụng với cơ quan, tổ chức, cá nhân tham gia hoặc liên quan tại Việt Nam, và với chủ thể ngoài lãnh thổ Việt Nam khi có quyền, nghĩa vụ theo pháp luật Việt Nam hoặc điều ước quốc tế mà Việt Nam là thành viên."),
    p("Luật có hiệu lực từ ngày 01/10/2025. Các điều 15, 61, 62, 63, 64, 65 và 66 có hiệu lực từ ngày 01/7/2025. Luật Khoa học và công nghệ số 29/2013/QH13 (đã được sửa đổi, bổ sung) hết hiệu lực kể từ ngày Luật này có hiệu lực, trừ các trường hợp chuyển tiếp tại khoản 1, 2, 3, 6, 8 và 9 Điều 73."),
    p("Luật này được ưu tiên áp dụng khi có quy định khác với luật, nghị quyết khác của Quốc hội về khoa học, công nghệ và đổi mới sáng tạo, trừ điều ước quốc tế và nghị quyết của Quốc hội có cơ chế, chính sách ưu đãi thuận lợi hơn."),
    h2("Một số khái niệm"),
    ul([
      "Khoa học là hệ thống tri thức về bản chất, quy luật của sự vật, hiện tượng tự nhiên, xã hội và tư duy.",
      "Công nghệ là tập hợp giải pháp kỹ thuật, quy trình, công cụ, kể cả bí quyết, được tạo ra từ tri thức khoa học và kinh nghiệm để biến nguồn lực thành sản phẩm.",
      "Đổi mới sáng tạo là tạo ra sản phẩm, dịch vụ, quy trình, mô hình kinh doanh mới hoặc cải tiến đáng kể so với cái đã có.",
      "Hoạt động khoa học, công nghệ và đổi mới sáng tạo gồm nghiên cứu cơ bản, nghiên cứu ứng dụng, phát triển công nghệ, phát triển giải pháp xã hội, sản xuất thử nghiệm, ứng dụng và chuyển giao công nghệ, đổi mới sáng tạo dựa trên đổi mới công nghệ, khởi nghiệp sáng tạo, cung cấp dịch vụ và hoạt động liên quan."
    ]),
    h2("Nguyên tắc và định hướng"),
    ul([
      "Xuất phát từ thực tiễn và dự báo xu hướng phát triển; phục vụ phát triển kinh tế - xã hội, quốc phòng, an ninh, chất lượng cuộc sống, môi trường và phát triển bền vững; lấy con người làm trung tâm.",
      "Nghiên cứu, ứng dụng trong y tế, công nghệ sinh học, trí tuệ nhân tạo và lĩnh vực liên quan trực tiếp đến con người phải đặt dưới sự giám sát, kiểm soát của con người.",
      "Bảo đảm quyền tự do nghiên cứu, sáng tạo; đề cao đạo đức nghề nghiệp, tính trung thực, khách quan và trách nhiệm.",
      "Nhà nước quản lý theo nguyên tắc hậu kiểm, đánh giá kết quả thực hiện, không can thiệp vào phương pháp và quy trình của tổ chức, doanh nghiệp, cá nhân, trừ trường hợp cần thiết.",
      "Doanh nghiệp là trung tâm của hệ thống đổi mới sáng tạo. Nhà nước ưu tiên làm chủ và thương mại hóa công nghệ trong nước, chấp nhận rủi ro, chia sẻ rủi ro và dùng thử nghiệm có kiểm soát.",
      "Ưu tiên hạ tầng nghiên cứu dùng chung, gắn viện nghiên cứu, cơ sở giáo dục đại học và doanh nghiệp; thu hút, trọng dụng nhân tài trong nước và nước ngoài."
    ]),
    h2("Chấp nhận rủi ro và thử nghiệm có kiểm soát"),
    ul([
      "Kinh phí của doanh nghiệp nhà nước đã sử dụng đúng mục tiêu, phạm vi và tuân thủ đầy đủ quy định quản lý nhiệm vụ, quy trình, nội dung nghiên cứu và biện pháp phòng ngừa rủi ro thì không phải hoàn trả chỉ vì nhiệm vụ không đạt mục tiêu đề ra.",
      "Người được giao phê duyệt, quản lý ngân sách khoa học, công nghệ và đổi mới sáng tạo được xem xét miễn trách nhiệm hành chính và bồi thường dân sự khi đã tuân thủ quy định, không cố ý vi phạm pháp luật, nhưng kết quả nhiệm vụ không đạt mục tiêu.",
      "Thử nghiệm có kiểm soát được cấp theo đề xuất của tổ chức, doanh nghiệp, thời hạn không quá 03 năm và có thể gia hạn một lần không quá 03 năm.",
      "Trong thử nghiệm có kiểm soát, cơ quan, tổ chức, cá nhân đã thực hiện đúng quy định được xem xét miễn, loại trừ trách nhiệm đối với thiệt hại, rủi ro đã được dự liệu, trừ trường hợp đã biết hoặc buộc phải biết nguy cơ mà vẫn không áp dụng biện pháp ngăn ngừa."
    ]),
    h2("Doanh nghiệp, nhân tài và phổ biến tri thức"),
    ul([
      "Tổ chức, cá nhân dùng ngân sách nhà nước hoặc được hưởng ưu đãi, hỗ trợ phải phổ biến, lan tỏa tri thức và công bố kết quả, kể cả cập nhật trên Hệ thống thông tin quốc gia về khoa học, công nghệ và đổi mới sáng tạo. Nội dung thuộc bí mật nhà nước hoặc ảnh hưởng quốc phòng, an ninh không thuộc phạm vi này.",
      "Chi phí của doanh nghiệp cho nghiên cứu khoa học, phát triển công nghệ, đổi mới sáng tạo và khoản chi cho các hoạt động đó được tính vào chi phí được trừ theo pháp luật về thuế.",
      "Nhà khoa học trẻ tài năng, kỹ sư trẻ tài năng được hỗ trợ nâng cao trình độ ở nước ngoài và chủ trì nhiệm vụ khoa học, công nghệ. Nhà khoa học xuất sắc được xem xét tài trợ để chủ trì nhóm nghiên cứu mạnh.",
      "Nghiên cứu viên sau tiến sĩ, nghiên cứu sinh và học viên thạc sĩ được xem xét tài trợ hoạt động nghiên cứu từ ngân sách nhà nước.",
      "Chuyên gia, nhà khoa học trong nước, người Việt Nam định cư ở nước ngoài và chuyên gia, nhà khoa học nước ngoài được hưởng ưu đãi về tiền lương, nhà ở, thuế và thủ tục xuất nhập cảnh theo quy định."
    ]),
    h2("Hội nhập quốc tế"),
    p("Hội nhập, hợp tác trên cơ sở độc lập, chủ quyền, an ninh quốc gia, bình đẳng và cùng có lợi. Tiếp thu có chọn lọc thành tựu quốc tế, bảo đảm sở hữu trí tuệ, đa dạng hóa đối tác và ưu tiên công nghệ cao, công nghệ chiến lược. Kết quả nghiên cứu được thương mại hóa, chuyển giao theo thỏa thuận; Nhà nước có chính sách hỗ trợ thương mại hóa và truyền thông khoa học.")
  ].join("")
};

const MATERIAL_NQ66 = {
  slug: "nghi-quyet-66-nqtw-2025",
  title: "Nghị quyết số 66-NQ/TW ngày 30/4/2025 của Bộ Chính trị — Đổi mới xây dựng và thi hành pháp luật",
  excerpt:
    "Quan điểm chỉ đạo, mục tiêu đến năm 2030 và 2045, nhiệm vụ về thể chế, thi hành pháp luật, nhân lực, chuyển đổi số và nguồn lực tài chính.",
  fileUrl: "/tai-lieu/phap-luat/nq_66_nqtw_2025.pdf",
  sortOrder: 50,
  content: [
    h2("Vị trí của nghị quyết"),
    p("Ban Chấp hành Trung ương ban hành Nghị quyết số 66-NQ/TW ngày 30 tháng 4 năm 2025 của Bộ Chính trị về đổi mới công tác xây dựng và thi hành pháp luật, đáp ứng yêu cầu phát triển đất nước trong kỷ nguyên mới. Nghị quyết phổ biến đến chi bộ."),
    h2("Quan điểm chỉ đạo"),
    ul([
      "Bảo đảm sự lãnh đạo toàn diện, trực tiếp của Đảng; tăng cường kiểm soát quyền lực, phòng chống tham nhũng, lãng phí, tiêu cực, lợi ích nhóm; phát huy giám sát, phản biện xã hội của Mặt trận Tổ quốc Việt Nam và sự tham gia của Nhân dân, tổ chức, doanh nghiệp.",
      "Xây dựng và thi hành pháp luật là đột phá của đột phá trong hoàn thiện thể chế phát triển; là nhiệm vụ trọng tâm của tiến trình xây dựng và hoàn thiện Nhà nước pháp quyền xã hội chủ nghĩa.",
      "Xây dựng pháp luật phải bám sát thực tiễn Việt Nam, tiếp thu có chọn lọc tinh hoa của nhân loại; thể chế, pháp luật trở thành lợi thế cạnh tranh và động lực tăng trưởng.",
      "Nâng cao hiệu quả thi hành pháp luật, xây dựng văn hóa tuân thủ pháp luật, gắn kết chặt việc xây dựng với việc thi hành.",
      "Đầu tư cho xây dựng chính sách, pháp luật là đầu tư cho phát triển; ưu tiên nguồn lực cho thể chế, hạ tầng kỹ thuật và chuyển đổi số."
    ]),
    h2("Mục tiêu"),
    h3("Đến năm 2030"),
    p("Việt Nam có hệ thống pháp luật dân chủ, công bằng, đồng bộ, thống nhất, công khai, minh bạch, khả thi, với cơ chế tổ chức thực hiện nghiêm minh, bảo đảm cơ sở pháp lý cho cạnh tranh lành mạnh, đổi mới sáng tạo. Các vướng mắc phát sinh từ thực tiễn được rà soát, tháo gỡ. Đến năm 2030, Việt Nam là nước đang phát triển, có công nghiệp hiện đại, thu nhập trung bình cao."),
    ul([
      "Năm 2025: cơ bản hoàn thành việc tháo gỡ những điểm nghẽn do quy định pháp luật.",
      "Năm 2027: hoàn thành việc sửa đổi, bổ sung, ban hành mới văn bản bảo đảm cơ sở pháp lý cho bộ máy nhà nước theo mô hình chính quyền địa phương 3 cấp.",
      "Năm 2028: hệ thống pháp luật về đầu tư, kinh doanh, góp phần đưa môi trường đầu tư của Việt Nam vào nhóm 3 nước dẫn đầu ASEAN."
    ]),
    h3("Tầm nhìn đến năm 2045"),
    p("Hệ thống pháp luật chất lượng cao, hiện đại, tiệm cận chuẩn mực quốc tế, được thực hiện nghiêm minh; tôn trọng, bảo vệ quyền con người, quyền công dân; quản trị quốc gia hiện đại. Đến năm 2045, Việt Nam trở thành nước phát triển, thu nhập cao, theo định hướng xã hội chủ nghĩa."),
    h2("Nhiệm vụ, giải pháp"),
    ul([
      "Các cấp ủy lãnh đạo toàn diện, trực tiếp công tác xây dựng và thi hành pháp luật. Người đứng đầu chịu trách nhiệm chính; gắn kết quả với đánh giá, khen thưởng, kỷ luật.",
      "Xây dựng pháp luật vừa bảo đảm quản lý nhà nước, vừa giải phóng nguồn lực sản xuất, khởi thông mọi nguồn lực. Không để khoảng trống pháp luật cản trở đổi mới sáng tạo. Thể chế hóa thử nghiệm có kiểm soát, chấp nhận rủi ro và chia sẻ rủi ro đối với khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số.",
      "Thi hành pháp luật công khai, minh bạch, kịp thời. Không hình sự hóa quan hệ kinh tế, dân sự; không dùng biện pháp hành chính để can thiệp, giải quyết tranh chấp dân sự, kinh tế. Xây dựng văn hóa tuân thủ pháp luật, tăng cường chuyển đổi số trong phổ biến, giáo dục pháp luật.",
      "Nâng cao năng lực thực hiện nghĩa vụ pháp lý quốc tế; mở rộng hợp tác pháp luật và tư pháp, thu hút chuyên gia người Việt Nam ở nước ngoài.",
      "Có chính sách đặc thù về tiền lương, phụ cấp, thuế đối với người làm công tác xây dựng, thi hành pháp luật. Hỗ trợ hằng tháng bằng 100% mức lương theo hệ số lương hiện hưởng đối với người trực tiếp, thường xuyên tham mưu nghiên cứu chiến lược, chính sách, xây dựng pháp luật tại một số cơ quan, đơn vị. Kiên quyết chấm dứt cơ sở đào tạo luật không bảo đảm tiêu chí, tiêu chuẩn.",
      "Xây dựng hạ tầng công nghệ thông tin, dữ liệu lớn và trí tuệ nhân tạo phục vụ xây dựng, thi hành pháp luật, bảo đảm đúng, đủ, sạch, sống và liên thông. Lồng ghép phổ biến, giáo dục pháp luật vào phong trào học tập số.",
      "Bảo đảm chi cho công tác xây dựng pháp luật không thấp hơn 0,5% tổng chi ngân sách nhà nước hằng năm và tăng dần theo yêu cầu. Ưu tiên nguồn lực phổ biến, giáo dục pháp luật cho đối tượng đặc thù, yếu thế, đồng bào dân tộc thiểu số."
    ]),
    h2("Tổ chức thực hiện"),
    ul([
      "Thành lập Ban Chỉ đạo Trung ương về hoàn thiện thể chế, pháp luật do Tổng Bí thư làm Trưởng ban.",
      "Đảng ủy Quốc hội lãnh đạo, chỉ đạo hoàn thiện pháp luật và tăng cường giám sát. Đảng ủy Chính phủ lãnh đạo chương trình hành động; phối hợp để Bộ Tư pháp trình Quốc hội khóa XV, Kỳ họp thứ 9 nghị quyết về một số cơ chế, chính sách đặc biệt.",
      "Mặt trận Tổ quốc Việt Nam xây dựng chương trình, kế hoạch vận động Nhân dân, phát huy giám sát, phản biện xã hội và tham gia xây dựng, thi hành pháp luật.",
      "Đảng ủy Bộ Tư pháp là cơ quan thường trực, chủ trì theo dõi, kiểm tra, đánh giá; định kỳ 6 tháng báo cáo Ban Chỉ đạo Trung ương và Bộ Chính trị."
    ])
  ].join("")
};

const MATERIAL_BLLD = {
  slug: "bo-luat-lao-dong-45-2019",
  title: "Bộ luật Lao động số 45/2019/QH14",
  excerpt:
    "Tiêu chuẩn lao động, hợp đồng, thời giờ làm việc và nghỉ ngơi, quyền của người lao động. Văn bản hợp nhất số 18/VBHN-VPQH ngày 12/02/2026.",
  fileUrl: "/tai-lieu/phap-luat/bo_luat_lao_dong_45_2019.pdf",
  sortOrder: 60,
  content: [
    h2("Phạm vi và văn bản đang dùng"),
    p("Bộ luật Lao động số 45/2019/QH14 do Quốc hội thông qua ngày 20/11/2019, có hiệu lực từ ngày 01/01/2021. Bản đưa lên trang này là Văn bản hợp nhất số 18/VBHN-VPQH ngày 12/02/2026, đã hợp nhất các sửa đổi, bổ sung của Luật Công nghiệp công nghệ số 71/2025/QH15, Luật Dân số số 113/2025/QH15 và Luật Giáo dục nghề nghiệp số 124/2025/QH15."),
    p("Bộ luật quy định tiêu chuẩn lao động; quyền, nghĩa vụ, trách nhiệm của người lao động, người sử dụng lao động, tổ chức đại diện người lao động tại cơ sở và tổ chức đại diện người sử dụng lao động; cùng quan hệ khác liên quan trực tiếp đến quan hệ lao động."),
    h2("Người lao động và một số quyền cơ bản"),
    p("Người lao động là người làm việc cho người sử dụng lao động theo thỏa thuận, được trả lương và chịu sự quản lý, điều hành, giám sát của người sử dụng lao động. Độ tuổi lao động tối thiểu là đủ 15 tuổi, trừ trường hợp Bộ luật có quy định khác đối với người chưa thành niên."),
    ul([
      "Tự do lựa chọn việc làm, nơi làm việc, nghề nghiệp; không bị phân biệt đối xử, cưỡng bức lao động, quấy rối tình dục tại nơi làm việc.",
      "Được trả lương theo thỏa thuận, phù hợp với trình độ và kỹ năng; được bảo hộ lao động, nghỉ theo chế độ và nghỉ hằng năm có hưởng lương.",
      "Được thành lập, gia nhập tổ chức đại diện người lao động; đối thoại, thương lượng tập thể và tham gia quy chế dân chủ ở nơi làm việc.",
      "Được từ chối làm việc nếu có nguy cơ rõ ràng đe dọa trực tiếp đến tính mạng, sức khỏe."
    ]),
    h2("Hợp đồng lao động"),
    p("Khi giao kết hợp đồng, người sử dụng lao động phải cung cấp thông tin trung thực về công việc, địa điểm, điều kiện làm việc, thời giờ làm việc, thời giờ nghỉ ngơi, tiền lương và các nội dung khác liên quan."),
    p("Người lao động đơn phương chấm dứt hợp đồng phải báo trước: ít nhất 45 ngày nếu hợp đồng không xác định thời hạn; ít nhất 30 ngày nếu hợp đồng xác định thời hạn từ 12 tháng đến 36 tháng; ít nhất 03 ngày làm việc nếu hợp đồng xác định thời hạn dưới 12 tháng. Bộ luật còn quy định các trường hợp được nghỉ việc ngay không cần báo trước."),
    h2("Thời giờ làm việc và nghỉ ngơi"),
    ul([
      "Thời giờ làm việc bình thường không quá 08 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần. Làm theo tuần thì không quá 10 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần. Nhà nước khuyến khích tuần làm việc 40 giờ.",
      "Giờ làm việc ban đêm tính từ 22 giờ đến 06 giờ sáng ngày hôm sau.",
      "Người lao động làm từ 06 giờ trở lên trong một ngày được nghỉ giữa giờ ít nhất 30 phút liên tục; làm ban đêm thì ít nhất 45 phút liên tục.",
      "Nghỉ lễ, tết hưởng nguyên lương gồm Tết Dương lịch 01 ngày, Tết Âm lịch 05 ngày, ngày Chiến thắng 30/4, ngày Quốc tế lao động 01/5, Quốc khánh 02 ngày và ngày Giỗ Tổ Hùng Vương.",
      "Nghỉ hằng năm hưởng nguyên lương: 12 ngày làm việc đối với công việc bình thường; 14 ngày đối với người chưa thành niên, người khuyết tật và công việc nặng nhọc, độc hại, nguy hiểm; 16 ngày đối với công việc đặc biệt nặng nhọc, độc hại, nguy hiểm."
    ])
  ].join("")
};

const MATERIAL_LUATCD = {
  slug: "luat-cong-doan-50-2024",
  title: "Luật Công đoàn số 50/2024/QH15",
  excerpt:
    "Vị trí của Công đoàn Việt Nam, quyền gia nhập công đoàn, trách nhiệm của người sử dụng lao động và tài chính công đoàn. Có hiệu lực từ 01/7/2025.",
  fileUrl: "/tai-lieu/phap-luat/luat_cong_doan_50_2024.pdf",
  sortOrder: 70,
  content: [
    h2("Vị trí và hiệu lực"),
    p("Quốc hội khóa XV thông qua Luật Công đoàn số 50/2024/QH15 ngày 27/11/2024. Luật có hiệu lực từ ngày 01/7/2025 và thay thế Luật Công đoàn số 12/2012/QH13. Luật số 97/2025/QH15, có hiệu lực cùng ngày 01/7/2025, sửa đổi, bổ sung một số điều của Luật này. Bản PDF là Luật số 50/2024/QH15."),
    p("Công đoàn Việt Nam là tổ chức chính trị - xã hội rộng lớn của giai cấp công nhân và của người lao động, thành lập trên cơ sở tự nguyện, do Đảng Cộng sản Việt Nam lãnh đạo. Công đoàn đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của người lao động; tham gia quản lý nhà nước, quản lý kinh tế - xã hội; giám sát, phản biện xã hội."),
    h2("Phạm vi"),
    p("Luật quy định chức năng, nhiệm vụ, quyền và trách nhiệm của Công đoàn Việt Nam; quyền thành lập, gia nhập và hoạt động công đoàn; việc gia nhập Công đoàn Việt Nam của tổ chức của người lao động tại doanh nghiệp; quyền, trách nhiệm của đoàn viên; trách nhiệm của Nhà nước và người sử dụng lao động; bảo đảm hoạt động của Công đoàn; giải quyết tranh chấp và xử lý vi phạm."),
    h2("Nhiệm vụ gắn với người lao động"),
    ul([
      "Tham gia xây dựng chính sách, pháp luật về kinh tế - xã hội, lao động, việc làm, tiền lương, bảo hiểm xã hội, bảo hiểm thất nghiệp, bảo hiểm y tế, an toàn vệ sinh lao động.",
      "Hỗ trợ đối thoại, thương lượng tập thể, ký kết và thực hiện thỏa ước lao động tập thể; tham gia xây dựng quan hệ lao động tiến bộ, hài hòa và ổn định.",
      "Tham gia, phối hợp kiểm tra, thanh tra việc thực hiện chế độ, chính sách, pháp luật liên quan đến quyền, nghĩa vụ của người lao động.",
      "Tuyên truyền, vận động người lao động học tập, nâng cao kỹ năng nghề, chấp hành pháp luật và tham gia phong trào thi đua."
    ]),
    h2("Tài chính công đoàn"),
    p("Kinh phí công đoàn do cơ quan, tổ chức, đơn vị, doanh nghiệp, hợp tác xã, liên hiệp hợp tác xã đóng bằng 2% quỹ tiền lương làm căn cứ đóng bảo hiểm xã hội bắt buộc cho người lao động. Người sử dụng lao động có trách nhiệm bảo đảm điều kiện hoạt động công đoàn và đóng kinh phí công đoàn đúng quy định."),
    p("Doanh nghiệp, hợp tác xã, liên hiệp hợp tác xã gặp khó khăn có thể được xem xét miễn, giảm hoặc tạm dừng đóng kinh phí công đoàn. Việc đóng, miễn, giảm, tạm dừng và quản lý, sử dụng được quy định chi tiết tại Nghị định số 105/2026/NĐ-CP.")
  ].join("")
};

const MATERIAL_BHXH = {
  slug: "luat-bao-hiem-xa-hoi-41-2024",
  title: "Luật Bảo hiểm xã hội số 41/2024/QH15",
  excerpt:
    "Bảo hiểm xã hội bắt buộc và tự nguyện, trợ cấp hưu trí xã hội, quyền của người tham gia và trách nhiệm của công đoàn. Văn bản hợp nhất đang áp dụng.",
  fileUrl: "/tai-lieu/phap-luat/luat_bhxh_41_2024.pdf",
  sortOrder: 80,
  content: [
    h2("Hiệu lực và phạm vi"),
    p("Luật Bảo hiểm xã hội số 41/2024/QH15 được Quốc hội thông qua ngày 29/6/2024, có hiệu lực từ ngày 01/7/2025. Bản PDF là văn bản hợp nhất, đã đưa vào các sửa đổi, bổ sung của Luật Nhà giáo số 73/2025/QH15, Luật Thanh tra số 84/2025/QH15, Luật Dân số số 113/2025/QH15 và Luật Phục hồi, phá sản số 142/2025/QH15."),
    p("Luật quy định quyền, trách nhiệm của cơ quan, tổ chức, cá nhân đối với bảo hiểm xã hội; trợ cấp hưu trí xã hội; đăng ký và quản lý thu, đóng; các chế độ bảo hiểm xã hội bắt buộc và tự nguyện; quỹ bảo hiểm xã hội; bảo hiểm hưu trí bổ sung; khiếu nại, tố cáo và xử lý vi phạm."),
    h2("Bảo hiểm xã hội là gì"),
    p("Bảo hiểm xã hội là sự bảo đảm thay thế hoặc bù đắp một phần thu nhập khi người tham gia bị giảm hoặc mất thu nhập do ốm đau, thai sản, tai nạn lao động, bệnh nghề nghiệp, khi nghỉ hưu hoặc chết, trên cơ sở đóng vào quỹ hoặc do ngân sách nhà nước bảo đảm."),
    ul([
      "Bảo hiểm xã hội bắt buộc là loại hình Nhà nước tổ chức, người lao động và người sử dụng lao động thuộc đối tượng phải tham gia.",
      "Người làm việc theo hợp đồng lao động không xác định thời hạn hoặc xác định thời hạn từ đủ 01 tháng trở lên thuộc đối tượng tham gia bắt buộc, kể cả khi các bên đặt tên gọi khác nhưng nội dung vẫn là việc làm có trả công và có sự quản lý, điều hành, giám sát.",
      "Cán bộ, công chức, viên chức thuộc đối tượng tham gia bảo hiểm xã hội bắt buộc.",
      "Công dân Việt Nam không thuộc diện bắt buộc có thể tham gia bảo hiểm xã hội tự nguyện."
    ]),
    h2("Trợ cấp hưu trí xã hội và người chưa đủ điều kiện lương hưu"),
    ul([
      "Công dân Việt Nam từ đủ 75 tuổi trở lên, không hưởng lương hưu hoặc trợ cấp bảo hiểm xã hội hằng tháng và có văn bản đề nghị thì được hưởng trợ cấp hưu trí xã hội.",
      "Người từ đủ 70 tuổi đến dưới 75 tuổi thuộc hộ nghèo, hộ cận nghèo, nếu đáp ứng điều kiện còn lại, cũng được hưởng trợ cấp hưu trí xã hội.",
      "Người đủ tuổi nghỉ hưu, có thời gian đóng bảo hiểm xã hội nhưng chưa đủ điều kiện hưởng lương hưu và chưa đủ tuổi hưởng trợ cấp hưu trí xã hội, nếu không nhận bảo hiểm xã hội một lần và không bảo lưu, được hưởng trợ cấp hằng tháng từ khoản đóng của mình. Mức thấp nhất bằng mức trợ cấp hưu trí xã hội."
    ]),
    h2("Quyền của người tham gia và vai trò của công đoàn"),
    p("Người tham gia được nhận chế độ đầy đủ, kịp thời; được cơ quan bảo hiểm xã hội cung cấp thông tin; được khiếu nại, tố cáo, khởi kiện. Người tham gia phải đóng theo quy định và kê khai thông tin chính xác, trung thực, đầy đủ."),
    p("Công đoàn, trong phạm vi chức năng của mình, bảo vệ quyền và lợi ích hợp pháp của người lao động tham gia bảo hiểm xã hội; tuyên truyền, tư vấn chính sách; tham gia thanh tra, kiểm tra và xử lý hành vi vi phạm pháp luật về bảo hiểm xã hội.")
  ].join("")
};

const MATERIAL_BDG = {
  slug: "luat-binh-dang-gioi",
  title: "Luật Bình đẳng giới số 73/2006/QH11",
  excerpt:
    "Mục tiêu xóa bỏ phân biệt đối xử về giới, bình đẳng trong lao động và các hành vi bị cấm. Văn bản hợp nhất số 45/VBHN-VPQH ngày 17/3/2026.",
  fileUrl: "/tai-lieu/phap-luat/luat_binh_dang_gioi.pdf",
  sortOrder: 90,
  content: [
    h2("Phạm vi và văn bản hợp nhất"),
    p("Luật Bình đẳng giới số 73/2006/QH11 được Quốc hội khóa XI thông qua ngày 29/11/2006, có hiệu lực từ ngày 01/7/2007. Bản PDF là Văn bản hợp nhất số 45/VBHN-VPQH ngày 17/3/2026 của Văn phòng Quốc hội."),
    p("Luật quy định nguyên tắc bình đẳng giới trong các lĩnh vực của đời sống xã hội và gia đình, biện pháp bảo đảm bình đẳng giới, trách nhiệm của cơ quan, tổ chức, gia đình và cá nhân."),
    h2("Mục tiêu"),
    p("Mục tiêu là xóa bỏ phân biệt đối xử về giới, tạo cơ hội như nhau cho nam và nữ trong phát triển kinh tế - xã hội và phát triển nguồn nhân lực, tiến tới bình đẳng giới thực chất và củng cố quan hệ hợp tác, hỗ trợ giữa nam và nữ trong mọi lĩnh vực của đời sống xã hội và gia đình."),
    h2("Bình đẳng trong lao động"),
    ul([
      "Nam, nữ bình đẳng về tiêu chuẩn, độ tuổi khi tuyển dụng; được đối xử bình đẳng tại nơi làm việc về việc làm, tiền công, tiền thưởng, bảo hiểm xã hội, điều kiện lao động và các điều kiện làm việc khác.",
      "Nam, nữ bình đẳng về tiêu chuẩn, độ tuổi khi được đề bạt, bổ nhiệm vào chức danh có tiêu chuẩn chức danh.",
      "Biện pháp thúc đẩy gồm quy định tỷ lệ nam, nữ được tuyển dụng; đào tạo, bồi dưỡng lao động nữ; người sử dụng lao động tạo điều kiện an toàn, vệ sinh cho lao động nữ làm việc trong ngành, nghề nặng nhọc, nguy hiểm hoặc tiếp xúc với chất độc hại."
    ]),
    h2("Một số hành vi bị cấm trong lao động"),
    ul([
      "Áp dụng điều kiện tuyển dụng khác nhau giữa nam và nữ đối với cùng một công việc mà hai bên có trình độ, khả năng như nhau, trừ biện pháp thúc đẩy bình đẳng giới.",
      "Từ chối tuyển dụng, tuyển dụng hạn chế, sa thải hoặc cho thôi việc vì lý do giới tính, hoặc vì mang thai, sinh con, nuôi con nhỏ.",
      "Phân công công việc mang tính phân biệt đối xử dẫn đến chênh lệch thu nhập, hoặc trả lương khác nhau cho người có cùng trình độ, năng lực vì lý do giới tính.",
      "Không thực hiện quy định của pháp luật lao động dành riêng cho lao động nữ."
    ])
  ].join("")
};

const MATERIAL_MTTQ = {
  slug: "luat-mat-tran-to-quoc-viet-nam",
  title: "Luật Mặt trận Tổ quốc Việt Nam số 75/2015/QH13",
  excerpt:
    "Vị trí, quyền và trách nhiệm của Mặt trận Tổ quốc Việt Nam trong đại đoàn kết, giám sát và phản biện xã hội. Văn bản hợp nhất số 89/VBHN-VPQH.",
  fileUrl: "/tai-lieu/phap-luat/luat_mttqvn.pdf",
  sortOrder: 100,
  content: [
    h2("Vị trí của Mặt trận"),
    p("Luật Mặt trận Tổ quốc Việt Nam số 75/2015/QH13 được Quốc hội khóa XIII thông qua ngày 09/6/2015, có hiệu lực từ ngày 01/01/2016. Bản PDF là Văn bản hợp nhất số 89/VBHN-VPQH ngày 22/8/2025, đã hợp nhất nội dung sửa đổi, bổ sung, trong đó có Luật số 97/2025/QH15."),
    p("Mặt trận Tổ quốc Việt Nam kế thừa vai trò lịch sử của Mặt trận Dân tộc thống nhất Việt Nam do Đảng Cộng sản Việt Nam và Chủ tịch Hồ Chí Minh sáng lập, lãnh đạo. Mặt trận là tổ chức liên minh chính trị, liên hiệp tự nguyện của tổ chức chính trị, các tổ chức chính trị - xã hội, tổ chức xã hội và các cá nhân tiêu biểu của các giai cấp, tầng lớp, dân tộc, tôn giáo và người Việt Nam định cư ở nước ngoài."),
    p("Mặt trận là cơ sở chính trị của chính quyền nhân dân; đại diện, bảo vệ quyền và lợi ích hợp pháp, chính đáng của Nhân dân; tập hợp, phát huy sức mạnh đại đoàn kết toàn dân tộc."),
    h2("Quyền và trách nhiệm"),
    ul([
      "Tập hợp, xây dựng khối đại đoàn kết toàn dân tộc; thực hiện dân chủ, tăng cường đồng thuận xã hội.",
      "Tuyên truyền, vận động Nhân dân thực hiện quyền làm chủ, thực hiện đường lối, chủ trương của Đảng và chính sách, pháp luật của Nhà nước.",
      "Đại diện, bảo vệ quyền và lợi ích hợp pháp, chính đáng của Nhân dân.",
      "Tham gia xây dựng Đảng, Nhà nước; thực hiện giám sát và phản biện xã hội.",
      "Tập hợp, tổng hợp ý kiến, kiến nghị của cử tri và Nhân dân để phản ánh với Đảng, Nhà nước.",
      "Thực hiện hoạt động đối ngoại nhân dân, góp phần xây dựng và bảo vệ Tổ quốc."
    ]),
    p("Công đoàn Việt Nam là tổ chức thành viên của Mặt trận. Trong hoạt động của mình, công đoàn phối hợp với Mặt trận để chăm lo, bảo vệ quyền và lợi ích hợp pháp, chính đáng của đoàn viên, người lao động.")
  ].join("")
};

const MATERIAL_ND105 = {
  slug: "nghi-dinh-105-2026-nd-cp",
  title: "Nghị định 105/2026/NĐ-CP — Tài chính công đoàn",
  excerpt:
    "Phương thức, thời hạn đóng kinh phí công đoàn; chậm đóng, không đóng; miễn, giảm, tạm dừng và phân phối kinh phí cho tổ chức của người lao động tại doanh nghiệp.",
  fileUrl: "/tai-lieu/phap-luat/nd_105_2026.pdf",
  sortOrder: 110,
  content: [
    h2("Hiệu lực"),
    p("Chính phủ ban hành Nghị định số 105/2026/NĐ-CP ngày 31/3/2026, có hiệu lực từ ngày 16/5/2026. Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Luật Công đoàn về tài chính công đoàn, thay thế Nghị định số 191/2013/NĐ-CP."),
    h2("Đóng kinh phí công đoàn"),
    ul([
      "Cơ quan, tổ chức, đơn vị sự nghiệp công lập không hưởng 100% lương từ ngân sách, doanh nghiệp, hợp tác xã và các đơn vị còn lại đóng mỗi tháng một lần, cùng thời điểm đóng bảo hiểm xã hội bắt buộc.",
      "Tổ chức, doanh nghiệp nông nghiệp, lâm nghiệp, ngư nghiệp, diêm nghiệp trả lương theo chu kỳ sản xuất, kinh doanh được đăng ký đóng mỗi tháng một lần hoặc 03 tháng một lần.",
      "Đóng theo tháng thì chậm nhất là ngày cuối cùng của tháng tiếp theo. Đóng theo chu kỳ 03 tháng thì chậm nhất là ngày cuối cùng của tháng tiếp theo ngay sau chu kỳ.",
      "Nguồn đóng của doanh nghiệp, hợp tác xã được hạch toán vào chi phí hoạt động sản xuất, kinh doanh, dịch vụ."
    ]),
    h2("Chậm đóng và không đóng"),
    p("Chậm đóng là chưa đóng hoặc đóng chưa đủ sau thời hạn đóng. Không đóng gồm không trích nộp, hoặc sau 60 ngày kể từ ngày hết thời hạn vẫn không đóng đủ số tiền hay không đóng đủ số người thuộc đối tượng phải đóng. Trường hợp được tạm dừng hoặc giảm mức đóng không bị coi là chậm đóng, không đóng."),
    h2("Miễn, giảm, tạm dừng"),
    ul([
      "Miễn số tiền chưa đóng khi doanh nghiệp, hợp tác xã, liên hiệp hợp tác xã giải thể hoặc phá sản và công đoàn tham gia phương án xử lý nợ hoặc nộp đơn yêu cầu mở thủ tục phá sản.",
      "Tạm dừng tối đa 12 tháng khi gặp khó khăn về kinh tế, thiên tai, hỏa hoạn, dịch bệnh, mất mùa, đồng thời phải dừng sản xuất, kinh doanh từ 30 ngày trở lên với ít nhất 50% lao động thuộc diện bảo hiểm xã hội bắt buộc phải nghỉ việc, hoặc thiệt hại trên 50% tổng giá trị tài sản (không kể đất).",
      "Sau thời gian tạm dừng, nếu vẫn phải cắt giảm lao động theo ngưỡng Nghị định quy định thì được xem xét giảm mức đóng tối đa 20%, trong thời gian không quá 06 tháng.",
      "Tổng Liên đoàn Lao động Việt Nam hoặc Liên đoàn Lao động cấp tỉnh trả lời bằng văn bản trong 15 ngày làm việc kể từ ngày nhận đủ hồ sơ."
    ]),
    h2("Tổ chức của người lao động tại doanh nghiệp"),
    p("Ở nơi có tổ chức của người lao động tại doanh nghiệp đã được cấp đăng ký và doanh nghiệp có đóng kinh phí công đoàn, phần kinh phí dành cho cấp cơ sở được phân phối theo tỷ lệ quỹ tiền lương của thành viên tổ chức đó so với toàn bộ người lao động thuộc diện đóng. Tổ chức phải gửi thông báo số tiền chậm nhất vào ngày cuối cùng của tháng tiếp theo; không gửi mà không có lý do chính đáng thì tháng kế tiếp bị tạm dừng phân phối.")
  ].join("")
};

const MATERIAL_ND283 = {
  slug: "nghi-dinh-283-2026-nd-cp",
  title: "Nghị định 283/2026/NĐ-CP — Xử phạt vi phạm hành chính về lao động, bảo hiểm xã hội",
  excerpt:
    "Hành vi, hình thức, mức phạt và biện pháp khắc phục hậu quả trong lao động, bảo hiểm xã hội và đưa người lao động Việt Nam đi làm việc ở nước ngoài. Có hiệu lực từ 10/9/2026.",
  fileUrl: "/tai-lieu/phap-luat/nd_283_2026.pdf",
  sortOrder: 120,
  content: [
    h2("Hiệu lực và phạm vi"),
    p("Chính phủ ban hành Nghị định số 283/2026/NĐ-CP ngày 15/7/2026, có hiệu lực từ ngày 10/9/2026. Nghị định thay thế Nghị định số 12/2022/NĐ-CP. Nghị định gồm 6 chương, 68 điều, do Phó Thủ tướng Phạm Thị Thanh Trà ký."),
    p("Phạm vi gồm lao động (việc làm, tuyển dụng và quản lý lao động, điều kiện lao động và quan hệ lao động, an toàn vệ sinh lao động, tổ chức đại diện người lao động tại cơ sở), bảo hiểm xã hội, và người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng. Hành vi thuộc lĩnh vực này nhưng không được Nghị định quy định thì áp dụng nghị định xử phạt của lĩnh vực quản lý nhà nước liên quan."),
    h2("Hình thức xử phạt và thời hiệu"),
    ul([
      "Hình thức xử phạt chính là cảnh cáo hoặc phạt tiền.",
      "Tùy tính chất, mức độ, có thể tịch thu tang vật, tước quyền sử dụng chứng chỉ hành nghề có thời hạn, đình chỉ hoạt động có thời hạn, hoặc trục xuất người lao động nước ngoài.",
      "Thời hiệu xử phạt là 01 năm đối với vi phạm về lao động, bảo hiểm xã hội và 02 năm đối với vi phạm về người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng.",
      "Vi phạm trên môi trường điện tử được xử lý theo Luật Xử lý vi phạm hành chính và các nghị định hướng dẫn."
    ]),
    h2("Một số nhóm vi phạm cần lưu ý"),
    ul([
      "Vi phạm về thời giờ làm việc, nghỉ ngơi, làm thêm giờ được phạt theo số người lao động bị vi phạm.",
      "Không thông báo hoặc không niêm yết nội quy lao động, và xử lý kỷ luật xâm phạm danh dự, nhân phẩm người lao động, thuộc nhóm vi phạm về kỷ luật lao động.",
      "Chậm đóng bảo hiểm xã hội bắt buộc có thể bị phạt tiền từ 12% đến 15% số tiền chậm đóng tại thời điểm lập biên bản, tối đa 75 triệu đồng, và phải đóng đủ số tiền còn thiếu.",
      "Trốn đóng bảo hiểm xã hội bắt buộc có thể bị phạt từ 18% đến 20% số tiền trốn đóng, tối đa 75 triệu đồng. Tái phạm quy định về đóng bảo hiểm xã hội bắt buộc hoặc bảo hiểm thất nghiệp, nếu có dấu hiệu tội phạm, phải chuyển hồ sơ cho cơ quan tiến hành tố tụng hình sự."
    ]),
    h2("Chuyển tiếp"),
    p("Hành vi đã xảy ra và kết thúc trước ngày Nghị định có hiệu lực thì áp dụng quy định có hiệu lực tại thời điểm thực hiện hành vi. Hành vi xảy ra trước ngày có hiệu lực nhưng vẫn đang diễn ra thì áp dụng Nghị định này. Quyết định xử phạt đã ban hành trước ngày có hiệu lực mà còn khiếu nại thì giải quyết theo quy định có hiệu lực lúc ban hành quyết định.")
  ].join("")
};

const EXAM_DESCRIPTION =
  "Ngân hàng trắc nghiệm Quý IV/2026 (Nghị định 328/2026/NĐ-CP, Thông tư 49 và 83/2026/TT-BGDĐT, Luật số 93/2025/QH15, Nghị quyết số 66-NQ/TW và các văn bản liên quan trong bộ câu hỏi). Thời gian 30 phút, 01 lần thi chính thức, đạt từ 70%. Thi thử không cần mã. Thi chính thức phải nhập mã dự thi đã gửi vào email.";

export async function seedLegalEducationQ4_2026(prisma: PrismaClient): Promise<void> {
  const bySlug = await prisma.legalEducationCampaign.findUnique({ where: { slug: LEGAL_EDUCATION_Q4_2026_SLUG } });
  const existing = bySlug ?? (await prisma.legalEducationCampaign.findFirst({ where: { title: CAMPAIGN_TITLE } }));
  const campaignData = {
    title: CAMPAIGN_TITLE,
    summary: SUMMARY,
    periodLabel: PERIOD_LABEL,
    startAt: CAMPAIGN_START,
    endAt: CAMPAIGN_END,
    isPublished: true
  };
  const campaign = existing
    ? await prisma.legalEducationCampaign.update({ where: { id: existing.id }, data: campaignData })
    : await prisma.legalEducationCampaign.create({
        data: { slug: LEGAL_EDUCATION_Q4_2026_SLUG, ...campaignData }
      });

  for (const material of [
    MATERIAL_ND328,
    MATERIAL_TT49,
    MATERIAL_TT83,
    MATERIAL_LUAT93,
    MATERIAL_NQ66,
    MATERIAL_BLLD,
    MATERIAL_LUATCD,
    MATERIAL_BHXH,
    MATERIAL_BDG,
    MATERIAL_MTTQ,
    MATERIAL_ND105,
    MATERIAL_ND283
  ]) {
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
      description: EXAM_DESCRIPTION,
      durationMinutes: 30,
      passingScorePercent: 70,
      maxAttempts: 1,
      revealAnswers: false,
      shuffleQuestions: true,
      shuffleOptions: true,
      requireEntryCode: true
    },
    create: {
      campaignId: campaign.id,
      title: `${CAMPAIGN_TITLE} — Trắc nghiệm`,
      description: EXAM_DESCRIPTION,
      durationMinutes: 30,
      passingScorePercent: 70,
      maxAttempts: 1,
      revealAnswers: false,
      shuffleQuestions: true,
      shuffleOptions: true,
      requireEntryCode: true,
      isOpen: false
    }
  });

  const attemptCount = await prisma.legalExamAttempt.count({ where: { examId: exam.id } });
  if (attemptCount > 0) {
    console.log("  Bỏ qua ghi đè ngân hàng câu hỏi vì đợt đã có lượt thi.");
    return;
  }
  await prisma.legalExamQuestion.deleteMany({ where: { examId: exam.id } });
  await prisma.legalExamQuestion.createMany({
    data: Q4_QUESTIONS.map((q) => ({
      examId: exam.id,
      text: q.text,
      optionsJson: JSON.stringify(q.options),
      correctOptionIndex: q.correctOptionIndex,
      sortOrder: q.sortOrder
    }))
  });
  console.log(`  Đã ghi ${Q4_QUESTIONS.length} câu hỏi.`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Thiếu DATABASE_URL. Đặt file .env ở thư mục gốc repo, hoặc chạy trên máy chủ có C:\\inetpub\\congdoan2026\\shared\\.env."
    );
  }
  const prisma = new PrismaClient();
  try {
    console.log("Seeding phổ biến pháp luật Quý IV/2026...");
    await seedLegalEducationQ4_2026(prisma);
    const include = {
      materials: { orderBy: { sortOrder: "asc" as const }, select: { slug: true, title: true } },
      exam: { include: { _count: { select: { questions: true } } } }
    };
    const campaign =
      (await prisma.legalEducationCampaign.findUnique({
        where: { slug: LEGAL_EDUCATION_Q4_2026_SLUG },
        include
      })) ??
      (await prisma.legalEducationCampaign.findFirst({
        where: { title: CAMPAIGN_TITLE },
        include
      }));
    console.log(
      JSON.stringify(
        {
          slug: campaign?.slug,
          materials: campaign?.materials.map((item) => item.slug),
          examOpen: campaign?.exam?.isOpen ?? null,
          requireEntryCode: campaign?.exam?.requireEntryCode ?? null,
          questionCount: campaign?.exam?._count.questions ?? 0
        },
        null,
        2
      )
    );
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = process.argv[1]?.includes("seed-legal-education-q4-2026");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
