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
import { Post } from './post.entity';
import { User } from './user.entity';
import { PropertyType, RentalType } from 'src/constants/room-type.enum';
import { RoomAmenity } from './room_amenity.entity';
import { Media } from './media.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.rooms)
  owner: User;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  propertyType: PropertyType;

  @Column({
    type: 'enum',
    enum: RentalType,
  })
  rentalType: RentalType;

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

  @OneToMany(() => Media, (media) => media.room)
  media: Media[];

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
