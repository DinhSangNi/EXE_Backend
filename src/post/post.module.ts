import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostAmenity } from 'src/entity/post_amenity.entity';
import { MediaModule } from 'src/media/media.module';
import { Post } from 'src/entity/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostAmenity]), MediaModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
