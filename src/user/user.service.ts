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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

  async createWithGoogle(googleCreateUserDto: GoogleCreateUserDto) {
    const user = await this.userRepository.findOneBy({
      email: googleCreateUserDto.email,
    });
    if (user) {
      return user;
    }

    const newUser = this.userRepository.create({
      ...googleCreateUserDto,
    });
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findByEmail(email: string) {
    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return await this.userRepository.findOneBy({ email: email });
  }
}
