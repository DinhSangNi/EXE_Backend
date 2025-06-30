import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
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
  async getAlls(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PostEntity[]>(
          'Create room successfully!',
          await this.postService.getAll(),
        ),
      );
  }

  @Get('/user')
  @Roles('host')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
}
