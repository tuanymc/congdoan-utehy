import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/** Global module — mọi module khác inject PrismaService trực tiếp, không cần import lại. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
