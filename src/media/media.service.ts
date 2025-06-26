import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { cloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateMediaDto } from 'src/dto/request/media-create.dto';
import { Media } from 'src/entity/media.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly cloudinaryService: cloudinaryService,
  ) {}

  async uploadMediaToCloudinary(file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File not found');

    if (file.size > 10 * 1024 * 1024)
      throw new BadRequestException('File greater than 10MB');

    const uploadApiResponse: UploadApiResponse =
      await this.cloudinaryService.uploadFile(file);
    return {
      name: uploadApiResponse.original_filename,
      publicId: uploadApiResponse.public_id,
      url: uploadApiResponse.secure_url,
      type: `${uploadApiResponse.resource_type}/${uploadApiResponse.format}`,
    };
  }

  async uploadMultipleMediasToCloudinary(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new NotFoundException('File not found');
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024)
        throw new BadRequestException('File greater than 10MB');
    });

    const uploadApiResponses: UploadApiResponse[] =
      await this.cloudinaryService.uploadMultipleFiles(files);
    return uploadApiResponses.map((uploadApiResponse) => {
      return {
        name: uploadApiResponse.original_filename,
        publicId: uploadApiResponse.public_id,
        url: uploadApiResponse.secure_url,
        type: `${uploadApiResponse.resource_type}/${uploadApiResponse.format}`,
      };
    });
  }

  async createMedia(
    createMediaDto: CreateMediaDto,
    files: Express.Multer.File[],
  ) {
    const uploadResponse = await this.uploadMultipleMediasToCloudinary(files);
    const mediaEntities = uploadResponse.map((res) => {
      return this.mediaRepository.create({
        name: res.name,
        public_id: res.publicId,
        url: res.url,
        type: res.type,
        purpose: createMediaDto.purpose,
        room: createMediaDto.roomId ? { id: createMediaDto.roomId } : undefined,
      });
    });

    return await this.mediaRepository.save(mediaEntities);
  }
}
