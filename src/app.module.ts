import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from './address/address.module';
import { MediaModule } from './media/media.module';
import dataSource from './config/data-source';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CronJobModule } from './cronjob/cronjob.module';
import { AmenityModule } from './amenity/amenity.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { NotificationModule } from './notification/notification.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ...dataSource.options,
          // type: 'mysql',
          // host: configService.get('DB_HOST'),
          // port: configService.get<number>('DB_PORT'),
          // username: configService.get('DB_USERNAME'),
          // password: configService.get('DB_PASSWORD'),
          // database: configService.get('DB_NAME'),
          // entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // synchronize: true,
          // migrations: ['dist/migrations/*.js'],
          // migrationsRun: false,
        };
      },
    }),
    AuthModule,
    UserModule,
    AddressModule,
    MediaModule,
    CloudinaryModule,
    CronJobModule,
    AmenityModule,
    PostModule,
    CategoryModule,
    NotificationModule,
    AppointmentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
