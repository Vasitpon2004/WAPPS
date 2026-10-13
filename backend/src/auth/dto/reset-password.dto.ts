import { Matches } from 'class-validator';
import { IsPassword } from './fields';

export class ResetPasswordDto {
  @Matches(/^[0-9a-f]{64}$/, { message: 'ลิงก์ตั้งรหัสผ่านไม่ถูกต้อง' })
  token: string;

  @IsPassword()
  new_password: string;
}