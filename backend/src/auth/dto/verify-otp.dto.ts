import { Matches } from 'class-validator';
import { IsKuEmail } from './fields';

export class VerifyOtpDto {
  @IsKuEmail()
  email: string;

  @Matches(/^\d{6}$/, { message: 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก' })
  code: string;
}