import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { User } from 'src/entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  async getAllUser(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<User[]>(
          'Get users successfully',
          await this.userService.findAll(),
        ),
      );
  }
}
