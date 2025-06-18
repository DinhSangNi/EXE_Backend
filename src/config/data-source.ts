// data-source.ts
import 'dotenv/config';
import { Amenity } from 'src/entity/amenity.entity';
import { Post } from 'src/entity/post.entity';
import { Room } from 'src/entity/room.entity';
import { RoomAmenity } from 'src/entity/room_amenity.entity';
import { User } from 'src/entity/user.entity';

import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  //   entities: ['dist/entity/*.js'],
  //   migrations: ['dist/migrations/*.js'],
  entities: [User, Post, Room, RoomAmenity, Amenity],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

export default dataSource;
