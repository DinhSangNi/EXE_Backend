import { IsString, IsUrl } from 'class-validator';

export class UploadMediaFormUrl {
  @IsString()
  @IsUrl()
  url: string;
}
