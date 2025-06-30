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
import { User } from './user.entity';
import { Category } from './category.entity';
import { Media } from './media.entity';
import { PostAmenity } from './post_amenity.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  ward: string;

  @Column({ nullable: true })
  street: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('float')
  square: number;

  @Column('float')
  price: number;

  @OneToMany(() => Media, (media) => media.post)
  medias: Media[];

  @OneToMany(() => PostAmenity, (postAmenity) => postAmenity.post)
  postAmenities: PostAmenity[];

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.posts)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt: Date;
}
