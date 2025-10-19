import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entity/appointment.entity';
import { Post } from 'src/entity/post.entity';
import { Repository } from 'typeorm';
import { Granularity } from './enum/granularity.enum';
import { User } from 'src/entity/user.entity';
import dayjs, { Dayjs } from 'dayjs';
import { Category } from 'src/entity/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getDashboardCounts() {
    const totalPosts = await this.postRepository.count();
    const totalAppointments = await this.appointmentRepository.count();
    const totalUsers = await this.userRepository.count();
    // const totalActiveUsers = await this.userRepository.count({ where: { isActive: true } });

    return {
      totalPosts,
      totalAppointments,
      totalUsers,
      //   totalActiveUsers,
    };
  }

  async getPostsAndAppointments(
    granularity: Granularity = Granularity.DAILY,
    startDate?: string,
    endDate?: string,
  ): Promise<{ period: string; posts: number; appointments: number }[]> {
    const today = dayjs();

    let start: Dayjs;
    let end: Dayjs;

    if (startDate && endDate) {
      start = dayjs(startDate);
      end = dayjs(endDate);
    } else {
      // FE không truyền → dùng granularity để set default
      switch (granularity) {
        case Granularity.WEEKLY:
          end = today;
          start = today.subtract(6, 'day');
          break;
        case Granularity.MONTHLY:
          end = today;
          start = today.startOf('month');
          break;
        default:
          end = today;
          start = today.subtract(6, 'day');
      }
    }

    // Format start/end để query MySQL (timezone +07)
    const startStr = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endStr = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');

    // MySQL CONVERT_TZ để đảm bảo timezone VN (+07)
    const postDateSelect = `DATE(CONVERT_TZ(post.createdAt, '+00:00', '+07:00'))`;
    const appointmentDateSelect = `DATE(CONVERT_TZ(app.createdAt, '+00:00', '+07:00'))`;

    // Lấy posts
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .select(`${postDateSelect}`, 'period')
      .addSelect('COUNT(*)', 'posts')
      .where('post.createdAt BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .andWhere('post.deletedAt IS NULL')
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // Lấy appointments
    const appointments = await this.appointmentRepository
      .createQueryBuilder('app')
      .select(`${appointmentDateSelect}`, 'period')
      .addSelect('COUNT(*)', 'appointments')
      .where('app.createdAt BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // Tạo danh sách tất cả ngày trong khoảng để fill missing
    const allDates: string[] = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      allDates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    // Merge posts + appointments
    const resultMap = new Map<
      string,
      { period: string; posts: number; appointments: number }
    >();
    allDates.forEach((d) =>
      resultMap.set(d, { period: d, posts: 0, appointments: 0 }),
    );

    posts.forEach((p) => {
      const periodVN = dayjs(p.period).format('YYYY-MM-DD'); // convert UTC -> VN
      const existing = resultMap.get(periodVN);
      if (existing) existing.posts = Number(p.posts);
    });

    appointments.forEach((a) => {
      const periodVN = dayjs(a.period).format('YYYY-MM-DD'); // convert UTC -> VN
      const existing = resultMap.get(periodVN);
      if (existing) existing.appointments = Number(a.appointments);
    });

    return Array.from(resultMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    );
  }

  async getPostsByCategory() {
    const query = this.postRepository
      .createQueryBuilder('post')
      .select([
        'category.name AS category',
        'parent.name AS parentCategory',
        'COUNT(post.id) AS totalPosts',
      ])
      .leftJoin('post.category', 'category')
      .leftJoin('category.parent', 'parent')
      .where('post.deletedAt IS NULL')
      .groupBy('category.id')
      .orderBy('totalPosts', 'DESC');

    const results = await query.getRawMany();

    return results.map((r) => ({
      category: r.category,
      parentCategory: r.parentCategory || null,
      totalPosts: Number(r.totalPosts),
    }));
  }
}
