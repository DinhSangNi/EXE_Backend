import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Purpose } from 'src/constants/room-type.enum';

export class CreateMediaDto {
  @IsEnum(Purpose)
  purpose: Purpose;

  @IsUUID()
  @IsOptional()
  roomId?: string;
}
