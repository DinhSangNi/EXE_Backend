import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserNotification } from './user_notification.entity';
import { NotificationType } from 'src/constants/notification-type';
import { NotificationAppointment } from './notification_appointment.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserNotification, (un) => un.notification, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  userNotifications: UserNotification[];

  @OneToMany(() => NotificationAppointment, (na) => na.notification, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notificationAppointments: NotificationAppointment[];
}
