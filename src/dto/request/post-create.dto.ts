import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Tiêu đề bài đăng',
    example: 'Cho thuê phòng trọ gần đại học',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết bài đăng',
    example: 'Phòng sạch sẽ, có ban công, gần chợ...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID của danh mục (category)',
    example: 'c1d3e94a-95bc-40be-91de-c9b9b6bdf010',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Tên thành phố/tỉnh', example: 'Hồ Chí Minh' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Tên quận/huyện', example: 'Quận 1' })
  @IsString()
  district: string;

  @ApiPropertyOptional({
    description: 'Tên phường/xã',
    example: 'Phường Bến Nghé',
  })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({
    description: 'Tên đường',
    example: 'Đường Nguyễn Huệ',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ description: 'Vĩ độ của địa điểm', example: 10.7769 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Kinh độ của địa điểm', example: 106.7009 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Diện tích (m²)', example: 25 })
  @IsNumber()
  square: number;

  @ApiProperty({ description: 'Giá thuê (VNĐ)', example: 3000000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'URL video nếu có (thường là YouTube)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID media (ảnh/video)',
    example: ['a1b2c3d4-5678-1234-9012-abcdef123456'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách ID tiện ích đi kèm',
    example: ['b2d3e4f5-6789-2345-0123-bcdef2345678'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  amenityIds?: string[];
}
