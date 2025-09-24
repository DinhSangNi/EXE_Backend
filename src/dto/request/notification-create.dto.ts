import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationType } from 'src/constants/notification-type';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType = NotificationType.SYSTEM;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  userIds?: string[];
}
