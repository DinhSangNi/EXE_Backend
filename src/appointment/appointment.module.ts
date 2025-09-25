import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/entity/appointment.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationAppointment } from 'src/entity/notification_appointment.entity';
import { AppointmentPost } from 'src/entity/appointment_post.entity';
import { MailService } from 'src/auth/mail.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      NotificationAppointment,
      AppointmentPost,
    ]),
    NotificationModule,
    AuthModule,
  ],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
