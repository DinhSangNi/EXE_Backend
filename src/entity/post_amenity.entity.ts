import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Amenity } from './amenity.entity';
import { Post } from './post.entity';

@Entity('post_amenities')
export class PostAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.postAmenities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Amenity, (amenity) => amenity.postAmenities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'amenityId' })
  amenity: Amenity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt: Date;
}
