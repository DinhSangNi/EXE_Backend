import { IsEnum } from 'class-validator';
import { Purpose } from 'src/constants/room-type.enum';

export class UploadImageMediaDto {
  @IsEnum(Purpose)
  purpose: Purpose;
}
