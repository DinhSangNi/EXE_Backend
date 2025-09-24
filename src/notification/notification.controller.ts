import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { NotificationFilterDto } from 'src/dto/request/notification-filter.dto';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { Notification } from 'src/entity/notification.entity';
import { UserRole } from 'src/user/user-role.enum';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy tất cả thông báo' })
  async getAll(
    @Query() filter: NotificationFilterDto,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    const data = await this.notificationService.findAll(filter, userId, role);

    return res.status(HttpStatus.OK).json(
      new ApiResponse<PaginationResponse<Notification[]>>(
        'Get filtered notifications successfully!',
        {
          ...data,
        },
      ),
    );
  }
}
