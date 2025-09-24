import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AppointmentStatus } from 'src/constants/appointment-status';
import { NotificationAppointment } from './notification_appointment.entity';
import { Post } from './post.entity';
import { AppointmentPost } from './appointment_post.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.appointments)
  user: User;

  @ManyToOne(() => User, (user) => user.hostAppointments)
  host: User;

  @Column({ type: 'timestamp' })
  appointmentDateTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.Pending,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  note?: string;

  @OneToMany(() => NotificationAppointment, (na) => na.appointment)
  notificationAppointments: NotificationAppointment[];

  @OneToMany(() => AppointmentPost, (ap) => ap.appointment)
  appointmentPosts: AppointmentPost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
