import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email.trim() },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
}