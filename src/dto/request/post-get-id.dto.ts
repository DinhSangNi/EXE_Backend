import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPostByIdDto {
  @ApiProperty({
    description: 'ID của bài đăng',
    example: 'f3d9b3a4-2f4e-4f5a-9c82-a4db1f5d8e2a',
  })
  @IsUUID()
  id: string;
}
