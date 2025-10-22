import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Granularity } from '../enum/granularity.enum';
import { Type } from 'class-transformer';

export class GetPostsAndAppointmentsDto {
  // @IsEnum(Granularity)
  // granularity: Granularity = Granularity.DAILY;

  // @IsOptional()
  // @IsDateString()
  // startDate?: string;

  // @IsOptional()
  // @IsDateString()
  // endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
}
