/** Ngân hàng Quý IV/2026, trích từ "Bộ câu hỏi thi Quý 4". Đáp án là phương án chữ đỏ (FF0000/EE0000). Ba câu không tô đỏ (6, 39, 79) lấy phương án in đậm. */
export interface Q4Question {
  sortOrder: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export const Q4_QUESTIONS: Q4Question[] = [
  {
    sortOrder: 10,
    text: "Theo Thông tư 83/2026/TT-BGDĐT, kết quả đánh giá mức độ đáp ứng Chuẩn cơ sở giáo dục đại học KHÔNG nhằm mục đích nào sau đây?",
    options: ["A. Phục vụ quản lý nhà nước.", "B. Tăng cường tính minh bạch, công khai các điều kiện bảo đảm chất lượng.", "C. Xếp hạng độc lập các trường đại học trên thế giới.", "D. Làm căn cứ để cơ sở đào tạo tự đánh giá và giải trình."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 20,
    text: "Việc đánh giá mức độ đáp ứng Chuẩn cơ sở giáo dục đại học được thực hiện trên cơ sở nào?",
    options: ["A. Chuyến viếng thăm trực tiếp của Bộ GD&ĐT.", "B. Dữ liệu, minh chứng và cam kết của cơ sở đào tạo.", "C. Số lượng sinh viên nhập học hàng năm.", "D. Đánh giá của các doanh nghiệp tuyển dụng."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 30,
    text: "Dữ liệu phục vụ đánh giá mức độ đáp ứng Chuẩn cơ sở giáo dục đại học phải được kết nối, chia sẻ thông qua hệ thống nào?",
    options: ["A. Hệ thống quản lý học tập (LMS).", "B. Hệ thống thông tin quốc gia về dân cư.", "C. Hệ thống cơ sở dữ liệu chuyên ngành về giáo dục đại học (HEMIS).", "D. Cổng thông tin điện tử của Chính phủ."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 40,
    text: "Trong trường hợp HEMIS xảy ra sự cố hệ thống, cơ sở giáo dục đại học phải làm gì để cung cấp dữ liệu?",
    options: ["A. Chờ đến khi hệ thống hoạt động bình thường trở lại.", "B. Gửi báo cáo bằng văn bản giấy qua đường bưu điện.", "C. Thu thập, tổng hợp, lưu trữ và cung cấp dữ liệu bằng phương thức điện tử theo yêu cầu của cơ quan quản lý.", "D. Tạm ngưng việc đánh giá chuẩn trong năm đó."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 50,
    text: "Tiêu chí 1.2 yêu cầu tỷ lệ chỉ số hoạt động chính đạt hoặc vượt mục tiêu trong kế hoạch hằng năm đã được phê duyệt tối thiểu là bao nhiêu?",
    options: ["A. 40%", "B. 50%", "C. 60%", "D. 70%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 60,
    text: "Tỷ lệ người học quy đổi trên giảng viên quy đổi (Tiêu chí 2.1) được yêu cầu luôn duy trì ở mức nào?",
    options: ["A. Không lớn hơn 30.", "B. Không lớn hơn 35.", "C. Không lớn hơn 40.", "D. Không lớn hơn 45."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 70,
    text: "Theo Tiêu chí 2.2, tỷ lệ giảng viên cơ hữu trong độ tuổi lao động trên tổng số giảng viên không được thấp hơn bao nhiêu?",
    options: ["A. 60%", "B. 70%", "C. 80%", "D. 90%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 80,
    text: "Đối với cơ sở đào tạo KHÔNG đào tạo tiến sĩ, tỷ lệ giảng viên có trình độ tiến sĩ trên tổng số giảng viên phải đạt tối thiểu bao nhiêu (hiện tại và định hướng từ năm 2030)?",
    options: ["A. Không thấp hơn 10% (từ 2030 không thấp hơn 20%).", "B. Không thấp hơn 15% (từ 2030 không thấp hơn 25%).", "C. Không thấp hơn 20% (từ 2030 không thấp hơn 30%).", "D. Không thấp hơn 30% (từ 2030 không thấp hơn 40%)."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 90,
    text: "Đối với cơ sở đào tạo CÓ đào tạo tiến sĩ (không phải trường đặc thù), tỷ lệ giảng viên có trình độ tiến sĩ tối thiểu là bao nhiêu?",
    options: ["A. 30% (từ 2030 là 40%).", "B. 40% (từ 2030 là 50%).", "C. 50% (từ 2030 là 60%).", "D. 60% (từ 2030 là 70%)."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 100,
    text: "Độ tuổi lao động của giảng viên cơ hữu trong cơ sở đào tạo TƯ THỤC được tính như thế nào?",
    options: ["A. Không giới hạn độ tuổi.", "B. Được tính như quy định đối với giảng viên cơ hữu trong cơ sở đào tạo công lập.", "C. Tối đa là 65 tuổi đối với mọi chức danh.", "D. Do Hiệu trưởng trường tư thục tự quyết định."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 110,
    text: "Từ năm 2030, diện tích đất tính bình quân trên một người học chính quy quy đổi không nhỏ hơn bao nhiêu?",
    options: ["A. 15 m2", "B. 20 m2", "C. 25 m2", "D. 30 m2"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 120,
    text: "Diện tích sàn xây dựng phục vụ đào tạo trên số người học chính quy quy đổi không nhỏ hơn bao nhiêu?",
    options: ["A. 2,0 m2", "B. 2,5 m2", "C. 2,8 m2", "D. 3,0 m2"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 130,
    text: "Tỷ lệ giảng viên cơ hữu được bảo đảm chỗ làm việc riêng biệt phải đạt tối thiểu bao nhiêu?",
    options: ["A. 50%", "B. 60%", "C. 70%", "D. 80%"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 140,
    text: "Số lượt sử dụng học liệu hợp lệ bình quân của giảng viên và người học trong năm học tối thiểu là bao nhiêu lượt?",
    options: ["A. 5 lượt", "B. 10 lượt", "C. 15 lượt", "D. 20 lượt"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 150,
    text: "Tiêu chí 4.1 yêu cầu biên độ hoạt động (chênh lệch thu chi trên tổng thu) tính trung bình 03 năm gần nhất phải như thế nào?",
    options: ["A. Lớn hơn 5%.", "B. Lớn hơn 10%.", "C. Không âm.", "D. Dương liên tục mỗi năm."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 160,
    text: "Chỉ số tăng trưởng bền vững (Tiêu chí 4.2) được xác định bằng trung bình cộng của các yếu tố nào trong 3 năm gần nhất?",
    options: ["A. Tốc độ tăng sinh viên và tốc độ tăng giảng viên.", "B. Tốc độ tăng tổng thu và tốc độ tăng thu ngoài học phí, ngoài NSNN.", "C. Tốc độ tăng diện tích sàn và tốc độ tăng tài sản.", "D. Tốc độ tăng bài báo quốc tế và doanh thu nghiên cứu."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 170,
    text: "Tỷ lệ nhập học trung bình trong 03 năm gần nhất so với số lượng tuyển sinh công bố không được thấp hơn bao nhiêu?",
    options: ["A. 40%", "B. 50%", "C. 60%", "D. 70%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 180,
    text: "Quy mô đào tạo không được sụt giảm quá mức bao nhiêu so với 03 năm trước (trừ trường hợp đã được phê duyệt/công bố trước)?",
    options: ["A. Quá 10%", "B. Quá 20%", "C. Quá 30%", "D. Quá 40%"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 190,
    text: "Tỷ lệ thôi học chung trong năm không được cao hơn mức nào?",
    options: ["A. 5%", "B. 10%", "C. 15%", "D. 20%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 200,
    text: "Riêng đối với người học năm học đầu tiên, tỷ lệ thôi học không được cao hơn bao nhiêu?",
    options: ["A. 10%", "B. 15%", "C. 20%", "D. 25%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 210,
    text: "Tỷ lệ tốt nghiệp chung (trong thời gian không vượt quá 1,5 lần thời gian chuẩn) và tỷ lệ tốt nghiệp đúng hạn lần lượt không được thấp hơn mức nào?",
    options: ["A. 60% và 40%", "B. 70% và 50%", "C. 60% và 50%", "D. 80% và 60%"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 220,
    text: "Tỷ lệ người học hài lòng với giảng viên và tỷ lệ người tốt nghiệp hài lòng tổng thể không được thấp hơn mức nào trên tổng số phản hồi hợp lệ?",
    options: ["A. 60%", "B. 70%", "C. 80%", "D. 90%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 230,
    text: "Trong khảo sát người tốt nghiệp, yêu cầu số người tốt nghiệp có phản hồi hợp lệ phải đạt tối thiểu bao nhiêu % số người được khảo sát?",
    options: ["A. 50%", "B. 60%", "C. 70%", "D. 80%"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 240,
    text: "Tỷ lệ người tốt nghiệp đại học có việc làm phù hợp, tự tạo việc làm hoặc học tiếp trong thời gian 12 tháng sau tốt nghiệp không thấp hơn bao nhiêu?",
    options: ["A. 60%", "B. 70%", "C. 80%", "D. 90%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 250,
    text: "Đối với cơ sở có đào tạo tiến sĩ, tỷ trọng thu từ hoạt động khoa học, công nghệ và ĐMST trung bình 3 năm gần nhất không thấp hơn bao nhiêu?",
    options: ["A. 2%", "B. 5%", "C. 10%", "D. 15%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 260,
    text: "Kết quả KHCN và ĐMST bình quân trên một giảng viên quy đổi đối với cơ sở đào tạo có đào tạo tiến sĩ (không phải trường đặc thù) không thấp hơn bao nhiêu sản phẩm quy đổi/năm?",
    options: ["A. 0,3 sản phẩm", "B. 0,5 sản phẩm", "C. 0,6 sản phẩm", "D. 1,0 sản phẩm"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 270,
    text: "Đối với các cơ sở đào tạo thuộc Bộ Quốc phòng, Bộ Công an, Danh mục Web of Science hoặc Scopus được thay thế bằng danh mục nào?",
    options: ["A. Danh mục tạp chí trong nước có chỉ số ISSN.", "B. Danh mục tạp chí quốc tế bất kỳ.", "C. Danh mục tạp chí uy tín nhất ở Việt Nam (tạp chí khoa học loại 1).", "D. Danh mục báo chí trung ương."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 280,
    text: "Cơ sở đào tạo mới thành lập, CHƯA thực hiện tuyển sinh thì được áp dụng Chuẩn như thế nào?",
    options: ["A. Không cần áp dụng bất kỳ tiêu chuẩn nào.", "B. Phải áp dụng toàn bộ 6 tiêu chuẩn.", "C. Chỉ áp dụng các tiêu chuẩn 1, 2 và 3 (trừ tiêu chí 3.3).", "D. Chỉ áp dụng tiêu chuẩn 4 và 5."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 290,
    text: "Tiêu chuẩn nào KHÔNG áp dụng đối với các cơ sở đào tạo thuộc Bộ Quốc phòng, Bộ Công an?",
    options: ["A. Tiêu chuẩn 1 (Tổ chức và quản trị)", "B. Tiêu chuẩn 2 (Giảng viên)", "C. Tiêu chuẩn 3 (Cơ sở vật chất)", "D. Tiêu chuẩn 4 (Tài chính)"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 300,
    text: "Kết quả đánh giá đối với từng chỉ số được xác định theo các trạng thái nào?",
    options: ["A. Xuất sắc, Khá, Đạt, Không đạt.", "B. Đạt, Không đạt, Chưa đủ dữ liệu đánh giá.", "C. Mức 1, Mức 2, Mức 3.", "D. Hoàn thành, Chưa hoàn thành."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 310,
    text: "Trường hợp kết quả &quot;chưa đủ dữ liệu đánh giá\", cơ sở đào tạo có thời hạn bao lâu để giải trình, bổ sung dữ liệu hợp lệ?",
    options: ["A. Không quá 15 ngày.", "B. Không quá 30 ngày.", "C. Không quá 45 ngày.", "D. Không quá 60 ngày."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 320,
    text: "Cơ sở đào tạo thực hiện tự đánh giá mức độ đáp ứng Chuẩn dựa trên số liệu không thuộc lĩnh vực tài chính được xác định tại thời điểm nào hàng năm?",
    options: ["A. Ngày 01 tháng 01", "B. Ngày 31 tháng 5", "C. Ngày 01 tháng 9", "D. Ngày 31 tháng 12"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 330,
    text: "Số liệu tài chính của năm báo cáo phải được hoàn thiện và cập nhật chậm nhất vào ngày nào của năm sau?",
    options: ["A. 31 tháng 1", "B. 28 tháng 2", "C. 31 tháng 3", "D. 30 tháng 4"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 340,
    text: "Bộ Giáo dục và Đào tạo thông báo kết quả đánh giá chuẩn cơ sở giáo dục đại học hằng năm trước ngày nào?",
    options: ["A. 30 tháng 4", "B. 31 tháng 5", "C. 30 tháng 6", "D. 31 tháng 12"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 350,
    text: "Chuẩn cơ sở giáo dục đại học được rà soát, cập nhật định kỳ bao nhiêu năm một lần?",
    options: ["A. 02 năm", "B. 03 năm", "C. 05 năm", "D. 10 năm"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 360,
    text: "Kỳ đánh giá đầu tiên theo Thông tư 83/2026/TT-BGDĐT được thực hiện đối với năm dữ liệu nào?",
    options: ["A. 2024", "B. 2025", "C. 2026", "D. 2027"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 370,
    text: "Thông tư 83/2026/TT-BGDĐT chính thức có hiệu lực thi hành từ ngày nào?",
    options: ["A. 30 tháng 9 năm 2026", "B. 15 tháng 10 năm 2026", "C. 15 tháng 11 năm 2026", "D. 01 tháng 01 năm 2027"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 380,
    text: "Theo Phụ lục I, hệ số quy đổi của giảng viên có trình độ Thạc sĩ là bao nhiêu?",
    options: ["A. 0,50", "B. 0,75", "C. 1,00", "D. 1,50"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 390,
    text: "Theo Phụ lục I, hệ số quy đổi người học trình độ Tiến sĩ là bao nhiêu?",
    options: ["A. 1,00", "B. 1,50", "C. 2,00", "D. 2,50"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 400,
    text: "Theo Phụ lục I, người học Đại học đào tạo từ xa được áp dụng hệ số quy đổi là bao nhiêu?",
    options: ["A. 0,50", "B. 0,80", "C. 1,00", "D. 1,50"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 410,
    text: "Luật Khoa học, Công nghệ và Đổi mới sáng tạo số 93/2025/QH15 được Quốc hội thông qua vào ngày nào?",
    options: ["A. 1/7/2025", "B. 27/6/2025", "C. 1/10/2025", "D. 15/7/2025"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 420,
    text: "Luật Khoa học, Công nghệ và Đổi mới sáng tạo số 93/2025/QH15 có hiệu lực thi hành chung từ ngày nào?",
    options: ["A. 1/7/2025", "B. 27/6/2025", "C. 1/10/2025", "D. 1/1/2026"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 430,
    text: "Theo Điều 1, Luật Khoa học, Công nghệ và Đổi mới sáng tạo quy định về nội dung nào sau đây?",
    options: ["A. Chỉ quy định hoạt động nghiên cứu khoa học trong trường đại học.", "B. Chỉ quy định việc thành lập doanh nghiệp công nghệ cao.", "C. Hoạt động khoa học, công nghệ và đổi mới sáng tạo; chính sách, biện pháp bảo đảm phát triển các hoạt động này.", "D. Chỉ quy định việc cấp bằng sáng chế."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 440,
    text: "Theo Điều 3, khoa học được hiểu là gì?",
    options: ["A. Hệ thống tri thức về bản chất, quy luật tồn tại và phát triển của sự vật, hiện tượng tự nhiên, xã hội và tư duy.", "B. Hoạt động sản xuất hàng hóa bằng máy móc.", "C. Việc ứng dụng phần mềm vào quản lý doanh nghiệp.", "D. Hoạt động kinh doanh sản phẩm mới trên thị trường."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 450,
    text: "Theo Điều 3, đổi mới sáng tạo được hiểu phù hợp nhất là hoạt động nào?",
    options: ["A. Chỉ mua sắm thiết bị hiện đại từ nước ngoài.", "B. Chỉ thay đổi tên thương mại của sản phẩm.", "C. Chỉ mở rộng quy mô sản xuất sản phẩm hiện có mà không có cải tiến.", "D. Tạo ra sản phẩm, dịch vụ, quy trình, mô hình kinh doanh mới hoặc cải tiến đáng kể những nội dung đã có."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 460,
    text: "Đối tượng áp dụng của Luật bao gồm nhóm nào sau đây?",
    options: ["A. Chỉ cơ quan quản lý nhà nước.", "B. Cơ quan, tổ chức, cá nhân trực tiếp tham gia hoặc có liên quan đến hoạt động thuộc phạm vi Luật quy định.", "C. Chỉ các trường đại học công lập.", "D. Chỉ doanh nghiệp hoạt động trong lĩnh vực công nghệ thông tin."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 470,
    text: "Nghiên cứu cơ bản chủ yếu nhằm mục đích nào?",
    options: ["A. Tăng doanh thu bán hàng trong ngắn hạn.", "B. Thương mại hóa ngay một sản phẩm.", "C. Khám phá bản chất, quy luật của sự vật, hiện tượng tự nhiên, xã hội và tư duy.", "D. Thay thế hoạt động quản lý nhà nước."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 480,
    text: "Nghiên cứu ứng dụng chủ yếu hướng tới mục đích nào?",
    options: ["A. Sử dụng tri thức khoa học để tạo ra giải pháp phục vụ nhu cầu thực tiễn.", "B. Chỉ lưu trữ tài liệu nghiên cứu.", "C. Chỉ phát triển lý thuyết mà không hướng tới ứng dụng.", "D. Chỉ tổ chức hội thảo khoa học."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 490,
    text: "Hoạt động nào sau đây thuộc phạm vi hoạt động khoa học, công nghệ và đổi mới sáng tạo theo Luật?",
    options: ["A. Chỉ hoạt động quảng cáo thương mại.", "B. Chỉ hoạt động mua bán hàng hóa thông thường.", "C. Chỉ hoạt động kế toán doanh nghiệp.", "D. Hoạt động chuyển giao công nghệ."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 500,
    text: "Theo Điều 3, công nghệ được hiểu phù hợp nhất là gì?",
    options: ["A. Chỉ là máy móc, thiết bị điện tử.", "B. Tập hợp các giải pháp, quy trình, công cụ và bí quyết được tạo ra từ việc ứng dụng tri thức khoa học, kinh nghiệm để biến đổi nguồn lực thành sản phẩm.", "C. Chỉ là các phần mềm máy tính.", "D. Chỉ là bằng độc quyền sáng chế."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 510,
    text: "Theo Điều 20, Nhà nước thúc đẩy chuyển đổi số trong lĩnh vực khoa học, công nghệ và đổi mới sáng tạo nhằm mục tiêu nào?",
    options: ["A. Thay thế hoàn toàn mọi hoạt động nghiên cứu trực tiếp.", "B. Chỉ tăng số lượng văn bản điện tử.", "C. Nâng cao hiệu quả và tính minh bạch thông qua phát triển hạ tầng số, số hóa dữ liệu, dịch vụ công trực tuyến và tự động hóa quy trình.", "D. Chỉ phục vụ hoạt động của doanh nghiệp tư nhân."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 520,
    text: "Theo Điều 49, nhân lực hoạt động khoa học, công nghệ và đổi mới sáng tạo bao gồm những ai?",
    options: ["A. Cá nhân quản lý, trực tiếp thực hiện hoặc hỗ trợ các hoạt động này.", "B. Chỉ người có học vị tiến sĩ.", "C. Chỉ viên chức tại các viện nghiên cứu công lập.", "D. Chỉ người trực tiếp thực hiện thí nghiệm."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 530,
    text: "Theo Điều 5, hoạt động khoa học, công nghệ và đổi mới sáng tạo cần hướng tới mục tiêu nào?",
    options: ["A. Chỉ phục vụ lợi ích kinh tế của doanh nghiệp.", "B. Chỉ ưu tiên các nghiên cứu có khả năng thu hồi vốn ngay lập tức.", "C. Chỉ tập trung vào các lĩnh vực đã có công nghệ hoàn thiện.", "D. Phục vụ phát triển kinh tế – xã hội, quốc phòng, an ninh, nâng cao chất lượng cuộc sống, bảo vệ môi trường và phát triển bền vững."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 540,
    text: "Theo nguyên tắc tại Điều 5, việc nghiên cứu, phát triển và ứng dụng công nghệ trong lĩnh vực liên quan trực tiếp đến con người cần đáp ứng yêu cầu nào?",
    options: ["A. Được tự động triển khai mà không cần giám sát.", "B. Tuân thủ pháp luật và đặt việc phát triển, ứng dụng công nghệ dưới sự giám sát, kiểm soát của con người.", "C. Chỉ cần được doanh nghiệp tài trợ.", "D. Chỉ cần có ý kiến đồng ý của đơn vị nghiên cứu."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 550,
    text: "Theo Điều 19, việc đánh giá kết quả, hiệu quả và tác động của hoạt động khoa học, công nghệ và đổi mới sáng tạo phải tuân theo nguyên tắc nào?",
    options: ["A. Chỉ dựa trên số lượng công trình được công bố.", "B. Do đơn vị thực hiện tự quyết định và không cần công khai.", "C. Độc lập, trung thực, khách quan, công khai, minh bạch, đúng pháp luật.", "D. Chỉ dựa trên số kinh phí đã giải ngân."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 560,
    text: "Theo Điều 19, kết quả đánh giá hoạt động khoa học, công nghệ và đổi mới sáng tạo có thể được sử dụng làm căn cứ để làm gì?",
    options: ["A. Điều chỉnh kế hoạch, nội dung, phương án phân bổ ngân sách và các chính sách liên quan theo quy định.", "B. Tự động miễn mọi nghĩa vụ tài chính cho tổ chức nghiên cứu.", "C. Thay thế toàn bộ quy trình quản lý ngân sách nhà nước.", "D. Xóa bỏ trách nhiệm giải trình của đơn vị thực hiện nhiệm vụ."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 570,
    text: "Theo Điều 42, Nhà nước thúc đẩy phát triển tổ chức có hoạt động trong lĩnh vực khoa học, công nghệ và đổi mới sáng tạo theo định hướng nào?",
    options: ["A. Chỉ hỗ trợ tổ chức công lập.", "B. Chỉ phát triển tổ chức thuộc doanh nghiệp nhà nước.", "C. Chỉ ưu tiên tổ chức có quy mô lớn.", "D. Không phân biệt công lập hay ngoài công lập, đồng thời ưu tiên nguồn lực cho một số tổ chức có vai trò dẫn dắt."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 580,
    text: "Theo Điều 50, chức danh khoa học và chức danh công nghệ thể hiện nội dung nào của cá nhân?",
    options: ["A. Chỉ thâm niên làm việc.", "B. Trình độ, năng lực chuyên môn, nghiệp vụ và kỹ năng trong lĩnh vực hoạt động.", "C. Chỉ mức thu nhập và vị trí quản lý.", "D. Chỉ số lượng bài báo đã công bố."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 590,
    text: "Theo Điều 59, nội dung nào phù hợp với chính sách phát triển hạ tầng phục vụ nghiên cứu khoa học, phát triển công nghệ và đổi mới sáng tạo?",
    options: ["A. Chỉ đầu tư cho trụ sở cơ quan quản lý.", "B. Chỉ đầu tư thiết bị phục vụ hoạt động hành chính.", "C. Đầu tư, cải tạo, nâng cấp cơ sở vật chất, trung tâm nghiên cứu, trung tâm thử nghiệm và phòng thí nghiệm trọng điểm quốc gia.", "D. Chỉ hỗ trợ mua sắm thiết bị cho doanh nghiệp nước ngoài."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 600,
    text: "Theo khoản 1 Điều 61, mức chi ngân sách nhà nước hằng năm cho khoa học, công nghệ và đổi mới sáng tạo được quy định như thế nào?",
    options: ["A. Tối thiểu 2% tổng chi ngân sách nhà nước, trong nguồn tổng chi tối thiểu 3% ngân sách nhà nước cho phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số.", "B. Tối thiểu 1% tổng chi ngân sách nhà nước và không được tăng thêm.", "C. Tối thiểu 5% tổng chi ngân sách nhà nước chỉ dành cho nghiên cứu cơ bản.", "D. Do từng tổ chức nghiên cứu tự xác định, không liên quan đến ngân sách nhà nước."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 610,
    text: "Theo Điều 68, nguyên tắc hội nhập và hợp tác quốc tế về khoa học, công nghệ và đổi mới sáng tạo được thể hiện như thế nào?",
    options: ["A. Ưu tiên hợp tác với một quốc gia duy nhất.", "B. Chỉ hợp tác trong lĩnh vực nghiên cứu cơ bản.", "C. Chấp nhận mọi điều kiện hợp tác để tiếp nhận công nghệ.", "D. Chủ động hội nhập, bảo đảm độc lập, chủ quyền, an ninh quốc gia, bình đẳng, cùng có lợi và tham gia giải quyết các vấn đề khoa học, công nghệ toàn cầu."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 620,
    text: "Một trường đại học sử dụng ngân sách nhà nước thực hiện đề tài nghiên cứu. Hội đồng chỉ căn cứ vào số lượng bài báo đã công bố, không xem xét hiệu quả thực tiễn, dữ liệu đánh giá hoặc mức độ đóng góp cho phát triển kinh tế – xã hội. Nhận định nào phù hợp nhất?",
    options: ["A. Hoàn toàn phù hợp vì số lượng bài báo là tiêu chí duy nhất cần thiết.", "B. Chưa phù hợp với định hướng đánh giá theo Luật, vì việc đánh giá cần bảo đảm các nguyên tắc luật định và căn cứ vào hệ thống tiêu chí, dữ liệu, mức độ đóng góp phù hợp.", "C. Phù hợp nếu đề tài có thời gian thực hiện dưới một năm.", "D. Chỉ không phù hợp khi đề tài được doanh nghiệp tài trợ."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 630,
    text: "Một doanh nghiệp triển khai hệ thống trí tuệ nhân tạo hỗ trợ quyết định trong lĩnh vực y tế. Doanh nghiệp cho rằng hệ thống có độ chính xác cao nên có thể loại bỏ hoàn toàn việc giám sát của con người. Theo Điều 5, nhận định nào đúng nhất?",
    options: ["A. Được phép nếu hệ thống đã được thương mại hóa.", "B. Được phép nếu doanh nghiệp cam kết chịu trách nhiệm.", "C. Không phù hợp với nguyên tắc của Luật, vì việc phát triển và ứng dụng công nghệ trong lĩnh vực liên quan trực tiếp đến con người phải đặt dưới sự giám sát, kiểm soát của con người.", "D. Chỉ cần có sự đồng ý của nhà cung cấp phần mềm."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 640,
    text: "Một cơ quan quản lý đề xuất phân bổ ngân sách khoa học, công nghệ và đổi mới sáng tạo hoàn toàn theo số tiền các đơn vị đã giải ngân năm trước, không sử dụng kết quả đánh giá về hiệu quả và tác động. Cách tiếp cận nào phù hợp nhất với Luật?",
    options: ["A. Cần xem xét kết quả đánh giá hoạt động làm căn cứ điều chỉnh kế hoạch, nội dung và phương án phân bổ ngân sách theo quy định; không chỉ dựa vào số tiền đã giải ngân.", "B. Bắt buộc phân bổ theo số tiền giải ngân, không cần đánh giá.", "C. Chỉ được phân bổ ngân sách theo số lượng nhân sự.", "D. Không được điều chỉnh ngân sách trong bất kỳ trường hợp nào."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 650,
    text: "Một tổ chức khoa học và công nghệ công lập muốn thương mại hóa kết quả nghiên cứu do tổ chức tạo ra thông qua doanh nghiệp. Viên chức của tổ chức dự kiến góp vốn, tham gia quản lý và điều hành doanh nghiệp này. Theo Điều 56, phương án nào phù hợp nhất?",
    options: ["A. Mọi viên chức đều được tự do tham gia mà không cần sự chấp thuận.", "B. Viên chức không bao giờ được tham gia doanh nghiệp có liên quan đến kết quả nghiên cứu.", "C. Chỉ cần doanh nghiệp đồng ý là đủ.", "D. Viên chức, viên chức quản lý có thể tham gia theo điều kiện luật định khi được người đứng đầu tổ chức đồng ý; nếu người đứng đầu tổ chức là viên chức quản lý thì phải được cấp trên quản lý trực tiếp đồng ý."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 660,
    text: "Một đơn vị đề nghị sử dụng ngân sách nhà nước để tài trợ chi phí thử nghiệm, kiểm định và đánh giá chất lượng sản phẩm trong mua sắm công. Sản phẩm là kết quả nghiên cứu và phát triển công nghệ trong nước. Theo khoản 2 Điều 61, nhận định nào chính xác nhất?",
    options: ["A. Nhà nước bắt buộc tài trợ toàn bộ chi phí cho mọi sản phẩm tham gia mua sắm công.", "B. Nhà nước có thể xem xét tài trợ chi phí này đối với sản phẩm thuộc trường hợp luật định, trong đó có sản phẩm là kết quả của nghiên cứu khoa học, phát triển công nghệ và đổi mới sáng tạo trong nước.", "C. Chỉ sản phẩm nhập khẩu mới được xem xét hỗ trợ.", "D. Không được phép sử dụng ngân sách nhà nước cho bất kỳ chi phí kiểm định nào."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 670,
    text: "Một tổ chức cho rằng do Luật Khoa học, Công nghệ và Đổi mới sáng tạo đã có hiệu lực nên mọi quy định của Luật Khoa học và Công nghệ số 29/2013/QH13 đều đương nhiên hết hiệu lực ngay từ ngày 1/7/2025. Nhận định nào chính xác nhất?",
    options: ["A. Đúng, toàn bộ luật cũ hết hiệu lực từ ngày 1/7/2025.", "B. Đúng, vì ngày Quốc hội thông qua luật mới cũng là ngày luật có hiệu lực.", "C. Không chính xác: Luật số 93/2025/QH15 có hiệu lực chung từ ngày 1/10/2025; một số điều có hiệu lực từ ngày 1/7/2025 và việc xử lý các quy định chuyển tiếp phải tuân theo Điều 73 của Luật.", "D. Sai vì Luật số 93/2025/QH15 chưa có hiệu lực."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 680,
    text: "Một cơ quan nhà nước đánh giá nhiệm vụ khoa học, công nghệ có liên quan đến Danh mục bí mật nhà nước. Cơ quan này cho rằng mọi tiêu chí đánh giá đều phải công khai giống như nhiệm vụ thông thường. Cách hiểu nào phù hợp nhất với khoản 3 Điều 19?",
    options: ["A. Mọi tiêu chí đánh giá đều phải công khai, không có ngoại lệ.", "B. Không cần đánh giá các nhiệm vụ thuộc Danh mục bí mật nhà nước.", "C. Chỉ cần đánh giá dựa trên báo cáo tài chính.", "D. Việc đánh giá phải tuân thủ các nguyên tắc luật định và có tiêu chí riêng đối với chương trình, nhiệm vụ thuộc Danh mục bí mật nhà nước."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 690,
    text: "Một trường đại học và một doanh nghiệp cùng nghiên cứu, phát triển công nghệ mới. Hai bên đề nghị cơ quan quản lý loại bỏ toàn bộ yêu cầu tuân thủ pháp luật vì đây là hoạt động hợp tác tự nguyện và có thể mang lại lợi ích kinh tế. Nhận định nào phù hợp nhất?",
    options: ["A. Hợp tác tự nguyện không làm mất nghĩa vụ tuân thủ pháp luật; hoạt động vẫn phải tuân theo Luật và các quy định pháp luật có liên quan.", "B. Chỉ doanh nghiệp phải tuân thủ pháp luật, trường đại học được miễn.", "C. Chỉ cần hợp đồng hợp tác có chữ ký của hai bên.", "D. Được miễn tuân thủ nếu sản phẩm chưa được thương mại hóa."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 700,
    text: "Một địa phương xây dựng chính sách phát triển khoa học, công nghệ và đổi mới sáng tạo, nhưng chỉ tập trung vào mua sắm thiết bị, không đầu tư hạ tầng nghiên cứu dùng chung, không hỗ trợ phát triển nguồn nhân lực và không thúc đẩy hợp tác quốc tế. Đánh giá nào phù hợp nhất với định hướng của Luật?",
    options: ["A. Hoàn toàn phù hợp vì thiết bị là yếu tố duy nhất quyết định năng lực nghiên cứu.", "B. Chưa thể hiện đầy đủ định hướng phát triển đồng bộ tiềm lực khoa học, công nghệ và đổi mới sáng tạo; cần xem xét kết hợp hạ tầng, nhân lực, nguồn lực tài chính và hợp tác quốc tế theo các quy định liên quan.", "C. Chỉ cần bổ sung kinh phí mua sắm thiết bị, không cần các giải pháp khác.", "D. Phải chuyển toàn bộ hoạt động nghiên cứu sang khu vực tư nhân."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 710,
    text: "Theo Nghị định số 328/2026/NĐ-CP, “Nạn nhân của tin giả, tin sai sự thật” được định nghĩa là ai?",
    options: ["A. Cá nhân bị tổn hại về danh dự, nhân phẩm, uy tín, tài sản, quyền và lợi ích hợp pháp khác do tin giả, tin sai sự thật gây ra.", "B. Tất cả các cá nhân, tổ chức tham gia vào quá trình phát tán, chia sẻ hoặc bình luận tin giả.", "C. Mọi cơ quan, tổ chức, doanh nghiệp bị ảnh hưởng trực tiếp hoạt động sản xuất kinh doanh trên không gian mạng.", "D. Cơ quan nhà nước bị xâm hại uy tín nghiêm trọng trên quy mô lớn liên quan đến an ninh quốc gia."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 720,
    text: "Tin giả, tin sai sự thật được phân loại theo độ nguy hại gồm mấy mức độ?",
    options: ["A. 5 mức độ.", "B. 4 mức độ.", "C. 3 mức độ.", "D. 2 mức độ."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 730,
    text: "Nhóm tin giả, tin sai sự thật gây hậu quả hoặc có nguy cơ gây hậu quả đặc biệt nghiêm trọng bao gồm thông tin tác động tiêu cực như thế nào?",
    options: ["A. Chỉ gây thiệt hại về tài chính cho một doanh nghiệp vừa và nhỏ trên không gian mạng.", "B. Xâm phạm quyền tiếp cận thông tin của công dân đối với các văn bản quy phạm pháp luật thông thường.", "C. Tác động trong phạm vi hẹp, xâm hại trực tiếp đến uy tín của một cá nhân cụ thể.", "D. Tác động tiêu cực trên quy mô lớn đến an ninh quốc gia, quốc phòng, đối ngoại, trật tự, an toàn xã hội."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 740,
    text: "Quy trình xử lý tin giả, tin sai sự thật được quy định tại Nghị định này KHÔNG điều chỉnh tin giả trong trường hợp nào sau đây?",
    options: ["A. Tin giả, tin sai sự thật có chứa thông tin công dân được tiếp cận có điều kiện.", "B. Tin giả, tin sai sự thật chưa được gắn nhãn bởi cơ quan chức năng có thẩm quyền.", "C. Tin giả, tin sai sự thật đang trong quá trình điều tra, xét xử.", "D. Tin giả do hệ thống trí tuệ nhân tạo tạo ra trên mạng xã hội xuyên biên giới."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 750,
    text: "Theo Điều 8, quy trình xử lý tin giả, tin sai sự thật bao gồm mấy bước chính?",
    options: ["A. 4 bước.", "B. 7 bước.", "C. 5 bước.", "D. 6 bước."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 760,
    text: "Theo Khoản 3 Điều 9, trạng thái thông tin trên cổng thông tin điện tử trong thời gian kiểm chứng, xác minh tin giả được thể hiện là gì?",
    options: ["A. “Đang kiểm tra”.", "B. “Đang chờ phê duyệt”.", "C. “Đang xử lý”.", "D. “Tân giả, tin sai sự thật”."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 770,
    text: "Hình thức gắn nhãn tin giả, tin sai sự thật được quy định như thế nào?",
    options: ["A. Yêu cầu xóa bỏ hoàn toàn tài khoản mạng xã hội mà không cần hiển thị nhãn cảnh báo.", "B. Phát sóng thông cáo báo chí trên truyền hình quốc gia mà không cần đánh dấu trên bài viết.", "C. Đánh dấu, hiển thị cảnh báo bằng ký hiệu, biểu tượng hoặc thể hiện dòng chữ “TIN GIẢ, TIN SAI SỰ THẬT”.", "D. Chỉ gửi văn bản cảnh báo trực tiếp qua đường bưu điện đến nơi cư trú của chủ thể phát tán."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 780,
    text: "Theo Điều 10, thời hạn để cơ quan chức năng gắn nhãn tin giả, tin sai sự thật kể từ khi kết luận thông tin là tin giả là bao lâu?",
    options: ["A. Trong thời hạn 24 giờ.", "B. Trong thời hạn 48 giờ.", "C. Ngay lập tức không quá 2 giờ.", "D. Trong thời hạn 12 giờ làm việc."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 790,
    text: "Theo Khoản 2 Điều 11, trong trường hợp kết luận thông tin không có điều kiện xác thực, cơ quan chức năng tiến hành hình thức nào?",
    options: ["A. Cảnh báo để cá nhân, tổ chức thận trọng hoặc không được sử dụng, đăng tải, phát tán.", "B. Chuyển ngay hồ sơ sang cơ quan tố tụng hình sự để khởi tố vụ án.", "C. Gắn nhãn 'TIN GIẢ, TIN SAI SỰ THẬT' bắt buộc trên mọi nền tảng.", "D. Tiến hành công bố chính thức cấp nhà nước ngay lập tức."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 800,
    text: "Theo Điểm b Khoản 4 Điều 11, thời gian công bố, cảnh báo đối với tin giả, tin sai sự thật nguy hại (thuộc điểm b khoản 1 Điều 4) là khi nào?",
    options: ["A. Trong thời hạn 12 giờ làm việc kể từ khi được gắn nhãn.", "B. Trong thời hạn 24 giờ kể từ khi phát hiện.", "C. Trong thời hạn 3 ngày làm việc.", "D. Phải tiến hành công bố ngay sau khi gắn nhãn."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 810,
    text: "Theo Điều 12, đơn vị nào có trách nhiệm ngăn chặn, không cho phép đăng tải hoặc gỡ bỏ tin giả sau khi có yêu cầu?",
    options: ["A. Chỉ riêng lực lượng Công an nhân dân trực tiếp thực hiện gỡ bỏ.", "B. Ủy ban nhân dân cấp xã nơi xảy ra sự việc.", "C. Các cơ quan báo chí, truyền thông, doanh nghiệp cung cấp dịch vụ Internet, viễn thông, mạng xã hội, thông tin xuyên biên giới.", "D. Chỉ các cá nhân phát tán tin giả mới có trách nhiệm tự gỡ bỏ."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 820,
    text: "Việc báo tin, tố giác, phản ánh thông tin có dấu hiệu giả, sai sự thật có thể thực hiện thông qua ứng dụng nào được đề cập tại Khoản 2 Điều 13?",
    options: ["A. Ứng dụng thanh toán trực tuyến ngân hàng.", "B. Ứng dụng bản đồ số giao thông.", "C. Ứng dụng VNeID.", "D. Ứng dụng mạng xã hội quốc tế bất kỳ."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 830,
    text: "Theo Điều 14, sau khi xử lý tin giả, các bộ, cơ quan ngang bộ, UBND các cấp có trách nhiệm gửi kết quả về cơ quan nào để tập hợp, theo dõi?",
    options: ["A. Bộ Công an.", "B. Bộ Thông tin và Truyền thông cũ hoặc cơ quan báo chí trung ương.", "C. Bộ Văn hóa, Thể thao và Du lịch.", "D. Văn phòng Chính phủ."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 840,
    text: "Theo Điều 15, cơ quan chức năng thực hiện rà soát, phát hiện thông tin có dấu hiệu giả, sai sự thật thông qua những hoạt động nào?",
    options: ["A. Chỉ qua kiểm toán tài chính nội bộ các cơ quan nhà nước.", "B. Trên không gian mạng, mạng xã hội, lĩnh vực báo chí, xuất bản, phát thanh, truyền hình, quảng cáo và tiếp nhận phản ánh của người dân.", "C. Chỉ thông qua đơn khiếu nại đất đai tại cấp xã.", "D. Chỉ thông qua kiểm tra trực tiếp giấy phép kinh doanh của các doanh nghiệp vừa và nhỏ."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 850,
    text: "Cơ quan nào chịu trách nhiệm chung trong việc tổ chức thanh tra, kiểm tra phòng, chống tin giả, tin sai sự thật?",
    options: ["A. Bộ Quốc phòng.", "B. Thanh tra Chính phủ.", "C. Ủy ban nhân dân cấp tỉnh.", "D. Bộ Công an."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 860,
    text: "Theo Điều 18, cơ quan nào chủ trì tổ chức thực hiện các biện pháp phòng, chống tin giả, tin sai sự thật trên lĩnh vực văn hóa, thể thao và du lịch?",
    options: ["A. Bộ Quốc phòng.", "B. Bộ Văn hóa, Thể thao và Du lịch.", "C. Bộ Công an.", "D. Bộ Ngoại giao."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 870,
    text: "Theo Điều 19, cơ quan nào chủ trì tổ chức thực hiện các biện pháp phòng, chống tin giả, tin sai sự thật trên lĩnh vực quân sự, quốc phòng?",
    options: ["A. Bộ Công an.", "B. Ủy ban nhân dân các cấp.", "C. Bộ Công Thương.", "D. Bộ Quốc phòng."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 880,
    text: "Theo Điều 20, Bộ Ngoại giao có trách nhiệm chủ trì công bố chính thức cấp nhà nước đối với loại tin giả nào?",
    options: ["A. Tin giả liên quan trực tiếp đến vi phạm trật tự an toàn giao thông đô thị.", "B. Tin giả, tin sai sự thật ảnh hưởng đến chủ trương, đường lối, chính sách của Đảng, Nhà nước về đối ngoại, các vấn đề quốc tế và quan hệ đối ngoại giữa Việt Nam và các đối tác.", "C. Tin giả tác động đến hoạt động quốc phòng, biên giới quân sự.", "D. Tin giả gây khủng hoảng kinh tế nội địa và lạm phát giá cả thị trường trong nước."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 890,
    text: "Theo Điều 22, các doanh nghiệp cung cấp dịch vụ Internet, mạng xã hội phải thiết lập đầu mối phối hợp hoạt động trong thời gian bao lâu với cơ quan chức năng của Bộ Công an?",
    options: ["A. 12 giờ mỗi ngày.", "B. Giờ hành chính từ thứ Hai đến thứ Sáu.", "C. 24/7.", "D. Chỉ khi có yêu cầu bằng văn bản gửi trước 3 ngày."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 900,
    text: "Theo Khoản 3 Điều 3, “Công bố tin giả, tin sai sự thật” được hiểu là gì?",
    options: ["A. Là hành vi tự động xóa bỏ vĩnh viễn tài khoản người dùng mà không cần thông báo công khai.", "B. Là việc người dân gửi đơn tố giác lên cơ quan công an cấp xã.", "C. Là việc các doanh nghiệp mạng xã hội tự ý gắn nhãn cảnh báo mà không cần kết luận của cơ quan chức năng.", "D. Là công khai thông tin xác nhận là tin giả, tin sai sự thật, danh tính cá nhân, tổ chức phát ngôn, làm, lưu trữ, đăng tải, phát tán, chia sẻ, bình luận tin giả."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 910,
    text: "Theo Điểm b Khoản 5 Điều 8, bước cuối cùng trong quy trình xử lý tin giả, tin sai sự thật là gì?",
    options: ["A. Gửi kết quả về Bộ Công an để theo dõi.", "B. Áp dụng các hình thức xử lý.", "C. Tiến hành rà soát ban đầu trên không gian mạng.", "D. Thiết lập đầu mối trực 24/7 của doanh nghiệp viễn thông."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 920,
    text: "Theo Khoản 2 Điều 10, trường hợp nào sau đây được thực hiện việc gắn nhãn tin giả, tin sai sự thật?",
    options: ["A. Khi thông tin chưa có kết luận chính thức nhưng đang trong quá trình 'Đang xử lý'.", "B. Tất cả các loại tin giả không phân biệt mức độ nguy hại, kể cả tin thuộc điểm a khoản 1 Điều 4.", "C. Thông tin xác thực là tin giả thuộc điểm c khoản 2 Điều 4 hoặc điểm b khoản 2 Điều 4 (tuân thủ pháp luật tiếp cận thông tin) hoặc tin do AI tạo ra chưa gắn nhãn.", "D. Chỉ áp dụng riêng cho các tin giả xuất hiện trên báo chí in truyền thống."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 930,
    text: "Theo Điều 13, trường hợp phát hiện cá nhân, cơ quan, tổ chức lợi dụng việc báo tin, tố giác tin giả để thực hiện hành vi nghiêm cấm thì xử lý như thế nào?",
    options: ["A. Miễn trách nhiệm hoàn toàn vì người tố giác có quyền tự do ngôn luận tuyệt đối.", "B. Chuyển giao quyền xử lý cho doanh nghiệp mạng xã hội tự quyết định hình thức kỷ luật.", "C. Cơ quan chức năng có thẩm quyền xử lý theo quy định của pháp luật về Luật Tiếp công dân và pháp luật liên quan.", "D. Chỉ tiến hành nhắc nhở công khai tại khu dân cư mà không áp dụng chế tài."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 940,
    text: "Theo Khoản 3 Điều 14, cá nhân, cơ quan, tổ chức khi khiếu nại, tố cáo về xử lý tin giả có trách nhiệm gì?",
    options: ["A. Được quyền giữ bí mật toàn bộ tài liệu và không phải cung cấp cho cơ quan nhà nước.", "B. Phải cung cấp tài liệu và các thông tin liên quan làm căn cứ kiểm chứng, xác minh cho cơ quan chức năng khi có yêu cầu.", "C. Chỉ cần trình bày bằng lời nói qua điện thoại mà không cần cung cấp bất kỳ tài liệu nào.", "D. Chuyển thẳng tài liệu cho các tổ chức quốc tế nước ngoài xem xét giải quyết."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 950,
    text: "Theo Điều 22, các doanh nghiệp cung cấp dịch vụ Internet, mạng xã hội, xuyên biên giới có trách nhiệm gì trong việc phòng, chống tin giả?",
    options: ["A. Chỉ cần thu phí dịch vụ quảng cáo mà không cần quan tâm đến tính xác thực của thông tin trên nền tảng.", "B. Cho phép người dùng tự do chia sẻ tin giả nếu có lượng tương tác cao trên mạng xã hội.", "C. Thiết lập cơ chế báo cáo vi phạm cho người dùng, ngăn chặn, không cho phép đăng tải, phát tán thông tin khi đã được xác thực là tin giả.", "D. Tự ý biên tập lại nội dung tin giả thành tin đúng sự thật trước khi đăng tải công khai."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 960,
    text: "Việc ứng dụng công nghệ được thực hiện thông qua phương thức đào tạo nào sau đây:",
    options: ["A. Đào tạo kết hợp trực tuyến và trực tiếp", "B. Chỉ áp dụng trong đào tạo trực tuyến", "C. Chỉ áp dụng trong đào tạo trực tiếp", "D. Tất cả các phương thức đào tạo"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 970,
    text: "Việc ứng dụng công nghệ được thực hiện thông qua phương thức đào tạo nào sau đây:",
    options: ["A. Đào tạo trực tiếp", "B. Đào tạo trực tiếp có hỗ trợ công nghệ số", "C. Đào tạo trực tuyến một phần", "D. Đào tạo từ xa"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 980,
    text: "Hãy xác định yêu cầu trọng tâm của việc ứng dụng công nghệ trong việc bảo đảm khả năng tổ chức, quản lý và theo dõi, đánh giá toàn bộ các hoạt động đào tạo:",
    options: ["A. Là việc quản lý hồ sơ của người học", "B. Là kết quả học tập của người học", "C. Là hoạt động giảng dạy của giảng viên", "D. Là quá trình học tập của người học"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 990,
    text: "Việc sử dụng trí tuệ nhân tạo trong hoạt động đào tạo phải bảo đảm yêu cầu nào sau đây?",
    options: ["A. Bảo đảm thay thế được vai trò của giảng viên.", "B. Bảo đảm hỗ trợ, không thay thế vai trò của giảng viên.", "C. Bảo đảm thay thế hoàn toàn được hình thức thi tự luận trên giấy khi đánh giá kết quả thi kết thúc học phần của người học.", "D. Bảo đảm được việc người học không phải học trực tiếp trên lớp."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1000,
    text: "Việc ứng dụng công nghệ trong đào tạo phải bảo đảm yêu cầu tối thiểu nào sau đây?",
    options: ["A. Bảo đảm khả năng kết nối, chia sẻ dữ liệu với các hệ thống quản lý đào tạo và cơ sở dữ liệu giáo dục theo quy định.", "B. Bảo đảm được việc không kết nối, chia sẻ dữ liệu với các hệ thống quản lý đào tạo khác và cơ sở dữ liệu giáo dục.", "C. Bảo đảm hoàn toàn bí mật thông tin trong quá trình quản lý đào tạo.", "D. Bảo đảm an toàn đời tư của đội ngũ cán bộ giảng dạy và người học."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1010,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐT, ứng dụng công nghệ trong kiểm tra, đánh giá người học được thực hiện trong các hoạt động nào sau đây:",
    options: ["A. Giám sát quá trình giảng dạy", "B. Đánh giá năng lực quản lý", "C. Đánh giá năng lực giảng dạy", "D. Xây dựng, quản lý ngân hàng câu hỏi, đề thi"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1020,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐT, nội dung của ứng dụng công nghệ trong cơ sở giáo dục bao gồm những hoạt động nào?",
    options: ["A. Chỉ áp dụng trong hoạt động đào tạo", "B. Chỉ áp dụng trong hoạt động nghiên cứu khoa học", "C. Chỉ áp dụng trong hoạt động quản trị và cung cấp dịch vụ", "D. Tất cả các hoạt động đào tạo và nghiên cứu khoa học; hoạt động quản trị và cung cấp dịch vụ."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1030,
    text: "Học liệu số bao gồm:",
    options: ["A. Bài giảng điện tử, giáo trình, tài liệu tham khảo, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác.", "B. Tất cả các bài giảng, giáo trình, tài liệu tham khảo, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác", "C. Bài giảng điện tử, giáo trình điện tử, tài liệu tham khảo, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác.", "D. Bài giảng điện tử, giáo trình điện tử, tài liệu điện tử, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1040,
    text: "Hệ thống quản trị số được hiểu như thế nào?",
    options: ["A. Là hệ thống thông tin được xây dựng và vận hành trên môi trường số phục vụ hoạt động quản lý, điều hành và ra quyết định của cơ sở giáo dục.", "B. Là hệ thống công nghệ được xây dựng và vận hành trên môi trường số phục vụ công tác tổ chức, quản lý và hỗ trợ hoạt động dạy và học, bao gồm quản lý nội dung học tập, tương tác giữa giảng viên và người học, theo dõi, quản lý quá trình và kết quả học tập.", "C. Là phần mềm ứng dụng công nghệ số, có khả năng tương tác với người sử dụng thông qua ngôn ngữ tự nhiên hoặc các hình thức giao tiếp khác nhằm hỗ trợ giải đáp thắc mắc, tư vấn, cung cấp thông tin hoặc hỗ trợ thực hiện một số nhiệm vụ theo phạm vi chức năng được thiết kế.", "D. Là mô hình cơ sở giáo dục vận hành chủ yếu trên nền tảng công nghệ số và dữ liệu số; thực hiện chuyển đổi toàn diện các hoạt động giáo dục trong cơ sở giáo dục trên môi trường số."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1050,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐT, Việc sử dụng trí tuệ nhân tạo trong nghiên cứu khoa học phải đảm bảo điều kiện nào?",
    options: ["A. Làm thay đổi bản chất khoa học của nghiên cứu", "B. Không làm thay đổi bản chất khoa học của nghiên cứu", "C. Tuân thủ theo quy định riêng của cơ sở giáo dục", "D. Không thể kiểm chứng kết quả nghiên cứu."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1060,
    text: "Các hành vi vi phạm liêm chính học thuật trong môi trường số bao gồm:",
    options: ["A. Không công bố hoặc công bố không đầy đủ việc sử dụng công nghệ, trí tuệ nhân tạo khi có yêu cầu theo quy định nội bộ của cơ sở giáo dục và pháp luật của Nhà nước.", "B. Công bố đầy đủ việc sử dụng công nghệ, trí tuệ nhân tạo khi không có yêu cầu theo quy định nội bộ của cơ sở giáo dục và pháp luật của Nhà nước.", "C. Không công bố hoặc công bố không đầy đủ việc sử dụng công nghệ, trí tuệ nhân tạo với tất cả mọi người có nhu cầu.", "D. Sử dụng công nghệ, bao gồm trí tuệ nhân tạo trong học tập, kiểm tra, đánh giá hoặc nghiên cứu khoa học."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1070,
    text: "Ứng dụng công nghệ trong giáo dục đại học, giáo dục nghề nghiệp được hiểu là gì?",
    options: ["A. Là việc sử dụng công nghệ số, trí tuệ nhân tạo và các công nghệ liên quan khác như: thực tế ảo, điện toán đám mây, dữ liệu lớn để hỗ trợ, nâng cao hiệu quả các hoạt động đào tạo, kiểm tra, đánh giá, nghiên cứu khoa học, quản trị và cung cấp dịch vụ trong cơ sở giáo dục.", "B. là hệ thống thông tin được xây dựng và vận hành trên môi trường số phục vụ hoạt động quản lý, điều hành và ra quyết định của cơ sở giáo dục.", "C. Là hệ thống công nghệ được xây dựng và vận hành trên môi trường số phục vụ công tác tổ chức, quản lý và hỗ trợ hoạt động dạy và học, bao gồm quản lý nội dung học tập, tương tác giữa giảng viên và người học, theo dõi, quản lý quá trình và kết quả học tập.", "D. Là phần mềm ứng dụng công nghệ số, có khả năng tương tác với người sử dụng thông qua ngôn ngữ tự nhiên hoặc các hình thức giao tiếp khác nhằm hỗ trợ giải đáp thắc mắc, tư vấn, cung cấp thông tin hoặc hỗ trợ thực hiện một số nhiệm vụ theo phạm vi chức năng được thiết kế."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1080,
    text: "Việc ứng dụng công nghệ trong cơ sở giáo dục phải tuân thủ nguyên tắc nào sau đây?",
    options: ["A. Ứng dụng công nghệ phải lấy đáp ứng chuẩn đầu ra làm trung tâm.", "B. Ứng dụng công nghệ phải lấy người dạy làm trung tâm.", "C. Ứng dụng công nghệ phải lấy việc phục vụ thực hiện chương trình đào tạo làm trung tâm.", "D. Ứng dụng công nghệ phải lấy người học làm trung tâm."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1090,
    text: "Việc ứng dụng công nghệ trong kiểm tra đánh giá người học được thực hiện phù hợp thông qua các phương thức nào?",
    options: ["A. Kiểm tra, đánh giá trực tiếp.", "B. Kiểm tra, đánh giá trực tuyến.", "C. Tất cả các phương thức.", "D. Kiểm tra, đánh giá việc tự học."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1100,
    text: "Ứng dụng công nghệ trong quản trị cơ sở giáo dục cần ưu tiên thực hiện hoạt động nào?",
    options: ["A. Quản trị chương trình đào tạo, bảo đảm chất lượng đào tạo, nghiên cứu khoa học và các hoạt động giáo dục.", "B. Tuân thủ quy định của pháp luật, bảo đảm an toàn thông tin và bảo vệ dữ liệu.", "C. Hỗ trợ phân tích, dự báo, đánh giá và nâng cao chất lượng ra quyết định", "D. Bảo đảm tính thống nhất, đồng bộ trong quản lý, điều hành."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1110,
    text: "Việc ứng dụng công nghệ trong quản trị phải bảo đảm:",
    options: ["A. Người khác thực hiện hoặc thực hiện thay các nhiệm vụ học tập, kiểm tra, đánh giá hoặc nghiên cứu.", "B. Quản lý, lưu trữ, chia sẻ và khai thác dữ liệu nghiên cứu theo quy định.", "C. Bảo đảm tính thống nhất, đồng bộ trong quản lý, điều hành.", "D. Chất lượng, tính khoa học, tính cập nhật và phù hợp với chuẩn đầu ra của chương trình đào tạo."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1120,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐT, cơ sở giáo dục tổ chức cung cấp trên môi trường số những dịch vụ nào?",
    options: ["A. Dịch vụ đào tạo, dịch vụ hành chính, dịch vụ tư vấn, hướng nghiệp, hỗ trợ người học.", "B. Dịch vụ tài chính khi cần sử dụng phần mềm của cơ sở giáo dục.", "C. Dịch vụ chăm sóc sức khỏe cho nguồn nhân lực.", "D. Tất cả các dịch vụ có liên quan đến người dạy và người học."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1130,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐ, kế hoạch ứng dụng công nghệ trung hạn là mấy năm?",
    options: ["A. 3 năm", "B. 4 năm", "C. 5 năm", "D. 6 năm"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1140,
    text: "Nguồn lực triển khai ứng dụng công nghệ được huy động từ đâu?",
    options: ["A. Ngân sách Nhà nước", "B. Nguồn tài chính tự cân đối của cơ sở giáo dục", "C. Nguồn xã hội hóa, hợp tác với tổ chức, doanh nghiệp", "D. Tất cả các nguồn hợp pháp."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1150,
    text: "Quy định nào sau đây là đúng với quy định của Thông tư 49/2026/TT-BGDĐ về xây dựng chiến lược ứng dụng công nghệ?",
    options: ["A. Chiến lược ứng dụng công nghệ bắt buộc phải được ban hành riêng.", "B. Chiến lược ứng dụng công nghệ không nhất thiết phải ban hành riêng, có thể tích hợp trong chiến lược phát triển của cơ sở giáo dục.", "C. Chiến lược ứng dụng công nghệ phải đảm bảo khép kín trong cơ sở giáo dục.", "D. Chiến lược ứng dụng công nghệ phải đảm bảo thay thế hoàn toàn cái cũ."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1160,
    text: "Các văn bản quy định nội bộ về ứng dụng công nghệ trong cơ sở giáo dục bao gồm:",
    options: ["A. Quy chế, quy định, quy trình và hướng dẫn liên quan.", "B. Quy chế, quy trình và hướng dẫn liên quan.", "C. Nội quy, quy chế, quy định và hướng dẫn liên quan.", "D. Quy chế, quy định và văn bản hướng dẫn liên quan."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1170,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐ, Hệ thống quản lý học tập được hiểu là:",
    options: ["A. Là hệ thống công nghệ được xây dựng và vận hành trên môi trường số phục vụ công tác tổ chức, quản lý và hỗ trợ hoạt động dạy và học, bao gồm quản lý nội dung học tập, tương tác giữa giảng viên và người học, theo dõi, quản lý quá trình và kết quả học tập.", "B. Là hệ thống thông tin được xây dựng và vận hành trên môi trường số phục vụ hoạt động quản lý, điều hành và ra quyết định của cơ sở giáo dục.", "C. Là các tài nguyên giáo dục được số hóa phục vụ hoạt động đào tạo, kiểm tra, đánh giá và nghiên cứu khoa học, bao gồm bài giảng điện tử, giáo trình, tài liệu tham khảo, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác", "D. Là việc sử dụng công nghệ số, trí tuệ nhân tạo và các công nghệ liên quan khác như: thực tế ảo, điện toán đám mây, dữ liệu lớn để hỗ trợ, nâng cao hiệu quả các hoạt động đào tạo, kiểm tra, đánh giá, nghiên cứu khoa học, quản trị và cung cấp dịch vụ trong cơ sở giáo dục"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1180,
    text: "Theo quy định của Thông tư 49/2026/TT-BGDĐ, mô hình giáo dục số được hiểu là:",
    options: ["A. Là mô hình sử dụng công nghệ số, trí tuệ nhân tạo và các công nghệ liên quan khác như: thực tế ảo, điện toán đám mây, dữ liệu lớn để hỗ trợ, nâng cao hiệu quả các hoạt động đào tạo, kiểm tra, đánh giá, nghiên cứu khoa học, quản trị và cung cấp dịch vụ trong cơ sở giáo dục", "B. Là mô hình cơ sở giáo dục vận hành chủ yếu trên nền tảng công nghệ số và dữ liệu số; thực hiện chuyển đổi toàn diện các hoạt động giáo dục trong cơ sở giáo dục trên môi trường số.", "C. Là mô hình các tài nguyên giáo dục được số hóa phục vụ hoạt động đào tạo, kiểm tra, đánh giá và nghiên cứu khoa học, bao gồm bài giảng điện tử, giáo trình, tài liệu tham khảo, học liệu mở, ngân hàng câu hỏi, dữ liệu học tập và các tài nguyên số khác.", "D. Là mô hình các hệ thống thông tin khác nhau trong nội bộ cơ sở giáo dục có thể kết nối, chia sẻ và sử dụng dữ liệu của nhau một cách đồng bộ theo các quy chuẩn được quy định."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1190,
    text: "Việc ứng dụng công nghệ trong cơ sở giáo dục phải tuân thủ tuân thủ nguyên tắc nào sau đây?",
    options: ["A. Tuân thủ kiến trúc số do cơ quan có thẩm quyền ban hành", "B. Bảo đảm an toàn thông tin cho cơ quan và các tổ chức khác.", "C. Bảo đảm khả năng kết nối, liên thông, chia sẻ dữ liệu trong nội bộ.", "D. Tránh đầu tư phân tán khắp nơi, trùng lắp trong quá trình ứng dụng công nghệ."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1200,
    text: "Ứng dụng công nghệ trong kiểm tra, đánh giá được thực hiện trong các hoạt động nào sau đây?",
    options: ["A. Xây dựng, quản lý ngân hàng câu hỏi, đề thi.", "B. Tổ chức kiểm tra, đánh giá và chấm điểm.", "C. Giám sát quá trình kiểm tra, đánh giá.", "D. Tất cả các hoạt động trên."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1210,
    text: "Nghị quyết 66 yêu cầu thực hiện nhiệm vụ nào nhằm phổ biến, giáo dục pháp luật?",
    options: ["A. Ứng dụng công nghệ số, thực hiện chuyển đổi số đồng bộ trong phổ biến, giáo dục pháp luật, trợ giúp pháp lý và đăng ký biện pháp bảo đảm", "B. Phát triển một nền tảng trực tuyến chuyên biệt, cung cấp dịch vụ tư vấn pháp luật và tài liệu giảng dạy điện tử cho toàn xã hội", "C. Xây dựng hệ thống học liệu pháp luật mô, triển khai giảng dạy số hóa và chương trình đào tạo trực tuyến cho cán bộ và đảng viên", "D. Thiết lập mạng lưới trung tâm pháp luật điện tử tại các địa phương, kết nối dữ liệu ngành và cung cấp dịch vụ pháp lý trên không gian mạng."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1220,
    text: "Nghị quyết số 66-NQ/TW quy định chi cho công tác xây dựng pháp luật không được thấp hơn bao nhiêu phần trăm (%) tổng chi ngân sách hằng năm?",
    options: ["A. 0.01", "B. 0,50%", "C. 0,80%", "D. 0,30%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1230,
    text: "Nghị quyết 66 xác định đến năm 2030 Việt Nam có hệ thống pháp luật như thế nào?",
    options: ["A. Hệ thống pháp luật dân chủ, công bằng, đồng bộ, thống nhất, công khai, minh bạch, khả thi", "B. Hệ thống pháp luật do người dân làm chủ, công bằng, công khai, minh bạch, và được thống nhất cao giữa các địa phương", "C. Hệ thống pháp luật dân chủ, công bằng, công khai, minh bạch, cho người dân giám sát và phản biện, góp ý và xây dựng", "D. Hệ thống pháp luật do người dân làm chủ, công bằng với tất cả người dân, không phân biệt vùng miền, độ tuổi, giới tinh"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1240,
    text: "Thực hiện Nghị quyết 66 NQ-TW, trường Đại học Sư phạm Kĩ thuật Hưng Yên đã có chỉ đạo nào sau đây:",
    options: ["A. Phòng Pháp chế và Kiểm tra nội bộ yêu cầu rà soát lại hệ thống văn bản quy định, xem xét các văn bản nào cần sửa đổi và thay mới", "B. Lên kế hoạch ban hành các văn bản thiếu trong toàn trường để kịp thời cập nhật quy định mới.", "C. Phòng Pháp chế và kiểm tra nội bộ thông báo phổ biến về Nghị định 66 tới các đơn vị.", "D. Tất cả phương án trên."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1250,
    text: "Theo Nghị quyết số 66-NQ/TW, trong công tác chuyển đổi số và ứng dụng trí tuệ nhân tạo, cơ sở dữ liệu lớn về pháp luật cần bảo đảm các tiêu chí nào?",
    options: ["A. “Đúng, đủ, sạch, nhanh”", "B. “Đúng, đủ, mạnh, sống”", "C. “Đúng, đủ, sạch, sống”", "D. “Đúng, đủ, mạnh, nhanh”"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1260,
    text: "Nghị quyết 66 nhấn mạnh yêu cầu nào cần được bảo đảm trong các quy định của luật?",
    options: ["A. Mang tính ổn định, đơn giản, dễ thực hiện, lấy người dân, doanh nghiệp làm trung tâm", "B. Gần với mục tiêu phát triển dài hạn, ưu tiên lợi ích nhà nước và bảo đảm an ninh quốc gia", "C. Phù hợp với các cam kết quốc tế, tăng cường tính cạnh tranh và hội nhập của Việt Nam", "D. Tạo hiệu quả trong quy trình quản lý, tạo thuận lợi cho triển khai, thi hành pháp luật"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1270,
    text: "Công đoàn Việt Nam thuộc loại hình tổ chức nào sau đây?",
    options: ["A. Tổ chức kinh tế", "B. Tổ chức chính trị - xã hội rộng lớn của giai cấp công nhân và người lao động", "C. Tổ chức phi chính phủ", "D. Tổ chức từ thiện độc lập"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1280,
    text: "Công đoàn Việt Nam là thành viên trong hệ thống chính trị do tổ chức nào lãnh đạo?",
    options: ["A. Quốc hội Việt Nam", "B. Chính phủ Việt Nam", "C. Đảng Cộng sản Việt Nam", "D. Ủy ban Nhân dân cấp tỉnh"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1290,
    text: "Công đoàn Việt Nam thực hiện những hoạt động nào sau đây?",
    options: ["A. Tham gia quản lý nhà nước, quản lý kinh tế - xã hội", "B. Giám sát, phản biện xã hội", "C. Tham gia kiểm tra, thanh tra, giám sát hoạt động của cơ quan nhà nước, tổ chức, đơn vị, doanh nghiệp", "D. Tất cả các đáp án trên"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1300,
    text: "Điều lệ Công đoàn Việt Nam quy định những nội dung nào?",
    options: ["A. Điều kiện, trình tự, thủ tục thành lập, gia nhập, giải thể và chấm dứt hoạt động công đoàn", "B. Quyền, trách nhiệm của tổ chức công đoàn các cấp và của đoàn viên công đoàn", "C. Tài chính, tài sản của Công đoàn", "D. Tất cả các đáp án trên"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1310,
    text: "Từ khi ra đời đến nay tổ chức Công đoàn Việt Nam đã mấy lần đổi tên?",
    options: ["A. 5", "B. 6", "C. 7"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1320,
    text: "Luật Công đoàn lần đầu tiên được Quốc hội nước ta ban hành vào năm nào?",
    options: ["A. Năm 1955", "B. Năm 1957", "C. Năm 1960"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1330,
    text: "Lần đầu tiên Chủ tịch Hồ Chí Minh dự Đại hội Công đoàn Việt Nam là Đại hội lần thứ mấy?",
    options: ["A. Lần thứ nhất", "B. Lần thứ hai", "C. Lần thứ ba", "D. Lần thứ tư"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1340,
    text: "Vai trò, trách nhiệm của Công đoàn được Hiến pháp nước ta ghi nhận thành một điều riêng biệt đầu tiên từ năm nào?",
    options: ["A. 1959", "B. 1980", "C. 1992", "D. 2013"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1350,
    text: "Luật BHXH hiện hành quy định đối tượng nào sau đây phải tham gia bảo hiểm xã hội bắt buộc?",
    options: ["A. Người làm việc theo hợp đồng lao động không xác định thời hạn, hợp đồng lao động xác định thời hạn.", "B. Cán bộ, công chức, viên chức", "C. Người hoạt động không chuyên trách ở xã, phường, thị trấn", "D. Tất cả các đáp án trên"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1360,
    text: "Theo Luật BHXH hiện hành, người tham gia bảo hiểm xã hội bắt buộc được hưởng những chế độ nào?",
    options: ["A. Ốm đau; thai sản; tai nạn lao động, bệnh nghề nghiệp; hưu trí ; tử tuất", "B. Thai sản; ốm đau", "C. Tai nạn lao động, bệnh nghề nghiệp, ốm đau", "D. Hưu trí; tử tuất"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1370,
    text: "Theo Luật BHXH hiện hành, người tham gia bảo hiểm xã hội tự nguyện được hưởng những chế độ nào?",
    options: ["A. Ốm đau; thai sản; tai nạn lao động, bệnh nghề nghiệp; hưu trí ; tử tuất", "B. Thai sản; ốm đau", "C. Tai nạn lao động, bệnh nghề nghiệp, ốm đau", "D. Hưu trí; tử tuất"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1380,
    text: "Thời gian tối đa hưởng chế độ ốm đau trong một năm đối với người lao động làm việc trong điều kiện bình thường nếu đã đóng bảo hiểm xã hội dưới 15 năm theo Luật BHXH hợp nhất số 19/VBHN-VPQH ngày 16 tháng 12 năm 2019 của Văn phòng quốc hội?",
    options: ["A. 30 ngày", "B. 40 ngày", "C. 45 ngày", "D. 60 ngày"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1390,
    text: "Thời gian tối đa hưởng chế độ ốm đau trong một năm đối với người lao động làm việc trong điều kiện bình thường nếu đã đóng bảo hiểm xã hội từ đủ 15 năm đến dưới 30 năm theo Luật BHXH hợp nhất số 19/VBHN-VPQH ngày 16 tháng 12 năm 2019 của Văn phòng quốc hội?",
    options: ["A. 30 ngày", "B. 40 ngày", "C. 50 ngày", "D. 45 ngày"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1400,
    text: "Thời gian tối đa hưởng chế độ ốm đau trong một năm đối với người lao động làm việc trong điều kiện bình thường nếu đã đóng bảo hiểm xã hội từ đủ 30 năm trở lên theo Luật BHXH hợp nhất số 19/VBHN-VPQH ngày 16 tháng 12 năm 2019 của Văn phòng quốc hội?",
    options: ["A. 30 ngày", "B. 45 ngày", "C. 55 ngày", "D. 60 ngày"],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1410,
    text: "Người lao động được nghỉ việc hưởng chế độ chăm sóc cho mỗi con ốm đau trong một năm đối với con dưới 3 tuổi Theo quy định Luật BHXH hợp nhất số 19/VBHN-VPQH ngày 16 tháng 12 năm 2019 của Văn phòng quốc hội là bao nhiêu ngày?",
    options: ["A. Tối đa 20 ngày làm việc", "B. Tối đa 15 ngày", "C. Tối đa 30 ngày"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1420,
    text: "Người lao động được nghỉ việc hưởng chế độ chăm sóc cho mỗi con ốm đau trong một năm đối với con đủ 5 tuổi Theo quy định Luật BHXH hợp nhất số 19/VBHN-VPQH ngày 16 tháng 12 năm 2019 của Văn phòng quốc hội là bao nhiêu ngày?",
    options: ["A. Tối đa 10 ngày làm việc", "B. Tối đa 15 ngày làm việc", "C. Tối đa 20 ngày làm việc"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1430,
    text: "Mặt trận Tổ quốc Việt Nam có vai trò quan trọng trong hệ thống chính trị là:",
    options: ["A. Cơ quan hành pháp của Nhà nước", "B. Tổ chức đại diện duy nhất cho người sử dụng lao động", "C. Liên minh chính trị, cơ sở của chính quyền nhân dân, khối đại đoàn kết toàn dân tộc", "D. Tổ chức chuyên môn về kinh tế"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1440,
    text: "Theo Điều 33 của Luật việc làm, mức đóng bảo hiểm thất nghiệp tối đa của người lao động là bao nhiêu phần trăm tiền lương tháng?",
    options: ["A. 0.5%", "B. 2%", "C. 1%", "D. 1.5%"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1450,
    text: "Theo Điều 38 của Luật việc làm, để đủ điều kiện hưởng trợ cấp thất nghiệp, người lao động phải đóng bảo hiểm thất nghiệp từ đủ bao nhiêu tháng trở lên trong thời gian 24 tháng trước khi chấm dứt hợp đồng lao động?",
    options: ["A. Từ đủ 12 tháng trở lên", "B. Từ đủ 18 tháng trở lên", "C. Từ đủ 24 tháng trở lên", "D. Từ đủ 06 tháng trở lên"],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1460,
    text: "Theo Điều 39 của Luật việc làm, mức hưởng trợ cấp thất nghiệp hằng tháng bằng bao nhiêu phần trăm mức bình quân tiền lương tháng đóng bảo hiểm thất nghiệp của 06 tháng liền kề trước khi nghỉ việc?",
    options: ["A. 70%", "B. 75%", "C. 60%", "D. 50%"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1470,
    text: "Theo Điều 39 của Luật việc làm, thời gian hưởng trợ cấp thất nghiệp tối đa là bao nhiêu tháng?",
    options: ["A. 24 tháng", "B. 12 tháng", "C. 09 tháng", "D. 06 tháng"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1480,
    text: "Theo Điều 35 của Bộ luật Lao động, người lao động làm việc theo hợp đồng không xác định thời hạn có quyền đơn phương chấm dứt hợp đồng nhưng phải báo trước ít nhất bao nhiêu ngày?",
    options: ["A. 3 ngày làm việc", "B. Không cần báo trước", "C. 45 ngày", "D. 30 ngày"],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1490,
    text: "Theo Điều 26 của Bộ luật Lao động, tiền lương trong thời gian thử việc ít nhất phải bằng bao nhiêu phần trăm mức lương của công việc đó?",
    options: ["A. 100%", "B. 85%", "C. 80%", "D. 70%"],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1500,
    text: "Theo Điều 37 của Bộ luật Lao động, trường hợp nào người sử dụng lao động KHÔNG được thực hiện quyền đơn phương chấm dứt hợp đồng lao động?",
    options: ["A. Người lao động thường xuyên không hoàn thành công việc.", "B. Người lao động tự ý bỏ việc 05 ngày liên tục.", "C. Người lao động nữ mang thai; đang nghỉ thai sản hoặc nuôi con dưới 12 tháng tuổi.", "D. Người lao động đủ tuổi nghỉ hưu."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1510,
    text: "Theo Điều 40 của Bộ luật Lao động, nếu người lao động đơn phương chấm dứt hợp đồng trái pháp luật thì phải bồi thường khoản tiền nào cho người sử dụng lao động?",
    options: ["A. Không phải bồi thường gì.", "B. Nửa tháng tiền lương theo hợp đồng lao động và một khoản tiền tương ứng với tiền lương theo hợp đồng lao động trong những ngày không báo trước.", "C. 02 tháng tiền lương.", "D. Toàn bộ tiền lương đã nhận trong năm."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1520,
    text: "Theo Luật Bình đẳng giới, bình đẳng giới được hiểu là gì?",
    options: ["A. Nam giới và nữ giới phải có vai trò và trách nhiệm hoàn toàn giống nhau trong mọi hoạt động.", "B. Nam, nữ có vị trí, vai trò ngang nhau, được tạo điều kiện và cơ hội phát huy năng lực của mình cho sự phát triển của cộng đồng, gia đình và thụ hưởng như nhau về thành quả của sự phát triển đó.", "C. Nữ giới được ưu tiên trong tất cả các lĩnh vực của đời sống xã hội.", "D. Nam giới có trách nhiệm quyết định các vấn đề quan trọng trong gia đình và xã hội."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1530,
    text: "Theo Luật Bình đẳng giới, hành vi nào sau đây bị nghiêm cấm?",
    options: ["A. Tổ chức tuyên truyền, giáo dục về bình đẳng giới.", "B. Tạo điều kiện để phụ nữ tham gia quản lý và lãnh đạo.", "C. Phân biệt đối xử về giới dưới mọi hình thức.", "D. Khuyến khích nam giới chia sẻ công việc gia đình."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1540,
    text: "Trong lĩnh vực giáo dục và đào tạo, nam và nữ có quyền bình đẳng nào sau đây?",
    options: ["A. Chỉ nam giới được ưu tiên tham gia các chương trình đào tạo chuyên sâu.", "B. Chỉ nữ giới được hưởng chính sách hỗ trợ trong giáo dục.", "C. Nam và nữ bình đẳng về độ tuổi đi học, lựa chọn ngành nghề học tập và tiếp cận các chương trình giáo dục, đào tạo.", "D. Việc lựa chọn ngành nghề đào tạo phải căn cứ vào giới tính."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1550,
    text: "Theo quy định về trách nhiệm của gia đình trong thực hiện bình đẳng giới, hành vi nào sau đây là đúng?",
    options: ["A. Ưu tiên đầu tư học tập cho con trai hơn con gái.", "B. Giao toàn bộ công việc nội trợ cho phụ nữ.", "C. Đối xử công bằng, tạo cơ hội như nhau giữa con trai và con gái trong học tập, lao động và tham gia các hoạt động khác.", "D. Chỉ người chồng có quyền quyết định các vấn đề kinh tế của gia đình."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1560,
    text: "Theo Luật Bình đẳng giới, người có hành vi vi phạm pháp luật về bình đẳng giới có thể phải chịu hình thức xử lý nào?",
    options: ["A. Chỉ bị nhắc nhở, phê bình.", "B. Chỉ bị xử phạt hành chính.", "C. Chỉ bị xử lý kỷ luật tại cơ quan, tổ chức.", "D. Tùy theo tính chất, mức độ vi phạm có thể bị xử lý kỷ luật, xử lý hành chính hoặc truy cứu trách nhiệm hình sự."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1570,
    text: "Theo Luật Mặt trận Tổ quốc Việt Nam hiện hành, Mặt trận Tổ quốc Việt Nam được xác định là tổ chức nào sau đây?",
    options: ["A. Tổ chức chính trị trực thuộc Chính phủ.", "B. Tổ chức liên minh chính trị, liên hiệp tự nguyện của tổ chức chính trị, các tổ chức chính trị - xã hội, tổ chức xã hội và các cá nhân tiêu biểu.", "C. Tổ chức xã hội nghề nghiệp hoạt động độc lập.", "D. Cơ quan hành chính nhà nước ở địa phương."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1580,
    text: "Theo quy định của Luật Mặt trận Tổ quốc Việt Nam, Mặt trận Tổ quốc Việt Nam có vai trò nào sau đây?",
    options: ["A. Là cơ quan trực tiếp quản lý hoạt động của các cơ quan nhà nước.", "B. Là cơ quan có quyền ban hành văn bản quy phạm pháp luật.", "C. Là bộ phận của hệ thống chính trị và là cơ sở chính trị của chính quyền nhân dân.", "D. Là cơ quan thay thế hoạt động của Quốc hội."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1590,
    text: "Một trong những chức năng, nhiệm vụ quan trọng của Mặt trận Tổ quốc Việt Nam là gì?",
    options: ["A. Giám sát và phản biện xã hội.", "B. Trực tiếp xét xử các vụ án hành chính.", "C. Quyết định ngân sách nhà nước.", "D. Bổ nhiệm cán bộ lãnh đạo các cơ quan nhà nước."],
    correctOptionIndex: 0
  },
  {
    sortOrder: 1600,
    text: "Theo quy định được sửa đổi, bổ sung tại Luật số 97/2025/QH15, các tổ chức chính trị - xã hội cùng với các tổ chức thành viên khác của Mặt trận thực hiện việc phối hợp và thống nhất hành động theo nguyên tắc nào?",
    options: ["A. Do Chính phủ chủ trì.", "B. Do Quốc hội chủ trì.", "C. Do Ủy ban nhân dân cấp tỉnh chủ trì.", "D. Do Mặt trận Tổ quốc Việt Nam chủ trì, đồng thời phát huy tính chủ động, sáng tạo của mỗi tổ chức thành viên."],
    correctOptionIndex: 3
  },
  {
    sortOrder: 1610,
    text: "Luật số 97/2025/QH15 sửa đổi, bổ sung một số điều của Luật Mặt trận Tổ quốc Việt Nam có hiệu lực thi hành từ ngày nào?",
    options: ["A. Ngày 01/01/2025.", "B. Ngày 01/7/2025.", "C. Ngày 27/6/2025.", "D. Ngày 01/01/2026."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1620,
    text: "Theo Nghị định số 105/2026/NĐ-CP, đối với cơ quan, tổ chức, đơn vị, doanh nghiệp đóng kinh phí công đoàn theo tháng, thời hạn đóng kinh phí công đoàn chậm nhất là khi nào?",
    options: ["A. Ngày 15 của tháng tiếp theo.", "B. Ngày cuối cùng của tháng tiếp theo.", "C. Ngày cuối cùng của tháng hiện tại.", "D. Ngày 15 của tháng hiện tại."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1630,
    text: "Đối với đơn vị sự nghiệp công lập tự bảo đảm một phần chi thường xuyên, nguồn đóng kinh phí công đoàn được lấy từ đâu?",
    options: ["A. Chỉ từ nguồn ngân sách nhà nước.", "B. Chỉ từ nguồn thu sự nghiệp của đơn vị.", "C. Từ nguồn ngân sách nhà nước, nguồn thu sự nghiệp và nguồn thu hợp pháp khác (nếu có).", "D. Chỉ từ nguồn đóng góp của đoàn viên công đoàn."],
    correctOptionIndex: 2
  },
  {
    sortOrder: 1640,
    text: "Theo Nghị định số 105/2026/NĐ-CP, tổ chức công đoàn được giao quản lý, sử dụng tài chính công đoàn được mở tài khoản tại đâu để thực hiện việc quản lý các nguồn tài chính?",
    options: ["A. Chỉ được mở tài khoản tại ngân hàng thương mại.", "B. Được mở tài khoản tại Kho bạc Nhà nước để phản ánh các khoản ngân sách nhà nước cấp hỗ trợ và tài khoản tiền gửi tại ngân hàng để phản ánh các khoản thu, chi kinh phí công đoàn.", "C. Chỉ được mở tài khoản tại Kho bạc Nhà nước.", "D. Được mở tài khoản tại bất kỳ tổ chức tài chính nào mà không cần phân biệt nguồn thu."],
    correctOptionIndex: 1
  },
  {
    sortOrder: 1650,
    text: "Theo Nghị định số 105/2026/NĐ-CP, kinh phí công đoàn chưa sử dụng hết khi kết thúc năm ngân sách được xử lý như thế nào?",
    options: ["A. Phải nộp toàn bộ vào ngân sách nhà nước.", "B. Phải hoàn trả cho người lao động.", "C. Được chuyển sang năm sau để tiếp tục sử dụng theo quy định; riêng nguồn ngân sách nhà nước cấp hỗ trợ thực hiện theo quy định của pháp luật về ngân sách nhà nước.", "D. Phải phân chia cho các đoàn viên công đoàn."],
    correctOptionIndex: 2
  }
];
