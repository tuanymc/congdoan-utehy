import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcryptjs";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const password = "ChangeMe@123";
  let passwordHash: string;
  let prisma: any;
  let service: AuthService;

  beforeAll(async () => {
    passwordHash = await hash(password, 4);
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        findUniqueOrThrow: jest.fn()
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      }
    };
    service = new AuthService(prisma, new JwtService());
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  });

  it("từ chối đăng nhập khi email không tồn tại", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login("khong-ton-tai@utehy.edu.vn", password)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("từ chối đăng nhập khi sai mật khẩu", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "admin@congdoan.utehy.edu.vn",
      isActive: true,
      passwordHash,
      roles: []
    });
    await expect(service.login("admin@congdoan.utehy.edu.vn", "sai-mat-khau")).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("đăng nhập thành công trả về access token, refresh token và thông tin user", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "admin@congdoan.utehy.edu.vn",
      fullName: "Quản trị viên",
      isActive: true,
      passwordHash,
      roles: [
        {
          role: {
            code: "ADMIN",
            permissions: [{ permission: { key: "post:create" } }, { permission: { key: "post:view" } }]
          }
        }
      ]
    });

    const result = await service.login("admin@congdoan.utehy.edu.vn", password);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).toEqual({
      id: "u1",
      email: "admin@congdoan.utehy.edu.vn",
      fullName: "Quản trị viên",
      roles: ["ADMIN"]
    });
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  it("từ chối tài khoản đã bị khoá (isActive = false)", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "khoa@utehy.edu.vn",
      isActive: false,
      passwordHash,
      roles: []
    });
    await expect(service.login("khoa@utehy.edu.vn", password)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
