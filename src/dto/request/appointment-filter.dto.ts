import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from 'src/constants/appointment-status';

export class AppointmentFilterDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  hostId?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'appointmentDateTime';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
