import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Purpose } from 'src/constants/room-type.enum';

export class UploadImageMediaDto {
  @ApiProperty({
    description: 'Mục đích sử dụng media (ví dụ: AVATAR, ROOM)',
    enum: Purpose,
    example: Purpose.AVATAR,
  })
  @IsEnum(Purpose)
  purpose: Purpose;
}
