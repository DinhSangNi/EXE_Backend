import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(private readonly mediaService: MediaService) {}

  // Chạy job lúc 1 giờ chiều mỗi ngày
  @Cron('0 13 * * *')
  // @Cron('*/30 * * * * *')
  async handleCron() {
    try {
      this.logger.log('Cron job is running at 2AM');
      const tempMedias = await this.mediaService.getAllTemporarayMedia();
      if (!tempMedias || tempMedias.length === 0) {
        this.logger.log('No temporary media to delete.');
        return;
      }

      const results = await Promise.allSettled(
        tempMedias.map(async (media) => {
          await this.mediaService.deleteMedia(media.id);
          return media.id;
        }),
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          this.logger.log(`Deleted media ${result.value} successfully.`);
        } else {
          this.logger.error(`Failed to delete media:`, result.reason);
        }
      });
    } catch (error) {
      this.logger.error('Unexpected error in cron job', error);
    }
  }
}
