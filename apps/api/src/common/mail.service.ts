import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sendSmtpMail } from "./smtp-send";

/**
 * Gửi email thông báo (tạo tài khoản công đoàn viên...). Cùng SMTP Gmail với web cũ
 * (QLEmail.aspx.cs: smtp.gmail.com:587 + STARTTLS). Thiếu SMTP_USER/SMTP_PASSWORD thì không gửi —
 * caller hiện mật khẩu trên màn hình quản trị để admin gửi thủ công.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly host: string;
  private readonly port: number;
  private readonly secure: boolean;
  private readonly user: string;
  private readonly password: string;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.host = this.config.get<string>("SMTP_HOST")?.trim() || "smtp.gmail.com";
    this.port = Number(this.config.get<string>("SMTP_PORT") ?? 587);
    this.secure = this.config.get<string>("SMTP_SECURE") === "true" || this.port === 465;
    this.user = this.config.get<string>("SMTP_USER")?.trim() || "";
    this.password = this.config.get<string>("SMTP_PASSWORD") ?? "";
    this.fromAddress =
      this.config.get<string>("SMTP_FROM")?.trim() || this.user || "congdoanutehy@gmail.com";

    if (!this.isConfigured()) {
      this.logger.warn("SMTP_USER/SMTP_PASSWORD chưa cấu hình — hệ thống sẽ không gửi được email mật khẩu.");
    }
  }

  isConfigured(): boolean {
    return Boolean(this.user && this.password);
  }

  async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      await sendSmtpMail({
        host: this.host,
        port: this.port,
        secure: this.secure,
        user: this.user,
        password: this.password,
        from: this.fromAddress,
        to,
        subject,
        text
      });
      return true;
    } catch (error) {
      this.logger.warn(
        `Không gửi được email tới ${to}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}
