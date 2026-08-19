import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { JwtAccessPayload, SystemRoleCode } from "@congdoan/types";
import { ROLES_KEY } from "../decorators/roles.decorator";

/** Kiểm tra @Roles(...) — phải chạy SAU JwtAuthGuard (đã gắn request.user). Không có @Roles = chỉ cần đăng nhập. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as JwtAccessPayload | undefined;
    if (!user) return false;

    const ok = requiredRoles.some((r) => user.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
    }
    return true;
  }
}
