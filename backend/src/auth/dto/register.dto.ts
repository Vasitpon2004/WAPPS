import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsKuEmail, IsPassword, Trim } from './fields';

export class RegisterDto {
  @IsKuEmail()
  email: string;

  @IsPassword()
  password: string;

  @Trim()
  @IsString({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @MaxLength(150, { message: 'ชื่อ-นามสกุลยาวเกิน 150 ตัวอักษร' })
  full_name: string;

  @IsIn(['student', 'professor'], {
    message: 'บทบาทต้องเป็น student หรือ professor',
  })
  role: 'student' | 'professor';

  @IsOptional()
  @Trim()
  @Matches(/^\d{10}$/, { message: 'รหัสนิสิตต้องเป็นตัวเลข 10 หลัก' })
  student_code?: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'รหัสอาจารย์ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสอาจารย์' })
  @MaxLength(20, { message: 'รหัสอาจารย์ยาวเกิน 20 ตัวอักษร' })
  professor_code?: string;

  @IsInt({ message: 'กรุณาเลือกสาขา' })
  major_id: number;
}