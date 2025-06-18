import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/dto/request/user-login.dto';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/dto/request/user-create.dto';
import { MailService } from 'src/auth/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validate(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userService.findByEmail(loginUserDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await compare(loginUserDto.password, user.password))) {
      throw new ConflictException('Password not match');
    }

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.validate(loginUserDto);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('REFRESHTOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESHTOKEN_EXPIRATION'),
      },
    );

    return { accessToken, refreshToken };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    if (await this.userService.findByEmail(createUserDto.email)) {
      throw new ConflictException('User already exists');
    }
    return await this.userService.create(createUserDto);
  }

  async sendOtp() {}
}
