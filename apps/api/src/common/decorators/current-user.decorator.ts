import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { JwtAccessPayload } from "@congdoan/types";

/** Lấy payload user hiện tại (đã qua JwtAuthGuard) trong controller: @CurrentUser() user: JwtAccessPayload */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtAccessPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
