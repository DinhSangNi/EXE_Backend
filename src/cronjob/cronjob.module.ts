import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobService } from './cronjob.service';
import { MediaModule } from 'src/media/media.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [ScheduleModule.forRoot(), MediaModule, CloudinaryModule],
  providers: [CronjobService],
  exports: [CronjobService],
})
export class CronJobModule {}
