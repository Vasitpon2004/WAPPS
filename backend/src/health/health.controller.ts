import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { fromDbDate, todayInBangkok } from '../common/utils/date-time.util';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    const semester = await this.prisma.semesters.findFirst({
      where: { is_current: true },
    });

    return {
      status: 'ok',
      today: todayInBangkok(),
      current_semester: semester && {
        id: semester.id,
        name: semester.name,
        start_date: fromDbDate(semester.start_date),
        end_date: fromDbDate(semester.end_date),
      },
    };
  }
}