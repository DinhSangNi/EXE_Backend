import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { Appointment } from './appointment.entity';

@Entity('notification_appointments')
export class NotificationAppointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Notification,
    (notification) => notification.notificationAppointments,
  )
  notification: Notification;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.notificationAppointments,
  )
  appointment: Appointment;

  @CreateDateColumn()
  createdAt: Date;
}
