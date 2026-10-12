import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

interface ErrorBody {
  statusCode: number;
  message: string;
}

const THAI_CHARACTER = /[\u0E00-\u0E7F]/;

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
  401: 'กรุณาเข้าสู่ระบบ',
  403: 'คุณไม่มีสิทธิ์ทำรายการนี้',
  404: 'ไม่พบข้อมูลที่ต้องการ',
  409: 'ข้อมูลขัดแย้งกับข้อมูลที่มีอยู่ในระบบ',
  413: 'ไฟล์มีขนาดใหญ่เกินไป',
  500: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }

    this.logger.error(exception);
    return { statusCode: 500, message: DEFAULT_MESSAGES[500] };
  }

  private fromHttpException(exception: HttpException): ErrorBody {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    const raw =
      typeof response === 'string'
        ? response
        : (response as { message?: string | string[] }).message;
    const text = Array.isArray(raw) ? raw.join(' · ') : raw;

    if (statusCode >= 500) {
      this.logger.error(exception);
    }

    if (text && THAI_CHARACTER.test(text)) {
      return { statusCode, message: text };
    }
    return { statusCode, message: this.defaultMessage(statusCode) };
  }

  private fromPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): ErrorBody {
    const cause = this.databaseCause(error);
    const pgCode = cause?.originalCode;

    if (error.code === 'P2025') {
      return { statusCode: 404, message: DEFAULT_MESSAGES[404] };
    }
    if (error.code === 'P2002' || pgCode === '23505') {
      return { statusCode: 409, message: 'ข้อมูลนี้มีอยู่ในระบบแล้ว' };
    }
    if (error.code === 'P2003' || pgCode === '23503') {
      return {
        statusCode: 409,
        message: 'ข้อมูลนี้เชื่อมโยงกับข้อมูลอื่นอยู่ จึงทำรายการไม่ได้',
      };
    }

    this.logger.error(
      `${error.code}: ${cause?.originalMessage ?? error.message}`,
    );
    return { statusCode: 500, message: DEFAULT_MESSAGES[500] };
  }

  private databaseCause(error: Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta as
      | {
          driverAdapterError?: {
            cause?: { originalCode?: string; originalMessage?: string };
          };
        }
      | undefined;
    return meta?.driverAdapterError?.cause;
  }

  private defaultMessage(statusCode: number): string {
    return (
      DEFAULT_MESSAGES[statusCode] ??
      (statusCode >= 500 ? DEFAULT_MESSAGES[500] : DEFAULT_MESSAGES[400])
    );
  }
}