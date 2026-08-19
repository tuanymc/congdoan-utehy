import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { JwtAccessPayload } from "@congdoan/types";
import { PERMISSIONS_KEY } from "../decorators/roles.decorator";

/** Kiểm tra @RequirePermissions("post:create") theo danh sách permission key đã gộp sẵn trong JWT. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as JwtAccessPayload | undefined;
    if (!user) return false;

    const ok = required.every((p) => user.permissions.includes(p));
    if (!ok) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
    }
    return true;
  }
}
