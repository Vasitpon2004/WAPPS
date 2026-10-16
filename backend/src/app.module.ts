import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/utils/validate-env';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { FacultiesModule } from './faculties/faculties.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    FacultiesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}