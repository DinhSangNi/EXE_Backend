import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { SendOtpDto } from 'src/dto/request/send-otp.dto';
import Redis from 'ioredis';
import { VerifyOtpDto } from 'src/dto/request/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async validate(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userService.findByEmail(loginUserDto.email);
    console.log('user: ', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new ConflictException('Password not match');
    }

    if (!(await compare(loginUserDto.password, user.password))) {
      throw new ConflictException('Password not match');
    }

    return user;
  }

  async generateAccessToken(payload: { sub: string; role: string }) {
    return await this.jwtService.signAsync({
      sub: payload.sub,
      role: payload.role,
    });
  }

  async generateRefreshToken(payload: { sub: string; role: string }) {
    return await this.jwtService.signAsync(
      { sub: payload.sub, role: payload.role },
      {
        secret: this.configService.get<string>('REFRESHTOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESHTOKEN_EXPIRATION'),
      },
    );
  }

  async login(loginUserDto: LoginUserDto): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    console.log('loginUserDto: ', loginUserDto);
    const user = await this.validate(loginUserDto);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.get<string>('REFRESHTOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESHTOKEN_EXPIRATION'),
      },
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    if (await this.userService.findByEmail(createUserDto.email)) {
      throw new ConflictException('User already exists');
    }
    const { password, ...rest } = await this.userService.create(createUserDto);
    return rest;
  }

  generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    if (await this.userService.findByEmail(sendOtpDto.email)) {
      throw new ConflictException('Email alread exists');
    }
    const otp = this.generateOtp();
    await this.redisClient.set(`${otp}:${sendOtpDto.email}`, otp, 'EX', 60);
    await this.mailService.sendOtp(sendOtpDto.email, otp);
    return {
      message: 'OTP already sent',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const savedOtp = await this.redisClient.get(
      `${verifyOtpDto.otp}:${verifyOtpDto.email}`,
    );

    if (!savedOtp) throw new UnauthorizedException('Invalid OTP');

    return {
      message: 'OTP authentication successful',
    };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESHTOKEN_SECRET'),
      });
      const newAccessToken = await this.jwtService.signAsync({
        sub: payload.sub,
      });
      return newAccessToken;
    } catch (error) {
      console.log('error: ', error);
      throw new UnauthorizedException('Invalid or expirated refresh token');
    }
  }
}
