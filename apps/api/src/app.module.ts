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
import { HomeSlideModule } from "./modules/home-slide/home-slide.module";
import { ContactModule } from "./modules/contact/contact.module";
import { MenuItemModule } from "./modules/menu-item/menu-item.module";

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
    HomeSlideModule,
    ContactModule,
    MenuItemModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
