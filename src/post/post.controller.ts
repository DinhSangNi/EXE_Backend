import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { FilterPostDto } from 'src/dto/request/post-filter.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { UserRole } from 'src/user/user-role.enum';

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
  @ApiOperation({ summary: 'Lấy tất cả bài đăng' })
  @ApiRes({
    status: 200,
    description: 'Danh sách bài đăng',
    type: [PostEntity],
  })
  async getAll(@Query() filter: FilterPostDto, @Res() res: Response) {
    const data = await this.postService.getAll(filter);

    return res.status(HttpStatus.OK).json(
      new ApiResponse<
        PaginationResponse<PostEntity[]> & {
          totalExpiredItems: number;
          totalApprovedItems: number;
          totalPendingItems: number;
          totalRejectedItems: number;
        }
      >('Get filtered posts successfully!', {
        ...data,
      }),
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
    @Query() filter: FilterPostDto,
    @Req() req: { user: { userId: string; role: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PaginationResponse<PostEntity[]>>(
          'Get posts by user successfully!',
          await this.postService.getAllByUserId(userId, filter),
        ),
      );
  }

  @Get('/:id')
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

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Xóa bài đăng theo ID' })
  @ApiRes({
    status: 200,
    description: 'Xóa bài đăng thành công',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    await this.postService.delete(id, userId, role);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse<void>('Delete post successfully!'));
  }
}
