import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetPostsAndAppointmentsDto } from './dto/getPostsAndAppoinments.dto';
import { UserFilterDto } from 'src/dto/request/user-filter.dto';
import { UserService } from 'src/user/user.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
  ) {}

  @Get('overview/counts')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getCounts() {
    return await this.adminService.getDashboardCounts();
  }

  @Get('overview/posts-and-appointments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getPostsAndAppointments(@Query() query: GetPostsAndAppointmentsDto) {
    return await this.adminService.getPostsAndAppointments(
      query.month,
      query.year,
    );
  }

  @Get('overview/posts-by-category')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getPostsByCategory() {
    return await this.adminService.getPostsByCategory();
  }

  @Get('/users/list')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getAllUsers(@Query() query: UserFilterDto) {
    return await this.userService.findAll(query);
  }
}
