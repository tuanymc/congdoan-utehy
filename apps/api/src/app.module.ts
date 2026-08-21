import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // giới hạn chung; auth.controller có thể siết thêm sau
    PrismaModule,
    HealthModule,
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
    PublicServicesModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
