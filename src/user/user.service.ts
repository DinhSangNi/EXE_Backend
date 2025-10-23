import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/request/user-create.dto';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { GoogleCreateUserDto } from 'src/dto/request/user-google-create';
import { MediaService } from 'src/media/media.service';
import { Purpose } from 'src/constants/room-type.enum';
import { UserFilterDto } from 'src/dto/request/user-filter.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mediaService: MediaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (user) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  async createWithGoogle(
    googleCreateUserDto: GoogleCreateUserDto,
  ): Promise<User> {
    // const user = await this.userRepository.findOne({
    //   where: {
    //     email: googleCreateUserDto.email,
    //   },
    //   relations: ['medias'],
    // });

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.medias', 'media', 'media.purpose = :purpose', {
        purpose: Purpose.AVATAR,
      })
      .addSelect(['media.url', 'media.id'])
      .where('user.email = :email', { email: googleCreateUserDto.email })
      .getOne();

    if (user) {
      return user;
    }

    const newUser = this.userRepository.create({
      name: googleCreateUserDto.name,
      email: googleCreateUserDto.email,
    });
    const savedUser = await this.userRepository.save(newUser);

    await this.mediaService.createAvatarMediaWithGoogle({
      userId: savedUser.id,
      url: googleCreateUserDto.url,
      type: 'image',
    });

    return (
      (await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['medias'],
      })) ?? savedUser
    );
  }

  async findAll(query?: UserFilterDto) {
    const { q, role, page, limit } = query || {};
    const newPage = page && page > 0 ? page : 1;
    const newLimit = limit && limit > 0 ? limit : 10;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (q) {
      queryBuilder.andWhere('user.name LIKE :q OR user.email LIKE :q', {
        q: `%${q}%`,
      });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    queryBuilder.skip((newPage - 1) * newLimit).take(newLimit);
    queryBuilder.orderBy('user.createdAt', 'DESC');
    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      data: results,
      totalItems: total,
      limit: 1,
      page: 1,
    } as PaginationResponse<User[]>;
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: ['medias'],
    });
  }
}
