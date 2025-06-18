import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { RoomType } from 'src/constants/room-type.enum';
import { RoomAmenity } from './room_amenity.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.rooms)
  owner: User;

  @Column({
    type: 'enum',
    enum: RoomType,
  })
  roomType: RoomType;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  ward: string;

  @Column()
  street: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @OneToMany(() => RoomAmenity, (roomAmenity) => roomAmenity.room)
  roomAmenities: RoomAmenity[];

  @OneToMany(() => Post, (post) => post.room)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt: Date;
}
