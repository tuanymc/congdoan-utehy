# Quy trình tổ chức thi tìm hiểu pháp luật và hướng dẫn thực hiện

Áp dụng trên Website Công đoàn UTEHY — mục **Tiện ích số / Phổ biến pháp luật**.

Tài liệu này vừa là quy trình tổ chức (Ban chấp hành, công đoàn bộ phận, đoàn viên), vừa là hướng dẫn thao tác trên hệ thống để bảo đảm các tiêu chí: đề thi lấy từ ngân hàng câu hỏi; mỗi bài thi trộn thứ tự câu và trộn đáp án; thời gian và số câu tùy biến; mở / khóa cuộc thi; có cửa sổ thi thử; tính điểm và thống kê theo cá nhân, theo công đoàn bộ phận.

---

## 1. Mục đích — phạm vi

### 1.1. Mục đích

- Phổ biến, giáo dục pháp luật cho công đoàn viên theo từng đợt (quý, chuyên đề, hoặc đợt đột xuất).
- Tổ chức thi trắc nghiệm công bằng: mỗi người nhận một đề được hệ thống trộn từ ngân hàng, không xem trước đáp án khi đang làm bài chính thức.
- Tổng hợp kết quả để khen thưởng cá nhân và đánh giá mức độ tham gia của từng công đoàn bộ phận.

### 1.2. Phạm vi

- **Đối tượng dự thi:** công đoàn viên đã có tài khoản đăng nhập và đã được gắn với hồ sơ trong danh bạ (để hệ thống biết công đoàn bộ phận).
- **Đọc tài liệu:** công khai, không cần đăng nhập.
- **Thi thử và thi chính thức:** bắt buộc đăng nhập.
- **Không áp dụng** cho khảo sát (Survey) — khảo sát là ý kiến ẩn danh, không chấm điểm.

### 1.3. Vai trò

| Vai trò | Trách nhiệm |
|---|---|
| Ban chấp hành Công đoàn trường | Quyết định chủ đề, lịch thi thử / thi chính thức, mức đạt, số câu, thời lượng, thể lệ tính điểm |
| Cán bộ quản trị (ADMIN / UNION_CLERK) | Tạo đợt, nhập tài liệu, nhập ngân hàng câu hỏi, cấu hình cửa sổ thi, mở–khóa thi, xuất thống kê |
| Chủ tịch / ủy viên công đoàn bộ phận | Đôn đốc đoàn viên đọc tài liệu, thi thử, thi chính thức; đối chiếu danh sách đoàn viên đã gắn tài khoản |
| Đoàn viên | Đọc tài liệu, thi thử (không tính xếp hạng), thi chính thức trong thời gian quy định |

---

## 2. Nguyên tắc kỹ thuật bắt buộc

Hệ thống thực thi các nguyên tắc dưới đây; cán bộ không được tắt trừ khi Ban chấp hành cho phép bằng văn bản.

1. **Đề lấy từ ngân hàng câu hỏi.** Mọi câu nhập ở màn hình *Câu hỏi* là ngân hàng của đợt. Số câu trên mỗi đề (`Số câu mỗi đề`) do Ban chấp hành quyết định và có thể khác số câu trong ngân hàng. Khi đoàn viên bấm thi, máy chủ lấy ngẫu nhiên đúng số câu đã cấu hình.
2. **Trộn thứ tự câu hỏi** trong từng lượt (`Xáo câu hỏi` = Có). Thứ tự đã khóa khi bắt đầu; F5 không đổi đề.
3. **Trộn đáp án** trong từng câu (`Xáo lựa chọn` = Có). Máy chủ chấm theo chỉ số đáp án gốc, không theo thứ tự hiển thị.
4. **Thời lượng tùy biến** (`Thời gian mỗi lượt`, đơn vị phút). Hết giờ thì hệ thống nộp tự động (có thêm 60 giây dự phòng phía máy chủ).
5. **Số câu tùy biến** (`Số câu mỗi đề`). Để trống = dùng hết ngân hàng.
6. **Cửa sổ mở / khóa thi chính thức:** phải bật *Đang mở thi* **và** nằm trong khoảng *Mở thi chính thức từ* → *Khóa thi chính thức*. Ngoài khoảng này không bắt đầu được lượt chính thức mới.
7. **Cửa sổ thi thử:** *Mở thi thử từ* → *Khóa thi thử*, số lần thi thử riêng. Lượt thi thử **không** tính vào xếp hạng cá nhân và điểm đơn vị. Sau khi nộp thi thử, hệ thống hiện đáp án để ôn.
8. **Thống kê hai tầng:** cá nhân (lượt chính thức tốt nhất) và công đoàn bộ phận (theo hồ sơ đoàn viên đã gắn tài khoản).

---

## 3. Công thức tính điểm

### 3.1. Điểm cá nhân (một lượt)

- Mỗi câu đúng = 1 điểm; câu sai hoặc bỏ trống = 0.
- Tỷ lệ % = (số câu đúng / số câu trên đề) × 100.
- **Đạt** khi % ≥ ngưỡng `Điểm đạt (%)` của đợt (mặc định 70).
- Nếu được phép nhiều lần thi chính thức: xếp hạng lấy **lượt tốt nhất** ( % cao hơn; nếu hòa thì lấy lượt nộp sớm hơn).
- Lượt hết giờ vẫn được chấm trên phần đã làm.

### 3.2. Điểm công đoàn bộ phận

Chỉ tính đoàn viên **đã gắn tài khoản** với hồ sơ thuộc bộ phận đó. Mẫu số “có tài khoản” lấy từ danh bạ Công đoàn bộ phận.

Với mỗi bộ phận:

- **Tỷ lệ tham gia** = số người đã nộp bài chính thức / số đoàn viên có tài khoản trong bộ phận × 100.
- **Điểm trung bình** = trung bình % của các lượt chính thức tốt nhất trong bộ phận (0 nếu chưa ai nộp).
- **Tỷ lệ đạt** = số người đạt / số người đã nộp chính thức × 100 (0 nếu chưa ai nộp).

**Điểm đơn vị** (thang 100):

> Điểm đơn vị = 50% × Điểm trung bình + 30% × Tỷ lệ tham gia + 20% × Tỷ lệ đạt

Xếp hạng đơn vị theo điểm đơn vị giảm dần; nếu hòa thì ưu tiên tỷ lệ tham gia cao hơn.

Người thi nhưng **chưa gắn công đoàn bộ phận** vẫn có mặt trên bảng cá nhân (ghi “Chưa gắn bộ phận”) và **không** cộng vào điểm đơn vị.

Thi thử **không** tham gia bất kỳ chỉ số nào ở mục 3.2.

---

## 4. Lịch trình một đợt thi

Ban chấp hành chốt lịch trước khi mở công khai. Gợi ý khung thời gian:

| Giai đoạn | Việc cần làm | Hệ thống |
|---|---|---|
| A. Chuẩn bị (trước ngày mở tài liệu) | Soạn tài liệu, nhập ngân hàng, rà đáp án, cấu hình số câu / phút / điểm đạt | Đợt ở trạng thái *Nháp* hoặc đã công khai tài liệu nhưng *Chưa mở thi* |
| B. Công bố tài liệu | Thông báo trên website, Zalo/email nội bộ | Bật *Công khai — hiện trên trang tiện ích số* |
| C. Thi thử | Đoàn viên ôn, làm quen giao diện, xem đáp án sau khi nộp | Điền *Mở / Khóa thi thử*, *Số lần thi thử* (gợi ý 3–5 lần) |
| D. Thi chính thức | Khóa thi thử (hoặc để hết hạn). Bật *Đang mở thi*, điền giờ mở–khóa chính thức | Chỉ lượt `OFFICIAL` mới tính điểm |
| E. Khóa sổ | Đến giờ khóa hoặc tắt *Đang mở thi* | Không bắt đầu lượt chính thức mới |
| F. Tổng hợp — công bố | Xem *Kết quả*: xếp hạng cá nhân, điểm đơn vị; xuất CSV | Công bố danh sách theo quyết định Ban chấp hành |

Nên **khóa thi thử trước khi mở thi chính thức** để tránh nhầm lẫn. Nếu hai cửa sổ chồng nhau, đoàn viên vẫn chọn đúng nút *Thi thử* hoặc *Thi chính thức*.

---

## 5. Hướng dẫn thực hiện trên website

Đường dẫn quản trị: `/legal-education-campaigns` (menu **Phổ biến pháp luật**).  
Đường dẫn công khai: `/tien-ich-so-cong-doan/pho-bien-phap-luat`.

### Bước 1. Tạo đợt phổ biến

1. Vào **Phổ biến pháp luật** → **Thêm đợt**.
2. Nhập tiêu đề, nhãn thời gian (ví dụ *Quý III năm 2026*), tóm tắt.
3. Cấu hình bài thi:
   - **Thời gian mỗi lượt (phút)** — tùy biến, ví dụ 20 hoặc 30.
   - **Số câu mỗi đề** — ví dụ 20 câu lấy từ ngân hàng 45 câu. Để trống nếu muốn dùng hết ngân hàng.
   - **Điểm đạt (%)** — ví dụ 70.
   - **Số lần thi chính thức** — thường 1.
   - **Hiện đáp án sau khi nộp** — *Không* với thi chính thức (thi thử vẫn hiện đáp án).
   - **Xáo câu hỏi** = Có; **Xáo lựa chọn** = Có.
   - **Trạng thái thi** = *Chưa mở thi* cho đến bước D.
   - **Mở / Khóa thi chính thức** — theo lịch Ban chấp hành.
   - **Mở / Khóa thi thử** và **Số lần thi thử**.
4. *Xuất bản tài liệu*: có thể công khai tài liệu trước, chưa mở thi.
5. Lưu. Hệ thống chuyển sang màn hình tài liệu.

### Bước 2. Đăng tài liệu ôn tập

Tại **Tài liệu** của đợt: thêm tóm tắt, file PDF (nếu có), bật xuất bản từng bài. Đoàn viên đọc không cần đăng nhập.

### Bước 3. Xây dựng ngân hàng câu hỏi

Tại **Câu hỏi**:

- Mỗi câu: nội dung + ít nhất 2 lựa chọn (mỗi lựa chọn một dòng) + chọn đáp án đúng.
- Nên nhập **nhiều hơn** số câu trên mỗi đề để việc lấy ngẫu nhiên có ý nghĩa (ví dụ ngân hàng 45, mỗi đề 20).
- Không công khai đáp án trên trang đoàn viên khi đang thi chính thức.

### Bước 4. Rà soát trước khi mở

- Làm một lượt thi thử bằng tài khoản thật trên trang công khai.
- Kiểm tra: số câu đúng bằng cấu hình; câu và đáp án đã xáo; đồng hồ đếm ngược; nộp hết giờ; kết quả thi thử **không** lên bảng xếp hạng chính thức.
- Xác nhận đoàn viên đã được **gắn tài khoản** với đúng công đoàn bộ phận (Danh bạ công đoàn viên). Nếu thiếu liên kết, người đó vẫn thi được nhưng đơn vị không được tính.

### Bước 5. Mở thi thử

1. Sửa đợt: điền giờ mở–khóa thi thử, số lần thi thử.
2. Công bố đường dẫn đợt. Đoàn viên bấm **Thi thử** (cần đăng nhập).
3. Theo dõi tab *Tất cả lượt thi* — cột *Thi thử*.

### Bước 6. Mở và khóa thi chính thức

1. Tắt hoặc để hết hạn thi thử (khuyến nghị).
2. Bật **Đang mở thi**, điền *Mở thi chính thức từ* và *Khóa thi chính thức*.
3. Thông báo giờ khóa rõ ràng. Đến giờ khóa, hệ thống từ chối lượt chính thức mới. Lượt đang làm vẫn được nộp trong thời lượng còn lại + 60 giây dự phòng.
4. Có thể khóa sớm bằng cách chuyển **Trạng thái thi** về *Chưa mở thi*.

### Bước 7. Tổng hợp — xuất số liệu

Vào **Kết quả** của đợt:

- **Xếp hạng cá nhân:** hạng, họ tên, công đoàn bộ phận, điểm, %, đạt/không đạt, giờ nộp. Chỉ lượt chính thức tốt nhất.
- **Công đoàn bộ phận:** số có tài khoản, số đã nộp, số đạt, tỷ lệ tham gia, điểm TB, tỷ lệ đạt, **điểm đơn vị**.
- **Tất cả lượt thi:** gồm thi thử và chính thức, phục vụ đối soát.
- **CSV cá nhân** / **CSV đơn vị** để lưu hồ sơ, báo cáo Ban chấp hành.

---

## 6. Hướng dẫn cho đoàn viên

1. Vào **Tiện ích số → Phổ biến pháp luật** → chọn đợt.
2. Đọc hết tài liệu tóm tắt / PDF trước khi thi.
3. Trong thời gian thi thử: **Thi thử** — được làm nhiều lần (theo cấu hình), xem đáp án sau khi nộp, **không** tính thành tích.
4. Trong thời gian thi chính thức: **Thi chính thức** — đề được lấy ngẫu nhiên, đã trộn câu và đáp án; làm trong thời gian quy định; hết giờ hệ thống tự nộp.
5. Đăng nhập đúng tài khoản đã gắn với hồ sơ công đoàn viên để kết quả vào đúng bộ phận.

---

## 7. Checklist trước giờ mở thi chính thức

- [ ] Tài liệu đã xuất bản, đường dẫn kiểm tra được trên máy người khác.
- [ ] Ngân hàng đủ câu; số câu mỗi đề ≤ số câu ngân hàng.
- [ ] Xáo câu hỏi = Có; xáo lựa chọn = Có.
- [ ] Thời lượng, điểm đạt, số lần thi chính thức đã chốt.
- [ ] Cửa sổ thi thử đã khóa hoặc đã hết hạn (nếu Ban chấp hành yêu cầu).
- [ ] Cửa sổ thi chính thức đúng lịch; trạng thái *Đang mở thi*.
- [ ] Đoàn viên trọng điểm đã gắn tài khoản và đúng công đoàn bộ phận.
- [ ] Đã chạy thử 1 lượt thi thử và 1 lượt chính thức (tài khoản kiểm tra), rồi xóa đợt thử hoặc chấp nhận lượt kiểm tra trên CSV.

---

## 8. Xử lý sự cố thường gặp

| Tình huống | Cách xử lý |
|---|---|
| “Bài thi này chưa mở hoặc đã kết thúc” | Kiểm tra *Đang mở thi* và giờ mở–khóa; đồng hồ máy chủ. |
| “Chưa đến hoặc đã hết thời gian thi thử” | Ngoài cửa sổ thi thử; dùng đúng nút *Thi thử*. |
| “Đã hết số lần thi” | Hết `maxAttempts` (chính thức) hoặc `practiceMaxAttempts` (thi thử). Không xóa lượt để “cho thi lại” trừ khi Ban chấp hành quyết định tạo đợt mới. |
| Người thi không hiện ở bảng đơn vị | Hồ sơ chưa gắn `userId` hoặc chưa gán công đoàn bộ phận. Gắn xong, mở lại *Kết quả* — không cần thi lại. |
| Hai người cùng đề / cùng thứ tự đáp án | Không xảy ra nếu đã bật xáo; mỗi lượt lưu `questionOrderJson` và `optionOrderJson` riêng. |
| Sửa / xóa câu hỏi khi đã có người thi | Tránh xóa câu đã dùng. Sửa nội dung có thể làm lệch bài đã nộp. Nên chốt ngân hàng trước giờ mở chính thức. |

---

## 9. Lưu hồ sơ

Sau khi khóa sổ, xuất và lưu:

- CSV cá nhân (mọi lượt, có cột Loại = Thi thử / Chính thức, bộ phận, %).
- CSV đơn vị (hạng, tham gia, điểm TB, tỷ lệ đạt, điểm đơn vị).
- Ảnh chụp hoặc in bảng xếp hạng nếu cần công bố.

Không công bố đáp án ngân hàng trên kênh rộng nếu còn dùng lại cho đợt sau.
