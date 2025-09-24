import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @Type(() => Date)
  @IsDate()
  appointmentDateTime: Date;

  @IsString()
  @IsOptional()
  note?: string;

  @IsUUID()
  hostId: string;

  @IsUUID()
  postId: string;
}
