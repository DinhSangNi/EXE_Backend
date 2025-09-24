import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Notification } from './notification.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userNotifications)
  user: User;

  @ManyToOne(
    () => Notification,
    (notification) => notification.userNotifications,
  )
  notification: Notification;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
