import { Module } from '@nestjs/common';
import { cloudinaryProvider } from './cloudinary.provider';
import { cloudinaryService } from './cloudinary.service';

@Module({
  imports: [],
  controllers: [],
  providers: [cloudinaryService, cloudinaryProvider],
  exports: [cloudinaryService, cloudinaryProvider],
})
export class CloudinaryModule {}
