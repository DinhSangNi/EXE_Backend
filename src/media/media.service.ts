import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { error } from 'console';
import { cloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Purpose } from 'src/constants/room-type.enum';
import { Media } from 'src/entity/media.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly cloudinaryService: cloudinaryService,
  ) {}

  async uploadMediaToCloudinary(file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File not found');

    if (file.size > 10 * 1024 * 1024 && file.mimetype.includes('image'))
      throw new BadRequestException('Image file greater than 10MB');

    if (file.size > 100 * 1024 * 1024 && file.mimetype.includes('video'))
      throw new BadRequestException('Video file greater than 100MB');

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
    if (!files) {
      throw new NotFoundException('File not found');
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024 && file.mimetype.includes('image'))
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

  async createAvatarMediaWithGoogle(dto: {
    userId: string;
    url: string;
    type: string;
  }): Promise<Media> {
    const newAvatarMedia = this.mediaRepository.create({
      user: { id: dto.userId },
      url: dto.url,
      type: dto.type,
      purpose: Purpose.AVATAR,
    });

    return this.mediaRepository.save(newAvatarMedia);
  }

  async createMultipleImageMediasFromFiles(dto: {
    files: Express.Multer.File[];
    userId: string;
  }): Promise<Media[]> {
    const uploadResponse = await this.uploadMultipleMediasToCloudinary(
      dto.files,
    );

    const newImageMedias = uploadResponse.map((res) => {
      return this.mediaRepository.create({
        user: { id: dto.userId },
        public_id: res.publicId,
        url: res.url,
        type: res.type,
      });
    });
    return await this.mediaRepository.save(newImageMedias);
  }

  async createRoomVideoMediaFromFile(dto: {
    file: Express.Multer.File;
    userId: string;
  }): Promise<Media> {
    const uploadResponse = await this.uploadMediaToCloudinary(dto.file);
    const newImageMedia = this.mediaRepository.create({
      user: { id: dto.userId },
      public_id: uploadResponse.publicId,
      url: uploadResponse.url,
      type: uploadResponse.type,
      purpose: Purpose.ROOMVIDEO,
    });
    return await this.mediaRepository.save(newImageMedia);
  }

  async createMediaFromFile(dto: {
    file: Express.Multer.File;
    userId: string;
  }): Promise<Media> {
    try {
      const uploadResponse = await this.uploadMediaToCloudinary(dto.file);
      const newMedia = this.mediaRepository.create({
        user: { id: dto.userId },
        public_id: uploadResponse.publicId,
        url: uploadResponse.url,
        type: uploadResponse.type,
      });
      return await this.mediaRepository.save(newMedia);
    } catch (err) {
      console.log('error: ', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async createMediaFromUrl(url: string, userId: string): Promise<Media> {
    if (!url) throw new BadRequestException('Url is required');
    const newMedia = this.mediaRepository.create({
      user: { id: userId },
      url: url,
      type: 'video',
    });

    return await this.mediaRepository.save(newMedia);
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          media.public_id,
          media.type.includes('video') ? 'video' : 'image',
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete Cloudinary file ${media.public_id}: ${error.message}`,
        );
        throw new Error(
          `Cloudinary delete failed for publicId: ${media.public_id}`,
        );
      }
    }

    await this.mediaRepository.delete(media.id);
  }

  async getAllTemporarayMedia(): Promise<Media[]> {
    return (
      (await this.mediaRepository.find({
        where: {
          temporary: true,
        },
      })) ?? []
    );
  }

  async updatePostIdToMedia(postId: string, mediaIds: string[]): Promise<void> {
    if (!mediaIds || mediaIds.length === 0)
      throw new BadRequestException(
        'Media IDs are required to associate with the room.',
      );

    await this.mediaRepository.update(
      { id: In(mediaIds) },
      { post: { id: postId }, temporary: false },
    );
  }
}
