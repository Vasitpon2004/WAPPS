import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const faculties = await this.prisma.faculties.findMany({
      select: {
        id: true,
        name: true,
        majors: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return faculties.map((faculty) => ({
      id: faculty.id,
      faculty_name: faculty.name,
      majors: faculty.majors.map((major) => ({
        id: major.id,
        major_name: major.name,
      })),
    }));
  }
}