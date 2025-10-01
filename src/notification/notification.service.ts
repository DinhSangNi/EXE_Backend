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
    userId?: string | null, // có thể null nếu chưa login
    role?: UserRole,
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
      isRead,
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

    // --- Lọc theo user/public ---
    if (role === UserRole.USER && userId) {
      // Nếu user đăng nhập → lấy notify công khai hoặc notify dành riêng user
      query.andWhere('(user.id = :userId OR user.id IS NULL)', { userId });
    } else {
      // Nếu chưa đăng nhập → chỉ lấy notify công khai
      query.andWhere('user.id IS NULL');
    }

    // --- Các filter khác ---
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
    // Query base
    const baseQuery = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.userNotifications', 'userNotification')
      .leftJoin('userNotification.user', 'user');

    if (role === UserRole.USER && userId) {
      baseQuery.andWhere('(user.id = :userId OR user.id IS NULL)', { userId });
    } else {
      baseQuery.andWhere('user.id IS NULL');
    }

    const totalUnreadItems = await baseQuery
      .clone()
      .andWhere('userNotification.isRead = :isRead', { isRead: false })
      .getCount();

    const totalReadItems = await baseQuery
      .clone()
      .andWhere('userNotification.isRead = :isRead', { isRead: true })
      .getCount();

    return {
      data: items,
      totalItems: total,
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
