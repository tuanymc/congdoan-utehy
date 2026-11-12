import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** JWT không bắt buộc — có token hợp lệ thì gắn request.user, không có / sai thì vẫn cho qua (user = null).
 * Dùng cho GET danh bạ công khai: khách xem không SĐT/email, người đã đăng nhập thì thấy. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      return true;
    }
    return true;
  }

  override handleRequest<TUser>(_err: unknown, user: TUser): TUser | null {
    return user ?? null;
  }
}
