import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/auth/mail.service';
import { resolveAddress } from 'src/common/utils/AddressFormat';
import { formatToVietnamTime } from 'src/common/utils/DateFormat';
import { AppointmentStatus } from 'src/constants/appointment-status';
import { NotificationType } from 'src/constants/notification-type';
import { CreateAppointmentDto } from 'src/dto/request/appointment-create.dto';
import { AppointmentFilterDto } from 'src/dto/request/appointment-filter.dto';
import { UpdateAppointmentDto } from 'src/dto/request/appointment-update.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { Appointment } from 'src/entity/appointment.entity';
import { AppointmentPost } from 'src/entity/appointment_post.entity';
import { NotificationAppointment } from 'src/entity/notification_appointment.entity';
import { User } from 'src/entity/user.entity';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { UserRole } from 'src/user/user-role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(NotificationAppointment)
    private notificationAppointmentRepository: Repository<NotificationAppointment>,
    @InjectRepository(AppointmentPost)
    private AppointmentPostRepository: Repository<AppointmentPost>,
    private notificationGateway: NotificationGateway,
    private notificationService: NotificationService,
    private mailService: MailService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const appointmentDate = new Date(createAppointmentDto.appointmentDateTime);

    if (Date.now() >= appointmentDate.getTime()) {
      throw new Error('Appointment date must be in the future');
    }

    // 1. Transaction để lưu appointment và các liên quan
    const savedAppointment =
      await this.appointmentRepository.manager.transaction(async (manager) => {
        const appointment = manager.create(Appointment, {
          appointmentDateTime: appointmentDate,
          note: createAppointmentDto.note,
          user: { id: userId },
          host: { id: createAppointmentDto.hostId },
          status: AppointmentStatus.Pending,
        });
        const savedAppointment = await manager.save(Appointment, appointment);

        // Lưu AppointmentPost nếu có
        if (createAppointmentDto.postId) {
          await manager.save(AppointmentPost, {
            post: { id: createAppointmentDto.postId },
            appointment: savedAppointment,
          });
        }

        return savedAppointment;
      });

    // 2. Transaction đã commit, query lại notification đầy đủ
    const createAndSendNotification = async (
      title: string,
      message: string,
      targetUserId: string,
    ) => {
      // 2a. Tạo notification
      const notification = await this.notificationService.create({
        title,
        message,
        type: NotificationType.APPOINTMENT,
        userIds: [targetUserId],
      });

      // 2b. Gắn notification với appointment
      await this.appointmentRepository.manager.save(NotificationAppointment, {
        notification,
        appointment: savedAppointment,
      });

      // 2c. Query lại đầy đủ nested relations
      // const fullNotification = await this.notificationRepository
      //   .createQueryBuilder('notification')
      //   .leftJoinAndSelect('notification.notificationAppointments', 'na')
      //   .leftJoinAndSelect('na.appointment', 'a')
      //   .leftJoinAndSelect('a.appointmentPosts', 'ap')
      //   .leftJoinAndSelect('ap.post', 'p')
      //   .leftJoinAndSelect('notification.userNotifications', 'un')
      //   .leftJoinAndSelect('un.user', 'u')
      //   .where('notification.id = :id', { id: notification.id })
      //   .getOne();
      const fullNotification = await this.notificationService.findById(
        notification.id,
      );

      console.log('fullNotification: ', fullNotification);

      // 2d. Gửi WebSocket
      if (fullNotification) {
        this.notificationGateway.sendNotification(
          targetUserId,
          fullNotification,
        );
      }

      return fullNotification;
    };

    // 3. Gửi notification cho user và host
    const [userNotification, hostNotification] = await Promise.all([
      createAndSendNotification(
        'Lịch hẹn đã được tạo',
        'Bạn đã tạo lịch hẹn thành công.',
        userId,
      ),
      createAndSendNotification(
        'Yêu cầu lịch hẹn xem nhà mới',
        'Bạn có một yêu cầu hẹn xem nhà mới',
        createAppointmentDto.hostId,
      ),
    ]);

    // 4. Gửi email cho user và host
    const [user, host] = await Promise.all([
      this.appointmentRepository.manager.findOne(User, {
        where: { id: userId },
      }),
      this.appointmentRepository.manager.findOne(User, {
        where: { id: createAppointmentDto.hostId },
      }),
    ]);

    if (user?.email && host?.email) {
      await this.mailService.sendBookingSuccessMail(
        user.email,
        host.email,
        userNotification!, // notification đầy đủ với relations
      );
    }

    return savedAppointment;
  }

  async findAll(
    filter: AppointmentFilterDto,
    userId: string,
    role: UserRole,
  ): Promise<PaginationResponse<Appointment[]>> {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .leftJoin('appointment.host', 'host')
      .addSelect(['host.id', 'host.name'])
      .leftJoinAndSelect('appointment.appointmentPosts', 'appointmentPost')
      .leftJoinAndSelect('appointmentPost.post', 'post');

    const totalAllItems = await qb.getCount();

    if (filter.userId) {
      qb.andWhere('user.id = :userId', { userId: filter.userId });
    }

    if (filter.hostId) {
      qb.andWhere('host.id = :hostId', { hostId: filter.hostId });
    }

    if (!filter.userId && !filter.hostId && role !== UserRole.ADMIN) {
      qb.andWhere('(user.id = :myId OR host.id = :myId)', { myId: userId });
    }

    if (filter.status) {
      qb.andWhere('appointment.status = :status', { status: filter.status });
    }

    if (filter.from) {
      qb.andWhere('appointment.appointmentDateTime >= :from', {
        from: filter.from,
      });
    }

    if (filter.to) {
      qb.andWhere('appointment.appointmentDateTime <= :to', { to: filter.to });
    }

    if (filter.keyword) {
      const keyword = decodeURIComponent(filter.keyword);
      qb.andWhere(
        'post.title LIKE :keyword COLLATE utf8mb4_unicode_ci OR appointment.note LIKE :keyword COLLATE utf8mb4_unicode_ci OR user.name LIKE :keyword COLLATE utf8mb4_unicode_ci OR host.name LIKE :keyword COLLATE utf8mb4_unicode_ci',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    const limit = filter.limit ?? 10;
    const page = filter.page ?? 1;

    qb.orderBy(
      `appointment.${filter.sortBy}`,
      filter.sortOrder
        ? (filter.sortOrder.toUpperCase() as 'ASC' | 'DESC')
        : 'DESC',
    )
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      totalAllItems: totalAllItems,
      data: items,
    };
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    role: UserRole,
  ): Promise<Appointment> {
    // 1. Transaction để update appointment
    const updatedAppointment =
      await this.appointmentRepository.manager.transaction(async (manager) => {
        const whereCondition =
          role === UserRole.ADMIN
            ? { id }
            : [
                { id, user: { id: userId } },
                { id, host: { id: userId } },
              ];

        const appointment = await manager.findOne(Appointment, {
          where: whereCondition,
          relations: [
            'user',
            'host',
            'appointmentPosts',
            'appointmentPosts.post',
          ],
        });

        if (!appointment) {
          throw new NotFoundException(
            role === UserRole.ADMIN
              ? `Appointment with id ${id} not found`
              : `Appointment with id ${id} not found or you have no permission to update this appointment`,
          );
        }

        // Cập nhật các trường
        if (updateAppointmentDto.appointmentDateTime) {
          appointment.appointmentDateTime = new Date(
            updateAppointmentDto.appointmentDateTime,
          );
        }
        if (updateAppointmentDto.status) {
          appointment.status = updateAppointmentDto.status;
        }
        if (updateAppointmentDto.note !== undefined) {
          appointment.note = updateAppointmentDto.note;
        }

        return await manager.save(Appointment, appointment);
      });

    // 2. Transaction đã commit → chuẩn bị gửi notification và email
    const firstPost = updatedAppointment.appointmentPosts[0]?.post;
    const postLocation = firstPost
      ? resolveAddress(
          firstPost.city,
          firstPost.district,
          firstPost.ward,
          firstPost.street,
        )
      : '';

    const timeStr = formatToVietnamTime(updatedAppointment.appointmentDateTime);

    let userMsg = '';
    let hostMsg = '';

    switch (updatedAppointment.status) {
      case AppointmentStatus.Confirmed:
        userMsg = `Lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation} đã được chủ nhà xác nhận`;
        hostMsg = `Bạn đã xác nhận lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation}`;
        break;
      case AppointmentStatus.Rejected:
        userMsg = `Lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị từ chối`;
        hostMsg = `Bạn đã từ chối lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation}`;
        break;
      default:
        userMsg = `Lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị hủy`;
        hostMsg = `Lịch hẹn với id: ${updatedAppointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị hủy`;
        break;
    }

    // 3. Tạo và gửi notification (sau commit)
    const createAndSendNotification = async (
      targetUserId: string,
      title: string,
      message: string,
    ) => {
      const notification = await this.notificationService.create({
        title,
        message,
        type: NotificationType.APPOINTMENT,
        userIds: [targetUserId],
      });

      await this.appointmentRepository.manager.save(NotificationAppointment, {
        notification,
        appointment: updatedAppointment,
      });

      // Query lại đầy đủ nested relations để gửi WebSocket
      // const fullNotification = await this.notificationRepository
      //   .createQueryBuilder('notification')
      //   .leftJoinAndSelect('notification.notificationAppointments', 'na')
      //   .leftJoinAndSelect('na.appointment', 'a')
      //   .leftJoinAndSelect('a.appointmentPosts', 'ap')
      //   .leftJoinAndSelect('ap.post', 'p')
      //   .leftJoinAndSelect('notification.userNotifications', 'un')
      //   .leftJoinAndSelect('un.user', 'u')
      //   .where('notification.id = :id', { id: notification.id })
      //   .getOne();

      const fullNotification = await this.notificationService.findById(
        notification.id,
      );

      if (fullNotification) {
        this.notificationGateway.sendNotification(
          targetUserId,
          fullNotification,
        );
      }

      return fullNotification;
    };

    // Gửi notification cho user và host
    await Promise.all([
      createAndSendNotification(
        updatedAppointment.user.id,
        'Cập nhật lịch hẹn',
        userMsg,
      ),
      createAndSendNotification(
        updatedAppointment.host.id,
        'Cập nhật lịch hẹn',
        hostMsg,
      ),
    ]);

    // 4. Gửi email nếu cần
    const [user, host] = await Promise.all([
      this.appointmentRepository.manager.findOne(User, {
        where: { id: updatedAppointment.user.id },
      }),
      this.appointmentRepository.manager.findOne(User, {
        where: { id: updatedAppointment.host.id },
      }),
    ]);

    if (user?.email && host?.email) {
      const userNotification = await this.notificationService.create({
        title: 'Cập nhật lịch hẹn',
        message: userMsg,
        type: NotificationType.APPOINTMENT,
        userIds: [user.id],
      });

      await this.mailService.sendBookingSuccessMail(
        user.email,
        host.email,
        userNotification,
      );
    }

    return updatedAppointment;
  }

  async findOneByUserIdAndPostId(userId: string, postId: string) {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .leftJoinAndSelect('appointment.appointmentPosts', 'appointmentPost')
      .leftJoinAndSelect('appointmentPost.post', 'post')
      .andWhere('user.id = :userId', { userId })
      .andWhere('post.id = :postId', { postId });

    const appointment = await qb.getOne();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findById(id: string) {
    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.user', 'user')
      .addSelect(['user.id', 'user.name'])
      .leftJoin('appointment.host', 'host')
      .addSelect(['host.id', 'host.name'])
      .leftJoinAndSelect('appointment.appointmentPosts', 'appointmentPost')
      .leftJoinAndSelect('appointmentPost.post', 'post')
      .andWhere('appointment.id = :id', { id });

    const appointment = await qb.getOne();
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}
