import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cronjob.service';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [ScheduleModule.forRoot(), MediaModule],
  providers: [CronJobService],
  exports: [],
})
export class CronJobModule {}
