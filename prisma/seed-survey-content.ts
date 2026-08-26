/**
 * Seed nội dung khảo sát đoàn viên (ẩn danh) — an toàn chạy lại.
 *
 * Cập nhật khảo sát đang mở trên production
 * (https://congdoan.utehy.edu.vn/tien-ich-so-cong-doan/khao-sat/1041ff78-2c9a-493a-83c3-00e8794372a8)
 * vốn là bản "test 1". Giữ nguyên id để URL công khai không đổi.
 *
 *   pnpm seed:survey
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/** Id khảo sát đang gắn trên website — không đổi để path /khao-sat/:id còn đúng. */
export const UNION_SATISFACTION_SURVEY_ID = "1041ff78-2c9a-493a-83c3-00e8794372a8";

const TITLE = "Khảo sát mức độ hài lòng của đoàn viên về hoạt động Công đoàn năm học 2025–2026";

const DESCRIPTION = [
  "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên trân trọng kính mời đoàn viên tham gia khảo sát.",
  "Kết quả giúp Ban Chấp hành nắm bắt nhu cầu, đánh giá hiệu quả hoạt động và điều chỉnh kế hoạch chăm lo, đại diện, bảo vệ quyền lợi người lao động trong năm học.",
  "Khảo sát hoàn toàn ẩn danh — không thu thập họ tên, mã cán bộ hay thông tin định danh. Thời gian hoàn thành khoảng 3–5 phút. Mọi ý kiến đều được ghi nhận và chỉ sử dụng cho mục đích cải thiện hoạt động Công đoàn."
].join("\n\n");

const LIKERT = [
  "Rất hài lòng",
  "Hài lòng",
  "Bình thường",
  "Không hài lòng",
  "Rất không hài lòng"
] as const;

const QUESTIONS: Array<{
  text: string;
  type: "SINGLE_CHOICE" | "TEXT";
  options?: string[];
  isRequired: boolean;
  sortOrder: number;
}> = [
  {
    text: "Đơn vị công tác của đồng chí thuộc nhóm nào?",
    type: "SINGLE_CHOICE",
    options: [
      "Khối khoa, bộ môn",
      "Khối phòng, ban chức năng",
      "Trung tâm, viện, đơn vị sự nghiệp",
      "Khác"
    ],
    isRequired: true,
    sortOrder: 10
  },
  {
    text: "Mức độ hài lòng đối với công tác tuyên truyền, phổ biến chế độ, chính sách cho đoàn viên.",
    type: "SINGLE_CHOICE",
    options: [...LIKERT],
    isRequired: true,
    sortOrder: 20
  },
  {
    text: "Mức độ hài lòng đối với hoạt động chăm lo đời sống, thăm hỏi và hỗ trợ đoàn viên khi gặp khó khăn.",
    type: "SINGLE_CHOICE",
    options: [...LIKERT],
    isRequired: true,
    sortOrder: 30
  },
  {
    text: "Mức độ hài lòng đối với các phong trào, hoạt động văn hóa — thể thao do Công đoàn tổ chức.",
    type: "SINGLE_CHOICE",
    options: [...LIKERT],
    isRequired: true,
    sortOrder: 40
  },
  {
    text: "Mức độ hài lòng đối với việc tiếp nhận, phản hồi và giải quyết kiến nghị của đoàn viên.",
    type: "SINGLE_CHOICE",
    options: [...LIKERT],
    isRequired: true,
    sortOrder: 50
  },
  {
    text: "Đồng chí thường theo dõi thông tin hoạt động Công đoàn qua kênh nào nhiều nhất?",
    type: "SINGLE_CHOICE",
    options: [
      "Website Công đoàn nhà trường",
      "Thông báo tại đơn vị, công đoàn bộ phận",
      "Email, Zalo hoặc nhóm nội bộ",
      "Hội nghị, họp đoàn viên",
      "Chưa thường xuyên theo dõi"
    ],
    isRequired: true,
    sortOrder: 60
  },
  {
    text: "Trong thời gian tới, đồng chí mong Công đoàn ưu tiên lĩnh vực nào?",
    type: "SINGLE_CHOICE",
    options: [
      "Chăm lo đời sống, phúc lợi đoàn viên",
      "Bồi dưỡng chuyên môn, nghiệp vụ",
      "Văn hóa, thể thao, gắn kết tập thể",
      "Đối thoại, bảo vệ quyền lợi người lao động",
      "Cải thiện môi trường và điều kiện làm việc"
    ],
    isRequired: true,
    sortOrder: 70
  },
  {
    text: "Ý kiến đóng góp, đề xuất khác (nếu có).",
    type: "TEXT",
    isRequired: false,
    sortOrder: 80
  }
];

export async function seedUnionSatisfactionSurvey(prisma: PrismaClient): Promise<string> {
  const existingById = await prisma.survey.findUnique({ where: { id: UNION_SATISFACTION_SURVEY_ID } });
  const existingByPlaceholder =
    existingById ??
    (await prisma.survey.findFirst({
      where: { OR: [{ title: "test 1" }, { title: TITLE }] }
    }));

  const survey =
    existingByPlaceholder ??
    (await prisma.survey.create({
      data: {
        id: UNION_SATISFACTION_SURVEY_ID,
        title: TITLE,
        description: DESCRIPTION,
        isOpen: true,
        isAnonymous: true,
        startAt: new Date("2026-08-01T00:00:00.000Z"),
        endAt: new Date("2026-12-31T10:00:00.000Z")
      }
    }));

  await prisma.survey.update({
    where: { id: survey.id },
    data: {
      title: TITLE,
      description: DESCRIPTION,
      isOpen: true,
      isAnonymous: true,
      startAt: new Date("2026-08-01T00:00:00.000Z"),
      endAt: new Date("2026-12-31T10:00:00.000Z")
    }
  });

  // Bản "test 1" chỉ để kiểm tra form — xoá câu hỏi/câu trả lời cũ rồi ghi bộ câu hỏi chính thức.
  await prisma.surveyQuestion.deleteMany({ where: { surveyId: survey.id } });
  await prisma.surveyResponse.deleteMany({ where: { surveyId: survey.id } });

  for (const question of QUESTIONS) {
    await prisma.surveyQuestion.create({
      data: {
        surveyId: survey.id,
        text: question.text,
        type: question.type,
        optionsJson: question.type === "SINGLE_CHOICE" ? JSON.stringify(question.options) : null,
        isRequired: question.isRequired,
        sortOrder: question.sortOrder
      }
    });
  }

  console.log(`Seeded survey ${survey.id} — ${QUESTIONS.length} questions.`);
  return survey.id;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedUnionSatisfactionSurvey(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").includes("seed-survey-content");
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
