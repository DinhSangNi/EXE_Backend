import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entity/notification.entity';
import { UserNotification } from 'src/entity/user_notification.entity';
import { NotificationController } from './notification.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserNotification])],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationGateway, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
