import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { AppointmentStatus } from 'src/constants/appointment-status';

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  appointmentDateTime?: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
