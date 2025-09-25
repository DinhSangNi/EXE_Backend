import { Controller, Get, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as ApiRes,
  ApiTags,
} from '@nestjs/swagger';
import { Category } from 'src/entity/category.entity'; // 👈 Import entity nếu có

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả danh mục' })
  @ApiRes({
    status: 200,
    description: 'Danh sách tất cả danh mục',
    type: [Category], // 👈 Nếu bạn có entity Category, đảm bảo import nó
  })
  async getAll(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Get all categories successfully!',
          await this.categoryService.getAll(),
        ),
      );
  }
}
