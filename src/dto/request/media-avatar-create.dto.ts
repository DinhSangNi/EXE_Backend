import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvatarMediaDto {
  @ApiProperty({
    description: 'URL của ảnh đại diện',
    example: 'https://res.cloudinary.com/.../avatar.jpg',
  })
  @IsString()
  url: string;
}
