import type { SystemRoleCode } from "./common";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Số giây tới khi accessToken hết hạn, để FE tự lên lịch refresh. */
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: SystemRoleCode[];
}

export interface LoginResponse extends TokenPair {
  user: AuthUser;
}

/** Payload giải mã từ access token JWT — dùng ở cả backend (guard) và frontend (đọc thông tin hiển thị). */
export interface JwtAccessPayload {
  sub: string; // userId
  email: string;
  roles: SystemRoleCode[];
  /** Danh sách permission key ("post:create"...) đã gộp từ tất cả role của user, tính sẵn lúc đăng nhập
   *  để guard kiểm tra không cần truy vấn CSDL mỗi request. Token ngắn hạn (15 phút) nên chấp nhận
   *  việc quyền có thể "cũ" tối đa bằng thời gian sống của access token. */
  permissions: string[];
  iat: number;
  exp: number;
}
