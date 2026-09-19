/**
 * Nội dung "Dịch vụ công" đối chiếu cổng chính thống (9/2026).
 * Cổng DVCQG (dichvucong.gov.vn) đã đổi trang chi tiết: URL dạng
 * /dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001195 trả "không tồn tại".
 * officialUrl trỏ cổng chuyên ngành / địa phương còn mở được trên trình duyệt.
 */
import type { PublicServiceProcedureCategory } from "../packages/types/src/public-service";

export interface PublicServiceProcedureSeed {
  slug: string;
  title: string;
  category: PublicServiceProcedureCategory;
  sortOrder: number;
  officialCode: string;
  officialUrl: string;
  summary: string;
  conditions: string;
  requiredDocuments: string;
  whereToApply: string;
  steps: string;
  fee: string;
  processingTime: string;
  resultDelivery: string;
  commonMistakes: string;
}

function withSource(whereToApply: string, item: Pick<PublicServiceProcedureSeed, "officialCode" | "officialUrl">): string {
  return `${whereToApply}\n\nNộp hồ sơ / xem thủ tục gốc (${item.officialCode}):\n${item.officialUrl}`;
}

const RAW_PROCEDURES: Omit<PublicServiceProcedureSeed, "whereToApply"> & { whereToApply: string }[] = [
  {
    slug: "cap-doi-the-can-cuoc",
    title: "Cấp đổi thẻ Căn cước",
    category: "CAN_CUOC",
    sortOrder: 10,
    officialCode: "2.001195",
    officialUrl: "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/tthc?matt=26094",
    summary:
      "Đổi thẻ Căn cước khi hết hạn, hư hỏng, thay đổi thông tin hoặc theo quy định Luật Căn cước — thực hiện tại Công an cấp tỉnh, không phụ thuộc nơi cư trú.",
    conditions:
      "Công dân Việt Nam thuộc diện đổi thẻ theo khoản 1 Điều 24 Luật Căn cước (hết hạn, thay đổi hộ tịch/cư trú, thẻ hư hỏng, sai sót thông tin...). Thông tin trong Cơ sở dữ liệu quốc gia về dân cư phải đúng trước khi lập hồ sơ đổi thẻ.",
    requiredDocuments:
      "Thẻ Căn cước/CCCD cũ; cung cấp họ tên khai sinh, số định danh cá nhân, nơi cư trú để đối chiếu CSDL dân cư. Không phải mang sổ hộ khẩu giấy. Nếu thông tin dân cư chưa khớp, phải điều chỉnh dữ liệu dân cư trước.",
    whereToApply:
      "Trực tiếp tại cơ quan quản lý căn cước Công an cấp tỉnh (Phòng Cảnh sát QLHC về TTXH) trên cả nước, không phụ thuộc nơi cư trú; hoặc đăng ký trước trên Cổng DVC Bộ Công an / ứng dụng VNeID rồi đến điểm thu nhận để chụp ảnh, vân tay, mống mắt. Giờ hành chính T2–T6 và sáng T7 (trừ lễ, tết).\nCổng DVC Bộ Công an (danh mục căn cước): https://dichvucong.bocongan.gov.vn/bocongan/bothutuc?linh_vuc=CAP_CCCD\nVNeID: https://vneid.gov.vn\nCổng DVC Quốc gia (đăng nhập VNeID, tìm «Cấp đổi thẻ căn cước»): https://dichvucong.gov.vn",
    steps:
      "1) Đặt lịch/nộp hồ sơ trên Cổng DVC Quốc gia hoặc VNeID (khuyến khích). 2) Đến điểm thu nhận, cung cấp họ tên – số định danh – nơi cư trú. 3) Cán bộ đối chiếu CSDL dân cư; nếu thông tin thay đổi thì điều chỉnh dân cư trước. 4) Thu nhận vân tay, ảnh khuôn mặt, mống mắt (từ đủ 6 tuổi). 5) Ký Phiếu thu nhận thông tin căn cước (mẫu theo Thông tư 17/2024/TT-BCA). 6) Nộp thẻ cũ, lệ phí (nếu có), nhận giấy hẹn CC02. 7) Nhận thẻ mới theo hình thức đã đăng ký.",
    fee: "Lệ phí cấp đổi: 50.000 đồng/thẻ (Luật Căn cước). Từ 01/7/2025 đến 31/12/2026 mức thu bằng 50% theo Thông tư 64/2025/TT-BTC (nộp trực tuyến thường được giảm thêm theo từng giai đoạn). Miễn/giảm với một số trường hợp do Bộ Tài chính quy định — kiểm tra mức hiện hành trên Cổng DVC khi nộp.",
    processingTime: "Không quá 07 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (Cổng DVCQG, thủ tục 2.001195).",
    resultDelivery:
      "Nhận trực tiếp tại cơ quan quản lý căn cước theo giấy hẹn, hoặc qua bưu chính công ích nếu đăng ký. Tra cứu tiến độ trên Cổng DVC / VNeID.",
    commonMistakes:
      "Đến đổi thẻ khi dữ liệu dân cư chưa khớp (họ tên đệm, ngày sinh, nơi cư trú); đặt lịch online nhưng không đến đúng giờ; tưởng còn dùng sổ hộ khẩu giấy thay cho xác thực dân cư."
  },
  {
    slug: "xac-nhan-thong-tin-cu-tru",
    title: "Đăng ký thường trú / xác nhận thông tin cư trú",
    category: "CU_TRU",
    sortOrder: 20,
    officialCode: "cư trú / VNeID",
    officialUrl: "https://vneid.gov.vn",
    summary:
      "Đăng ký nơi thường trú, tạm trú trên VNeID hoặc xin xác nhận thông tin cư trú điện tử — không còn sổ hộ khẩu giấy.",
    conditions:
      "Có chỗ ở hợp pháp (sở hữu, được chủ hộ/chủ sở hữu đồng ý, hoặc thuê/mượn đúng quy định diện tích của địa phương). Đăng ký thường trú/tạm trú trên VNeID yêu cầu tài khoản định danh mức 2.",
    requiredDocuments:
      "Tờ khai thay đổi thông tin cư trú (điền trên VNeID/Cổng DVC); giấy tờ chỗ ở hợp pháp (GCNQSDĐ/sở hữu nhà, hợp đồng thuê đã công chứng/chứng thực); văn bản đồng ý của chủ hộ nếu không phải chủ hộ. Khi nộp trực tuyến, nhiều giấy tờ được khai thác từ CSDL dân cư, không cần scan CCCD.",
    whereToApply:
      "Ứng dụng VNeID (Thủ tục hành chính → cư trú) hoặc Cổng DVC Quốc gia / Cổng DVC Bộ Công an; hoặc Công an cấp xã nơi đăng ký. Công an tỉnh Hưng Yên hướng dẫn đăng ký thường trú, tạm trú trên VNeID tại congan.hungyen.gov.vn. Cổng DVC tỉnh: https://dichvucong.hungyen.gov.vn",
    steps:
      "1) Cập nhật VNeID bản mới nhất, đăng nhập mức 2. 2) Chọn đăng ký thường trú hoặc tạm trú, kê khai chỗ ở hợp pháp, đính kèm giấy tờ (nếu hệ thống yêu cầu). 3) Theo dõi trạng thái trên VNeID. 4) Bổ sung nếu được yêu cầu xác minh. 5) Kết quả cập nhật trong CSDL cư trú; khi cần giấy xác nhận thông tin cư trú thì đề nghị bản điện tử/bản giấy theo hướng dẫn trên Cổng DVC.",
    fee: "Lệ phí cư trú do HĐND cấp tỉnh quy định (thường thấp, một số nơi miễn khi nộp trực tuyến). Xác nhận thông tin cư trú: theo mức niêm yết tại địa phương / Cổng DVC.",
    processingTime:
      "Đăng ký thường trú điện tử: không quá 02 ngày làm việc; nếu phải xác minh không quá 05 ngày làm việc kể từ khi nhận đủ hồ sơ/xác nhận qua VNeID (tham chiếu thủ tục liên thông 2.002621 trên Cổng DVCQG).",
    resultDelivery:
      "Thông báo trên VNeID/Cổng DVC; không cấp sổ hộ khẩu giấy. Giấy xác nhận thông tin cư trú (nếu đề nghị) nhận điện tử, trực tiếp hoặc qua bưu điện.",
    commonMistakes:
      "Hợp đồng thuê nhà chưa công chứng/chứng thực; thiếu đồng ý của chủ hộ; nhầm đăng ký thường trú (đổi nơi cư trú chính thức) với chỉ xin xác nhận cư trú để dùng cho một thủ tục khác."
  },
  {
    slug: "dang-ky-khai-sinh",
    title: "Đăng ký khai sinh liên thông (thường trú + thẻ BHYT trẻ em)",
    category: "HO_TICH",
    sortOrder: 30,
    officialCode: "khai sinh liên thông",
    officialUrl: "https://dichvucong.hungyen.gov.vn",
    summary:
      "Một lần nộp: đăng ký khai sinh, đăng ký thường trú và cấp thẻ BHYT cho trẻ dưới 6 tuổi trên Cổng DVC Quốc gia / VNeID.",
    conditions:
      "Trẻ chưa được đăng ký khai sinh. Cha, mẹ hoặc người thân thích, người giám hộ đăng ký trong 60 ngày kể từ ngày sinh. Liên thông áp dụng khi làm đồng thời thường trú và BHYT trẻ em dưới 6 tuổi.",
    requiredDocuments:
      "Giấy chứng sinh do cơ sở y tế cấp (sinh ngoài cơ sở y tế: văn bản người làm chứng hoặc cam đoan); giấy tờ tùy thân cha/mẹ; giấy chứng nhận kết hôn nếu đã đăng ký kết hôn. Nộp trực tuyến: kê khai trên Cổng DVC/VNeID, nhiều thông tin lấy từ CSDL dân cư.",
    whereToApply:
      "UBND cấp xã nơi cư trú của cha hoặc mẹ; hoặc nộp trực tuyến trên Cổng DVC Quốc gia / VNeID, chọn thủ tục liên thông «Đăng ký khai sinh, đăng ký thường trú, cấp thẻ BHYT cho trẻ em dưới 6 tuổi».",
    steps:
      "1) Chuẩn bị Giấy chứng sinh và giấy tờ cha/mẹ. 2) Nộp trực tuyến (khuyến khích liên thông) hoặc tại UBND cấp xã. 3) Công chức hộ tịch đăng ký khai sinh trên phần mềm hộ tịch điện tử (thường trong ngày). 4) Hệ thống chuyển điện tử sang cư trú (thường trú) và BHXH (thẻ BHYT trẻ em). 5) Nhận Giấy khai sinh; thẻ BHYT điện tử/giấy theo tiến độ từng cơ quan.",
    fee: "Miễn lệ phí đăng ký khai sinh lần đầu. Các bước liên thông cư trú/BHYT theo quy định từng cơ quan (thường không thu lệ phí khai sinh).",
    processingTime:
      "Khai sinh: trong ngày làm việc nếu hồ sơ hợp lệ. Thường trú điện tử: không quá 02 ngày làm việc (xác minh tối đa 05 ngày). Cấp thẻ BHYT trẻ em: không quá 02 ngày làm việc sau khi nhận hồ sơ điện tử (Cổng DVCQG, mã 2.002621).",
    resultDelivery:
      "Giấy khai sinh bản chính tại UBND cấp xã hoặc qua bưu điện. Thông tin thường trú cập nhật CSDL. Thẻ BHYT trẻ em trên VssID/VNeID hoặc bản giấy nếu đăng ký nhận tại nhà.",
    commonMistakes:
      "Quá 60 ngày phải làm khai sinh quá hạn; thông tin tên đệm không thống nhất với Giấy chứng sinh; khai thông tin cha khi cha mẹ chưa kết hôn mà chưa làm thủ tục nhận cha."
  },
  {
    slug: "cap-lai-the-bhyt-tra-cuu-qua-trinh-dong-bhxh",
    title: "Cấp lại thẻ BHYT / tra cứu quá trình đóng BHXH",
    category: "BHXH_BHYT",
    sortOrder: 40,
    officialCode: "BHXH / VssID",
    officialUrl: "https://baohiemxahoi.gov.vn",
    summary:
      "Cấp lại thẻ BHYT khi mất, hỏng; tra cứu quá trình đóng BHXH, BHYT, BHTN trên VssID hoặc Cổng DVC BHXH / DVCQG.",
    conditions:
      "Đã có mã số BHXH. Cấp lại thẻ: mất, hỏng hoặc thay đổi thông tin. Tra cứu: người đang hoặc đã tham gia BHXH. Đăng nhập VssID/Cổng DVC bằng VNeID mức 2.",
    requiredDocuments:
      "Online: không cần nộp giấy tờ nếu đã xác thực VNeID. Trực tiếp: căn cước, Tờ khai TK1-TS (tham gia/điều chỉnh thông tin) theo hướng dẫn BHXH Việt Nam. Đơn vị SDLĐ nộp hồ sơ tập trung khi đăng ký, điều chỉnh đóng BHXH/BHYT.",
    whereToApply:
      "Ứng dụng VssID; Cổng DVC Quốc gia; Cổng DVC BHXH Việt Nam (baohiemxahoi.gov.vn); hoặc Bộ phận một cửa cơ quan BHXH; bưu chính. Thủ tục gốc trên DVCQG: «Đăng ký, điều chỉnh đóng BHXH, BHYT, BHTN…; cấp sổ BHXH, thẻ BHYT».",
    steps:
      "1) Đăng nhập VssID hoặc Cổng DVC bằng VNeID mức 2. 2) Chọn cấp lại thẻ BHYT do hỏng/mất, hoặc tra cứu quá trình tham gia. 3) Gửi yêu cầu cấp lại — dùng ngay thẻ BHYT điện tử trên VssID/VNeID khi đi KCB. 4) Tra cứu: xem quá trình đóng theo đơn vị, giai đoạn. 5) Nếu do đơn vị sử dụng lao động: nộp TK1-TS qua I-VAN/Cổng DVC theo mã 2962.",
    fee: "Cấp lại thẻ BHYT do lỗi cơ quan BHXH: không thu. Do lỗi người tham gia: theo mức BHXH Việt Nam niêm yết tại thời điểm nộp. Tra cứu: miễn phí.",
    processingTime:
      "Cấp sổ BHXH/thẻ BHYT, điều chỉnh đóng: 10 ngày theo công bố trên Cổng DVCQG (mã 2962). Cấp lại thẻ trên VssID thường nhanh hơn (khoảng 01–02 ngày làm việc tùy trường hợp).",
    resultDelivery:
      "Thẻ BHYT điện tử trên VssID/VNeID dùng ngay. Sổ/thẻ giấy (nếu đăng ký) nhận tại BHXH hoặc qua bưu điện theo hình thức đã chọn.",
    commonMistakes:
      "Nhầm mã số BHXH với số thẻ BHYT; số điện thoại/CCCD trên dữ liệu BHXH chưa cập nhật nên không vào được VssID; vẫn đòi thẻ giấy trong khi thẻ điện tử đã có giá trị khi khám chữa bệnh."
  },
  {
    slug: "quyet-toan-thue-thu-nhap-ca-nhan",
    title: "Quyết toán thuế thu nhập cá nhân",
    category: "THUE_TNCN",
    sortOrder: 50,
    officialCode: "eTax",
    officialUrl: "https://dichvucong.gdt.gov.vn",
    summary:
      "Cá nhân tự quyết toán thuế TNCN (nhiều nguồn thu nhập, hoàn thuế) trên Cổng DVC Quốc gia / Cổng DVC ngành Thuế bằng VNeID.",
    conditions:
      "Có thu nhập tiền lương, tiền công; thuộc diện tự quyết toán (từ 2 nơi chi trả trở lên và không ủy quyền cho đơn vị, hoặc có số thuế nộp thừa muốn hoàn). Viên chức chỉ có 1 nơi chi trả thường ủy quyền cho nhà trường quyết toán.",
    requiredDocuments:
      "Tài khoản giao dịch thuế điện tử (đăng ký qua DVCQG bằng VNeID hoặc Cổng DVC Thuế); chứng từ khấu trừ TNCN do đơn vị chi trả cấp; hồ sơ người phụ thuộc nếu giảm trừ gia cảnh. Tờ khai quyết toán (mẫu 02/QTT-TNCN) hệ thống thường gợi ý sẵn dữ liệu.",
    whereToApply:
      "Cổng Dịch vụ công Quốc gia (liên thông ngành Thuế) hoặc https://dichvucong.gdt.gov.vn (eTax). Có thể nộp hồ sơ giấy tại Chi cục Thuế nơi cư trú nếu không quyết toán online.",
    steps:
      "1) Đăng nhập DVCQG / Cổng DVC Thuế bằng VNeID. 2) Chọn quyết toán thuế TNCN, kiểm tra dữ liệu thu nhập và số đã khấu trừ. 3) Bổ sung người phụ thuộc, khoản giảm trừ (nếu có). 4) Nộp tờ khai; hệ thống tính số nộp thêm hoặc hoàn. 5) Theo dõi hoàn thuế vào tài khoản ngân hàng đã đăng ký.",
    fee: "Không thu phí quyết toán / hoàn thuế TNCN.",
    processingTime:
      "Hạn nộp hồ sơ tự quyết toán: chậm nhất ngày cuối tháng 4 năm sau (kiểm tra thông báo Tổng cục Thuế từng năm). Thời gian hoàn thuế theo Luật Quản lý thuế (hoàn trước kiểm sau hoặc kiểm trước hoàn sau, thường vài tuần đến khoảng 40 ngày tùy hồ sơ).",
    resultDelivery: "Thông báo trên Cổng DVC/eTax. Tiền hoàn (nếu có) chuyển khoản tài khoản ngân hàng đã đăng ký.",
    commonMistakes:
      "Đã ủy quyền cho trường nhưng vẫn tự quyết toán trùng; quên chứng từ khấu trừ từ đơn vị cũ khi chuyển công tác; khai trùng/thiếu người phụ thuộc; nộp trễ hạn khi còn số thuế phải nộp thêm."
  },
  {
    slug: "cap-phieu-ly-lich-tu-phap",
    title: "Cấp Phiếu lý lịch tư pháp",
    category: "LY_LICH_TU_PHAP",
    sortOrder: 60,
    officialCode: "2.000488",
    officialUrl: "https://dichvucong.hungyen.gov.vn",
    summary:
      "Cấp Phiếu LLTP số 1 cho công dân Việt Nam (xin việc, hồ sơ viên chức). Người thường trú Hưng Yên có thể nộp trên VNeID / Cổng DVC tỉnh.",
    conditions:
      "Công dân Việt Nam hoặc người nước ngoài đang cư trú tại Việt Nam có nhu cầu xác nhận án tích. Phiếu số 1: cấp cho cá nhân, cơ quan, tổ chức. Nộp trên VNeID tại Hưng Yên: công dân thường trú tỉnh, tài khoản định danh mức 2.",
    requiredDocuments:
      "Tờ khai yêu cầu cấp Phiếu LLTP (điền online). Nộp trực tuyến DVCQG/Hệ thống Bộ Tư pháp: không cần đính kèm bản sao căn cước. Nộp trực tiếp: bản sao căn cước (xuất trình bản chính). Ủy quyền: giấy ủy quyền; cha mẹ/vợ chồng/con nộp thay không cần ủy quyền.",
    whereToApply:
      "Sở Tư pháp nơi thường trú (không có thường trú thì nơi tạm trú). Trực tuyến: Cổng DVC Quốc gia, Hệ thống thông tin giải quyết TTHC Bộ Tư pháp, VNeID, hoặc https://dichvucong.hungyen.gov.vn. Trung tâm Phục vụ hành chính công tỉnh Hưng Yên nhận hồ sơ trực tiếp.",
    steps:
      "1) Đăng nhập VNeID mức 2 hoặc Cổng DVC. 2) Chọn «Cấp Phiếu lý lịch tư pháp», xác thực sinh trắc. 3) Kê khai quá trình cư trú, nghề nghiệp từ đủ 14 tuổi. 4) Nộp phí trực tuyến. 5) Theo dõi trên VNeID / Cổng DVC tỉnh. 6) Nhận bản điện tử trên VNeID; bản giấy tại nhà qua bưu điện hoặc tại Trung tâm Hành chính công nếu đăng ký.",
    fee: "Theo mức Bộ Tài chính / Sở Tư pháp niêm yết trên Cổng DVC khi nộp (có ưu đãi một số đối tượng). Kiểm tra số tiền trên màn hình thanh toán trước khi xác nhận.",
    processingTime:
      "Thông thường không quá 10 ngày làm việc; trường hợp phải xác minh thêm có thể dài hơn (đến khoảng 15 ngày) theo công bố của cơ quan thực hiện.",
    resultDelivery:
      "Bản điện tử trả về tài khoản VNeID và Cổng DVC tỉnh Hưng Yên. Bản giấy: bưu chính công ích hoặc Trung tâm Phục vụ hành chính công tỉnh.",
    commonMistakes:
      "Kê khai thiếu nơi từng cư trú từ đủ 14 tuổi; nhầm Phiếu số 1 và số 2; nộp hộ nhưng không đúng quan hệ/ủy quyền."
  },
  {
    slug: "doi-giay-phep-lai-xe",
    title: "Đổi giấy phép lái xe",
    category: "GPLX",
    sortOrder: 70,
    officialCode: "3.000347",
    officialUrl: "https://dvc-gplx.csgt.bocongan.gov.vn",
    summary:
      "Đổi GPLX hết hạn, hỏng, hoặc sai lệch thông tin với thẻ Căn cước — nộp trực tuyến bằng VNeID, nhận kết quả sau 05 ngày làm việc nếu hồ sơ hợp lệ.",
    conditions:
      "Người được sát hạch, cấp GPLX tại Việt Nam; GPLX hỏng; hết hạn (kể cả GPLX đổi từ GPLX nước ngoài khi có thẻ thường trú); thông tin trên GPLX lệch với căn cước. Không đổi nếu GPLX không có trong hệ thống Cảnh sát giao thông / sổ quản lý, hoặc chưa chấp hành xong xử lý vi phạm giao thông.",
    requiredDocuments:
      "Xác thực tài khoản định danh điện tử (VNeID). Hồ sơ điện tử theo hướng dẫn trên Cổng DVC; giấy khám sức khỏe lái xe còn hạn do cơ sở y tế đủ điều kiện cấp (khi quy định yêu cầu). Không phải nộp riêng giấy xác nhận cư trú hay Phiếu LLTP — cơ quan tra cứu trên CSDL và VNeID.",
    whereToApply:
      "Cổng DVC Quốc gia (thủ tục 3.000347) hoặc cổng đổi GPLX trực tuyến của ngành (ví dụ dvc4.gplx.gov.vn) đăng nhập VNeID; hoặc Phòng CSGT / Công an cấp xã được bố trí điểm tiếp nhận.",
    steps:
      "1) Đăng nhập VNeID, vào thủ tục đổi GPLX trên Cổng DVC. 2) Kê khai, đính kèm giấy khám sức khỏe (nếu hệ thống yêu cầu), nộp lệ phí. 3) Cơ quan tra cứu GPLX và vi phạm giao thông. 4) Nếu thiếu hồ sơ: thông báo bổ sung trong 02 ngày làm việc. 5) Phiếu hẹn 05 ngày làm việc kể từ nhận đủ hồ sơ hợp lệ. 6) Nhận GPLX mới trực tiếp hoặc qua bưu điện.",
    fee: "Theo mức niêm yết trên Cổng DVC khi nộp (tham khảo phổ biến khoảng 115.000 đồng/lần đổi với nhiều hạng xe — luôn lấy số trên biên lai điện tử).",
    processingTime: "05 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (Cổng DVCQG, mã 3.000347).",
    resultDelivery: "Nhận tại điểm tiếp nhận theo phiếu hẹn hoặc qua bưu chính công ích / thông báo trên hệ thống DVC.",
    commonMistakes:
      "GPLX quá hạn lâu có thể phải sát hạch lại thay vì chỉ đổi — kiểm tra trước; giấy khám sức khỏe sai cơ sở/hết hạn; còn vi phạm giao thông chưa xử lý xong nên hệ thống từ chối."
  },
  {
    slug: "dang-ky-xe-mo-to-xe-gan-may",
    title: "Đăng ký xe mô tô, xe gắn máy",
    category: "DANG_KY_PHUONG_TIEN",
    sortOrder: 80,
    officialCode: "1.010914",
    officialUrl: "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/tthc?matt=64188",
    summary:
      "Đăng ký, cấp biển số xe mô tô, xe gắn máy tại Công an cấp xã được phân cấp — có thể khai trực tuyến trước trên Cổng DVC rồi đưa xe đến kiểm tra thực tế.",
    conditions:
      "Chủ xe là cá nhân/tổ chức có xe hợp pháp (xe mới có hóa đơn/nguồn gốc; xe sang tên có chứng từ chuyển quyền sở hữu hợp lệ).",
    requiredDocuments:
      "Giấy khai đăng ký xe (mẫu 01, điền trực tuyến hoặc trực tiếp); chứng từ nguồn gốc xe; chứng từ lệ phí trước bạ; giấy tờ chủ xe / cư trú theo Thông tư đăng ký xe của Bộ Công an; hợp đồng mua bán công chứng/chứng thực nếu sang tên.",
    whereToApply:
      "Bộ phận tiếp nhận Công an cấp xã nơi được phân cấp đăng ký xe. Khai trước trên Cổng DVC Quốc gia (mã 1.010914) / Cổng DVC Bộ Công an; dữ liệu truyền về hệ thống đăng ký xe Cục CSGT.",
    steps:
      "1) Kê khai đăng ký xe trực tuyến, nộp lệ phí trước bạ điện tử nếu hệ thống hỗ trợ. 2) Đưa xe và hồ sơ đến Công an cấp xã. 3) Cán bộ đối chiếu nhãn hiệu, số máy, số khung, màu sơn. 4) Chà số khung/số máy, ký xác nhận. 5) Nộp lệ phí đăng ký, cấp biển. 6) Nhận Giấy chứng nhận đăng ký xe và biển số.",
    fee: "Lệ phí trước bạ theo tỷ lệ % giá trị xe (UBND cấp tỉnh). Lệ phí cấp biển/đăng ký theo Bộ Tài chính — xem mức trên Cổng DVC và biên lai khi nộp.",
    processingTime: "Thường 02 ngày làm việc hoặc trong ngày nếu hồ sơ đủ và đã kiểm tra thực tế xe (theo công bố thủ tục 1.010914 / hướng dẫn địa phương).",
    resultDelivery: "Nhận trực tiếp Giấy đăng ký xe và biển số tại nơi đăng ký sau khi kiểm tra xe và nộp đủ lệ phí.",
    commonMistakes:
      "Chưa nộp lệ phí trước bạ; giấy tờ sang tên chưa công chứng; số máy/số khung trên hồ sơ không khớp xe thật."
  },
  {
    slug: "dang-ky-tai-khoan-dinh-danh-dien-tu-vneid",
    title: "Cấp tài khoản định danh điện tử mức 2 (VNeID)",
    category: "KHAC",
    sortOrder: 90,
    officialCode: "1.011411",
    officialUrl: "https://vneid.gov.vn",
    summary:
      "Cấp tài khoản định danh điện tử mức 2 và căn cước điện tử — điều kiện để nộp hầu hết dịch vụ công trực tuyến.",
    conditions:
      "Công dân Việt Nam đã có thẻ CCCD gắn chip / thẻ Căn cước còn hiệu lực (chưa có thẻ: cấp tài khoản mức 2 cùng lúc với cấp thẻ). Có số thuê bao di động chính chủ.",
    requiredDocuments:
      "Thẻ Căn cước/CCCD gắn chip; số điện thoại chính chủ; email (nên có). Phiếu đề nghị cấp tài khoản định danh điện tử mẫu TK01 (Nghị định 69/2024/NĐ-CP) — kê khai tại cơ quan Công an / trên ứng dụng.",
    whereToApply:
      "Ứng dụng VNeID (đăng ký mức 1 tại nhà); kích hoạt mức 2 tại Công an cấp xã/huyện hoặc điểm thu nhận căn cước. Thủ tục gốc: Cổng DVCQG mã 1.011411. Cổng Bộ Công an: https://dichvucong.bocongan.gov.vn",
    steps:
      "1) Tải VNeID, đăng ký tài khoản mức 1 bằng số điện thoại và căn cước. 2) Đến Công an: xuất trình thẻ, cung cấp SĐT chính chủ, email, thông tin cần tích hợp. 3) Cán bộ xác thực khuôn mặt, vân tay với CSDL căn cước. 4) Nhận thông báo cấp mức 2 qua VNeID/SMS/email. 5) Đăng nhập lại, dùng VNeID mức 2 cho DVCQG, BHXH, Thuế, Công an, GPLX.",
    fee: "Miễn phí đăng ký và kích hoạt tài khoản định danh điện tử.",
    processingTime:
      "Mức 1: ngay trên ứng dụng. Mức 2: sau khi xác thực sinh trắc, thông báo qua ứng dụng/SĐT (thường vài ngày làm việc; công bố chi tiết trên thủ tục 1.011411).",
    resultDelivery: "Kích hoạt trên ứng dụng VNeID; dùng ngay để đăng nhập các cổng dịch vụ công.",
    commonMistakes:
      "Chỉ có mức 1 nên không nộp được nhiều TTHC toàn trình; SĐT không chính chủ, mất OTP; chưa cập nhật email khôi phục."
  },
  {
    slug: "de-nghi-mien-giam-hoc-phi-dai-hoc",
    title: "Đề nghị miễn, giảm học phí tại cơ sở giáo dục đại học công lập",
    category: "KHAC",
    sortOrder: 100,
    officialCode: "NĐ 238/2025/NĐ-CP",
    officialUrl: "https://dichvucong.gov.vn",
    summary:
      "Người học (con đoàn viên, bản thân đang học) thuộc đối tượng miễn/giảm học phí theo Nghị định 238/2025/NĐ-CP nộp đơn tại cơ sở giáo dục đại học công lập.",
    conditions:
      "Người học tại cơ sở GDĐH công lập thuộc đối tượng miễn, giảm học phí do pháp luật quy định (Nghị định 238/2025/NĐ-CP và quyết định công bố TTHC của Bộ GDĐT). Không phải mọi viên chức/đoàn viên đều được miễn — chỉ khi thuộc diện luật định (ví dụ một số trường hợp có cha/mẹ hưởng trợ cấp TNLĐ-BNN, đối tượng chính sách…).",
    requiredDocuments:
      "Đơn đề nghị miễn, giảm học phí theo mẫu Phụ lục III Nghị định 238/2025/NĐ-CP; giấy tờ chứng minh đối tượng (ví dụ quyết định hưởng trợ cấp hàng tháng của cha/mẹ do cơ quan BHXH cấp, giấy tờ đối tượng chính sách theo từng khoản của nghị định). Nộp trong 45 ngày làm việc kể từ ngày nhập học.",
    whereToApply:
      "Cơ sở giáo dục đại học công lập nơi người học đang theo học (phòng công tác sinh viên / tài chính). Tra cứu mô tả TTHC trên Cổng DVC Quốc gia. Quyết định 2624/QĐ-BGDĐT (17/9/2025) công bố TTHC thay thế mã 1.005144 theo Nghị định 238/2025/NĐ-CP.",
    steps:
      "1) Xác định đúng diện miễn/giảm theo nghị định. 2) Điền đơn Phụ lục III, kèm minh chứng. 3) Nộp cho nhà trường trong 45 ngày làm việc từ ngày nhập học (trực tiếp, bưu điện hoặc Cổng DVC nếu trường đã kết nối). 4) Thủ trưởng cơ sở xét duyệt, quyết định miễn/giảm, lập danh sách. 5) Theo dõi kết quả tại trường.",
    fee: "Không thu phí xét miễn, giảm học phí.",
    processingTime:
      "Nhà trường xét duyệt trong 10 ngày làm việc kể từ khi nhận đơn (theo công bố TTHC Bộ GDĐT / mô tả trên Cổng DVCQG).",
    resultDelivery: "Quyết định miễn, giảm học phí của thủ trưởng cơ sở; bút toán học phí trên hệ thống nhà trường.",
    commonMistakes:
      "Nộp muộn quá 45 ngày sau nhập học; thiếu giấy tờ minh chứng đối tượng; nhầm diện miễn với diện chỉ được hỗ trợ chi phí học tập theo nghị định."
  }
];

export const PUBLIC_SERVICE_PROCEDURE_SEED: PublicServiceProcedureSeed[] = RAW_PROCEDURES.map((item) => ({
  ...item,
  whereToApply: withSource(item.whereToApply, item)
}));

export const PUBLIC_SERVICE_LINK_SEED = [
  {
    title: "Cổng Dịch vụ công Quốc gia",
    url: "https://dichvucong.gov.vn",
    description:
      "Điểm một cửa số quốc gia — tra cứu và nộp hầu hết TTHC trực tuyến, đăng nhập bằng VNeID mức 2.",
    group: "Cổng Dịch vụ công Quốc gia",
    sortOrder: 0
  },
  {
    title: "Cổng Dịch vụ công tỉnh Hưng Yên",
    url: "https://dichvucong.hungyen.gov.vn",
    description:
      "Hệ thống thông tin giải quyết TTHC tỉnh Hưng Yên — lý lịch tư pháp, cư trú và các thủ tục địa phương.",
    group: "Địa phương",
    sortOrder: 5
  },
  {
    title: "VNeID — Định danh điện tử",
    url: "https://vneid.gov.vn",
    description: "Ứng dụng định danh điện tử quốc gia — bắt buộc để đăng nhập hầu hết cổng dịch vụ công.",
    group: "Định danh điện tử",
    sortOrder: 10
  },
  {
    title: "Bảo hiểm xã hội Việt Nam",
    url: "https://baohiemxahoi.gov.vn",
    description: "VssID, tra cứu quá trình đóng, cấp lại thẻ BHYT — đăng nhập bằng VNeID.",
    group: "BHXH Việt Nam",
    sortOrder: 20
  },
  {
    title: "Cổng Dịch vụ công ngành Thuế",
    url: "https://dichvucong.gdt.gov.vn",
    description: "Kê khai, quyết toán thuế thu nhập cá nhân, tra cứu nghĩa vụ thuế.",
    group: "Cơ quan thuế",
    sortOrder: 30
  },
  {
    title: "Cổng Dịch vụ công Bộ Công an",
    url: "https://dichvucong.bocongan.gov.vn",
    description: "Căn cước, cư trú, đăng ký xe và thủ tục ngành Công an.",
    group: "Cổng chuyên ngành khác",
    sortOrder: 40
  },
  {
    title: "Đổi giấy phép lái xe trực tuyến",
    url: "https://dvc-gplx.csgt.bocongan.gov.vn",
    description: "Cổng DVC cấp, đổi GPLX của Cục Cảnh sát giao thông — đăng nhập VNeID mức 2.",
    group: "Cổng chuyên ngành khác",
    sortOrder: 50
  }
];

export function toProcedureRecord(item: PublicServiceProcedureSeed, isActive: boolean) {
  return {
    slug: item.slug,
    title: item.title,
    category: item.category,
    summary: item.summary,
    conditions: item.conditions,
    requiredDocuments: item.requiredDocuments,
    whereToApply: item.whereToApply,
    steps: item.steps,
    fee: item.fee,
    processingTime: item.processingTime,
    resultDelivery: item.resultDelivery,
    commonMistakes: item.commonMistakes,
    sortOrder: item.sortOrder,
    isActive
  };
}
