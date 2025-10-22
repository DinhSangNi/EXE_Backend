import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
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
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.notificationAppointments,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @CreateDateColumn()
  createdAt: Date;
}
