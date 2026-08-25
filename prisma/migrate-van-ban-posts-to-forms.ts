/**
 * Chuyển bài viết chuyên mục "van-ban" (đang hiện ở /tin-tuc?category=van-ban) sang OfficialDocument
 * loại "Biểu mẫu Công đoàn" để hiện ở /tien-ich-so-cong-doan/bieu-mau.
 *
 * Idempotent: legacyCode = "post:<postId>". Chạy lại không tạo trùng. Bài viết nguồn chuyển ARCHIVED
 * để không còn trên trang tin tức.
 *
 *   pnpm migrate:van-ban-forms
 *   MIGRATE_DRY_RUN=true pnpm migrate:van-ban-forms
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { basename } from "node:path";

const prisma = new PrismaClient();
const DRY_RUN = process.env.MIGRATE_DRY_RUN === "true";
const FORMS_TYPE_NAME = "Biểu mẫu Công đoàn";
const SOURCE_CATEGORY_SLUG = "van-ban";
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|wps|rtf)$/i;

function extractFileLinks(html: string): Array<{ fileName: string; path: string }> {
  const found = new Map<string, { fileName: string; path: string }>();
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const raw of hrefs) {
    let href = raw.replace(/&amp;/g, "&").trim();
    try {
      href = decodeURIComponent(href.replace(/\+/g, "%20"));
    } catch {
      // giữ nguyên nếu không decode được
    }
    const withoutOrigin = href.replace(/^https?:\/\/[^/]+/i, "");
    if (!FILE_EXT.test(withoutOrigin)) continue;
    const path = withoutOrigin.replace(/^[/\\]+/, "");
    if (!path || path.startsWith("..")) continue;
    const fileName = decodeURIComponent(basename(path.split("?")[0] ?? path)) || "file";
    if (!found.has(path)) found.set(path, { fileName, path });
  }
  return [...found.values()];
}

async function main(): Promise<void> {
  const category = await prisma.category.findFirst({ where: { slug: SOURCE_CATEGORY_SLUG } });
  if (!category) {
    console.log(`Không tìm thấy chuyên mục slug="${SOURCE_CATEGORY_SLUG}" — không có gì để chuyển.`);
    return;
  }

  let formsType = await prisma.documentType.findFirst({ where: { name: FORMS_TYPE_NAME } });
  if (!formsType) {
    if (DRY_RUN) {
      console.log(`[dry-run] Sẽ tạo DocumentType "${FORMS_TYPE_NAME}".`);
    } else {
      formsType = await prisma.documentType.create({
        data: {
          name: FORMS_TYPE_NAME,
          description: "Biểu mẫu, đơn từ dùng chung cho đoàn viên — hiển thị ở trang Kho biểu mẫu trong Tiện ích số."
        }
      });
    }
  }
  if (!formsType && !DRY_RUN) {
    throw new Error(`Không tạo được loại công văn "${FORMS_TYPE_NAME}".`);
  }

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id, status: { not: "ARCHIVED" } },
    orderBy: { publishedAt: "desc" }
  });
  console.log(`Tìm thấy ${posts.length} bài viết chuyên mục "${category.name}" (chưa lưu trữ).`);

  let created = 0;
  let skipped = 0;
  let archived = 0;

  for (const post of posts) {
    const legacyCode = `post:${post.id}`;
    const existing = await prisma.officialDocument.findFirst({ where: { legacyCode } });
    if (existing) {
      skipped += 1;
      if (!DRY_RUN && post.status !== "ARCHIVED") {
        await prisma.post.update({ where: { id: post.id }, data: { status: "ARCHIVED" } });
        archived += 1;
      }
      continue;
    }

    const links = extractFileLinks(post.content);
    console.log(
      `  ${DRY_RUN ? "[dry-run] " : ""}Chuyển "${post.title}" → biểu mẫu (${links.length} file đính kèm từ HTML)`
    );

    if (DRY_RUN) {
      created += 1;
      continue;
    }

    const doc = await prisma.officialDocument.create({
      data: {
        title: post.title,
        content: post.content,
        summary: post.excerpt,
        direction: "OUTGOING",
        status: "PUBLISHED",
        isPublic: true,
        documentTypeId: formsType!.id,
        issuedAt: post.publishedAt,
        createdAt: post.publishedAt ?? post.createdAt,
        legacyCode,
        attachments: {
          create: links.map((link) => ({
            fileName: link.fileName,
            path: link.path,
            uploadedAt: post.publishedAt
          }))
        }
      }
    });
    await prisma.post.update({ where: { id: post.id }, data: { status: "ARCHIVED" } });
    created += 1;
    archived += 1;
    void doc;
  }

  if (!DRY_RUN) {
    await prisma.category.update({
      where: { id: category.id },
      data: { showInMenu: false }
    });
  }

  console.log(
    `Xong. Tạo ${created} biểu mẫu, bỏ qua ${skipped} (đã chuyển trước đó), lưu trữ ${archived} bài viết nguồn.`
  );
  console.log("Trang kho biểu mẫu: /tien-ich-so-cong-doan/bieu-mau");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
