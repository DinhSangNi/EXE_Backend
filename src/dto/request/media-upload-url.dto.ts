import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaFormUrl {
  @ApiProperty({
    description: 'URL của file media cần upload',
    example: 'https://example.com/media/video.mp4',
  })
  @IsString()
  @IsUrl()
  url: string;
}
