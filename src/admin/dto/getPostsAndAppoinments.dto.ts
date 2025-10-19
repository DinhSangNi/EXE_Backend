import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Granularity } from '../enum/granularity.enum';

export class GetPostsAndAppointmentsDto {
  @IsEnum(Granularity)
  granularity: Granularity = Granularity.DAILY;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
