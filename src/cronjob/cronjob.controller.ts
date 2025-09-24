import { Controller } from '@nestjs/common';
import { CronjobService } from './cronjob.service';

@Controller('cronjob')
export class CronJobController {
  constructor(private readonly cronjobService: CronjobService) {}
}
