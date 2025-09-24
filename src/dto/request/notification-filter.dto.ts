import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from 'src/constants/notification-type';

export class NotificationFilterDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  //   @IsOptional()
  //   @IsUUID()
  //   userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 5;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
