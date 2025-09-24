import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const appointmentDate = new Date(createAppointmentDto.appointmentDateTime);

    if (Date.now() >= appointmentDate.getTime()) {
      throw new Error('Appointment date must be in the future');
    }

    return await this.appointmentRepository.manager.transaction(
      async (manager) => {
        const appointment = manager.create(Appointment, {
          appointmentDateTime: appointmentDate,
          note: createAppointmentDto.note,
          user: { id: userId },
          host: { id: createAppointmentDto.hostId },
        });
        const savedAppointment = await manager.save(Appointment, appointment);

        if (createAppointmentDto.postId) {
          await manager.save(AppointmentPost, {
            post: { id: createAppointmentDto.postId },
            appointment: { id: savedAppointment.id },
          });
        }

        const sendAppointmentNotification = async (
          title: string,
          message: string,
          targetUserId: string,
        ) => {
          const notification = await this.notificationService.create({
            title,
            message,
            type: NotificationType.APPOINTMENT,
            userIds: [targetUserId],
          });

          await manager.save(NotificationAppointment, {
            notification: { id: notification.id },
            appointment: { id: savedAppointment.id },
          });

          this.notificationGateway.sendNotification(targetUserId, notification);
        };

        await sendAppointmentNotification(
          'Lịch hẹn đã được tạo',
          'Bạn đã tạo lịch hẹn thành công.',
          userId,
        );

        await sendAppointmentNotification(
          'Yêu cầu lịch hẹn xem nhà mới',
          'Bạn có một yêu cầu hẹn xem nhà mới',
          createAppointmentDto.hostId,
        );

        return savedAppointment;
      },
    );
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

    if (filter.keyword) {
      qb.andWhere(
        'appointment.note LIKE :keyword OR user.name LIKE :keyword OR host.name LIKE :keyword',
        {
          keyword: `%${filter.keyword}%`,
        },
      );
    }

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

  async sendNotification(
    userId: string,
    message: string,
    title = 'Cập nhật lịch hẹn',
  ) {
    const notification = await this.notificationService.create({
      title,
      message,
      type: NotificationType.APPOINTMENT,
      userIds: [userId],
    });

    const savedNotification = await this.notificationService.findById(
      notification.id,
    );

    this.notificationGateway.sendNotification(userId, savedNotification);

    return savedNotification;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    role: UserRole,
  ): Promise<Appointment> {
    const whereCondition =
      role === UserRole.ADMIN ? { id } : { id, user: { id: userId } };

    const appointment = await this.appointmentRepository.findOne({
      where: whereCondition,
      relations: ['user', 'host', 'appointmentPosts', 'appointmentPosts.post'],
    });

    if (!appointment) {
      throw new NotFoundException(
        role === UserRole.ADMIN
          ? `Appointment with id ${id} not found`
          : `Appointment with id ${id} not found or you have no permission to update this appointment`,
      );
    }

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

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    const firstPost = appointment.appointmentPosts[0]?.post;
    const postLocation = firstPost
      ? resolveAddress(
          firstPost.city,
          firstPost.district,
          firstPost.ward,
          firstPost.street,
        )
      : '';

    const timeStr = formatToVietnamTime(appointment.appointmentDateTime);
    let userMsg = '';
    let hostMsg = '';

    switch (appointment.status) {
      case AppointmentStatus.Confirmed:
        userMsg = `Lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation} đã được chủ nhà xác nhận`;
        hostMsg = `Bạn đã xác nhận lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation}`;
        break;
      case AppointmentStatus.Rejected:
        userMsg = `Lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị từ chối`;
        hostMsg = `Bạn đã từ chối lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation}`;
        break;
      default:
        userMsg = `Lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị hủy`;
        hostMsg = `Lịch hẹn với id: ${appointment.id} vào lúc ${timeStr} tại ${postLocation} đã bị hủy`;
        break;
    }

    await this.sendNotification(appointment.user.id, userMsg);
    await this.sendNotification(appointment.host.id, hostMsg);

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
}
