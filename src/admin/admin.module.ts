import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entity/post.entity';
import { Appointment } from 'src/entity/appointment.entity';
import { User } from 'src/entity/user.entity';
import { Category } from 'src/entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Appointment, User, Category])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
