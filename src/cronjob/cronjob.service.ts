import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaService } from 'src/media/media.service';
import { cloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);

  constructor(
    private readonly mediaService: MediaService,
    private readonly cloudinaryService: cloudinaryService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCleanup() {
    this.logger.log('🔁 Cron: Đang dọn dẹp ảnh isTemporary=true');

    const expiredMediaList = await this.mediaService.getAllTemporarayMedia();

    for (const media of expiredMediaList) {
      this.logger.log(`🗑 Xoá ${media.public_id} (${media.url})`);

      try {
        await this.cloudinaryService.deleteFile(media.public_id);
        await this.mediaService.deleteMedia(media.id);
      } catch (err) {
        this.logger.error(`❌ Lỗi xoá ${media.public_id}: ${err.message}`);
      }
    }

    this.logger.log(`✅ Đã xử lý ${expiredMediaList.length} media hết hạn`);
  }
}
