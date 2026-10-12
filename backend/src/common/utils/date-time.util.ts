import { BadRequestException } from '@nestjs/common';

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDate(date: string): boolean {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

export function toDbDate(date: string): Date {
  if (!isValidDate(date)) {
    throw new BadRequestException(
      `วันที่ไม่ถูกต้อง: ${date} (ใช้รูปแบบ YYYY-MM-DD)`,
    );
  }
  return new Date(`${date}T00:00:00.000Z`);
}

export function fromDbDate(value: Date): string;
export function fromDbDate(value: Date | null): string | null;
export function fromDbDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toDbTime(time: string): Date {
  if (!TIME_PATTERN.test(time)) {
    throw new BadRequestException(`เวลาไม่ถูกต้อง: ${time} (ใช้รูปแบบ HH:MM)`);
  }
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export function fromDbTime(value: Date): string;
export function fromDbTime(value: Date | null): string | null;
export function fromDbTime(value: Date | null): string | null {
  return value ? value.toISOString().slice(11, 16) : null;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function weekdayOf(date: string): number {
  return toDbDate(date).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const result = toDbDate(date);
  result.setUTCDate(result.getUTCDate() + days);
  return fromDbDate(result);
}

export function todayInBangkok(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(
    new Date(),
  );
}