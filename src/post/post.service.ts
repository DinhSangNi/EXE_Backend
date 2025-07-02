import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from 'src/dto/request/post-create.dto';
import { PostAmenity } from 'src/entity/post_amenity.entity';
import { MediaService } from 'src/media/media.service';
import { IsNull, Repository } from 'typeorm';
import { Post } from 'src/entity/post.entity';
import { UpdatePostDto } from 'src/dto/request/post-update.dto';
import { Category } from 'src/entity/category.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostAmenity)
    private readonly postAmenityRepository: Repository<PostAmenity>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly mediaService: MediaService,
  ) {}

  async createPostAmenities(
    postId: string,
    amenityIds: string[],
  ): Promise<void> {
    if (!amenityIds || amenityIds.length === 0) {
      throw new BadRequestException('Amenity IDs are required.');
    }

    const postAmenities = amenityIds.map((amenityId) => {
      return this.postAmenityRepository.create({
        post: { id: postId },
        amenity: { id: amenityId },
      });
    });

    await this.postAmenityRepository.save(postAmenities);
  }

  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<Post | null> {
    const {
      title,
      description,
      categoryId,
      city,
      district,
      ward,
      street,
      latitude,
      longitude,
      square,
      price,
      url,
      mediaIds = [],
      amenityIds = [],
    } = createPostDto;

    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() + 1);

    // Tạo post
    const post = this.postRepository.create({
      title,
      description,
      city,
      district,
      ward,
      street,
      latitude,
      longitude,
      square,
      price,
      owner: { id: userId },
      category: {
        id: categoryId,
      },
      expiredAt: expiredDate,
    });

    const savedPost = await this.postRepository.save(post);

    // Nếu có url, tạo media từ url
    if (url) {
      const newMedia = await this.mediaService.createMediaFromUrl(url, userId);
      mediaIds.push(newMedia.id); // Thêm media mới vào danh sách
    }

    // Gán media vào post
    if (mediaIds.length > 0) {
      await this.mediaService.updatePostIdToMedia(savedPost.id, mediaIds);
    }

    // Gán amenity vào post
    if (amenityIds.length > 0) {
      await this.createPostAmenities(savedPost.id, amenityIds);
    }

    // Trả về kết quả đã populate
    return this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: [
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
  }

  async getAll(): Promise<Post[]> {
    return await this.postRepository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
  }

  async getById(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getAllByUserId(userId: string): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: {
        owner: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
    return posts;
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    userId: string,
  ): Promise<Post | null> {
    console.log('dto: ', dto);

    const updated = await this.postRepository.preload({
      id,
      ...dto,
    });

    console.log('updated: ', updated);

    if (!updated) {
      throw new NotFoundException('Post not found!');
    }

    // Tìm và gán category vào post
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: {
          id: dto.categoryId,
        },
      });
      if (category) {
        updated.category = category;
      }
    }

    // Nếu có url, tạo media từ url
    if (dto.mediaIds && dto.url) {
      const newMedia = await this.mediaService.createMediaFromUrl(
        dto.url,
        userId,
      );
      dto.mediaIds.push(newMedia.id); // Thêm media mới vào danh sách
    }

    // Gán media vào post
    if (dto.mediaIds && dto.mediaIds.length > 0) {
      await this.mediaService.updatePostIdToMedia(updated.id, dto.mediaIds);
    }

    // Gán amenity vào post
    if (dto.amenityIds && dto.amenityIds.length > 0) {
      await this.createPostAmenities(updated.id, dto.amenityIds);
    }

    await this.postRepository.save(updated);

    return await this.postRepository.findOne({
      where: { id },
      relations: [
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
  }
}
