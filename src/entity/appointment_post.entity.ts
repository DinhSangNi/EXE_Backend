import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Post } from './post.entity';

@Entity('appointment_posts')
export class AppointmentPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.appointmentPosts, {
    onDelete: 'CASCADE',
  })
  appointment: Appointment;

  @ManyToOne(() => Post, (post) => post.appointmentPosts, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
