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

    // 1. Transaction lưu appointment + các liên quan
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

    // 2. Tạo notification nhưng chưa push socket
    const createNotification = async (
      title: string,
      message: string,
      targetUserId: string,
    ) => {
      // a. Tạo notification
      const notification = await this.notificationService.create({
        title,
        message,
        type: NotificationType.APPOINTMENT,
        userIds: [targetUserId],
      });

      // b. Gắn notification với appointment
      await this.appointmentRepository.manager.save(NotificationAppointment, {
        notification,
        appointment: savedAppointment,
      });

      // c. Lấy notification đầy đủ với relations
      return await this.notificationService.findById(notification.id);
    };

    const [userNotification, hostNotification] = await Promise.all([
      createNotification(
        'Lịch hẹn đã được tạo',
        'Bạn đã tạo lịch hẹn thành công.',
        userId,
      ),
      createNotification(
        'Yêu cầu lịch hẹn xem nhà mới',
        'Bạn có một yêu cầu hẹn xem nhà mới',
        createAppointmentDto.hostId,
      ),
    ]);

    // 3. Gửi email trước
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

    // 4. Sau khi mail gửi xong mới push notification qua WebSocket
    if (userNotification) {
      this.notificationGateway.sendNotification(userId, userNotification);
    }
    if (hostNotification) {
      this.notificationGateway.sendNotification(
        createAppointmentDto.hostId,
        hostNotification,
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

    // 2. Chuẩn bị message
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

    // 3. Tạo notification record
    const [userNotification, hostNotification] = await Promise.all([
      this.notificationService.create({
        title: 'Cập nhật lịch hẹn',
        message: userMsg,
        type: NotificationType.APPOINTMENT,
        userIds: [updatedAppointment.user.id],
      }),
      this.notificationService.create({
        title: 'Cập nhật lịch hẹn',
        message: hostMsg,
        type: NotificationType.APPOINTMENT,
        userIds: [updatedAppointment.host.id],
      }),
    ]);

    // 4. Save NotificationAppointment mapping
    await Promise.all([
      this.appointmentRepository.manager.save(NotificationAppointment, {
        notification: userNotification,
        appointment: updatedAppointment,
      }),
      this.appointmentRepository.manager.save(NotificationAppointment, {
        notification: hostNotification,
        appointment: updatedAppointment,
      }),
    ]);

    // 5. Reload notification đầy đủ relations để MailService có đủ dữ liệu
    const [fullUserNotification, fullHostNotification] = await Promise.all([
      this.notificationService.findById(userNotification.id),
      this.notificationService.findById(hostNotification.id),
    ]);

    // 6. Gửi email trước
    const [user, host] = await Promise.all([
      this.appointmentRepository.manager.findOne(User, {
        where: { id: updatedAppointment.user.id },
      }),
      this.appointmentRepository.manager.findOne(User, {
        where: { id: updatedAppointment.host.id },
      }),
    ]);

    // console.log('user email: ', user?.email);
    // console.log('host email: ', host?.email);

    if (user?.email && host?.email) {
      try {
        await this.mailService.sendAppointmentStatusUpdateMail(
          user.email,
          host.email,
          fullUserNotification!,
          fullHostNotification!,
        );
      } catch (err) {
        console.error('Error sending mail:', err);
      }
    }

    // 7. Sau khi mail xong mới gửi socket notify
    this.notificationGateway.sendNotification(
      updatedAppointment.user.id,
      userNotification,
    );
    this.notificationGateway.sendNotification(
      updatedAppointment.host.id,
      hostNotification,
    );

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
      .andWhere('post.id = :postId', { postId })
      .orderBy('appointment.createdAt', 'DESC');

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
