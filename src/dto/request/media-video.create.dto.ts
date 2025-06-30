import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoMediaDto {
  @ApiPropertyOptional({
    description: 'ID của phòng (nếu có)',
    example: 'a8f1e7d2-3f1b-4c2d-912a-99f43e7f3e32',
  })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({
    description:
      'URL video nếu có (nếu là video từ YouTube hoặc link trực tiếp)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Loại video (ví dụ: youtube, tiktok, mp4, ...)',
    example: 'youtube',
  })
  @IsString()
  type: string;
}
