import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dto/request/user-login.dto';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { SendOtpDto } from 'src/dto/request/send-otp.dto';
import { VerifyOtpDto } from 'src/dto/request/verify-otp.dto';
import { CreateUserDto } from 'src/dto/request/user-create.dto';
import { User } from 'src/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginUserDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponse<{ user: Partial<User>; accessToken: string }>(
        'Login successfully',
        {
          user,
          accessToken,
        },
      ),
    );
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return res
      .status(HttpStatus.CREATED)
      .json(
        new ApiResponse(
          'Register successfully',
          await this.authService.register(createUserDto),
        ),
      );
  }

  @Post('/logout')
  async logout(@Req() req: any, @Res() res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse('Logout successfully'));
  }

  @Post('/send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse((await this.authService.sendOtp(sendOtpDto)).message),
      );
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          (await this.authService.verifyOtp(verifyOtpDto)).message,
        ),
      );
  }

  @Post('/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponse('Refresh Token not found'));
    }
    const newAccessToken = await this.authService.refreshToken(refreshToken);
    return res.status(HttpStatus.OK).json(
      new ApiResponse<{ accessToken: string }>('Refresh token succesfully', {
        accessToken: newAccessToken,
      }),
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as {
      email: string;
      name: string;
      picture: string;
      googleId: string;
    };

    const savedUser = await this.userService.createWithGoogle({
      email: user.email,
      name: user.name,
      url: user.picture,
    });

    const accessToken = await this.authService.generateAccessToken({
      sub: savedUser.id,
      role: savedUser.role,
    });

    const refreshToken = await this.authService.generateRefreshToken({
      sub: savedUser.id,
      role: savedUser.role,
    });

    const { password, ...rest } = savedUser;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(${JSON.stringify({ accessToken: accessToken, user: rest })}, "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  }
}
