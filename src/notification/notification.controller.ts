import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { UserNotification } from 'src/entity/user_notification.entity';
import { OptionalAuthGuard } from 'src/common/guards/optional-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Lấy tất cả thông báo' })
  async getAll(
    @Query() filter: NotificationFilterDto,
    @Req() req: { user?: { userId: string; role: UserRole } }, // có thể undefined
    @Res() res: Response,
  ) {
    const userId = req.user?.userId;
    const role = req.user?.role;

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

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markRead(@Param('id') id: string, @Req() req, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<UserNotification>(
          'Mark notification as read successfully!',
          await this.notificationService.markAsRead(id, req.user.id),
        ),
      );
  }
}
