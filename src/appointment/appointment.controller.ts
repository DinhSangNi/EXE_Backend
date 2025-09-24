import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateAppointmentDto } from 'src/dto/request/appointment-create.dto';
import { Response } from 'express';
import { Appointment } from 'src/entity/appointment.entity';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { PaginationResponse } from 'src/dto/Response/paginationResponse.dto';
import { AppointmentFilterDto } from 'src/dto/request/appointment-filter.dto';
import { UserRole } from 'src/user/user-role.enum';
import { UpdateAppointmentDto } from 'src/dto/request/appointment-update.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Tạo cuộc hẹn mới' })
  async createAppointment(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateAppointmentDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.CREATED)
      .json(
        new ApiResponse<Appointment | null>(
          'Create appointment successfully!',
          await this.appointmentService.create(body, userId),
        ),
      );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Lấy danh sách cuộc hẹn' })
  async getAllAppointments(
    @Query() filter: AppointmentFilterDto,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    const appointments = await this.appointmentService.findAll(
      filter,
      userId,
      role,
    );
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<PaginationResponse<Appointment[]>>(
          'Get all appointments successfully!',
          appointments,
        ),
      );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiBody({ type: UpdateAppointmentDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentDto,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<Appointment>(
          'Get all appointments successfully!',
          await this.appointmentService.update(id, updateDto, userId, role),
        ),
      );
  }

  @Get('by-post')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get an appointment by userId and postId' })
  async findOneByUserIdAndPostId(
    @Query('postId') postId: string,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    const appointment = await this.appointmentService.findOneByUserIdAndPostId(
      userId,
      postId,
    );

    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<Appointment>(
          'Get appointment by userId and postId successfully!',
          appointment,
        ),
      );
  }
}
