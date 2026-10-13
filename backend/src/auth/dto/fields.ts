import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export function IsKuEmail() {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    ),
    IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
    Matches(/@ku\.th$/, { message: 'ใช้ได้เฉพาะอีเมล @ku.th' }),
    MaxLength(255, { message: 'อีเมลยาวเกิน 255 ตัวอักษร' }),
  );
}

export function IsPassword() {
  return applyDecorators(
    IsString({ message: 'กรุณากรอกรหัสผ่าน' }),
    MinLength(8, { message: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' }),
    MaxLength(72, { message: 'รหัสผ่านยาวได้ไม่เกิน 72 ตัวอักษร' }),
    Matches(/[A-Za-z]/, {
      message: 'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัว',
    }),
    Matches(/\d/, { message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' }),
  );
}