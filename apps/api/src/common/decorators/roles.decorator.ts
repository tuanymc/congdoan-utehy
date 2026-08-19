import { SetMetadata } from "@nestjs/common";
import type { SystemRoleCode } from "@congdoan/types";

export const ROLES_KEY = "roles";
/** Gắn lên controller/handler: @Roles("ADMIN", "UNION_CLERK"). Rỗng = chỉ cần đăng nhập. */
export const Roles = (...roles: SystemRoleCode[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = "permissions";
/** Gắn lên handler theo permission key cụ thể: @RequirePermissions("post:create"). */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
