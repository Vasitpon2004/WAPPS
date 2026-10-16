import { Controller, Get ,} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { FacultiesService } from './faculties.service';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Public()
  @Get()
  findAll() {
    return this.facultiesService.findAll();
  }
}