import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { Role } from '../common/types/auth-user';
import { Prisma } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailDto } from './dto/email.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

const BCRYPT_ROUNDS = 10;
const OTP_TTL_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const RESET_TTL_MINUTES = 30;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const OTP_INVALID = 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ';
const RESET_INVALID = 'ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่';

const USER_WITH_MAJOR = {
  majors: { include: { faculties: true } },
} satisfies Prisma.usersInclude;

type UserWithMajor = Prisma.usersGetPayload<{
  include: typeof USER_WITH_MAJOR;
}>;

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async listMajors() {
    const majors = await this.prisma.majors.findMany({
      include: { faculties: true },
      orderBy: [{ faculty_id: 'asc' }, { name: 'asc' }],
    });
    return majors.map((major) => ({
      id: major.id,
      name: major.name,
      faculty_id: major.faculty_id,
      faculty_name: major.faculties.name,
    }));
  }

  async register(dto: RegisterDto) {
    this.checkRoleFields(dto);

    const major = await this.prisma.majors.findUnique({
      where: { id: dto.major_id },
    });
    if (!major) {
      throw new BadRequestException('ไม่พบสาขาที่เลือก');
    }

    await this.checkDuplicates(dto);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        password_hash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        full_name: dto.full_name,
        role: dto.role,
        student_code: dto.role === 'student' ? dto.student_code : null,
        professor_code: dto.role === 'professor' ? dto.professor_code : null,
        major_id: dto.major_id,
      },
    });

    const sent = await this.issueOtp(user.id, user.email);
    return {
      message: sent
        ? 'สมัครสมาชิกแล้ว กรุณากรอกรหัส OTP ที่ส่งไปทางอีเมล'
        : 'สมัครสมาชิกแล้ว แต่ส่งอีเมลไม่สำเร็จ กรุณากดขอรหัส OTP ใหม่',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.is_verified) {
      throw new BadRequestException(OTP_INVALID);
    }

    const otp = await this.prisma.otp_verify.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });
    if (!otp || otp.is_used || otp.expires_at < new Date()) {
      throw new BadRequestException(OTP_INVALID);
    }
    if (!(await bcrypt.compare(dto.code, otp.code_hash))) {
      throw new BadRequestException(OTP_INVALID);
    }

    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: user.id },
        data: { is_verified: true },
      }),
      this.prisma.otp_verify.update({
        where: { id: otp.id },
        data: { is_used: true },
      }),
    ]);
    return { message: 'ยืนยันอีเมลแล้ว เข้าสู่ระบบได้เลย' };
  }

  async resendOtp(dto: EmailDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (user && !user.is_verified && user.is_active) {
      const latest = await this.prisma.otp_verify.findFirst({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
      });
      const tooSoon =
        latest !== null &&
        Date.now() - latest.created_at.getTime() < OTP_RESEND_SECONDS * 1000;
      if (!tooSoon) {
        await this.issueOtp(user.id, user.email);
      }
    }

    return {
      message:
        'ถ้าอีเมลนี้สมัครไว้และยังไม่ได้ยืนยัน ระบบส่งรหัส OTP ใหม่ให้แล้ว (ขอได้ทุก 1 นาที)',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      include: USER_WITH_MAJOR,
    });
    const passwordOk = await bcrypt.compare(
      dto.password,
      user?.password_hash ?? DUMMY_HASH,
    );
    if (!user || !passwordOk) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    if (!user.is_verified) {
      throw new ForbiddenException(
        'ยังไม่ได้ยืนยันอีเมล กรุณากรอกรหัส OTP ที่ส่งไปทางอีเมล',
      );
    }
    if (!user.is_active) {
      throw new ForbiddenException(
        'บัญชีนี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
      );
    }

    const payload: JwtPayload = { sub: user.id };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: this.toPublicUser(user),
    };
  }

  async me(userId: number) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { id: userId },
      include: USER_WITH_MAJOR,
    });
    return this.toPublicUser(user);
  }

  async forgotPassword(dto: EmailDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (user && user.is_active) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.password_reset_tokens.create({
        data: {
          user_id: user.id,
          token_hash: sha256(token),
          expires_at: minutesFromNow(RESET_TTL_MINUTES),
        },
      });
      const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
      const link = `${frontendUrl}/reset-password?token=${token}`;
      await this.mail.sendPasswordReset(user.email, link, RESET_TTL_MINUTES);
    }

    return {
      message: `ถ้าอีเมลนี้มีในระบบ ระบบส่งลิงก์ตั้งรหัสผ่านใหม่ให้แล้ว ลิงก์ใช้ได้ ${RESET_TTL_MINUTES} นาที`,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.password_reset_tokens.findUnique({
      where: { token_hash: sha256(dto.token) },
      include: { users: true },
    });
    if (
      !record ||
      record.is_used ||
      record.expires_at < new Date() ||
      !record.users.is_active
    ) {
      throw new BadRequestException(RESET_INVALID);
    }

    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: record.user_id },
        data: {
          password_hash: await bcrypt.hash(dto.new_password, BCRYPT_ROUNDS),
        },
      }),
      this.prisma.password_reset_tokens.updateMany({
        where: { user_id: record.user_id, is_used: false },
        data: { is_used: true },
      }),
    ]);
    return {
      message: 'ตั้งรหัสผ่านใหม่แล้ว เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย',
    };
  }

  private checkRoleFields(dto: RegisterDto) {
    if (dto.role === 'student') {
      if (!dto.student_code) {
        throw new BadRequestException('นิสิตต้องกรอกรหัสนิสิต');
      }
      if (dto.professor_code) {
        throw new BadRequestException('นิสิตไม่ต้องกรอกรหัสอาจารย์');
      }
    } else {
      if (!dto.professor_code) {
        throw new BadRequestException('อาจารย์ต้องกรอกรหัสอาจารย์');
      }
      if (dto.student_code) {
        throw new BadRequestException('อาจารย์ไม่ต้องกรอกรหัสนิสิต');
      }
    }
  }

  private async checkDuplicates(dto: RegisterDto) {
    const codeCondition: Prisma.usersWhereInput =
      dto.role === 'student'
        ? { student_code: dto.student_code }
        : { professor_code: dto.professor_code };

    const existing = await this.prisma.users.findFirst({
      where: { OR: [{ email: dto.email }, codeCondition] },
      select: { email: true },
    });
    if (!existing) return;

    if (existing.email === dto.email) {
      throw new ConflictException(
        'อีเมลนี้สมัครแล้ว ถ้ายังไม่ได้ยืนยัน ให้กดขอรหัส OTP ใหม่',
      );
    }
    throw new ConflictException(
      dto.role === 'student'
        ? 'รหัสนิสิตนี้มีผู้ใช้แล้ว'
        : 'รหัสอาจารย์นี้มีผู้ใช้แล้ว',
    );
  }

  private async issueOtp(userId: number, email: string): Promise<boolean> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.prisma.otp_verify.create({
      data: {
        user_id: userId,
        code_hash: await bcrypt.hash(code, BCRYPT_ROUNDS),
        expires_at: minutesFromNow(OTP_TTL_MINUTES),
      },
    });
    return this.mail.sendOtp(email, code, OTP_TTL_MINUTES);
  }

  private toPublicUser(user: UserWithMajor) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role as Role,
      student_code: user.student_code,
      professor_code: user.professor_code,
      major_id: user.major_id,
      /*major_name: user.majors?.name ?? null,
      faculty_name: user.majors?.faculties.name ?? null,
      discord_id: user.discord_id,*/
    };
  }
}