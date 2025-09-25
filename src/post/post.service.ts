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
import dayjs from 'dayjs';
import { FilterPostDto } from 'src/dto/request/post-filter.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { PostStatus } from 'src/constants/post-status.enum';
import { UserRole } from 'src/user/user-role.enum';

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

    // Convert dayjs -> Date (TypeORM hỗ trợ)
    const expiredDate = dayjs().add(1, 'month').toDate();

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
      category: { id: categoryId },
      expiredAt: expiredDate, // ✅ bây giờ là Date, không phải object
    });

    const savedPost = await this.postRepository.save(post);

    // Nếu có url, tạo media từ url
    if (url) {
      const newMedia = await this.mediaService.createMediaFromUrl(url, userId);
      mediaIds.push(newMedia.id);
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

  async getAll(filter: FilterPostDto): Promise<
    PaginationResponse<Post[]> & {
      totalAllItems: number;
      totalExpiredItems: number;
      totalApprovedItems: number;
      totalPendingItems: number;
      totalRejectedItems: number;
    }
  > {
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.owner', 'owner')
      .leftJoinAndSelect(
        'owner.medias',
        'ownerMedia',
        'ownerMedia.purpose LIKE :purpose',
        { purpose: '%avatar%' },
      )
      .leftJoinAndSelect('post.medias', 'postMedia')
      .leftJoinAndSelect('post.postAmenities', 'postAmenities')
      .leftJoinAndSelect('postAmenities.amenity', 'amenity')
      .leftJoinAndSelect('post.category', 'category')
      .addSelect(['owner.name'])
      .where('post.deletedAt IS NULL');

    // ==== Count section (thống kê dashboard) ====
    const totalAllItems = await this.postRepository.count({
      where: { deletedAt: IsNull() },
    });

    const totalExpiredItems = await this.postRepository.count({
      where: { status: PostStatus.EXPIRED, deletedAt: IsNull() },
    });

    const totalApprovedItems = await this.postRepository.count({
      where: { status: PostStatus.APPROVED, deletedAt: IsNull() },
    });

    const totalPendingItems = await this.postRepository.count({
      where: { status: PostStatus.PENDING, deletedAt: IsNull() },
    });

    const totalRejectedItems = await this.postRepository.count({
      where: { status: PostStatus.REJECTED, deletedAt: IsNull() },
    });

    // ==== Filtering ====
    if (filter.minPrice !== undefined) {
      query.andWhere('post.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice !== undefined) {
      query.andWhere('post.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter.minSquare !== undefined) {
      query.andWhere('post.square >= :minSquare', {
        minSquare: filter.minSquare,
      });
    }
    if (filter.maxSquare !== undefined) {
      query.andWhere('post.square <= :maxSquare', {
        maxSquare: filter.maxSquare,
      });
    }

    if (filter.category) {
      query.andWhere('category.id = :category', { category: filter.category });
    }

    if (filter.province) {
      query.andWhere('post.city = :province', { province: filter.province });
    }
    if (filter.district) {
      query.andWhere('post.district = :district', {
        district: filter.district,
      });
    }
    if (filter.ward) {
      query.andWhere('post.ward = :ward', { ward: filter.ward });
    }

    if (filter.amenities && filter.amenities.length > 0) {
      filter.amenities.forEach((amenityId, index) => {
        query.andWhere(
          `EXISTS (
          SELECT 1 FROM post_amenities pa${index}
          WHERE pa${index}."postId" = post.id 
          AND pa${index}."amenityId" = :amenityId${index}
        )`,
          { [`amenityId${index}`]: amenityId },
        );
      });
    }

    if (filter.status) {
      query.andWhere('post.status = :status', { status: filter.status });
    }

    // ==== Pagination ====
    const limit = filter.limit ?? 10;
    const page = filter.page ?? 1;

    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query
      .orderBy('post.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total, // tổng số bài sau filter
      totalAllItems, // tổng tất cả bài hợp lệ (chưa delete)
      totalExpiredItems,
      totalApprovedItems,
      totalPendingItems,
      totalRejectedItems,
      data: items,
    };
  }

  async getById(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'owner',
        'owner.medias',
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getAllByUserId(
    userId: string,
    filter: FilterPostDto,
  ): Promise<
    PaginationResponse<Post[]> & {
      totalExpiredItems: number;
      totalApprovedItems: number;
      totalPendingItems: number;
      totalRejectedItems: number;
    }
  > {
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.owner', 'owner')
      .leftJoinAndSelect(
        'owner.medias',
        'ownerMedia',
        'ownerMedia.purpose LIKE :purpose',
        { purpose: '%avatar%' },
      )
      .leftJoinAndSelect('post.medias', 'postMedia')
      .leftJoinAndSelect('post.postAmenities', 'postAmenities')
      .leftJoinAndSelect('postAmenities.amenity', 'amenity')
      .leftJoinAndSelect('post.category', 'category')
      .addSelect(['owner.name'])
      .where('post.deletedAt IS NULL');

    // Tính toán tổng số bài đăng
    const totalAllItems = await this.postRepository.count({
      where: {
        owner: {
          id: userId,
        },
      },
    });

    // Tính toán tổng số bài đăng hết hạn
    const totalExpiredItems = await this.postRepository.count({
      where: {
        status: PostStatus.EXPIRED,
      },
    });

    // Tính toán tổng số bài đăng đã duyệt
    const totalApprovedItems = await this.postRepository.count({
      where: {
        status: PostStatus.APPROVED,
      },
    });

    // Tính toán tổng số bài đăng đang chờ duyệt
    const totalPendingItems = await this.postRepository.count({
      where: {
        status: PostStatus.PENDING,
      },
    });

    // Tính toán tổng số bài đăng đã từ chối
    const totalRejectedItems = await this.postRepository.count({
      where: {
        status: PostStatus.REJECTED,
      },
    });

    if (filter.minPrice !== undefined) {
      query.andWhere('post.price >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice !== undefined) {
      query.andWhere('post.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter.minSquare !== undefined) {
      query.andWhere('post.square >= :minSquare', {
        minSquare: filter.minSquare,
      });
    }
    if (filter.maxSquare !== undefined) {
      query.andWhere('post.square <= :maxSquare', {
        maxSquare: filter.maxSquare,
      });
    }
    if (filter.category) {
      query.andWhere('category.id = :category', { category: filter.category });
    }

    if (filter.province) {
      query.andWhere('post.city = :province', {
        province: filter.province,
      });
    }

    if (filter.district) {
      query.andWhere('post.district = :district', {
        district: filter.district,
      });
    }

    if (filter.ward) {
      query.andWhere('post.ward = :ward', { ward: filter.ward });
    }

    if (filter.amenities && filter.amenities.length > 0) {
      filter.amenities.forEach((amenityId, index) => {
        query.andWhere(
          `EXISTS (
        SELECT 1 FROM post_amenities pa${index}
        WHERE pa${index}.postId = post.id AND pa${index}.amenityId = :amenityId${index}
      )`,
          { [`amenityId${index}`]: amenityId },
        );
      });
    }

    if (filter.status) {
      query.andWhere('post.status = :status', { status: filter.status });
    }

    const limit = filter.limit ?? 10;
    const page = filter.page ?? 1;

    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query
      .orderBy('post.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      totalAllItems: totalAllItems,
      totalExpiredItems: totalExpiredItems,
      totalApprovedItems: totalApprovedItems,
      totalPendingItems: totalPendingItems,
      totalRejectedItems: totalRejectedItems,
      data: items,
    };
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
        'owner',
        'medias',
        'postAmenities',
        'postAmenities.amenity',
        'category',
      ],
    });
  }

  async delete(id: string, userId: string, role: UserRole): Promise<void> {
    if (role !== UserRole.ADMIN) {
      const post = await this.postRepository.findOne({
        where: { id, owner: { id: userId }, deletedAt: IsNull() },
      });
      if (!post) {
        throw new NotFoundException(
          'Post not found or already deleted or not yours',
        );
      }
    } else {
      const post = await this.postRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });
      if (!post) {
        throw new NotFoundException('Post not found or already deleted');
      }
    }
    await this.postRepository.softDelete(id);
  }
}
