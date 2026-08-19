import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Bảo vệ route bằng access token JWT (chiến lược "jwt" đăng ký ở auth/strategies/jwt.strategy.ts). */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
