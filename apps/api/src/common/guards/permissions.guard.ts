import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { JwtAccessPayload } from "@congdoan/types";
import { ANY_PERMISSIONS_KEY, PERMISSIONS_KEY } from "../decorators/roles.decorator";

/** Kiểm tra @RequirePermissions (AND) và @RequireAnyPermissions (OR) theo permission key trong JWT. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAll = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const requiredAny = this.reflector.getAllAndOverride<string[]>(ANY_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const hasAll = Boolean(requiredAll && requiredAll.length > 0);
    const hasAny = Boolean(requiredAny && requiredAny.length > 0);
    if (!hasAll && !hasAny) return true;

    const user = context.switchToHttp().getRequest().user as JwtAccessPayload | undefined;
    if (!user) return false;

    const permissions = user.permissions;
    const okAll = !hasAll || requiredAll!.every((p) => permissions.includes(p));
    const okAny = !hasAny || requiredAny!.some((p) => permissions.includes(p));
    if (!okAll || !okAny) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
    }
    return true;
  }
}
