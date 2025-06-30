import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề bài đăng',
    example: 'Phòng trọ quận 1 giá rẻ',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả bài đăng',
    example: 'Phòng thoáng mát, gần chợ...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ID danh mục',
    example: 'd5cb558d-2f3a-4a9a-9f2a-bb0e4e6c44d1',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Thành phố', example: 'Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Quận/Huyện', example: 'Quận 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Phường/Xã', example: 'Phường Bến Nghé' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'Tên đường', example: 'Nguyễn Huệ' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Vĩ độ', example: 10.7769 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Kinh độ', example: 106.7009 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Diện tích phòng', example: 25 })
  @IsOptional()
  @IsNumber()
  square?: number;

  @ApiPropertyOptional({ description: 'Giá phòng', example: 3500000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    description: 'Link video YouTube',
    example: 'https://www.youtube.com/watch?v=abc123xyz',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID media (hình ảnh/video)',
    example: ['4c229a7f-9476-4d71-bcf3-ec85b5ce479e'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách ID tiện ích (amenities)',
    example: ['59ac5e4e-6b4d-4c92-a21f-f2f732abdc5b'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  amenityIds?: string[];
}
