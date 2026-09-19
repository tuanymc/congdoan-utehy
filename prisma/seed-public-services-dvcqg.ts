/**
 * Cập nhật chuyên mục Dịch vụ công từ dữ liệu Cổng DVC Quốc gia (dichvucong.gov.vn).
 * An toàn chạy lại: upsert theo slug (thủ tục) và theo url (liên kết).
 *
 *   pnpm seed:public-services
 *
 * Khác prisma/seed.ts: script này GHI ĐÈ nội dung hướng dẫn + bật isActive=true
 * để trang /tien-ich-so-cong-doan/dich-vu-cong hiện đủ thủ tục (seed.ts chỉ create nháp).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  PUBLIC_SERVICE_LINK_SEED,
  PUBLIC_SERVICE_PROCEDURE_SEED,
  toProcedureRecord
} from "./public-service-dvcqg-data";

const prisma = new PrismaClient();

const NOTICE_TITLE = "Hướng dẫn dịch vụ công đã cập nhật theo Cổng DVC Quốc gia";

async function main() {
  console.log("Upsert thủ tục dịch vụ công (nguồn dichvucong.gov.vn)...");
  for (const item of PUBLIC_SERVICE_PROCEDURE_SEED) {
    const data = toProcedureRecord(item, true);
    await prisma.publicServiceProcedure.upsert({
      where: { slug: data.slug },
      create: data,
      update: {
        title: data.title,
        category: data.category,
        summary: data.summary,
        conditions: data.conditions,
        requiredDocuments: data.requiredDocuments,
        whereToApply: data.whereToApply,
        steps: data.steps,
        fee: data.fee,
        processingTime: data.processingTime,
        resultDelivery: data.resultDelivery,
        commonMistakes: data.commonMistakes,
        sortOrder: data.sortOrder,
        isActive: true
      }
    });
    console.log(`  ✓ ${item.slug} (${item.officialCode})`);
  }

  console.log("Upsert kho liên kết cổng chính thống...");
  for (const link of PUBLIC_SERVICE_LINK_SEED) {
    const existing = await prisma.publicServiceLink.findFirst({ where: { url: link.url } });
    if (existing) {
      await prisma.publicServiceLink.update({
        where: { id: existing.id },
        data: {
          title: link.title,
          description: link.description,
          group: link.group,
          sortOrder: link.sortOrder,
          isActive: true
        }
      });
    } else {
      await prisma.publicServiceLink.create({ data: { ...link, isActive: true } });
    }
    console.log(`  ✓ ${link.url}`);
  }

  const noticeExists = await prisma.publicServiceNotice.findFirst({ where: { title: NOTICE_TITLE } });
  if (!noticeExists) {
    await prisma.publicServiceNotice.create({
      data: {
        title: NOTICE_TITLE,
        content:
          "Công đoàn đã rà soát và đăng hướng dẫn các thủ tục thường gặp (căn cước, cư trú, khai sinh liên thông, BHXH/BHYT, thuế TNCN, lý lịch tư pháp, GPLX, đăng ký xe, VNeID, miễn giảm học phí) theo thông tin công bố trên Cổng Dịch vụ công Quốc gia (https://dichvucong.gov.vn) và Cổng DVC tỉnh Hưng Yên. Nộp hồ sơ trực tuyến bằng tài khoản VNeID mức 2. Mức phí/thời hạn có thể thay đổi — luôn đối chiếu lại trên cổng chính thống trước khi nộp. Vướng bước nào, dùng «Công đoàn hỗ trợ tôi».",
        category: "NEW_SERVICE",
        isPinned: true,
        isActive: true
      }
    });
    console.log("  ✓ thông báo cập nhật DVCQG");
  }

  console.log("Xong. Kiểm tra /tien-ich-so-cong-doan/dich-vu-cong và /admin/public-service-procedures");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
