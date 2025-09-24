// data-source.ts
import 'dotenv/config';
import { Amenity } from 'src/entity/amenity.entity';
import { Appointment } from 'src/entity/appointment.entity';
import { AppointmentPost } from 'src/entity/appointment_post.entity';
import { Category } from 'src/entity/category.entity';
import { Media } from 'src/entity/media.entity';
import { Notification } from 'src/entity/notification.entity';
import { NotificationAppointment } from 'src/entity/notification_appointment.entity';
import { Post } from 'src/entity/post.entity';
import { PostAmenity } from 'src/entity/post_amenity.entity';
import { User } from 'src/entity/user.entity';
import { UserNotification } from 'src/entity/user_notification.entity';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

const sslCertPath = path.join(
  process.cwd(),
  'src',
  'certs',
  'DigiCertGlobalRootG2.crt.pem',
);

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Post,
    PostAmenity,
    Amenity,
    Media,
    Category,
    Appointment,
    Notification,
    UserNotification,
    NotificationAppointment,
    AppointmentPost,
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  ssl: {
    ca: fs.readFileSync(sslCertPath),
  },
});

export default dataSource;
