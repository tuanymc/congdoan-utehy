import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Gửi email thông báo (tạo tài khoản công đoàn viên...). Không cấu hình SMTP_HOST thì mọi lần gửi
 * trả về false — caller tự hiện mật khẩu trên màn hình quản trị để admin gửi thủ công.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST")?.trim();
    const port = Number(this.config.get<string>("SMTP_PORT") ?? 587);
    const user = this.config.get<string>("SMTP_USER")?.trim();
    const pass = this.config.get<string>("SMTP_PASSWORD") ?? "";
    const secure = this.config.get<string>("SMTP_SECURE") === "true" || port === 465;
    this.fromAddress =
      this.config.get<string>("SMTP_FROM")?.trim() || user || "noreply@utehy.edu.vn";

    if (!host) {
      this.transporter = null;
      this.logger.warn("SMTP_HOST chưa cấu hình — hệ thống sẽ không gửi được email mật khẩu.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, text });
      return true;
    } catch (error) {
      this.logger.warn(
        `Không gửi được email tới ${to}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}
