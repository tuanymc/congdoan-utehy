import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ContentModule } from "./modules/content/content.module";
import { OfficialDocumentsModule } from "./modules/official-documents/official-documents.module";
import { UnionDirectoryModule } from "./modules/union-directory/union-directory.module";
import { UnionLeadershipModule } from "./modules/union-leadership/union-leadership.module";
import { HomeSlideModule } from "./modules/home-slide/home-slide.module";
import { ContactModule } from "./modules/contact/contact.module";
import { MenuItemModule } from "./modules/menu-item/menu-item.module";
import { SiteSettingsModule } from "./modules/site-settings/site-settings.module";
import { EventsModule } from "./modules/events/events.module";
import { AiToolsModule } from "./modules/ai-tools/ai-tools.module";
import { SurveysModule } from "./modules/surveys/surveys.module";
import { PublicServicesModule } from "./modules/public-services/public-services.module";
import { LegalEducationModule } from "./modules/legal-education/legal-education.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { clientIp } from "./common/utils/client-ip";

/** PM2 cwd = apps/api — nếu .env cạnh API thiếu DOCUMENT_FILES_DIR thì lấy thêm .env gốc repo. */
function configEnvFilePaths(): string[] {
  const cwdEnv = join(process.cwd(), ".env");
  const paths = [cwdEnv];
  const repoRootEnv = join(process.cwd(), "..", "..", ".env");
  if (existsSync(join(process.cwd(), "dist", "main.js")) && existsSync(repoRootEnv)) {
    paths.push(repoRootEnv);
  }
  return paths;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: configEnvFilePaths() }),
    // IIS ARR proxy mọi request vào 127.0.0.1:3000 — phải lấy IP từ X-Forwarded-For,
    // nếu không cả trường bị chung 100 req/phút và bài thi (tự lưu đáp án) bị 429.
    ThrottlerModule.forRoot({
      throttlers: [{ name: "default", ttl: 60_000, limit: 300 }],
      errorMessage: "Bạn đang thao tác quá nhanh. Vui lòng đợi giây lát rồi thử lại.",
      getTracker: (req) => clientIp(req)
    }),
    PrismaModule,
    HealthModule,
    DashboardModule,
    AuthModule,
    UsersModule,
    ContentModule,
    OfficialDocumentsModule,
    UnionDirectoryModule,
    UnionLeadershipModule,
    HomeSlideModule,
    ContactModule,
    MenuItemModule,
    SiteSettingsModule,
    EventsModule,
    AiToolsModule,
    SurveysModule,
    PublicServicesModule,
    LegalEducationModule,
    UploadsModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
