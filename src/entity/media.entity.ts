import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Purpose } from 'src/constants/room-type.enum';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  public_id: string;

  @ManyToOne(() => User, (user) => user.medias)
  user: User;

  @Column({ nullable: true })
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'enum', enum: Purpose, nullable: true })
  purpose: Purpose;

  @ManyToOne(() => Post, (post) => post.medias, { nullable: true })
  post: Post;

  @Column({ default: true })
  temporary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt: Date;
}
