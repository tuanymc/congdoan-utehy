# Prompt cho Cursor — Xây dựng lại Website Công đoàn UTEHY

## Cách dùng file này

Dán toàn bộ nội dung bên dưới vào Cursor (Chat hoặc Composer/Agent mode) ngay tại thư mục gốc của một repo Git trống. Yêu cầu Cursor thực hiện **tuần tự từng PHASE ở mục 7**, sau mỗi phase dừng lại, tự chạy build/lint/test, báo cáo theo mẫu ở mục 10, và **chờ xác nhận trước khi sang phase tiếp theo** — không tự ý làm nhảy cóc nhiều phase trong một lượt.

Nếu Cursor được cấp quyền đọc thư mục dự án cũ (`CongDoan.utehy.edu.vn` — chứa solution ASP.NET Web Forms `CongDoan.sln`), hãy trỏ nó vào đó ở Phase 0 để đối chiếu nghiệp vụ gốc; nếu không có, dùng đúng danh sách chức năng liệt kê trong prompt này làm nguồn duy nhất.

---

## 0. Vai trò và nguyên tắc làm việc

Bạn là kỹ sư phần mềm full-stack cấp senior, xây dựng lại **Website Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên** từ một hệ thống ASP.NET Web Forms cũ sang kiến trúc hiện đại. Tuân thủ nghiêm ngặt các nguyên tắc sau trong suốt dự án:

- Không bỏ sót bất kỳ chức năng nào trong danh sách "Chức năng kế thừa bắt buộc" ở mục 5.1. Nếu nghi ngờ một chức năng chưa rõ nghiệp vụ, dừng lại và hỏi thay vì tự suy đoán.
- Không đổi loại cơ sở dữ liệu — bắt buộc dùng **SQL Server**. Không tự ý chuyển sang PostgreSQL/MySQL dù có lý do "dễ dùng hơn".
- Không hardcode secrets (chuỗi kết nối, khoá API) vào mã nguồn hay commit — luôn dùng biến môi trường (`.env`, có `.env.example` mẫu).
- Viết commit nhỏ, rõ ràng, theo Conventional Commits (`feat:`, `fix:`, `chore:`...).
- Mỗi module nghiệp vụ khi hoàn thành phải có: API có kiểm thử (unit/integration), kiểm tra kiểu dữ liệu chặt (TypeScript strict mode), và tài liệu API (Swagger/OpenAPI tự sinh).
- Giao diện: tiếng Việt là ngôn ngữ hiển thị chính; mã nguồn, tên biến, comment viết bằng tiếng Anh.
- Nếu một quyết định kiến trúc quan trọng chưa có trong prompt này (ví dụ chọn thư viện gửi email, chọn nhà cung cấp lưu trữ file), hãy đề xuất 2 phương án kèm ưu/nhược điểm rồi hỏi, không tự chọn âm thầm.

---

## 1. Bối cảnh dự án

Hệ thống hiện tại là website Công đoàn trường chạy trên ASP.NET Web Forms (.NET Framework 4.8), kiến trúc 3 lớp cổ điển (MyWeb / MyWeb.Business / MyWeb.Data), cơ sở dữ liệu SQL Server (`CMS_CongDoan`). Hệ thống hoạt động ổn định nhưng công nghệ đã lạc hậu, khó bảo trì, giao diện chưa hiện đại, thiếu các tiện ích số cho đoàn viên.

Mục tiêu: xây dựng lại toàn bộ hệ thống bằng **Node.js (backend) + React (frontend) + SQL Server (CSDL, giữ nguyên)**, kế thừa 100% nghiệp vụ hiện có, giao diện hiện đại/responsive, và bổ sung nhóm chức năng mới **"Tiện ích số Công đoàn"** hỗ trợ viên chức, người lao động (VCNLĐ) sử dụng Dịch vụ công Quốc gia, CNTT và AI.

Tài liệu gốc là "Bản thiết kế & Kế hoạch nâng cấp Website Công đoàn UTEHY" — prompt này là bản chuyển thể để Cursor thực thi trực tiếp.

---

## 2. Stack công nghệ bắt buộc

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Backend | Node.js 20 LTS + TypeScript + **NestJS** | Kiến trúc module hoá theo domain nghiệp vụ, dùng decorator, DI có sẵn, sinh Swagger tự động |
| ORM | **Prisma** | Kết nối SQL Server qua `sqlserver` provider, quản lý migration theo version |
| CSDL | **SQL Server** (giữ nguyên loại CSDL) | Có thể dùng SQL Server 2019+ bản mới trên môi trường dev/staging |
| Xác thực | JWT (access + refresh token), Passport.js, bcrypt/argon2 cho mật khẩu | RBAC theo policy, không dùng ASP.NET Membership cũ |
| Frontend công khai + Cổng đoàn viên | **React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix UI)** | Tái sử dụng design system đã có sẵn trong thư mục tham khảo `University Information Portal` (Vite + Radix + Tailwind + lucide-react + recharts) nếu được cung cấp trong repo |
| Frontend quản trị (admin) | **React + Refine** (https://refine.dev) làm khung admin, kết hợp component từ `shadcn/ui` để đồng bộ giao diện với phần công khai | Đã chốt dùng React cho toàn bộ 3 ứng dụng (public, cổng đoàn viên, admin) — không dùng Vue, xem lý do bên dưới |
| Realtime | Socket.IO | Thông báo công văn/biểu mẫu thời gian thực |
| Cache/Queue nhẹ | **Memurai** + BullMQ | Memurai là bản Redis-compatible chạy native trên Windows (cài như Windows Service) — dùng thay Redis vì Redis không có bản Windows chính thức. Session cache, hàng đợi gửi thông báo/email/SMS, xử lý AI bất đồng bộ |
| Soạn thảo nội dung | TipTap (React) | Thay CKEditor cũ |
| Lưu trữ file | Thư mục trên Windows Server (ổ đĩa riêng cho uploads) | Có kiểm tra loại file, quét virus (Windows Defender/ClamAV for Windows hoặc dịch vụ ngoài); có thể chuyển sang Object Storage sau nếu cần |
| Trợ lý ảo AI | Anthropic Claude API (khuyến nghị) hoặc API tương đương, có lớp RAG dựa trên tài liệu nội bộ | Xem chi tiết mục 5.2 |
| Triển khai / Process management | **IIS + PM2, không dùng Docker** | Xem chi tiết ở phần "Kiến trúc triển khai" ngay dưới đây |
| CI/CD | GitHub Actions với **self-hosted runner cài trực tiếp trên Windows Server** | Không build/deploy qua container; runner tự build và reload PM2/site IIS |
| Testing | Jest (backend), Vitest + React Testing Library (frontend), Playwright (E2E cho luồng quan trọng) | |
| Giám sát | Winston/Pino cho log tập trung (ghi ra file, PM2 log rotate), Sentry cho lỗi runtime | |

### Quyết định: admin dùng React + Refine (đã chốt, không dùng Vue)

Toàn bộ 3 ứng dụng (public site, cổng đoàn viên, admin) đều dùng React — admin dùng thêm khung Refine để tăng tốc dựng CRUD/bảng dữ liệu/phân quyền, coi đây là "dùng framework có sẵn" nhưng không phải trả giá bằng việc chia đôi codebase, chia đôi kiểu dữ liệu dùng chung (DTO/type giữa FE-BE), chia đôi CI/CD và kỹ năng cần có ở đội bảo trì. Cursor không được tự ý đề xuất chuyển `apps/admin` sang Vue hay framework khác.

### Kiến trúc triển khai: Windows Server + IIS + PM2 (đã chốt, không dùng Docker)

Hệ thống được deploy trực tiếp lên Windows Server đang có sẵn, theo đúng năng lực vận hành hiện tại của đội CNTT (IIS quen thuộc, PM2 quản lý tiến trình Node.js). Đây là quyết định đã chốt — Cursor **không được** tự ý đưa Docker/docker-compose vào bất kỳ phase nào, kể cả "chỉ cho local dev".

- **IIS**: đóng vai trò reverse proxy/HTTPS termination phía trước tiến trình Node.js, dùng module **Application Request Routing (ARR) + URL Rewrite**. Cấu hình 3 site (hoặc 3 path/binding) trỏ tới: `apps/api` (proxy `/api/*` sang cổng nội bộ NestJS, ví dụ `127.0.0.1:3000`), `apps/web` (serve file tĩnh build ra từ Vite, hoặc proxy nếu dùng SSR), `apps/admin` (tương tự, thường tách subdomain/subpath riêng, ví dụ `admin.congdoan.utehy.edu.vn`).
- **PM2**: quản lý tiến trình `apps/api` (và `apps/web`/`apps/admin` nếu có phần SSR chạy Node) bằng file `ecosystem.config.js` — tự khởi động lại khi crash, chạy cluster mode theo số CPU nếu cần, ghi log ra file. Dùng `pm2-windows-startup` (hoặc NSSM) để PM2 tự khởi động cùng Windows Server khi reboot.
- **Memurai**: cài như Windows Service riêng, kết nối qua biến môi trường `REDIS_URL` giống hệt cấu hình client Redis chuẩn (Memurai tương thích giao thức Redis).
- **SQL Server**: chạy native trên Windows Server như hiện tại (không đổi).
- **CI/CD**: cài **self-hosted GitHub Actions runner** trực tiếp trên Windows Server (hoặc một máy Windows khác có quyền truy cập server đó). Workflow: checkout → cài dependency → build từng app (`apps/api`, `apps/web`, `apps/admin`) → chạy test/lint → copy thư mục build vào đúng path IIS đang trỏ tới → chạy `pm2 reload ecosystem.config.js --update-env` để áp dụng bản mới cho API mà không downtime. Không có bước build/push Docker image ở bất kỳ đâu trong workflow.
- **Local dev của lập trình viên**: cài native trên máy dev, khớp với production — SQL Server Express + Memurai cài trực tiếp (không qua Docker), để tránh lỗi kiểu "chạy được ở dev nhưng lỗi trên IIS thật".
- **Cấu trúc thư mục trên server** (gợi ý): `C:\inetpub\congdoan\api\`, `C:\inetpub\congdoan\web\`, `C:\inetpub\congdoan\admin\`, mỗi thư mục là bản build mới nhất được CI copy vào; file `.env` đặt ngoài thư mục build (không bị ghi đè mỗi lần deploy).

---

## 3. Cấu trúc monorepo đề xuất

```
congdoan-utehy/
  apps/
    api/            # NestJS backend (REST + WebSocket)
    web/             # React — cổng công khai + cổng đoàn viên
    admin/           # React + Refine — trang quản trị
  packages/
    ui/              # Design system dùng chung (component shadcn/ui tuỳ biến theo nhận diện Công đoàn)
    types/           # DTO / type dùng chung giữa FE và BE (sinh từ OpenAPI hoặc Prisma)
    config/          # eslint/tsconfig/tailwind config dùng chung
  prisma/
    schema.prisma
    migrations/
  deploy/
    ecosystem.config.js     # cấu hình PM2 cho apps/api (và SSR nếu có)
    iis/
      web.config.api        # mẫu web.config cho site API (ARR/URL Rewrite)
      web.config.web
      web.config.admin
    scripts/
      deploy.ps1             # script PowerShell: copy build + pm2 reload, chạy bởi self-hosted runner
  .github/workflows/ # CI/CD — self-hosted runner trên Windows Server, KHÔNG build/push Docker image
```

Dùng pnpm workspaces hoặc Turborepo để quản lý monorepo (Cursor tự chọn, ưu tiên pnpm + Turborepo vì nhẹ và nhanh).

---

## 4. Mô hình dữ liệu (5 domain chính)

Thiết kế schema Prisma theo 5 domain, đặt tên bảng/trường chuẩn hoá (bỏ tiền tố `tbl` cũ):

1. **Membership (Đoàn viên)**: `Member` (hồ sơ đoàn viên), `Leader` (lãnh đạo công đoàn), `Position` (chức vụ), `Term` (nhiệm kỳ), `Department` (bộ phận công đoàn), `ManagementUnit` (đơn vị quản lý), `EducationLevel` (trình độ học vấn).
2. **Content (Nội dung)**: `Post` (bài viết — gộp thay cho 12 bảng NewsXxx cũ) với trường `categoryId`, `Category` (chuyên mục, dữ liệu-hoá thay vì tạo trang riêng từng chuyên mục), `Document` (văn bản), `Announcement` (thông báo), `Slide` (banner), `Attachment` (tệp đính kèm dùng chung).
3. **OfficialDocument (Công văn)**: `IncomingDocument`, `OutgoingDocument`, `DocumentWorkflowStep` (luồng xử lý), `Attachment`.
4. **DigitalUtility (Tiện ích số)**: `EForm` (biểu mẫu điện tử), `EFormSubmission` (đơn đã nộp + trạng thái duyệt), `UnionFeeLedger` (ví đoàn phí — lịch sử đóng/nhận hỗ trợ), `SupportBooking` (đặt lịch hỗ trợ DVC quốc gia), `ChatbotConversation` + `ChatbotMessage` (lịch sử hội thoại AI), `SurveyForm` + `SurveyResponse` (khảo sát), `Event` + `EventRegistration` (lịch công tác/đăng ký hoạt động).
5. **System (Hệ thống)**: `User`, `Role`, `Permission`, `AuditLog`, `Menu`, `SystemConfig`, `Notification` (đa kênh).

Yêu cầu: viết migration Prisma rõ ràng, có seed data mẫu (vài chuyên mục, vài đoàn viên mẫu, tài khoản admin mặc định) để dev/test.

---

## 5. Danh sách module chức năng cần build

### 5.1. Chức năng kế thừa bắt buộc (từ hệ thống cũ)

- Trang chủ, giới thiệu công đoàn, giới thiệu đoàn viên, tổ chức bộ máy công đoàn (sơ đồ trực quan).
- Hệ thống tin tức theo chuyên mục (data-driven, một bảng `Post`/`Category` thay vì nhiều trang cứng): tin chung, chính sách pháp luật, chế độ – thi đua khen thưởng, hoạt động công đoàn bộ phận, hoạt động giao lưu, hoạt động ủng hộ – hỗ trợ, ủy ban kiểm tra, ban chuyên môn, câu lạc bộ, thông tin giáo dục, số liệu thống kê, khác.
- Văn bản, thông báo (danh sách + chi tiết + đính kèm).
- Công văn đến / công văn đi (danh sách, chi tiết, đính kèm, phân loại) — nâng cấp thành luồng xử lý (workflow) nhiều bước, có trạng thái theo thời gian thực.
- Quản lý đoàn viên: hồ sơ đầy đủ, danh mục dùng chung (chức vụ, nhiệm kỳ, trình độ học vấn, bộ phận, đơn vị quản lý), lãnh đạo công đoàn theo nhiệm kỳ.
- Thống kê công đoàn: dashboard biểu đồ (theo bộ phận/giới tính/trình độ...) + xuất Excel/PDF.
- Tuyển dụng, FAQ, liên hệ (kèm bản đồ).
- Quản trị: đăng nhập, đổi mật khẩu, quản lý người dùng, quản lý menu, cấu hình hệ thống, quản lý slide/banner.

> Không đưa vào hệ thống mới: các module Bất động sản, Thương mại, Xây dựng — là tàn dư template CMS gốc, không thuộc nghiệp vụ công đoàn. Nếu trong quá trình khảo sát dữ liệu thực tế phát hiện các bảng này đang được dùng cho mục đích khác, dừng lại và hỏi trước khi bỏ.

### 5.2. Tiện ích số Công đoàn (module mới, trọng tâm)

- **Hỗ trợ Dịch vụ công Quốc gia**: kho hướng dẫn từng bước (kèm ảnh/video) cho các thủ tục phổ biến (BHXH điện tử, VNeID, lý lịch tư pháp, thường trú/tạm trú...), liên kết nhanh tới cổng dịch vụ công chính thức, đặt lịch hỗ trợ trực tiếp 1-1 với cán bộ công đoàn. **Không** xây dựng kết nối API trực tiếp tới Cổng DVC Quốc gia/VNeID ở giai đoạn này (yêu cầu cấp phép nhà nước, ngoài phạm vi) — chỉ liên kết và hướng dẫn.
- **Trợ lý ảo AI Công đoàn (Chatbot)**: dùng Anthropic Claude API (hoặc tương đương), có lớp RAG truy xuất từ kho văn bản/công văn/chính sách nội bộ đã số hoá (bảng `Document`, `Post`). Giới hạn phạm vi trả lời, luôn hiển thị cảnh báo "mang tính tham khảo", có nút chuyển tiếp câu hỏi cho cán bộ công đoàn phụ trách khi không đủ tin cậy. Lưu lịch sử hội thoại (`ChatbotConversation`) để cải thiện dần.
- **Biểu mẫu điện tử & luồng duyệt**: form builder đơn giản hoặc form cấu hình sẵn (đơn xin nghỉ, đề nghị hỗ trợ khó khăn/hiếu hỉ, đăng ký khen thưởng, đăng ký hoạt động phong trào), gửi duyệt nhiều cấp, theo dõi trạng thái realtime (Socket.IO), lưu lịch sử.
- **Ví đoàn phí điện tử**: xem lịch sử đóng đoàn phí, khoản hỗ trợ đã nhận, đăng ký đề nghị hỗ trợ, theo dõi trạng thái duyệt.
- **Thông báo đa kênh**: Web Push, email, SMS (giữ tích hợp nhà cung cấp SMS hiện có — cần hỏi lại thông tin nhà cung cấp cụ thể), Zalo OA (tích hợp Zalo Notification Service).
- **Lịch công tác & khảo sát trực tuyến**: lịch sự kiện dùng chung, đăng ký tham gia hoạt động, form khảo sát/bình chọn có tổng hợp kết quả tự động.
- **Thư viện số Công đoàn**: kho văn bản pháp luật/biểu mẫu/tài liệu tập huấn/video, tìm kiếm toàn văn (dùng full-text search của SQL Server hoặc tích hợp Meilisearch/Elasticsearch nếu cần tìm kiếm mạnh hơn).
- **Danh bạ số & bản đồ tổ chức**: sơ đồ tổ chức trực quan, danh bạ cán bộ công đoàn.
- **PWA**: đóng gói `apps/web` (cổng đoàn viên) thành Progressive Web App — cài được trên điện thoại, nhận push notification, cache một phần nội dung để dùng offline.

---

## 6. Yêu cầu phi chức năng

- **Bảo mật**: JWT + refresh token, RBAC chi tiết theo module/thao tác (xem/thêm/sửa/xoá/duyệt) cho 4 nhóm vai trò (Quản trị hệ thống, Văn thư công đoàn, Cán bộ công đoàn bộ phận, Đoàn viên), audit log cho mọi thay đổi dữ liệu quan trọng, chống CSRF/XSS/SQL Injection (Prisma tham số hoá sẵn), rate limiting API, HTTPS bắt buộc.
- **Bảo vệ dữ liệu cá nhân**: tuân thủ Nghị định 13/2023/NĐ-CP — có trang chính sách bảo mật, cơ chế đồng ý xử lý dữ liệu khi đoàn viên đăng ký tài khoản.
- **Hiệu năng**: code-splitting theo route, lazy-load ảnh, cache API phù hợp (Memurai), mục tiêu Lighthouse Performance ≥ 85 cho trang công khai.
- **Responsive & Accessibility**: mobile-first, kiểm tra trên các breakpoint chính, tuân thủ WCAG AA cơ bản (contrast màu, alt text, điều hướng bàn phím).
- **SEO**: các trang tin tức/công khai cần render được nội dung cho search engine — cân nhắc dùng Next.js (SSR/SSG) thay Vite thuần cho `apps/web` nếu ưu tiên SEO cao; nếu vẫn dùng Vite/CSR thuần, phải có kế hoạch pre-render hoặc SSR tối thiểu cho các trang tin tức.
- **Đa ngôn ngữ**: tiếng Việt là mặc định và bắt buộc, kiến trúc i18n sẵn sàng mở rộng tiếng Anh sau này nếu cần (không bắt buộc build ngay).
- **Sao lưu & khôi phục**: script backup SQL Server tự động định kỳ, tài liệu quy trình restore.

---

## 7. Kế hoạch build theo PHASE (thực hiện tuần tự, dừng sau mỗi phase để báo cáo)

**Phase 0 — Khởi tạo & thiết lập nền tảng**
Scaffold monorepo (pnpm + Turborepo), cấu hình `apps/api` (NestJS), `apps/web`, `apps/admin`, `packages/ui`, `packages/types`. Cấu hình ESLint/Prettier/TypeScript strict dùng chung. Hướng dẫn cài đặt native cho môi trường dev (SQL Server Express + Memurai cài trực tiếp trên máy, không qua Docker) trong README. Tạo khung `deploy/` (ecosystem.config.js cho PM2, mẫu web.config cho IIS, script PowerShell deploy) dù chưa dùng thật ở phase này. Kết nối Prisma tới SQL Server, tạo schema domain `System` (User/Role/Permission) trước tiên. Output: repo chạy được bằng `pnpm dev` (chạy trực tiếp bằng Node, không container), có trang "Hello" ở cả web và admin, API có endpoint health-check.

**Phase 1 — Xác thực & phân quyền**
Module Auth (đăng ký/đăng nhập/refresh token/đổi mật khẩu), RBAC middleware, seed 4 vai trò mặc định. Trang đăng nhập ở cả `web` và `admin` dùng chung component từ `packages/ui`. Output: đăng nhập được, phân quyền chặn đúng theo vai trò, có test cho luồng auth.

**Phase 2 — Domain Content & Membership (chức năng lõi)**
Xây CRUD đầy đủ cho `Post`/`Category`, `Document`, `Announcement`, `Slide`, và toàn bộ domain Membership (`Member`, `Leader`, `Position`, `Term`, `Department`, `ManagementUnit`, `EducationLevel`). Giao diện công khai hiển thị tin tức theo chuyên mục, trang tổ chức bộ máy, trang giới thiệu đoàn viên. Trang admin quản lý toàn bộ dữ liệu trên bằng Refine. Output: đối chiếu đầy đủ với danh sách mục 5.1 phần Content & Membership, có test.

**Phase 3 — Công văn & thống kê**
Domain `OfficialDocument` với luồng xử lý (workflow), trang thống kê đoàn viên (dashboard biểu đồ dùng recharts) + xuất Excel/PDF. Output: nộp/duyệt công văn hoạt động end-to-end, dashboard hiển thị đúng số liệu từ seed data.

**Phase 4 — Tiện ích số Công đoàn**
Triển khai lần lượt: biểu mẫu điện tử & luồng duyệt → ví đoàn phí → thông báo đa kênh (bắt đầu với Web Push + email, để SMS/Zalo OA ở dạng interface sẵn sàng tích hợp, cắm khoá API sau) → lịch công tác & khảo sát → thư viện số → danh bạ số → chatbot AI (RAG cơ bản trước, tinh chỉnh sau) → hỗ trợ Dịch vụ công Quốc gia (nội dung tĩnh + đặt lịch) → PWA. Mỗi tiểu mục coi là một sub-phase, báo cáo riêng.

**Phase 5 — Di trú dữ liệu & kiểm thử toàn diện**
Viết script ETL từ CSDL `CMS_CongDoan` cũ sang schema mới (nếu Cursor được cấp quyền truy cập CSDL cũ hoặc export mẫu), kèm đối chiếu số lượng bản ghi. Viết E2E test (Playwright) cho các luồng quan trọng: đăng nhập, đăng bài, nộp công văn, nộp biểu mẫu, chat với AI. Rà bảo mật cơ bản (OWASP Top 10 checklist thủ công).

**Phase 6 — Chuẩn bị go-live**
CI/CD hoàn chỉnh (GitHub Actions với self-hosted runner trên Windows Server: lint → test → build → copy vào path IIS → `pm2 reload` để deploy staging, không container hoá bất kỳ bước nào), tài liệu vận hành (README triển khai cụ thể cho IIS/PM2/Memurai, biến môi trường cần thiết, quy trình backup/restore SQL Server, cách xem log PM2), checklist bàn giao.

---

## 8. Quy ước code

- TypeScript `strict: true` toàn bộ monorepo, không dùng `any` trừ khi có comment giải thích lý do.
- Đặt tên: `PascalCase` cho component/class, `camelCase` cho biến/hàm, `kebab-case` cho tên file React component không bắt buộc nhưng nên nhất quán trong repo.
- Mọi API endpoint phải có DTO validate bằng `class-validator`, trả lỗi theo format chuẩn nhất quán (mã lỗi, message tiếng Việt cho người dùng cuối).
- Mọi bảng dữ liệu nhạy cảm (Member, EFormSubmission, UnionFeeLedger, ChatbotConversation) phải có audit log khi tạo/sửa/xoá.
- Component UI dùng chung đặt trong `packages/ui`, không copy-paste giữa `web` và `admin`.

---

## 9. Việc không được tự ý làm

- Không đổi SQL Server sang CSDL khác.
- Không đưa Docker/docker-compose vào bất kỳ phase nào (kể cả "chỉ cho local dev") — hệ thống triển khai native trên Windows Server bằng IIS + PM2 + Memurai, đây là quyết định đã chốt.
- Không xoá hẳn dữ liệu/module cũ (BĐS, Thương mại...) khỏi kế hoạch mà không có xác nhận — mặc định là "không đưa vào hệ thống mới" chứ không phải "xoá dữ liệu cũ".
- Không tự thêm tính năng ngoài phạm vi mục 5 mà không đề xuất trước.
- Không bỏ qua bước viết test để "làm nhanh hơn".
- Không tự động deploy lên production.

---

## 10. Định dạng báo cáo sau mỗi phase

Sau khi hoàn thành một phase, báo cáo theo mẫu:

```
### Phase X — <tên phase>
Đã làm: <danh sách gạch đầu dòng>
Kết quả kiểm thử: <lint/build/test pass hay fail, số lượng test>
Đối chiếu checklist mục 5: <đã hoàn thành bao nhiêu / còn thiếu gì>
Rủi ro/điểm cần quyết định: <nếu có>
Đề xuất phase tiếp theo: <có nên tiếp tục không>
```

Chỉ chuyển sang phase tiếp theo sau khi báo cáo trên được xác nhận.
