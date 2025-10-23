import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entity/appointment.entity';
import { Post } from 'src/entity/post.entity';
import { Repository } from 'typeorm';
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
    month?: number,
    year?: number,
  ): Promise<{
    data: { period: string; posts: number; appointments: number }[];
    granularity: 'day' | 'month';
  }> {
    const today = dayjs();

    if (month && !year) {
      throw new BadRequestException('Bạn phải nhập cả year khi có month');
    }

    const targetYear = year ?? today.year();

    let start: Dayjs;
    let end: Dayjs;
    let isMonthlyView = false;

    if (month) {
      // Hiển thị từng ngày trong tháng
      start = dayjs(`${targetYear}-${month}-01`);
      end = start.endOf('month');
      isMonthlyView = true;
    } else {
      // Hiển thị 12 tháng trong năm
      start = dayjs(`${targetYear}-01-01`);
      end = dayjs(`${targetYear}-12-31`);
    }

    // Format start/end để query MySQL (timezone +07)
    const startStr = start.startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endStr = end.endOf('day').format('YYYY-MM-DD HH:mm:ss');

    // Chọn format date theo chế độ
    const dateSelect = isMonthlyView
      ? `DATE(CONVERT_TZ(createdAt, '+00:00', '+07:00'))`
      : `DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '+07:00'), '%Y-%m')`;

    // ---- POSTS ----
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .select(`${dateSelect}`, 'period')
      .addSelect('COUNT(*)', 'posts')
      .where('post.createdAt BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .andWhere('post.deletedAt IS NULL')
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // ---- APPOINTMENTS ----
    const appointments = await this.appointmentRepository
      .createQueryBuilder('app')
      .select(`${dateSelect}`, 'period')
      .addSelect('COUNT(*)', 'appointments')
      .where('app.createdAt BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // ---- Tạo danh sách các mốc thời gian cần fill ----
    const allPeriods: string[] = [];
    if (isMonthlyView) {
      // Từng ngày trong tháng
      let current = start;
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        allPeriods.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
    } else {
      // 12 tháng trong năm
      for (let m = 1; m <= 12; m++) {
        allPeriods.push(dayjs(`${targetYear}-${m}-01`).format('YYYY-MM'));
      }
    }

    // ---- Merge kết quả ----
    const resultMap = new Map<
      string,
      { period: string; posts: number; appointments: number }
    >();
    allPeriods.forEach((p) =>
      resultMap.set(p, { period: p, posts: 0, appointments: 0 }),
    );

    posts.forEach((p) => {
      const key = isMonthlyView
        ? dayjs(p.period).format('YYYY-MM-DD')
        : dayjs(p.period).format('YYYY-MM');
      const existing = resultMap.get(key);
      if (existing) existing.posts = Number(p.posts);
    });

    appointments.forEach((a) => {
      const key = isMonthlyView
        ? dayjs(a.period).format('YYYY-MM-DD')
        : dayjs(a.period).format('YYYY-MM');
      const existing = resultMap.get(key);
      if (existing) existing.appointments = Number(a.appointments);
    });

    return {
      data: Array.from(resultMap.values()).sort((a, b) =>
        a.period.localeCompare(b.period),
      ),
      granularity: isMonthlyView ? 'day' : 'month',
    };
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
