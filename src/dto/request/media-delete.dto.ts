import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteMediaDto {
  @ApiProperty({
    description: 'ID của media cần xoá',
    example: 'b8598c4b-98fb-4ad5-8b9d-0cf46ff6c722',
  })
  @IsUUID()
  id: string;
}
