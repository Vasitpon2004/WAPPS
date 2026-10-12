import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new Error(
        `ต่อฐานข้อมูลไม่ได้ ตรวจ DATABASE_URL ใน .env และดูว่า PostgreSQL เปิดอยู่ (${(error as Error).message})`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}