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
import { Room } from './room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 10 })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.RENTER })
  role: UserRole;

  @Column()
  avatar: string;

  @OneToMany(() => Room, (room) => room.owner)
  rooms: Room[];

  @OneToMany(() => Post, (post) => post.owner)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
