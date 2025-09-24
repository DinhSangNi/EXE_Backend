import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationType } from 'src/constants/notification-type';
import { CreateNotificationDto } from 'src/dto/request/notification-create.dto';
import { NotificationFilterDto } from 'src/dto/request/notification-filter.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { Notification } from 'src/entity/notification.entity';
import { User } from 'src/entity/user.entity';
import { UserNotification } from 'src/entity/user_notification.entity';
import { UserRole } from 'src/user/user-role.enum';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    return await this.dataSource.transaction(async (manager) => {
      // Tạo notification
      const notification = manager.create(Notification, {
        title: createDto.title,
        message: createDto.message,
        type: createDto.type || NotificationType.SYSTEM,
      });
      const savedNotification = await manager.save(notification);

      // Xác định user target
      let userIds: string[] = [];
      if (createDto.userIds && createDto.userIds.length > 0) {
        userIds = createDto.userIds;
      } else {
        // system-wide → tất cả user
        const allUsers = await manager.find(User, { select: ['id'] });
        userIds = allUsers.map((u) => u.id);
      }

      // Tạo user_notifications
      const userNotifications = userIds.map((userId) =>
        manager.create(UserNotification, {
          user: { id: userId },
          notification: savedNotification,
          isRead: false,
        }),
      );

      await manager.save(userNotifications);

      // Trả về notification + relations

      return createDto.userIds
        ? await manager
            .getRepository(Notification)
            .createQueryBuilder('notification')
            .leftJoinAndSelect(
              'notification.userNotifications',
              'userNotification',
            )
            .leftJoin('userNotification.user', 'user')
            .addSelect(['user.id', 'user.name'])
            .where('notification.id = :id', { id: savedNotification.id })
            .getOneOrFail()
        : await manager
            .getRepository(Notification)
            .createQueryBuilder('notification')
            .where('notification.id = :id', { id: savedNotification.id })
            .getOneOrFail();
    });
  }

  async findAll(
    filter: NotificationFilterDto,
    userId: string,
    role: UserRole,
  ): Promise<PaginationResponse<Notification[]>> {
    const {
      keyword = '',
      type,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filter;

    console.log('role: ', role);
    console.log('userId: ', userId);

    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.userNotifications', 'userNotification')
      .leftJoin('userNotification.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .leftJoinAndSelect(
        'notification.notificationAppointments',
        'notificationAppointment',
      )
      .leftJoinAndSelect('notificationAppointment.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentPosts', 'appointmentPost')
      .leftJoinAndSelect('appointmentPost.post', 'post');

    if (role === UserRole.USER) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (keyword) {
      query.andWhere(
        '(notification.title LIKE :keyword OR notification.message LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    const totalAllItems = await query.getCount();

    query.skip((page - 1) * limit).take(limit);

    query.orderBy(
      `notification.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      totalItems: total,
      totalAllItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.notificationRepository.findOne({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        message: true,
        userNotifications: {
          user: true,
        },
        notificationAppointments: {
          appointment: {
            appointmentDateTime: true,
            appointmentPosts: {
              id: true,
              post: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      relations: [
        'notificationAppointments',
        'notificationAppointments.appointment',
        'notificationAppointments.appointment.appointmentPosts',
        'notificationAppointments.appointment.appointmentPosts.post',
        'userNotifications',
        'userNotifications.user',
      ],
    });
  }
}
