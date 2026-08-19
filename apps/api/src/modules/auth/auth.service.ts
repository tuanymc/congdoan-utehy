import { createHash, randomBytes } from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import type { AuthUser, JwtAccessPayload, LoginResponse, SystemRoleCode, TokenPair } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  private get accessSecret() {
    return process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret";
  }
  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? "dev-only-insecure-refresh-secret";
  }
  private get accessExpiresIn() {
    return process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
  }
  private get refreshExpiresIn() {
    return process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");
    }

    const passwordOk = await compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng.");
    }

    const roles = user.roles.map((ur) => ur.role.code as SystemRoleCode);
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)))
    ];

    const tokens = await this.issueTokenPair(user.id, user.email, roles, permissions);

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const authUser: AuthUser = { id: user.id, email: user.email, fullName: user.fullName, roles };
    return { ...tokens, user: authUser };
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    roles: SystemRoleCode[],
    permissions: string[]
  ): Promise<TokenPair> {
    const accessPayload: Omit<JwtAccessPayload, "iat" | "exp"> = { sub: userId, email, roles, permissions };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn
    });

    const refreshTokenRaw = randomBytes(48).toString("hex");
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti: refreshTokenRaw },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn }
    );

    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(decoded.exp * 1000)
      }
    });

    const decodedAccess = this.jwt.decode(accessToken) as { exp: number };
    return {
      accessToken,
      refreshToken,
      expiresIn: decodedAccess.exp - Math.floor(Date.now() / 1000)
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    }

    // Rotation: thu hồi refresh token cũ ngay khi dùng, tránh replay.
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Tài khoản không còn hoạt động.");
    }

    const roles = user.roles.map((ur) => ur.role.code as SystemRoleCode);
    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)))
    ];
    return this.issueTokenPair(user.id, user.email, roles, permissions);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ok = await compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Mật khẩu hiện tại không đúng.");
    }
    const passwordHash = await hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    // Đổi mật khẩu xong thì thu hồi toàn bộ refresh token cũ, buộc đăng nhập lại trên các thiết bị khác.
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async getAuthUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((ur) => ur.role.code as SystemRoleCode)
    };
  }
}
