import { Injectable, NotFoundException } from '@nestjs/common';
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

      // Build query base
      const qb = manager
        .getRepository(Notification)
        .createQueryBuilder('notification')
        .where('notification.id = :id', { id: savedNotification.id });

      if (createDto.userIds && createDto.userIds.length > 0) {
        qb.leftJoinAndSelect(
          'notification.userNotifications',
          'userNotification',
        )
          .leftJoin('userNotification.user', 'user')
          .addSelect(['user.id', 'user.name']);
      }

      return await qb.getOneOrFail();
    });
  }

  async findAll(
    filter: NotificationFilterDto,
    userId: string,
    role: UserRole,
  ): Promise<
    PaginationResponse<Notification[]> & {
      totalUnreadItems: number;
      totalReadItems: number;
    }
  > {
    const {
      keyword = '',
      type,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isRead, // ✅ lấy ra từ filter
    } = filter;

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

    // Lọc theo user nếu là USER
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

    if (typeof isRead === 'boolean') {
      query.andWhere('userNotification.isRead = :isRead', { isRead });
    }

    query.skip((page - 1) * limit).take(limit);

    query.orderBy(
      `notification.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Lấy danh sách items + total
    const [items, total] = await query.getManyAndCount();

    // === Đếm số chưa đọc & số đã đọc ===
    // Query phụ: tổng chưa đọc
    const unreadQuery = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.userNotifications', 'userNotification')
      .leftJoin('userNotification.user', 'user');

    if (role === UserRole.USER) {
      unreadQuery.andWhere('user.id = :userId', { userId });
    }

    unreadQuery.andWhere('userNotification.isRead = :isRead', {
      isRead: false,
    });
    const totalUnreadItems = await unreadQuery.getCount();

    // Query phụ: tổng đã đọc
    const readQuery = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.userNotifications', 'userNotification')
      .leftJoin('userNotification.user', 'user');

    if (role === UserRole.USER) {
      readQuery.andWhere('user.id = :userId', { userId });
    }

    readQuery.andWhere('userNotification.isRead = :isRead', { isRead: true });
    const totalReadItems = await readQuery.getCount();

    return {
      data: items,
      totalItems: total, // số bản ghi theo filter hiện tại
      totalUnreadItems,
      totalReadItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.notificationRepository.findOne({
      where: { id },
      relations: {
        notificationAppointments: {
          appointment: {
            appointmentPosts: {
              post: true,
            },
          },
        },
        userNotifications: {
          user: true,
        },
      },
    });
  }

  async markAsRead(id: string, userId: string): Promise<UserNotification> {
    // tìm notification của user đó
    const userNotification = await this.userNotificationRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    userNotification.isRead = true;
    return await this.userNotificationRepository.save(userNotification);
  }
}
