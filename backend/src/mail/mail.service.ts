import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly transporter: Transporter | null;

  constructor(config: ConfigService) {
    this.from = config.get<string>('MAIL_FROM') ?? '';
    const port = Number(config.get<string>('SMTP_PORT') || 587);
    const user = config.get<string>('SMTP_USER');

    this.transporter = this.from
      ? createTransport({
          host: config.get<string>('SMTP_HOST'),
          port,
          secure: port === 465,
          auth: user
            ? { user, pass: config.get<string>('SMTP_PASS') }
            : undefined,
        })
      : null;
  }

  sendOtp(to: string, code: string, minutes: number): Promise<boolean> {
    return this.send(to, 'รหัสยืนยันอีเมล ระบบนัดหมายการสอบ', [
      `รหัสยืนยันของคุณคือ ${code}`,
      `รหัสนี้ใช้ได้ ${minutes} นาที`,
      'ถ้าคุณไม่ได้สมัครสมาชิก ไม่ต้องทำอะไร',
    ]);
  }

  sendPasswordReset(
    to: string,
    link: string,
    minutes: number,
  ): Promise<boolean> {
    return this.send(to, 'ตั้งรหัสผ่านใหม่ ระบบนัดหมายการสอบ', [
      'กดลิงก์นี้เพื่อตั้งรหัสผ่านใหม่',
      link,
      `ลิงก์ใช้ได้ ${minutes} นาที และใช้ได้ครั้งเดียว`,
      'ถ้าคุณไม่ได้ขอตั้งรหัสผ่านใหม่ ไม่ต้องทำอะไร',
    ]);
  }

  private async send(
    to: string,
    subject: string,
    lines: string[],
  ): Promise<boolean> {
    const text = lines.join('\n');

    if (!this.transporter) {
      this.logger.log(`[อีเมลจำลอง] ถึง ${to} · ${subject}\n${text}`);
      return true;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
      return true;
    } catch (error) {
      this.logger.error(
        `ส่งอีเมลถึง ${to} ไม่สำเร็จ: ${(error as Error).message}`,
      );
      return false;
    }
  }
}