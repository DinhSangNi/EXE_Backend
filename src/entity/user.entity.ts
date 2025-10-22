import { UserRole } from 'src/user/user-role.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Media } from './media.entity';
import { Appointment } from './appointment.entity';
import { UserNotification } from './user_notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ length: 10, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Media, (media) => media.user, { cascade: true })
  medias: Media[];

  @OneToMany(() => Post, (post) => post.owner, { cascade: true })
  posts: Post[];

  @OneToMany(() => Appointment, (appointment) => appointment.user, {
    cascade: true,
  })
  appointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.host, {
    cascade: true,
  })
  hostAppointments: Appointment[];

  @OneToMany(() => UserNotification, (un) => un.user, { cascade: true })
  userNotifications: UserNotification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt: Date;
}
