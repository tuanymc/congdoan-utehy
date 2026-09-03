import { SetMetadata } from "@nestjs/common";
import type { SystemRoleCode } from "@congdoan/types";

export const ROLES_KEY = "roles";
/** Gắn lên controller/handler: @Roles("ADMIN", "UNION_CLERK"). Rỗng = chỉ cần đăng nhập. */
export const Roles = (...roles: SystemRoleCode[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = "permissions";
/** Gắn lên handler theo permission key cụ thể: @RequirePermissions("post:create"). Mọi key đều bắt buộc. */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const ANY_PERMISSIONS_KEY = "any_permissions";
/** Gắn lên handler: đủ 1 trong các quyền là được — dùng cho endpoint dùng chung (vd upload ảnh). */
export const RequireAnyPermissions = (...permissions: string[]) => SetMetadata(ANY_PERMISSIONS_KEY, permissions);
