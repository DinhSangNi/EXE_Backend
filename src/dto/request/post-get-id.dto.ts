import { IsUUID } from 'class-validator';

export class GetPostByIdDto {
  @IsUUID()
  id: string;
}
