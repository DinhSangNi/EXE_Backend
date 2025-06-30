import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { User } from 'src/entity/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as ApiSwaggerResponse,
} from '@nestjs/swagger';

@ApiTags('Users') // Tên nhóm trong Swagger UI
@ApiBearerAuth() // Thêm Bearer token input trong Swagger
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiSwaggerResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: ApiResponse, // Đây là lớp wrapper, bên dưới cần thêm generic
  })
  async getAllUser(@Res() res: Response) {
    const users = await this.userService.findAll();
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse<User[]>('Get users successfully', users));
  }
}
