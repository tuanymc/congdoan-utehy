import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorBody } from "@congdoan/types";

/**
 * Chuẩn hoá mọi lỗi trả về theo ApiErrorBody (packages/types/src/common.ts) — message tiếng Việt
 * cho người dùng cuối, errorCode ổn định để FE xử lý logic riêng khi cần.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Đã có lỗi xảy ra, vui lòng thử lại sau.";
    let errorCode = "INTERNAL_ERROR";
    let details: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      errorCode = HttpStatus[status] ?? "HTTP_ERROR";
      if (typeof body === "string") {
        message = body;
      } else if (typeof body === "object" && body !== null) {
        const b = body as Record<string, unknown>;
        if (Array.isArray(b.message)) {
          message = "Dữ liệu gửi lên không hợp lệ.";
          details = { validation: b.message as string[] };
        } else if (typeof b.message === "string") {
          message = b.message;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    const body: ApiErrorBody = {
      statusCode: status,
      errorCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url
    };

    response.status(status).json(body);
  }
}
