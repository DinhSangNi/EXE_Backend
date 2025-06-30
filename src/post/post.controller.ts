import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreatePostDto } from 'src/dto/request/post-create.dto';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { AuthGuard } from '@nestjs/passport';
import { PostService } from './post.service';
import { Post as PostEntity } from 'src/entity/post.entity';
import { GetPostByIdDto } from 'src/dto/request/post-get-id.dto';
import { UpdatePostDto } from 'src/dto/request/post-update.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as ApiRes,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Tạo bài đăng mới' })
  @ApiRes({
    status: 200,
    description: 'Tạo bài đăng thành công',
    type: PostEntity,
  })
  async create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreatePostDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity | null>(
          'Create room successfully!',
          await this.postService.create(body, userId),
        ),
      );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy tất cả bài đăng (admin)' })
  @ApiRes({
    status: 200,
    description: 'Danh sách bài đăng',
    type: [PostEntity],
  })
  async getAlls(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity[]>(
          'Get all posts successfully!',
          await this.postService.getAll(),
        ),
      );
  }

  @Get('/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy bài đăng của người dùng hiện tại' })
  @ApiRes({
    status: 200,
    description: 'Danh sách bài đăng của user',
    type: [PostEntity],
  })
  async getAllByUserId(
    @Req() req: { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity[]>(
          'Get posts by user successfully!',
          await this.postService.getAllByUserId(userId),
        ),
      );
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy bài đăng theo ID' })
  @ApiRes({
    status: 200,
    description: 'Chi tiết bài đăng',
    type: PostEntity,
  })
  async getById(@Param() dto: GetPostByIdDto, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity>(
          'Get post by id successfully!',
          await this.postService.getById(dto.id),
        ),
      );
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cập nhật bài đăng theo ID' })
  @ApiRes({
    status: 200,
    description: 'Cập nhật bài đăng thành công',
    type: PostEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
    @Req() req: { user: { userId: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity | null>(
          `Update post with id: ${id} successfully!`,
          await this.postService.update(id, body, userId),
        ),
      );
  }
}
