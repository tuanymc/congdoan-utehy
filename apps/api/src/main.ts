import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://congdoan.utehy.edu.vn",
  "https://congdoan.utehy.edu.vn",
  "http://congdoan.hyute.edu.vn",
  "https://congdoan.hyute.edu.vn"
];

function allowedCorsOrigins(): string[] {
  const extra = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_CORS_ORIGINS, ...extra])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Không ép HTTP → HTTPS: IIS có binding http://congdoan.hyute.edu.vn cùng site với
  // https://congdoan.utehy.edu.vn; upgrade-insecure-requests làm hỏng host chưa có chứng chỉ SSL.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: { "upgrade-insecure-requests": null }
      }
    })
  );

  const corsOrigins = allowedCorsOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Website Công đoàn HYUTE — API")
    .setDescription("API cho hệ thống Công đoàn HYUTE (public site, cổng đoàn viên, trang quản trị)")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Chú ý: KHÔNG đặt "api/docs" — mọi route khác trong app này đều không có tiền tố "api/" (health,
  // auth, posts...), vì tiền tố "/api" được thêm ở tầng IIS reverse-proxy khi mount app này làm
  // sub-application "/api" của site chính (xem deploy/iis/web.config.api). IIS đã tự bóc "/api" khỏi
  // URL trước khi chuyển tiếp vào đây, nên phải khai "docs" (không tiền tố) để khớp — request thật
  // của trình duyệt vẫn là https://<domain>/api/docs như bình thường.
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API đang chạy tại http://localhost:${port} (Swagger: /docs, hoặc /api/docs qua IIS)`);
}

bootstrap();
