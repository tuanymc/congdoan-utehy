import type { SystemRoleCode } from "./common";

export interface RoleDto {
  id: string;
  code: SystemRoleCode;
  name: string;
  description?: string | null;
}

export interface PermissionDto {
  id: string;
  /** Định dạng "module:action", vd "post:create", "member:approve". */
  key: string;
  module: string;
  action: string;
  description?: string | null;
}

export interface UserListItemDto {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: RoleDto[];
  createdAt: string;
}

export interface UserDetailDto extends UserListItemDto {
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  fullName?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export interface AuditLogDto {
  id: string;
  actorUserId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { before: unknown; after: unknown }> | null;
  createdAt: string;
}
