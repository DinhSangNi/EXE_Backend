import { Controller } from '@nestjs/common';
import { CronJobService } from './cronjob.service';

@Controller('cronjob')
export class CronJobController {
  constructor(private readonly cronjobService: CronJobService) {}
}
