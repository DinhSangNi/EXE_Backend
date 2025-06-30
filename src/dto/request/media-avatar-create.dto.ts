import { IsString } from 'class-validator';

export class CreateAvatarMediaDto {
  @IsString()
  url: string;
}
