import { IsNotEmpty, IsString } from 'class-validator';
import { IsKuEmail } from './fields';

export class LoginDto {
  @IsKuEmail()
  email: string;

  @IsString({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  password: string;
}