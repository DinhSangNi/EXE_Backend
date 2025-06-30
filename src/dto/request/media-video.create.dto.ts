import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVideoMediaDto {
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  type: string;
}
